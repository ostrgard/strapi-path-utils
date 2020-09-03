const { generateModel } = require("../../../../index");

module.exports = generateModel({
  contentType: "post",
  getBasePath: () => "test",
});
