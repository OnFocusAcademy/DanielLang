const { makeModule } = require("../../src/runtime");

const NAME = "Global";

module.exports = makeModule(
  NAME,
  (core, string) => ({ ...core, string }),
  [],
  ["Core", "String"]
);
