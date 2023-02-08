const { makeModule } = require("../../src/runtime");

const NAME = "Global";

module.exports = makeModule(
  NAME,
  (Core, String) => ({ ...Core, String }),
  [],
  ["Core", "String"]
);
