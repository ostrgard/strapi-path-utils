async function createRedirect(oldPath, newPath) {
  await strapi.query("redirect").create({ from: oldPath, to: newPath });
}

async function removeRedirectForPath(path) {
  await strapi.query("redirect").delete({ from: path });
}

module.exports = {
  createRedirect,
  removeRedirectForPath,
};
