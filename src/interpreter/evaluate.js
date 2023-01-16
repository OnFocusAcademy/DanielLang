// eslint-disable-next-line
const { isList, List } = require("../_internal/List");
// eslint-disable-next-line
const { Env } = require("./Env");
const { Forms } = require("./forms");
const { isKeyword } = require("./utils");
/**
 * Evaluate an AST as code
 * @param {import("../reader/read").AST} ast
 * @param {Env} env
 */
const evaluate = (ast, env) => {
  if (isList(ast)) {
    // evaluate form
    return evalList(ast, env);
  }

  switch (typeof ast) {
    case "number":
    case "string":
    case "boolean":
    case "object":
      return ast;
    case "symbol":
      if (isKeyword(ast)) {
        return ast;
      }
      return evalSymbol(ast, env);
    default:
      throw new Error(`Unknown AST ${ast}`);
  }
};

/**
 *
 * @param {List} ast
 * @returns {import("../reader/read").AST|Object}
 */
const evalList = (ast, env) => {
  const [fst] = ast;

  switch (fst.description) {
    case Forms.Do:
      return evalDoBlock(ast, env);
    case Forms.Define:
      return evalDefine(ast, env);
    default:
      return evalCall(ast, env);
  }
};

/**
 * Evaluate subexpressions of a block in order
 * @param {List} ast
 * @returns {import("../reader/read").AST|Object}
 */
const evalDoBlock = (ast, env) => {
  let value;
  const [, exprs] = ast;

  for (let expr of exprs) {
    value = evaluate(expr, env);
  }

  return value;
};

/**
 * Looks up a symbol in the current environment and returns its value
 * @param {Symbol} ast
 * @param {Env} env
 */
const evalSymbol = (ast, env) => {
  return env.get(ast);
};

/**
 * Evaluate a call expression
 * @param {import("../reader/read").AST} ast
 * @param {Env} env
 */
const evalCall = (ast, env) => {
  let [fn, ...args] = ast;
  fn = evaluate(fn, env);

  if (typeof fn !== "function") {
    throw new Error(
      `Call expression callee must be a function; ${typeof func} given`
    );
  }

  args = args.map((arg) => evaluate(arg, env));

  return fn(...args);
};

/**
 * Define a new symbol in the current environment
 * @param {import("../reader/read").AST} ast
 * @param {Env} env
 */
const evalDefine = (ast, env) => {
  const [, name, value] = ast;
  env.define(name, evaluate(value, env));
};

exports.evaluate = evaluate;
