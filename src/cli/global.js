const { Env } = require("../interpreter/Env");
const { module: core } = require("../../lib/js/Core");
const { makeFunction } = require("../runtime");
const { evaluate } = require("../interpreter/evaluate");

const createGlobalEnv = () => {
  let env = Env.from(core());

  env.set(
    Symbol.for("eval"),
    makeFunction((ast) => evaluate(ast, env), { name: "Daniel.core.eval" })
  );

  return env;
};

exports.global = createGlobalEnv();
