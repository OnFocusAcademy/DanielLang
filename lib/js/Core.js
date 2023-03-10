const fs = require("fs");
const readlineSync = require("readline-sync");
const cuid = require("cuid");
const equal = require("fast-deep-equal/es6");
const { curryN, curry } = require("ramda");
const { print } = require("../../src/printer/print");
const { read } = require("../../src/reader/read");
const {
  makeFunction,
  makeModule,
  Exception,
  RuntimeException,
} = require("../../src/runtime");
const { Cons } = require("../../src/_internal/Cons");
const { cons, list, isList, List } = require("../../src/_internal/List");
const { range } = require("../../src/interpreter/types/Range");
const { isKeyword } = require("../../src/interpreter/utils");
const { readfile, writefile, mapToObject } = require("../../src/cli/utils");
const { getAllOwnKeys } = require("../../src/utils");

const NAME = "Core";
const variadic = true;

const head = (obj) => obj.first();

const tail = (obj) => (obj instanceof Cons ? obj.last() : obj.tail());

const copyMap = (map) => {
  let copy = new Map();
  for (let [k, v] of map) {
    copy.set(k, v);
  }
  return copy;
};

const copyCons = (pair) => cons(pair.first(), pair.last());

const copyObj = (obj) => {
  let copy = {};

  for (let [k, v] of getAllOwnKeys(obj)) {
    copy[k] = v;
  }

  return copy;
};

const reduce = (name = "reduce") =>
  makeFunction((fn, init, lst) => lst.reduce(fn, init), {
    name: `${NAME}.${name}`,
  });

const pipe = (val, ...fns) => fns.reduce((v, fn) => fn(v), val);

module.exports = makeModule(NAME, () => ({
  // read string as Daniel code, outputs AST
  read: makeFunction(read, { name: `${NAME}.read` }),
  // basic list and pair functions
  cons: makeFunction(cons, { name: `${NAME}.cons` }),
  pair: makeFunction(cons, { name: `${NAME}.pair` }),
  list: makeFunction(list, { name: `${NAME}.list` }),
  head: makeFunction(head, { name: `${NAME}.head` }),
  car: makeFunction(head, { name: `${NAME}.car` }),
  tail: makeFunction(tail, { name: `${NAME}.tail` }),
  cdr: makeFunction(tail, { name: `${NAME}.cdr` }),
  last: makeFunction((obj) => obj.last(), { name: `${NAME}.last` }),
  // list functions
  each: makeFunction((fn, lst) => lst.forEach(fn), { name: `${NAME}.each` }),
  map: makeFunction((fn, lst) => lst.map(fn), { name: `${NAME}.map` }),
  filter: makeFunction((fn, lst) => lst.filter(fn), {
    name: `${NAME}.filter`,
  }),
  reduce: reduce(),
  foldl: reduce("foldl"),
  foldr: makeFunction((fn, init, lst) => lst.reduceRight(fn, init), {
    name: `${NAME}.foldr`,
  }),
  // map functions
  assoc: makeFunction(
    (map, pairs /* list of Cons cells */) => {
      let copy = copyMap(map);
      for (let pair of pairs) {
        copy.set(pair.first(), pair.last());
      }
      return copy;
    },
    { name: `${NAME}.assoc`, variadic }
  ),
  dissoc: makeFunction(
    (map, ...keys) => {
      let copy = copyMap(map);
      for (let k of keys) {
        copy.delete(k);
      }
      return copy;
    },
    { name: `${NAME}.dissoc`, variadic }
  ),
  "make-map": makeFunction(
    (entries /* list of Cons cells */) => {
      let m = new Map();
      for (let entry of entries) {
        m.set(entry.first(), entry.last());
      }
      return m;
    },
    { name: `${NAME}.make-map` }
  ),
  keys: makeFunction((map) => list(...map.keys()), { name: `${NAME}.keys` }),
  values: makeFunction((map) => list(...map.values()), {
    name: `${NAME}.values`,
  }),
  entries: makeFunction(
    (map) =>
      [...map.entries()].reduce(
        (lst, entry) => lst.append(cons(...entry)),
        new List()
      ),
    { name: `${NAME}.entries` }
  ),
  merge: makeFunction(
    (...maps) => {
      let merged = new Map();
      for (let map of maps) {
        for (let [k, v] of map) {
          merged.set(k, v);
        }
      }
      return merged;
    },
    { name: `${NAME}.merge` }
  ),
  // work with maps and lists
  get: makeFunction((key, obj) => obj.get(key), { name: `${NAME}.get` }),
  set: makeFunction((key, val, obj) => obj.set(key, val), {
    name: `${NAME}.set`,
  }),
  "has?": makeFunction((key, obj) => obj.has(key), { name: `${NAME}.has?` }),
  // also works with pairs and objects
  copy: makeFunction(
    (obj) =>
      obj instanceof Map
        ? copyMap(obj)
        : isList(obj)
        ? obj.copy()
        : obj instanceof Cons
        ? copyCons(obj)
        : copyObj(obj),
    { name: `${NAME}.copy` }
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
    name: `${NAME}.println`,
    variadic,
  }),
  input: makeFunction((prompt) => readlineSync.question(prompt), {
    name: `${NAME}.input`,
  }),
  readfile: makeFunction(readfile, { name: `${NAME}.readfile` }),
  writefile: makeFunction(writefile, { name: `${NAME}.writefile` }),
  "file-exists?": makeFunction((path) => fs.existsSync(path), {
    name: `${NAME}.file-exists?`,
  }),
  // conversion functions
  string: makeFunction(
    (...args) =>
      `${args
        .map((arg) => print(arg, { quoteString: true, colors: false }))
        .join(" ")}`,
    {
      name: `${NAME}.string`,
      variadic,
    }
  ),
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
  "**": makeFunction(
    curryN(2, (...args) => args.reduce((prod, arg) => prod ** arg)),
    {
      name: `${NAME}.**`,
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
  "<=>": makeFunction((a, b) => (a > b ? 1 : a < b ? -1 : 0), {
    name: `${NAME}.<=>`,
  }),
  // work with lists and strings
  length: makeFunction((list) => list.length, { name: `${NAME}.length` }),
  concat: makeFunction((iter, ...iters) => iter.concat(...iters), {
    name: `${NAME}.concat`,
  }),
  append: makeFunction(
    (obj, obj2) => {
      if (typeof obj === "string") {
        return obj + obj2;
      }
      return obj.append(obj2);
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
  "empty?": makeFunction(
    (obj) => obj == null || (isList(obj) && obj.length === 0),
    { name: `${NAME}.empty?` }
  ),
  "pair?": makeFunction((obj) => obj instanceof Cons || isList(obj), {
    name: `${NAME}.pair?`,
  }),
  "function?": makeFunction((obj) => typeof obj === "function", {
    name: `${NAME}.function?`,
  }),
  "symbol?": makeFunction((obj) => typeof obj === "symbol" && !isKeyword(obj), {
    name: `${NAME}.symbol?`,
  }),
  "map?": makeFunction((obj) => obj instanceof Map, { name: `${NAME}.map?` }),
  "keyword?": makeFunction(isKeyword, { name: `${NAME}.keyword?` }),
  "true?": makeFunction((obj) => obj === true, { name: `${NAME}.true?` }),
  "false?": makeFunction((obj) => obj === false, { name: `${NAME}.false?` }),
  // creates random symbols
  gensym: makeFunction(() => Symbol.for(cuid()), { name: `${NAME}.gensym` }),
  // autocurry a function
  curry: makeFunction(
    (fn) => (fn.__length__ ? curryN(fn.__length__, fn) : curry(fn)),
    { name: `${NAME}.curry` }
  ),
  // apply a function to a list of args
  apply: makeFunction((fn, args) => fn(...args), { name: `${NAME}.apply` }),
  // pipe a value through a series of unary functions from L to R
  "|>": makeFunction(pipe, {
    name: `${NAME}.|>`,
    variadic,
  }),
  // compose 2 unary functions L to R
  compose: makeFunction((f, g) => (x) => g(f(x)), { name: `${NAME}.compose` }),
  // compose n number of functions L to R
  pipe: makeFunction(
    (...fns) =>
      (x) =>
        pipe(x, ...fns),
    { name: `${NAME}.pipe`, variadic }
  ),
  // require native JS code
  "js-require": makeFunction(require, { name: `${NAME}.js-require` }),
  // eval a string as JavaScript
  "js-eval": makeFunction(eval, { name: `${NAME}.js-eval` }),
  // throwing exceptions
  Exception,
  RuntimeException,
  fail: makeFunction(
    (message, exn = Exception) => {
      throw new exn(message);
    },
    { name: `${NAME}.fail` }
  ),
  // object property accessor
  prop: makeFunction(
    (key, obj) => {
      // must use class name for static method
      // e.g. (Superclass.static-method arg1 ...)
      if (typeof obj?.[key] === "function") {
        return obj[key].bind(obj);
      }
      return obj?.[key];
    },
    { name: `${NAME}.prop` }
  ),
  // class instance constructor function
  new: makeFunction((cls, ...args) => new cls(...args), {
    name: `${NAME}.new`,
  }),
  // sets a property on an object
  "set-field!": makeFunction(
    (field, value, obj) => {
      obj[field] = value;
      return obj;
    },
    { name: `${NAME}.set-field!` }
  ),
  // constructs an object from a map (like an object literal)
  object: makeFunction(mapToObject, { name: `${NAME}.object` }),
  Promise,
}));
