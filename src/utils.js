const { fileURLToPath } = require("url");

exports.getAllOwnKeys = (obj) => {
  let keys = [];

  for (let key of Object.getOwnPropertySymbols(obj)) {
    keys.push(key);
  }

  for (let [key] of Object.entries(obj)) {
    keys.push(key);
  }

  return keys;
};

exports.getPathFromFileURL = (path) => fileURLToPath(path).href;

/**
 * Capitalize a string's first character and lowercase the rest
 * @param {String} str
 * @returns {String}
 */
exports.capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

exports.isError = (fn) => {
  try {
    fn();
    return false;
  } catch (e) {
    return true;
  }
};
