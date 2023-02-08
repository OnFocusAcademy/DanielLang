const path = require("path");
const fs = require("fs");
const { getPathFromFileURL } = require("./utils");

/** Add __length__ property to Object constructor to make making classes work */
// this won't work with all native constructors...
Object.__length__ = 0;

class Exception extends Error {
  constructor(message) {
    super(message);
  }
}

class RuntimeException extends Exception {
  constructor(message) {
    super(message);
  }
}

class Module {
  /**
   * Constructs the Module object
   * @param {String} name
   * @param {Function} create
   * @param {String[]} requires in-language modules this module requires
   * @param {String[]} nativeRequires JS modules this module requires
   */
  constructor(name, create, requires, nativeRequires) {
    this.name = name;
    this.create = create;
    this.requires = requires;
    this.nativeRequires = nativeRequires;
  }

  toString() {
    return `Module ${this.__name__}`;
  }
}

/**
 * Function wrapper for Module class
 * @param {String} name
 * @param {Function} create
 * @param {String[]} requires in-language modules this module requires
 * @param {String[]} nativeRequires JS modules this module requires
 * @returns {Module}
 */
const makeModule = (name, create, requires = [], nativeRequires = []) =>
  new Module(name, create, requires, nativeRequires);

/**
 * Convert a JS function into a Daniel function
 * @param {Function} func
 * @param {Object} kwargs
 * @param {String} [kwargs.name=lambda]
 * @param {Boolean} [kwargs.variadic=false]
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

/**
 * Resolve a required module name to a file
 * @param {String} rq
 * @param {Object} kwargs
 * @param {String} kwargs.file required if local module
 * @param {Boolean} kwargs.native
 */
const resolveRequire = (rq, { basePath = "", native = false } = {}) => {
  if (rq.startsWith("//") || /^[a-zA-Z]:\\\\/.test(rq)) {
    // is absolute path
    if (fs.existsSync(rq)) {
      return rq;
    }
  }

  if (rq.startsWith("file:")) {
    // is file URL
    if (fs.existsSync(getPathFromFileURL(rq))) {
      return getPathFromFileURL(rq);
    }
  }

  if (rq.startsWith(".")) {
    // local module (user-defined)
    const absPath = path.join(basePath, rq);
    if (fs.existsSync(`${absPath}.dan`)) {
      // is in-language module
      return `${absPath}.dan`;
    } else if (fs.existsSync(`${absPath}.js`)) {
      // is native module
      return `${absPath}.js`;
    }
  } else {
    // global module (builtin)
    const filePath = path.join(
      __dirname,
      "../lib",
      native ? `js/${rq}.js` : `${rq}.dan`
    );

    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  throw new RuntimeException(`Could not resolve file for module ${rq}`);
};

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
      superClass.call(this, ...args);
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

  klass.__name__ = klass.name;
  klass.__length__ = fields.length;
  Object.setPrototypeOf(klass, superClass);
  Object.setPrototypeOf(klass.prototype, superClass.prototype);
  attachMethods(staticMethods, klass);
  attachMethods(instanceMethods, klass.prototype);

  return klass;
};

module.exports = {
  Exception,
  RuntimeException,
  Module,
  makeModule,
  makeFunction,
  resolveRequire,
  makeClass,
};
