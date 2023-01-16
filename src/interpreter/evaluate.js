// eslint-disable-next-line
const { makeFunction } = require("../runtime");
// eslint-disable-next-line
const { isList, List } = require("../_internal/List");
// eslint-disable-next-line
const { Env } = require("./Env");
const { Forms } = require("./forms");
const { isKeyword, isFalsy } = require("./utils");
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
 * Evaluate a list form
 * @param {List} ast
 */
const evalList = (ast, env) => {
  const [fst] = ast;

  switch (fst.description) {
    case Forms.Do:
      return evalDoBlock(ast, env);
    case Forms.Define:
      return evalDefine(ast, env);
    case Forms.If:
      return evalIf(ast, env);
    case Forms.Lambda:
      return evalLambda(ast, env);
    default:
      return evalCall(ast, env);
  }
};

/**
 * Evaluate subexpressions of a block in order
 * @param {List} ast
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
 * @param {List} ast
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
 * @param {List} ast
 * @param {Env} env
 */
const evalDefine = (ast, env) => {
  const [, name, value] = ast;
  env.define(name, evaluate(value, env));
};

/**
 * Evaluate an if expression
 * @param {List} ast
 * @param {Env} env
 */
const evalIf = (ast, env) => {
  const [, cond, then, orElse] = ast;

  if (!isFalsy(evaluate(cond, env))) {
    return evaluate(then, env);
  }

  return evaluate(orElse, env);
};

/**
 * Evaluate a lambda expression
 * @param {List} ast
 * @param {Env} env
 */
const evalLambda = (ast, env) => {
  return makeLambda(ast.tail(), env);
};

/**
 * Creates a function
 * @param {List} ast
 * @param {Env} env
 * @param {String} [name=lambda]
 */
const makeLambda = (ast, env, name = "lambda") => {
  const [args, body] = ast;
  const lambda = (...params) => {
    let scope = env.extend(name);
    args.forEach((arg, i) => scope.define(arg, evaluate(params[i], env)));

    return evaluate(body, scope);
  };

  return makeFunction(lambda, { name });
};

exports.evaluate = evaluate;
