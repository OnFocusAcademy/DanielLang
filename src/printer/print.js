const util = require("util");
const chalk = require("chalk");
const { isKeyword } = require("../interpreter/utils");

/**
 * Print the result of any expression
 * @param {Any} obj
 * @returns {String}
 */
const print = (obj, quoteString = false) => {
  // null or undefined
  if (obj == null) {
    return "nil";
  }

  if (obj?.__string__ && typeof obj.__string__ === "function") {
    return obj.__string__();
  }

  if (obj.isList && obj.isList()) {
    return printList(obj);
  }

  if (obj instanceof Map) {
    return printMap(obj);
  }

  if (typeof obj === "function") {
    return `Function ${obj.__name__ ? obj.__name__ : obj.name}`;
  }

  if (typeof obj === "string") {
    return quoteString === true ? `"${obj}"` : obj;
  }

  if (isKeyword(obj)) {
    return Symbol.keyFor(obj);
  }

  if (typeof obj === "symbol") {
    return chalk.blueBright(Symbol.keyFor(obj));
  }

  if (typeof obj === "number") {
    return chalk.yellowBright(String(obj));
  }

  if (typeof obj === "boolean") {
    return chalk.greenBright(String(obj));
  }

  if (typeof obj === "object") {
    return util.inspect(obj);
  }

  return String(obj);
};

/**
 * Print a list
 * @param {List} list
 * @returns {String}
 */
const printList = (list) =>
  list.length ? `(${list.map(print).join(" ")})` : "nil";

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
