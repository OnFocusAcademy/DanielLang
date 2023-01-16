const { makeFunction } = require("../../src/runtime");
const { cons, list } = require("../../src/_internal/List");

const NAME = "core";

exports.provides = {
  cons: makeFunction(cons, { name: `${NAME}.cons` }),
  list: makeFunction(list, { name: `${NAME}.list` }),
  "+": makeFunction((...args) => args.reduce((sum, arg) => sum + arg, 0), {
    name: `${NAME}.+`,
  }),
  "-": makeFunction((...args) => args.reduce((diff, arg) => diff - arg), {
    name: `${NAME}.-`,
  }),
  "*": makeFunction((...args) => args.reduce((prod, arg) => prod * arg, 1), {
    name: `${NAME}.*`,
  }),
  "/": makeFunction((...args) => args.reduce((quot, arg) => quot / arg), {
    name: `${NAME}./`,
  }),
  "//": makeFunction(
    (...args) => args.reduce((quot, arg) => Math.floor(quot / arg), 0),
    {
      name: `${NAME}.//`,
    }
  ),
  "%": makeFunction((...args) => args.reduce((rem, arg) => rem % arg), {
    name: `${NAME}.%`,
  }),
  map: makeFunction((fn, lst) => lst.map(fn), { name: `${NAME}.map` }),
  filter: makeFunction((fn, lst) => lst.filter(fn), { name: `${NAME}.filter` }),
  reduce: makeFunction((fn, lst) => lst.reduce(fn), { name: `${NAME}.reduce` }),
};
