// eslint-disable-next-line
const { makeFunction } = require("../runtime");
// eslint-disable-next-line
const { isList, List, list, cons } = require("../_internal/List");
// eslint-disable-next-line
const { Env } = require("./Env");
const { Forms } = require("./forms");
const { Lambda } = require("./Lambda");
const { isKeyword, isTruthy } = require("./utils");
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
      return evalLambda(ast.tail(), env);
    case Forms.Set:
      return evalSet(ast, env);
    case Forms.For:
      return evalFor(ast, env);
    case Forms.ForList:
      return evalForList(ast, env);
    default:
      return evalCall(ast, env);
  }
};

/**
 * Evaluate subexpressions of a block in order
 * @param {List} ast
 * @param {Env} env
 */
const evalDoBlock = (ast, env) => {
  let value;
  const exprs = ast.tail();

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

  if (typeof fn !== "function" && !fn.daniel) {
    throw new Error(
      `Call expression callee must be a function; ${typeof func} given`
    );
  }

  args = list(args.map((arg) => evaluate(arg, env)));

  if (fn.daniel) {
    // we're going to sloppily allow extra arguments to any function
    // because JS does and it's just easier that way
    fn.params.forEach((param, i) => {
      if (fn.variadic && i === fn.length) {
        fn.env.define(param, args.slice(i));
      } else {
        fn.env.define(param, args.get(i));
      }
    });

    // Body is do block, using loop to eliminate at least 1 recursive call
    const [, exprs] = fn.body;
    let value = null;

    for (let expr of exprs) {
      if (isList(expr)) {
        value = evalList(expr, fn.env);
      } else {
        value = evaluate(expr, fn.env);
      }
    }

    return value;
  }

  return fn(...args);
};

/**
 * Define a new symbol in the current environment
 * @param {List} ast
 * @param {Env} env
 */
const evalDefine = (ast, env) => {
  const [, name, value] = ast;

  if (isList(name)) {
    return evalFuncDef(ast, env);
  }

  if (typeof name !== "symbol") {
    throw new Error(
      `Variable definition must use a valid symbol; ${typeof name} given`
    );
  }

  env.define(name, evaluate(value, env));
};

/**
 * Sets a new value for an already-defined variable
 * @param {List} ast
 * @param {Env} env
 */
const evalSet = (ast, env) => {
  const [, name, value] = ast;

  if (typeof name !== "symbol") {
    throw new Error(
      `Variable name to set must be a valid symbol; ${typeof name} given`
    );
  }

  const setEnv = env.lookup(name);

  env.set(name, evaluate(value, setEnv));
};

/**
 * Evaluate an if expression
 * @param {List} ast
 * @param {Env} env
 */
const evalIf = (ast, env) => {
  const [, cond, then, orElse] = ast;

  if (isTruthy(evaluate(cond, env))) {
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
  return makeLambda(ast, env);
};

/**
 * Makes a Daniel function
 * @param {List} ast
 * @param {Env} env
 * @param {String} [name=lambda]
 * @returns {Lambda}
 */
const makeLambda = (ast, env, name = "lambda") => {
  const [args, ...body] = ast;
  const scope = env.extend("lambda");
  const blockBody = list(Symbol.for("do"), ...body);
  const restIdx = args.find((arg) => arg === "&");
  const variadic = restIdx > -1;
  const params = args.filter((arg) => arg !== "&");
  const length = variadic ? params.length - 1 : params.length;

  return new Lambda(scope, params, variadic, blockBody, length, name);
};

/**
 * Evaluates a function definition using define
 * @param {List} ast
 * @param {Env} env
 */
const evalFuncDef = (ast, env) => {
  const [, header, body] = ast;
  const name = header.first();
  const args = header.tail();
  let blockBody = list(Symbol.for("do")).append(body);

  if (typeof name !== "symbol") {
    throw new Error(
      `Function definition name must be a symbol; ${typeof name} given`
    );
  }

  const fn = makeLambda(list(args, blockBody), env, Symbol.keyFor(name));

  env.define(name, fn);
};

/**
 * Evaluates a for loop
 * @param {List} ast
 * @param {Env} env
 */
const evalFor = (ast, env) => {
  const [, binding, ...body] = ast;
  const [name, iter] = binding;
  const blockBody = list(Symbol.for("do"), ...body);
  const iterator = evaluate(iter, env);
  let retVal;

  for (let value of iterator) {
    env.set(name, iterator instanceof Map ? cons(value[0], value[1]) : value);
    retVal = evaluate(blockBody, env);
  }

  return retVal;
};

/**
 * Evaluates a list comprehension
 * @param {List} ast
 * @param {Env} env
 */
const evalForList = (ast, env) => {
  const [, binding, ...body] = ast;
  const [name, iter, ...whenClause] = binding;
  const blockBody = list(Symbol.for("do"), ...body);
  const iterator = evaluate(iter, env);
  const [, predAST] = whenClause;
  let l = new List();

  for (let value of iterator) {
    env.set(name, value);
    const predicate = predAST?.length > 0 ? evaluate(predAST, env) : true;

    if (predicate) {
      l.append(evaluate(blockBody, env));
    }
  }

  return l;
};

exports.evaluate = evaluate;
