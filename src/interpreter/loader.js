const fs = require("fs");
// eslint-disable-next-line
const { resolveRequire, Exception, Module } = require("../runtime");
// eslint-disable-next-line
const { Env } = require("./Env");

let moduleTable = {};
let nameMap = {};
let modules = {};

/**
 * Resolve module names to their file paths
 * @param {String[]} requires
 * @param {String[]} nativeRequires
 */
const getModulePaths = (requires, nativeRequires) => {
  let paths = [];

  for (let req of requires) {
    if (req.startsWith("//") || /^[a-zA-Z]:\\\\/.test(req)) {
      // is already resolved
      paths.push(req);
    } else {
      let path = resolveRequire(req);
      nameMap[path] = req;
      paths.push(path);
    }
  }

  for (let req of nativeRequires) {
    if (req.startsWith("//") || /^[a-zA-Z]:\\\\/.test(req)) {
      // is already resolved
      paths.push(req);
    } else {
      let path = resolveRequire(req, { native: true });
      nameMap[req] = path;
      paths.push(path);
    }
  }

  return paths;
};

/**
 * Traverse the dependency graph and get the order in which to load modules
 * Inspiration from {@link https://github.com/brownplt/pyret-lang/blob/331e29e79cfc8d49fd3b73684dd3a034d445f5c5/src/js/base/amd_loader.js#L73}
 * @param {String[]} deps
 * @returns {String[]}
 */
const getLoadOrder = (deps) => {
  let sorted = [];
  let toVisit = {};
  let currentlyVisiting = {};
  let visited = {};

  const visitNode = (node) => {
    if (!(node in moduleTable) && !(node in modules)) {
      throw new Exception(`Unknown module ${nameMap[node]}`);
    }

    if (node in currentlyVisiting) {
      throw new Exception(
        `You have a circular dependency that includes ${nameMap[node]}`
      );
    }

    if (node in visited) {
      // it's already been loaded, so we're good
      return;
    }

    // if we get here, the node is unvisited so we mark it as currently being visited
    currentlyVisiting[node] = true;

    if (node in toVisit) {
      // we're visiting it now, so we can remove it from toVisit
      delete toVisit[node];
    }

    // now visit its children recursively
    for (let dep of getModulePaths(
      moduleTable[node].requires,
      moduleTable[node].nativeRequires
    )) {
      visitNode(dep);
    }

    // now all of its dependencies will have been added to the list
    // so it's safe to add it to the load order array
    sorted.push(node);
    delete currentlyVisiting[node];
    visited[node] = true;
  };

  // now flag the nodes children as toVisit
  for (let dep of deps) {
    toVisit[dep] = true;
  }

  // as long as there are keys in toVisit, we need to keep visiting
  while (Object.keys(toVisit).length > 0) {
    let nextNode = Object.keys(toVisit)[0];
    visitNode(nextNode);
  }

  // now the dependencies have been sorted, so we can return the list
  return sorted;
};

/**
 * Define a module in the module table
 * @param {String} name
 * @param {String} file
 * @param {Module} mod
 */
const define = (name, file, mod) => {
  if (typeof mod?.create !== "function") {
    throw new Exception(`Module constructor for ${name} is not a function`);
  }

  if (file in moduleTable) {
    throw new Exception(`Module ${name} already queued`);
  }

  moduleTable[file] = mod;
};

/**
 * Evaluate the modules that have been queued up
 * @param {String[]} depsOrder
 * @param {Env} env
 * @param {Object} [kwargs]
 * @param {Boolean} [kwargs.open=false]
 * @param {String} [kwargs.as=""]
 */
const evaluateModules = (depsOrder, env, { open = false, as = "" } = {}) => {
  for (let dep of depsOrder) {
    let mods = [];
    for (let d of depsOrder) {
      // deps are file paths for already evaluated modules so
      // it's safe to use d as the key to get the module info
      // to populate dependencies for the module being evaluated
      mods.push(modules[d]);
    }

    // evaluate the module, passing in its dependencies
    modules[dep] = moduleTable[dep].create(...mods);

    // add module to the containing environment (probably global)
    if (open) {
      env.addMany(modules[dep]);
    } else if (as) {
      env.set(typeof as === "symbol" ? as : Symbol.for(as), modules[dep]);
    } else {
      env.set(Symbol.for(moduleTable[dep].name), modules[dep]);
    }
  }
};

const loadModules = ({
  name,
  path = "",
  env,
  open = false,
  as = "",
  native = false,
} = {}) => {
  if (path === "") {
    if (fs.existsSync(resolveRequire(name, { native }))) {
      path = resolveRequire(name, { native });
    } else {
      throw new Exception(
        `Could not resolve path to module ${name ?? "unknown module"}`
      );
    }
  }

  nameMap[name] = path;

  let mod;
  const defineModule = (path) => {
    if (path.endsWith(".js")) {
      mod = require(path);
    } else if (path.endsWith(".dan")) {
      // evaluate Daniel module
    } else {
      throw new Exception(`A module must be either a .js or .dan file`);
    }

    const rootDeps = getModulePaths(mod.requires, mod.nativeRequires);

    if (!(path in moduleTable)) {
      define(mod.name, path, mod);
    }

    for (let dep of rootDeps) {
      defineModule(dep);
    }
  };

  defineModule(path);
  const loadOrder = getLoadOrder([path]);
  evaluateModules(loadOrder, env, { open, as });

  return modules;
};

exports.loadModules = loadModules;
