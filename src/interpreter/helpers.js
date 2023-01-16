exports.isKeyword = (obj) =>
  typeof obj === "symbol" && obj.description.startsWith(":");
