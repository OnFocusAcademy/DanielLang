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
    let path = resolveRequire(req);
    nameMap[path] = req;
    paths.push(path);
  }

  for (let req of nativeRequires) {
    let path = resolveRequire(req, { native: true });
    nameMap[path] = req;
    paths.push(path);
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
      // it's alreaady been loaded, so we're good
      return;
    }

    // if we get here, the node is unvisited so we mark it as currently being visited
    currentlyVisiting[node] = true;

    if (node in toVisit) {
      // we're visiting it now, so we can remove it from toVisit
      delete toVisit[node];
    }

    // now visit its children recursively
    for (let dep of moduleTable[node].deps) {
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
    let nextNode = Object.keys()(toVisit)[0];
    visitNode(nextNode);
  }

  // now the dependencies have been sorted, so we can return the list
  return sorted;
};

/**
 * Define a module in the module table
 * @param {String} name
 * @param {String} file
 * @param {Module} module
 */
const define = (name, file, module) => {
  if (typeof module !== "function") {
    throw new Exception(`Module constructor for ${name} is not a function`);
  }

  if (file in moduleTable) {
    throw new Exception(`Module ${name} already queued`);
  }

  moduleTable[file] = module;
};

/**
 * Evaluate the modules that have been queued up
 * @param {String[]} depsOrder
 * @param {Object} deps
 * @param {Env} env
 * @param {Object} [kwargs]
 * @param {Boolean} [kwargs.open=false]
 * @param {String} [kwargs.as=""]
 */
const evaluateModules = (
  depsOrder,
  deps,
  env,
  { open = false, as = "" } = {}
) => {
  for (let dep of depsOrder) {
    let mods = [];
    let ds = getModulePaths(deps.requires, deps.nativeRequires);

    for (let d of ds) {
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
      env.define(Symbol.for(as), modules[dep]);
    } else {
      env.define(Symbol.for(nameMap[dep]), modules[dep]);
    }
  }
};

const loadModules = ({ name, path = "", env, open = false, as = "" } = {}) => {
  if (path === "") {
    if (fs.existsSync(resolveRequire(name))) {
      path = resolveRequire(name);
    } else {
      throw new Exception(
        `Could not resolve path to module ${name ?? "unknown module"}`
      );
    }
  }

  nameMap[path] = name;

  const defineModule = (path) => {
    let module;

    if (path.endsWith(".js")) {
      module = require(path);
    } else if (path.endsWith(".dan")) {
      // evaluate Daniel module
    } else {
      throw new Exception(`A module must be either a .js or .dan file`);
    }

    const rootDeps = getModulePaths(module.requires, module.nativeRequires);

    if (!(path in moduleTable)) {
      define(module.name, path, module);
    }

    for (let dep of rootDeps) {
      defineModule(dep);
    }
  };

  defineModule(path);
  const loadOrder = getLoadOrder([path]);
  evaluateModules(
    loadOrder,
    {
      requires: module.requires,
      nativeRequires: module.nativeRequires,
    },
    env,
    { open, as }
  );

  return modules;
};

exports.loadModules = loadModules;
