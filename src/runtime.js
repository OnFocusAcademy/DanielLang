const { getAllOwnKeys } = require("./utils");

/** Add __length__ property to Object constructor to make making classes work */
// this won't work with all native constructors...
Object.__length__ = 0;

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
      this[typeof key === "symbol" ? Symbol.keyFor(key) : key] = provides[key];
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
  func.name = name;
  func.daniel = false;
  func.variadic = variadic;

  return func;
};

class Exception extends Error {
  constructor(message) {
    super(message);
  }
}

/**
 * Attaches methods to a prototype or constructor
 * @param {Map} methods
 * @param {Object} obj
 */
const attachMethods = (methods, obj) => {
  for (let [name, method] of methods) {
    obj[name] = method;
  }
  return obj;
};

/**
 * Creates a class
 * @param {String} name
 * @param {String[]} fields
 * @param {Map} instanceMethods
 * @param {Map} staticMethods
 * @param {Function} superClass
 */
const makeClass = (
  name,
  fields,
  instanceMethods,
  staticMethods,
  superClass
) => {
  // using this wrapper should allow the name property to be correctly set
  // to the class name on the constructor function
  let wrapper = {
    [name]: function (...args) {
      const superLen = superClass.__length__;
      superClass.call(this, args);
      let subFields = fields.slice(superLen);
      let i = 0;
      for (let arg of args.slice(superLen)) {
        // handle variadic constructor
        // note that a subclass with a variadic superclass constructor
        // will not be able to accept additional arguments besides
        // what the superclass defines
        if (
          i === subFields.length - 1 &&
          args.slice(superLen).length > subFields.length
        ) {
          this[subFields[i]] = args.slice(i);
          break;
        }

        this[subFields[i++]] = arg;
      }

      if (instanceMethods.has("init")) {
        let initArgs = {};
        let i = 0;
        for (let field of fields) {
          // handle variadic init arg
          if (i === fields.length - 1 && args.length > fields.length) {
            initArgs[field] = args.slice(i);
            break;
          }

          initArgs[field] = args[i++];
        }

        instanceMethods.get("init")(this, initArgs);
      }
    },
  };

  let klass = wrapper[name];

  klass.__length__ = fields.length;
  Object.setPrototypeOf(klass, superClass);
  Object.setPrototypeOf(klass.prototype, superClass.prototype);
  attachMethods(staticMethods, klass);
  attachMethods(instanceMethods, klass.prototype);

  return klass;
};

module.exports = { makeModule, makeFunction, Exception, makeClass };
