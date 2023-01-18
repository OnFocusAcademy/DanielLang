const readlineSync = require("readline-sync");
const cuid = require("cuid");
const equal = require("fast-deep-equal/es6");
const { curry, curryN, map } = require("ramda");
const { print } = require("../../src/printer/print");
const { read } = require("../../src/reader/read");
const { makeFunction } = require("../../src/runtime");
const { Cons } = require("../../src/_internal/Cons");
const { cons, list, isList, List } = require("../../src/_internal/List");
const { range } = require("../../src/interpreter/types/Range");
const { Lambda } = require("../../src/interpreter/Lambda");
const { isKeyword } = require("../../src/interpreter/utils");
const { readfile, writefile } = require("../../src/cli/utils");

const NAME = "Daniel.core";
const variadic = true;

exports.name = NAME;

const copyMap = (map) => {
  let copy = new Map();
  for (let [k, v] of map) {
    copy.set(k, v);
  }
  return copy;
};

const copyCons = (pair) => cons(pair.first(), pair.last());

exports.provides = {
  // read string as Daniel code, outputs AST
  read: makeFunction(read, { name: `${NAME}.read` }),
  // basic list and pair functions
  cons: makeFunction(cons, { name: `${NAME}.cons` }),
  list: makeFunction(list, { name: `${NAME}.list` }),
  head: makeFunction((obj) => obj.first(), { name: `${NAME}.head` }),
  tail: makeFunction((obj) => (obj instanceof Cons ? obj.last() : obj.tail())),
  last: makeFunction((obj) => obj.last(), { name: `${NAME}.last` }),
  // list functions
  map: makeFunction((fn, lst) => lst.map(fn), { name: `${NAME}.map` }),
  filter: makeFunction((fn, lst) => lst.filter(fn), { name: `${NAME}.filter` }),
  reduce: makeFunction((fn, init, lst) => lst.reduce(fn, init), {
    name: `${NAME}.reduce`,
  }),
  // map functions
  assoc: makeFunction((map, pairs /* list of Cons cells */) => {
    let copy = copyMap(map);
    for (let pair of pairs) {
      copy.set(pair.first(), pair.last());
    }
    return copy;
  }),
  dissoc: makeFunction((map, ...keys) => {
    let copy = copyMap(map);
    for (let k of keys) {
      copy.delete(k);
    }
    return copy;
  }),
  "make-map": makeFunction(
    (entries /* list of Cons cells */) => {
      let m = new Map();
      for (let entry of entries) {
        m.set(entry.head(), entry.last());
      }
      return m;
    },
    { name: `${NAME}.make-map` }
  ),
  keys: makeFunction((map) => list(...map.keys()), { name: `${NAME}.keys` }),
  values: makeFunction((map) => list(...map.values()), {
    name: `${NAME}.entries`,
  }),
  entries: makeFunction((map) =>
    [...map.entries()].reduce(
      (lst, entry) => lst.append(cons(...entry)),
      new List()
    )
  ),
  // work with maps and lists
  get: makeFunction((key, obj) => obj.get(key), { name: `${NAME}.get` }),
  set: makeFunction((key, val, obj) => obj.set(key, val), {
    name: `${NAME}.get`,
  }),
  has: makeFunction((key, obj) => obj.has(key), { name: `${NAME}.get` }),
  // also works with pairs
  copy: makeFunction((obj) =>
    obj instanceof Map ? copyMap(obj) : isList(obj) ? obj.copy() : copyCons(obj)
  ),
  // for simple iteration
  range: makeFunction(range, { name: `${NAME}.range` }),
  // I/O
  print: makeFunction(
    (...args) => {
      process.stdout.write(args.map(print).join(" "));
      // to keep from printing nil at end of string without a newline
      return "";
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
  readfile: makeFunction(readfile, { name: `${NAME}.readfile` }),
  writefile: makeFunction(writefile, { name: `${NAME}.writefile` }),
  // conversion functions
  string: makeFunction((...args) => args.map(print).join(" "), {
    name: `${NAME}.string`,
    variadic,
  }),
  number: makeFunction(Number, { name: `${NAME}.number` }),
  boolean: makeFunction((val) => val != null, { name: `${NAME}.boolean` }),
  symbol: makeFunction((val) => Symbol.for(val), { name: `${NAME}.symbol` }),
  keyword: makeFunction((str) => Symbol.for(`:${str}`), {
    name: `${NAME}.keyword`,
  }),
  // works with numbers and strings
  "+": makeFunction(
    curryN(2, (...args) => args.reduce((sum, arg) => sum + arg)),
    {
      name: `${NAME}.+`,
      variadic,
    }
  ),
  // work with numbers
  "-": makeFunction(
    curryN(2, (...args) => args.reduce((diff, arg) => diff - arg)),
    {
      name: `${NAME}.-`,
      variadic,
    }
  ),
  "*": makeFunction(
    curryN(2, (...args) => args.reduce((prod, arg) => prod * arg, 1)),
    {
      name: `${NAME}.*`,
      variadic,
    }
  ),
  "/": makeFunction(
    curryN(2, (...args) => args.reduce((quot, arg) => quot / arg)),
    {
      name: `${NAME}./`,
      variadic,
    }
  ),
  "//": makeFunction(
    curryN(2, (...args) => args.reduce((quot, arg) => Math.floor(quot / arg))),
    {
      name: `${NAME}.//`,
      variadic,
    }
  ),
  "%": makeFunction(
    curryN(2, (...args) => args.reduce((rem, arg) => rem % arg)),
    {
      name: `${NAME}.%`,
      variadic,
    }
  ),
  // reference equality for any type
  "!=": makeFunction((a, b) => a !== b, { name: `${NAME}.!=` }),
  "=": makeFunction((a, b) => a === b, { name: `${NAME}.=` }),
  // reference equality for any object
  "equal?": makeFunction((a, b) => equal(a, b), { name: `${NAME}.equal?` }),
  // comparison for numbers and strings
  ">": makeFunction((a, b) => a > b, { name: `${NAME}.>` }),
  ">=": makeFunction((a, b) => a >= b, { name: `${NAME}.>=` }),
  "<": makeFunction((a, b) => a < b, { name: `${NAME}.<` }),
  "<=": makeFunction((a, b) => a <= b, { name: `${NAME}.<=` }),
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
  "map?": makeFunction((obj) => obj instanceof Map),
  "keyword?": makeFunction(isKeyword, { name: `${NAME}.keyword?` }),
  // creates random symbols
  gensym: makeFunction(() => Symbol.for(cuid()), { name: `${NAME}.gensym` }),
  // auto-curry a function
  curry: makeFunction((fn) => {
    if (typeof fn === "function") {
      // native function
      return curry(fn);
    }
    // Daniel function
    // call the function with the given arguments and return a new
    // Lambda with the given arguments bound to their names and the
    // unused parameters as the parameters to the new function
    const curried = (...args) => {
      if (args.length < fn.length) {
        const usedParams = fn.params.slice(0, args.length - 1);
        let i = 0;
        for (let param of usedParams) {
          fn.env.define(param, args[i]);
          i++;
        }
        const newParams = fn.params.slice(args.length - 1);
        return new Lambda(
          fn.env,
          newParams,
          fn.variadic,
          fn.body,
          fn.variadic ? newParams.length - 1 : newParams.length,
          `${fn.__name__} (partial ${usedParams.length})`
        );
      }
    };
    return curried;
  }),
};
