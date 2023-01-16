const { isKeyword } = require("../interpreter/helpers");
// eslint-disable-next-line
const { List, isList } = require("../_internal/List");

/**
 * Print the result of any expression
 * @param {Any} obj
 * @returns {String}
 */
const print = (obj) => {
  if (isList(obj)) {
    return printList(obj);
  }

  if (obj instanceof Map) {
    return printMap(obj);
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

/**
 * Print a list
 * @param {List} list
 * @returns {String}
 */
const printList = (list) => `(${[...list].map(print).join(" ")})`;

/**
 * Print a map
 * @param {Map} map
 * @returns {String}
 */
const printMap = (map) =>
  `{${[...map.entries()]
    .map((e) => print(e[0]) + " => " + print(e[1]))
    .join(" ")}}`;

module.exports = { print, printList };
