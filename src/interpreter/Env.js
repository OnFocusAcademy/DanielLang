/**
 * Environment to pass into interpreter
 */
exports.Env = class Env {
  /**
   * Constructs an Environment object
   * @param {Object} params
   * @param {Env|null} params.parent
   * @param {String} params.name
   */
  constructor({ parent = null, name = "global" } = {}) {
    this.parent = parent;
    this.name = name;
    this.namespace = new Map();
  }

  /**
   * Creates an environment and adds each name/value pair in vars to its namespace
   * @param {Object} vars
   * @param {Object} params
   * @param {Env|null} params.parent
   * @param {String} params.name
   * @returns {Env}
   */
  static from(vars, { parent = null, name = "global" } = {}) {
    let env = new Env({ parent, name });

    for (let sym of Object.getOwnPropertySymbols(vars)) {
      env.define(sym, vars[sym]);
    }

    for (let [key, value] of Object.entries(vars)) {
      env.define(Symbol.for(key), value);
    }

    return env;
  }

  /**
   * Defines a new value in the current env's namespace
   * @param {Symbol} name
   * @param {import("../reader/read").AST|Object} value
   * @returns {Boolean}
   */
  define(name, value) {
    if (this.has(name)) {
      throw new Error(
        `Name ${name.description} is already defined in the current environment`
      );
    }

    this.set(name, value);
    return this.has(name);
  }

  /**
   * Extend the current Environment by defining a child
   * @param {Env} parent
   * @returns {Env}
   */
  extend(parent, name) {
    return new Env({ parent, name });
  }

  /**
   * Gets the value for name in the current env's namespace
   * @param {Symbol} key
   * @returns {import("../reader/read").AST|Object}
   */
  get(key) {
    const env = this.lookup(key);
    return env.namespace.get(key);
  }

  /**
   * Checks if the current env's namespace contains key
   * @param {Symbol} key
   * @returns {Boolean}
   */
  has(key) {
    return this.namespace.has(key);
  }

  /**
   * Returns the environment whose namespace contains key
   * @param {Symbol} key
   * @returns {Env}
   */
  lookup(key) {
    let current = this;

    while (current) {
      if (current.has(key)) {
        return current;
      }
    }

    throw new Error(
      `Name ${key.description} not found in the current environment`
    );
  }

  /**
   * Sets a name to a value in the current env's namespace
   * @param {Symbol} key
   * @param {import("../reader/read").AST|Object} value
   * @returns {Boolean}
   */
  set(key, value) {
    this.namespace.set(key, value);
    return this.namespace.has(key);
  }
};
