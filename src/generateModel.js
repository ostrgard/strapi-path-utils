const uniqid = require("uniqid");
const slugFromTitle = require("./slugFromTitle").default;
const { createRedirect, removeRedirectForPath } = require("./redirect");

async function generatePath(entity, parentPath, contentType, index) {
  const slug = slugFromTitle(entity.title, index);
  const path = `/${slug}`;

  if (parentPath) return parentPath + path;

  if (!entity.parent) return path;

  // Depending on how the entity were fetched, the parent is either an id string
  // or an object.
  const parent = entity.parent.id
    ? entity.parent
    : await strapi.query(contentType).findOne({ id: entity.parent });

  return parent.path + path;
}

async function generateUniquePath(entity, parentPath, contentType, index = 0) {
  const path = await generatePath(entity, parentPath, contentType, index);

  const otherEntitiesWithPath = await strapi
    .query(contentType)
    .count({ _where: { path, id_ne: entity.id } });

  return otherEntitiesWithPath === 0
    ? path
    : generateUniquePath(entity, parentPath, contentType, index + 1);
}

async function updateChildren(data, contentType) {
  const childUpdates = data.children.map(async (c) => {
    // Depending on how object were fetched, the child is either an id string or
    // an object.
    const child = await strapi.query(contentType).findOne({ id: c.id || c });
    return strapi
      .query(contentType)
      .update({ id: child.id }, { ...child, parent: data });
  });

  return Promise.all(childUpdates);
}

const generateModel = ({ contentType, model = {}, getBasePath }) => ({
  ...model,
  lifecycles: {
    async beforeCreate(data) {
      if (model.beforeCreate) {
        await model.beforeCreate(data);
      }

      const parentPath = getBasePath ? await getBasePath() : undefined;
      data.preview_key = uniqid();
      data.path = await generateUniquePath(data, parentPath, contentType);

      // Remove redirect that match the path if it exists
      if (data.published) {
        await removeRedirectForPath(data.path);
      }
    },
    async beforeUpdate(params, data) {
      if (model.beforeUpdate) {
        await model.beforeCreate(params, data);
      }

      const parentPath = getBasePath ? await getBasePath() : undefined;
      const path = await generateUniquePath(data, parentPath, contentType);

      // Remove redirect that match the path if it exists
      if (data.published) {
        await removeRedirectForPath(path);
      }

      //  Only act if path changes
      if (data.path !== path) {
        //  Create a new redirect
        await createRedirect(data.path, path);
        data.path = path;

        // Update all children
        if (data.children) {
          await updateChildren(data, contentType);
        }
      }
    },
  },
});

exports.default = generateModel;
