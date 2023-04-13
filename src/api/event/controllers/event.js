"use strict";

/**
 *  event controller
*/

const { createCoreController } = require("@strapi/strapi").factories;

//! Create is Owner Policy
module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  // link event with user
  async create(ctx) {
    const { id } = ctx.state.user; // ctx.state.user contains the current authenticated user
    const response = await super.create(ctx); // response.id is event id
    const updatedResponse = await strapi.entityService.update(
      "api::event.event",
      response.data.id,
      { data: { user: id } }
    );
    return updatedResponse;
  },

  async update(ctx) {
    var { id } = ctx.state.user;
    var [events] = await strapi.entityService.findMany("api::event.event", {
      filters: {
        id: ctx.request.params.id,
        user: id,
      },
    });
    if (events) {
      const response = await super.update(ctx);
      return response;
    } else {
      return ctx.unauthorized();
    }
  },

  async delete(ctx) {
    var { id } = ctx.state.user;
    var [events] = await strapi.entityService.findMany("api::event.event", {
      filters: {
        id: ctx.request.params.id,
        user: id,
      },
    });
    if (events) {
      const response = await super.delete(ctx);
      return response;
    } else {
      return ctx.unauthorized();
    }
  },
}));
