const readlineSync = require("readline-sync");
const { print } = require("../../src/printer/print");
const { read } = require("../../src/reader/read");
const { makeFunction } = require("../../src/runtime");
const { Cons } = require("../../src/_internal/Cons");
const { cons, list, isList } = require("../../src/_internal/List");

const NAME = "Daniel.core";
const variadic = true;

exports.name = NAME;

exports.provides = {
  cons: makeFunction(cons, { name: `${NAME}.cons` }),
  list: makeFunction(list, { name: `${NAME}.list` }),
  print: makeFunction(
    (...args) => {
      process.stdout.write(args.map(print).join(" "));
    },
    {
      name: `${NAME}.print`,
      variadic,
    }
  ),
  println: makeFunction((...args) => console.log(args.map(print).join(" ")), {
    name: `${NAME}.print`,
    variadic,
  }),
  string: makeFunction((...args) => args.map(print).join(" "), {
    name: `${NAME}.string`,
    variadic,
  }),
  number: makeFunction(Number, { name: `${NAME}.number` }),
  boolean: makeFunction((val) => val != null, { name: `${NAME}.boolean` }),
  symbol: makeFunction((val) => Symbol.for(val), { name: `${NAME}.symbol` }),
  read: makeFunction(read, { name: `${NAME}.read` }),
  input: makeFunction((prompt) => readlineSync.question(prompt), {
    name: `${NAME}.input`,
  }),
  "+": makeFunction((...args) => args.reduce((sum, arg) => sum + arg), {
    name: `${NAME}.+`,
    variadic,
  }),
  "-": makeFunction((...args) => args.reduce((diff, arg) => diff - arg), {
    name: `${NAME}.-`,
    variadic,
  }),
  "*": makeFunction((...args) => args.reduce((prod, arg) => prod * arg, 1), {
    name: `${NAME}.*`,
    variadic,
  }),
  "/": makeFunction((...args) => args.reduce((quot, arg) => quot / arg), {
    name: `${NAME}./`,
    variadic,
  }),
  "//": makeFunction(
    (...args) => args.reduce((quot, arg) => Math.floor(quot / arg)),
    {
      name: `${NAME}.//`,
      variadic,
    }
  ),
  "%": makeFunction((...args) => args.reduce((rem, arg) => rem % arg), {
    name: `${NAME}.%`,
    variadic,
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
  length: makeFunction((list) => list.length, { name: `${NAME}.length` }),
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
  "symbol?": makeFunction((obj) => typeof obj === "symbol", {
    name: `${NAME}.symbol?`,
  }),
};
