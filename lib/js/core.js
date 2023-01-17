const readlineSync = require("readline-sync");
const cuid = require("cuid");
const equal = require("fast-deep-equal/es6");
const { print } = require("../../src/printer/print");
const { read } = require("../../src/reader/read");
const { makeFunction } = require("../../src/runtime");
const { Cons } = require("../../src/_internal/Cons");
const { cons, list, isList } = require("../../src/_internal/List");
const { range } = require("../../src/interpreter/types/Range");

const NAME = "Daniel.core";
const variadic = true;

exports.name = NAME;

exports.provides = {
  // read string as Daniel code, outputs AST
  read: makeFunction(read, { name: `${NAME}.read` }),
  // basic data structures
  cons: makeFunction(cons, { name: `${NAME}.cons` }),
  list: makeFunction(list, { name: `${NAME}.list` }),
  // console I/O
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
  input: makeFunction((prompt) => readlineSync.question(prompt), {
    name: `${NAME}.input`,
  }),
  // conversion functions
  string: makeFunction((...args) => args.map(print).join(" "), {
    name: `${NAME}.string`,
    variadic,
  }),
  number: makeFunction(Number, { name: `${NAME}.number` }),
  boolean: makeFunction((val) => val != null, { name: `${NAME}.boolean` }),
  symbol: makeFunction((val) => Symbol.for(val), { name: `${NAME}.symbol` }),
  // works with numbers and strings
  "+": makeFunction((...args) => args.reduce((sum, arg) => sum + arg), {
    name: `${NAME}.+`,
    variadic,
  }),
  // work with numbers
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
  // reference equality for any type
  "!=": makeFunction((a, b) => a !== b, { name: `${NAME}.!=` }),
  "=": makeFunction((a, b) => a === b, { name: `${NAME}.=` }),
  // work with numbers and strings
  ">": makeFunction((a, b) => a > b, { name: `${NAME}.>` }),
  ">=": makeFunction((a, b) => a >= b, { name: `${NAME}.>=` }),
  "<": makeFunction((a, b) => a < b, { name: `${NAME}.<` }),
  "<=": makeFunction((a, b) => a <= b, { name: `${NAME}.<=` }),
  // list functions
  map: makeFunction((fn, lst) => lst.map(fn), { name: `${NAME}.map` }),
  filter: makeFunction((fn, lst) => lst.filter(fn), { name: `${NAME}.filter` }),
  reduce: makeFunction((fn, init, lst) => lst.reduce(fn, init), {
    name: `${NAME}.reduce`,
  }),
  // work with lists and strings
  length: makeFunction((list) => list.length, { name: `${NAME}.length` }),
  concat: makeFunction(
    (iter, ...iters) => iter.concat(...iters),
    {
      name: `${NAME}.concat`,
    },
    { name: `${NAME}.concat` }
  ),
  append: makeFunction(
    (obj, ...objs) => {
      if (typeof obj === "string") {
        return objs.reduce((all, str) => all + str, obj);
      }
      return obj.append(...objs);
    },
    { name: `${NAME}.append` }
  ),
  // predicates
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
  // empty list is nil
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
  // reference equality for any object
  "equal?": makeFunction((a, b) => equal(a, b), { name: `${NAME}.equal?` }),
  range: makeFunction(range, { name: `${NAME}.range` }),
  // Work with maps and lists
  get: makeFunction((key, obj) => obj.get(key), { name: `${NAME}.get` }),
  set: makeFunction((key, val, obj) => obj.set(key, val), {
    name: `${NAME}.get`,
  }),
  has: makeFunction((key, obj) => obj.has(key), { name: `${NAME}.get` }),
  // creates random symbols
  gensym: makeFunction(() => Symbol.for(cuid()), { name: `${NAME}.gensym` }),
};
