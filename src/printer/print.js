const { isKeyword } = require("../interpreter/utils");

/**
 * Print the result of any expression
 * @param {Any} obj
 * @returns {String}
 */
const print = (obj) => {
  if (obj?.isList && obj.isList()) {
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
    let str = `"${obj}"`;
    if (str.startsWith('""') && str.endsWith('""') && str.length > 2) {
      return str.slice(1, -1);
    }

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

  return String(obj);
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
