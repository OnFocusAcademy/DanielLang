exports.isKeyword = (obj) =>
  typeof obj === "symbol" && obj.description.startsWith(":");
exports.isFalsy = (val) => val === false || val == null;
