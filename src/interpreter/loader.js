const { resolveRequire, Exception } = require("../runtime");
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
  let urls = [];

  for (let req of requires) {
    let url = resolveRequire(req);
    nameMap[url] = req;
    urls.push(url);
  }

  for (let req of nativeRequires) {
    let url = resolveRequire(req, { native: true });
    nameMap[url] = req;
    urls.push(url);
  }

  return urls;
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

const define = (name, file, deps, module) => {
  if (typeof module !== "function") {
    throw new Exception(`Module constructor for ${name} is not a function`);
  }

  if (file in moduleTable) {
    throw new Exception(`Module ${name} already queued`);
  }

  moduleTable[file] = { name, file, deps, module };
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
    let deps = moduleTable[dep].deps;
    let mods = [];

    for (let d of deps) {
      // depsOrder starts with an already sorted array from the dependency graph
      // so we can just iterate over it since deps are already resolved
      mods.push(modules[d]);
    }

    // evaluate the module, passing in its dependencies
    modules[dep] = moduleTable[dep].module(...mods);

    // add module to the containing environment (probably global)
    if (open) {
      env.addMany(modules[dep]);
    } else if (as) {
      env.define(as, modules[dep]);
    } else {
      env.define(moduleTable[dep].name, modules[dep]);
    }
  }
};
