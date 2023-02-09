const { Env } = require("../interpreter/Env");
const { loadModules } = require("../interpreter/loader");
const { makeFunction } = require("../runtime");
const { evaluate } = require("../interpreter/evaluate");

const createGlobalEnv = () => {
  const env = new Env({ parent: null, name: "__global__" });
  loadModules({ name: "Core", env, native: true, open: true, evaluate });
  loadModules({ name: "String", env, native: true, evaluate });
  loadModules({ name: "Base", env, open: true, evaluate });
  env.set(
    Symbol.for("eval"),
    makeFunction((ast) => evaluate(ast, env), { name: "Core.eval" })
  );

  return env;
};

exports.global = createGlobalEnv();
