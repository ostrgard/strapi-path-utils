const { sanitizeEntity } = require("strapi-utils");

const modifyFields = (entity) => {
  if (!entity) return entity;

  return {
    ...entity,
    preview_key: undefined,
    children: entity.children
      ? entity.children.filter((n) => n.published).map(modifyFields)
      : undefined,
    parent:
      entity.parent && entity.parent.published
        ? modifyFields(entity.parent)
        : undefined,
  };
};

const generateController = ({ contentType, controller = {} }) => ({
  ...controller,
  async find(ctx) {
    const entities = controller.find
      ? await controller.find(ctx)
      : (await strapi.services[contentType].find(ctx.query)).map((entity) =>
          sanitizeEntity(entity, { model: strapi.models[contentType] })
        );

    return entities
      .filter(
        (entity) =>
          entity.published || entity.preview_key === ctx.query.preview_key
      )
      .map(modifyFields);
  },
  async findOne(ctx) {
    const entity = controller.findOne
      ? await controller.findOne(ctx)
      : sanitizeEntity(await strapi.services[contentType].findOne(ctx.query), {
          model: strapi.models[contentType],
        });

    return modifyFields(entity);
  },
});

exports.default = generateController;