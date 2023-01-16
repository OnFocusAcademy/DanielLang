const { print } = require("../../src/printer/print");
const { read } = require("../../src/reader/read");
const { makeFunction } = require("../../src/runtime");
const { Cons } = require("../../src/_internal/Cons");
const { cons, list, isList } = require("../../src/_internal/List");

const NAME = "Daniel.core";

exports.name = NAME;

exports.provides = {
  cons: makeFunction(cons, { name: `${NAME}.cons` }),
  list: makeFunction(list, { name: `${NAME}.list` }),
  print: makeFunction(print, { name: `${NAME}.print` }),
  read: makeFunction(read, { name: `${NAME}.read` }),
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
    (...args) => args.reduce((quot, arg) => Math.floor(quot / arg)),
    {
      name: `${NAME}.//`,
    }
  ),
  "%": makeFunction((...args) => args.reduce((rem, arg) => rem % arg), {
    name: `${NAME}.%`,
  }),
  "=": makeFunction((a, b) => a === b, { name: `${NAME}.=` }),
  ">": makeFunction((a, b) => a > b, { name: `${NAME}.>` }),
  ">=": makeFunction((a, b) => a >= b, { name: `${NAME}.>=` }),
  "<": makeFunction((a, b) => a < b, { name: `${NAME}.<` }),
  "<=": makeFunction((a, b) => a <= b, { name: `${NAME}.<=` }),
  "!=": makeFunction((a, b) => a !== b, { name: `${NAME}.!=` }),
  map: makeFunction((fn, lst) => lst.map(fn), { name: `${NAME}.map` }),
  filter: makeFunction((fn, lst) => lst.filter(fn), { name: `${NAME}.filter` }),
  reduce: makeFunction((fn, init, lst) => lst.reduce(fn, init), {
    name: `${NAME}.reduce`,
  }),
  "number?": makeFunction((obj) => typeof obj === "number", {
    name: `${NAME}.number?`,
  }),
  "string?": makeFunction((obj) => typeof obj === "string", {
    name: `${NAME}.string?`,
  }),
  "boolean?": makeFunction((obj) => typeof obj === "boolean", {
    name: `${NAME}.boolean?`,
  }),
  "nil?": makeFunction((obj) => obj == null, {
    name: `${NAME}.nil?`,
  }),
  // nil is empty list
  "list?": makeFunction((obj) => isList(obj) || obj == null, {
    name: `${NAME}.list?`,
  }),
  "empty?": makeFunction((obj) => obj == null, { name: `${NAME}.empty?` }),
  "pair?": makeFunction((obj) => obj instanceof Cons, {
    name: `${NAME}.pair?`,
  }),
  "function?": makeFunction((obj) => typeof obj === "function", {
    name: `${NAME}.function?`,
  }),
};
