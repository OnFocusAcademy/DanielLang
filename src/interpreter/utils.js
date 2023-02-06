const isKeyword = (obj) =>
  typeof obj === "symbol" && obj.description.startsWith(":");
exports.isKeyword = isKeyword;
const isFalsy = (val) => val === false || val == null;
exports.isFalsy = isFalsy;
exports.isTruthy = (val) => !isFalsy(val);

// Self-quoting data is AST data that evaluates to itself, i.e.
// doesn't have to be looked up in an environment. Native
// functions are self-quoting objects for our purposes
exports.isSelfQuoting = (val) =>
  ["string", "number", "boolean", "undefined", "function"].includes(
    typeof val
  ) ||
  // make sure it's not a Daniel function
  (typeof val === "object" && !val?.daniel && !(val?.isList && val.isList())) ||
  isKeyword(val);
