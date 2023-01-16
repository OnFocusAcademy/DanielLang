const { getAllOwnKeys } = require("./utils");

/**
 * Class representing an in-language module
 * @param {String} __name__
 * @param {Object} provides names provided by the module in the module scope
 */
class Module {
  /**
   * Constructs the Module object
   * @param {String} name
   * @param {Object} provides
   */
  constructor(name, provides) {
    this.__name__ = name;

    for (let key of getAllOwnKeys(provides)) {
      this[key] = provides[key];
    }
  }

  toString() {
    return `Module ${this.__name__}`;
  }
}

/**
 * Function wrapper for Module class
 * @param {String} name
 * @param {Object} provides
 * @returns {Module}
 */
const makeModule = (name, provides) => new Module(name, provides);

module.exports = { makeModule };
