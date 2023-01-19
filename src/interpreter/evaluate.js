// eslint-disable-next-line
const { isList, List, list, cons } = require("../_internal/List");
// eslint-disable-next-line
const { Env } = require("./Env");
const { Forms } = require("./forms");
const { Lambda } = require("./Lambda");
const {
  isKeyword,
  isTruthy,
  isSelfQuoting,
  evalDanielFuncCall,
} = require("./utils");
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
    case Forms.Quote:
      return ast.get(1);
    case Forms.QuasiQuote:
      return quasiquote(ast.get(1), env);
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
    if (isSelfQuoting(expr)) {
      value = expr;
    } else if (typeof expr === "symbol") {
      value = env.get(expr);
    } else if (isList(expr)) {
      value = evalList(expr, env);
    } else {
      // will we ever get here?
      value = evaluate(expr, env);
    }
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
      `Call expression callee must be a function; ${typeof fn} given`
    );
  }

  args = args.map((arg) => evaluate(arg, env));

  if (fn.daniel) {
    return evalDanielFuncCall(fn, evaluate, ...args);
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
    // then branch
    if (isSelfQuoting(then)) {
      return then;
    } else if (typeof then === "symbol") {
      return env.get(then);
    } else if (isList(then)) {
      return evalList(then, env);
    } else {
      // will we ever get here?
      return evaluate(then, env);
    }
  }

  // else branch
  if (isSelfQuoting(orElse)) {
    return orElse;
  } else if (typeof orElse === "symbol") {
    return env.get(orElse);
  } else if (isList(orElse)) {
    return evalList(orElse, env);
  } else {
    // will we ever get here?
    return evaluate(orElse, env);
  }
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
  const blockBody = list(Symbol.for("do"), ...body);
  const restIdx = args.findIndex((arg) => arg === "&");
  const variadic = restIdx > -1;
  const params = args.filter((arg) => arg !== "&");
  const length = variadic ? params.length - 1 : params.length;
  const fn = new Lambda(env, params, variadic, blockBody, length, name);
  const danielFn = (...args) => evalDanielFuncCall(fn, evaluate, ...args);

  danielFn.daniel = true;
  danielFn.name = name;
  return danielFn;
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

  if (typeof name !== "symbol") {
    throw new Error(
      `Function definition name must be a symbol; ${typeof name} given`
    );
  }

  const fn = makeLambda(list(args, body), env, Symbol.keyFor(name));
  const danielFn = (...args) => evalDanielFuncCall(fn, evaluate, ...args);

  env.define(name, danielFn);
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
    for (let expr of blockBody) {
      if (isSelfQuoting(expr)) {
        return expr;
      } else if (typeof expr === "symbol") {
        return env.get(expr);
      } else if (isList(expr)) {
        return evalList(expr, env);
      } else {
        // will we ever get here?
        return evaluate(expr, env);
      }
    }
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
    for (let expr of blockBody) {
      const predicate = predAST?.length > 0 ? evaluate(predAST, env) : true;

      if (predicate) {
        if (isSelfQuoting(expr)) {
          l.append(expr);
        } else if (typeof expr === "symbol") {
          l.append(env.get(expr));
        } else if (isList(expr)) {
          l.append(evalList(expr, env));
        } else {
          // will we ever get here?
          l.append(evaluate(expr, env));
        }
      }
    }
  }

  return l;
};

/**
 * Quasiquote
 * @param {List} ast
 * @param {Env} env
 */
const quasiquote = (ast, env) => {
  if (isList(ast)) {
    const head = ast.first();
    if (head === Symbol.for("unquote")) {
      return evaluate(ast.get(1), env);
    }

    return ast.reduceRight((l, el) => {
      if (isList(el) && el.first() === Symbol.for("splice-unquote")) {
        return list(...el.tail(), ...l);
      }
      return list(quasiquote(el, env), ...l);
    }, new List());
  }

  return typeof ast === "symbol" && !isKeyword(ast)
    ? list(Symbol.for("quote"), ast)
    : ast;
};

exports.evaluate = evaluate;
