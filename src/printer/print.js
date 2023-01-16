const { isKeyword } = require("../interpreter/helpers");
const { isList } = require("../_internal/List");

const print = (obj) => {
  if (isList(obj)) {
    return printList(obj);
  }

  if (obj instanceof Map) {
    return printMap(obj);
  }

  if (Array.isArray(obj)) {
    return printVector(obj);
  }

  // null or undefined
  if (obj == null) {
    return "nil";
  }

  if (typeof obj === "string") {
    return `"${obj}"`;
  }

  if (typeof obj === "boolean" || typeof obj === "number") {
    return obj;
  }

  if (isKeyword(obj)) {
    return Symbol.keyFor(obj);
  }

  if (typeof obj === "symbol") {
    return `'${Symbol.keyFor(obj)}`;
  }

  throw new Error(`Print not implemented for ${obj}`);
};

const printList = (list) => `(${[...list].map(print).join(" ")})`;

const printMap = (map) =>
  `{${[...map.entries()]
    .map((e) => print(e[0]) + " => " + print(e[1]))
    .join(" ")}}`;

const printVector = (vec) => `[${vec.map((v) => print(v)).join(" ")}]`;

module.exports = { print, printList };
