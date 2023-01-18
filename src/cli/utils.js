const fs = require("fs");

/**
 * Check if the current input is a complete expression
 * @param {String} str
 * @returns {Boolean}
 */
exports.inputFinished = (str) => {
  let parenCount = 0;
  let bracketCount = 0;
  let braceCount = 0;

  for (let char of str) {
    if (char === "(") {
      parenCount++;
    } else if (char === ")") {
      parenCount--;
    } else if (char === "[") {
      bracketCount++;
    } else if (char === "]") {
      bracketCount--;
    } else if (char === "{") {
      braceCount++;
    } else if (char === "}") {
      braceCount--;
    }
  }

  return parenCount === 0 && bracketCount === 0 && braceCount === 0;
};

/**
 * Count the number of spaces to indent in the REPL
 * @param {String} str
 * @returns {Number}
 */
exports.countIndent = (str) => {
  let indentCount = 0;

  for (let char of str) {
    if (char === "(" || char === "[" || char === "{") {
      indentCount++;
    } else if (char === ")" || char === "]" || char === "}") {
      indentCount--;
    }
  }

  return indentCount;
};

exports.readfile = (file, opts = { encoding: "utf8" }) => {
  if (opts instanceof Map) {
    const optsObj = mapToObject(opts);
    return fs.readFileSync(file, optsObj);
  }
  return fs.readFileSync(file, opts);
};

exports.writefile = (file, data, opts = { encoding: "utf8" }) => {
  if (opts instanceof Map) {
    const optsObj = mapToObject(opts);
    return fs.writeFileSync(file, data, optsObj);
  }
  return fs.writeFileSync(file, data, opts);
};

const mapToObject = (map) => {
  const obj = {};
  for (let [k, v] of map) {
    obj[k] = v;
  }
  return obj;
};

exports.mapToObject = mapToObject;
