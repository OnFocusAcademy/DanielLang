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

/**
 * Convert a JS function into a Daniel function
 * @param {Function} func
 * @param {Object} kwargs
 * @param {String} kwargs.name
 */
const makeFunction = (
  func,
  { name = func.name ?? "lambda", variadic = false } = {}
) => {
  func.__name__ = name;
  func.daniel = true;
  func.variadic = variadic;

  func.toString = () => `Function ${func.__name__}`;

  return func;
};

module.exports = { makeModule, makeFunction };
