const path = require("path");
const { isList } = require("../_internal/List");
const { makeModule, resolveRequire } = require("../runtime");
const { loadModules } = require("./loader");
const { isError } = require("../utils");

/**
 * Evaluate an import expression
 * @param {List} ast
 * @param {Env} env
 */
exports.evalImport = (ast, env, evaluate) => {
  const [, mod, , as] = ast;
  const name =
    typeof mod === "symbol"
      ? Symbol.keyFor(mod)
      : mod.startsWith(".")
      ? mod // must be an absolute path or file URL
      : path.basename(mod).split(".")[0];
  const cwd = process.cwd();
  const native = !isError(() =>
    resolveRequire(name, { basePath: cwd, native: true })
  );
  const filePath = resolveRequire(name, {
    basePath: cwd,
    native,
  });

  loadModules({ name, path: filePath, env, as, native, evaluate });
};

/**
 * Evaluates a Daniel module
 * @param {List} ast
 * @param {Env} env
 */
exports.evalModule = (ast, env, evaluate) => {
  const [, name, ...body] = ast;
  const moduleEnv = env.extend(Symbol.keyFor(name));
  let provides = {};

  for (let expr of body) {
    let fst = isList(expr) && expr.first();
    if (fst === Symbol.for("provide")) {
      // will have exactly 2 nodes, both symbols, 2nd is variable name for value to provide
      let sym = expr.get(1);
      provides[Symbol.keyFor(sym)] = evaluate(sym, moduleEnv);
    } else {
      // is definition or side effect
      evaluate(expr, moduleEnv);
    }
  }

  return makeModule(Symbol.keyFor(name), () => provides);
};
