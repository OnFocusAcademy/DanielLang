const { makeModule, makeFunction } = require("../../src/runtime");

const NAME = "Math";

module.exports = makeModule(NAME, () => ({
  PI: Math.PI,
  abs: makeFunction(Math.abs, { name: `${NAME}.abs` }),
  sqrt: makeFunction(Math.sqrt, { name: `${NAME}.sqrt` }),
  pow: makeFunction(Math.pow, { name: `${NAME}.pow` }),
}));
