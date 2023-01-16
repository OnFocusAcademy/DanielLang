const { Env } = require("../interpreter/Env");
const { provides: core } = require("../../lib/js/core");
const { makeFunction } = require("../runtime");
const { evaluate } = require("../interpreter/evaluate");

exports.createGlobalEnv = () => {
  let env = Env.from(core);

  env.set(
    Symbol.for("eval"),
    makeFunction((ast) => evaluate(ast, env), { name: "Daniel.core.eval" })
  );

  return env;
};
