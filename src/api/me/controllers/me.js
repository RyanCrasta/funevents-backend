"use strict";
const utils = require("@strapi/utils");
const { sanitize } = utils;
const { createCoreController } = require("@strapi/strapi").factories;
const modelUid = "api::event.event";

module.exports = createCoreController("api::me.me", ({ strapi }) => ({
  async me(ctx) {
    try {
      const user = ctx.state.user;

      if (!user) {
        return ctx.badRequest(null, [
          {
            messages: [{ id: "No auth header was found" }],
          },
        ]);
      }

      // Get event ids
      const events = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          where: {
            id: user.id,
          },
          populate: {
            events: { select: "id" },
          },
        });

      if (!events) {
        return ctx.notFound();
      }

      // Get the events into a format for the query
      const newEvents = events[0].events.map((evt) => ({
        id: { $eq: evt.id },
      }));

      // use the newly formatted newEvents in a query to get the users
      // events and images
      if (newEvents.length === 0) {
        return sanitize.contentAPI.output([], strapi.getModel(modelUid));
      }

      const eventsAndMedia = await strapi.db.query(modelUid).findMany({
        where: {
          $or: newEvents,
        },
        populate: { image: true },
      });

      return sanitize.contentAPI.output(
        eventsAndMedia,
        strapi.getModel(modelUid)
      );
    } catch (err) {
      return ctx.internalServerError(err.message);
    }
  },
}));
