const { Env } = require("../interpreter/Env");
const { provides: core } = require("../../lib/js/core");
const { makeFunction } = require("../runtime");
const { evaluate } = require("../interpreter/evaluate");
const { curry } = require("../interpreter/utils");

const createGlobalEnv = () => {
  let env = Env.from(core);

  env.set(
    Symbol.for("eval"),
    makeFunction((ast) => evaluate(ast, env), { name: "Daniel.core.eval" })
  );
  env.set(
    Symbol.for("curry"),
    makeFunction((fn) => curry(fn, evaluate), { name: "Daniel.core.curry" })
  );

  return env;
};

exports.global = createGlobalEnv();
