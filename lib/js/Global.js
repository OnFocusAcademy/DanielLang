const { makeModule } = require("../../src/runtime");

const NAME = "Global";

exports = makeModule(
  NAME,
  (core, string) => ({ ...core, string }),
  [],
  ["Core", "String"]
);
