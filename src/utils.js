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
