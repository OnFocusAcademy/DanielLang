// eslint-disable-next-line
const { makeClass } = require("../runtime");
const { isList, List, list, cons } = require("../_internal/List");
// eslint-disable-next-line
const { Env } = require("./Env");
const { Forms } = require("./forms");
const { isKeyword, isTruthy, isSelfQuoting } = require("./utils");
const { evalModule, evalImport } = require("./module");
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

  if (ast instanceof Map && ast.literal) {
    let m = new Map();
    for (let [k, v] of ast) {
      m.set(evaluate(k, env), evaluate(v, env));
    }
    return m;
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
 * Determines if an AST value is a macro call
 * @param {import("../reader/read").AST} ast
 * @param {Env} env
 */
const isMacroCall = (ast, env) => {
  if (isList(ast)) {
    const [first] = ast;

    if (typeof first === "symbol" && !isKeyword(first)) {
      return env.exists(first) && env.get(first)?.isMacro === true;
    }
  }

  return false;
};

/**
 * Expand macros into AST
 * @param {import("../reader/read").AST} ast
 * @param {Env} env
 */
const macroexpand = (ast, env) => {
  while (isMacroCall(ast, env)) {
    const [name] = ast;
    let macro = env.get(name);

    ast = macro(...ast.tail());
  }

  return ast;
};

/**
 * Evaluate a list form
 * @param {List} ast
 * @param {Env} env
 */
const evalList = (ast, env) => {
  ast = macroexpand(ast, env);

  if (!isList(ast)) {
    return ast;
  }

  let [fst] = ast;

  if (isList(fst)) {
    fst = evalList(fst, env);
  }

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
    case Forms.DefMacro:
      return evalDefMacro(ast, env);
    case Forms.Macroexpand:
      return macroexpand(ast.get(1), env);
    case Forms.Class:
      return evalClassDecl(ast, env);
    case Forms.Try:
      return evalTryCatch(ast, env);
    case Forms.Import:
      return evalImport(ast, env, evaluate);
    case Forms.Module:
      return evalModule(ast, env, evaluate);
    case Forms.Async:
      return evalFuncDef(ast, env, false, true);
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

  // allow keyword key access to maps and objects as if keyword was a function
  if (isKeyword(fn)) {
    const obj = evaluate(args[0], env);

    if (fn === Symbol.for(":await")) {
      return obj.then && typeof obj.then === "function"
        ? awaitCall(args[0], env)
        : obj;
    }

    return obj instanceof Map ? obj.get(fn) : obj[fn];
  }

  fn = typeof fn === "function" ? fn : evaluate(fn, env);

  if (typeof fn !== "function") {
    throw new Error(
      `Call expression callee must be a function; ${typeof fn} given`
    );
  }

  args = args.map((arg) => evaluate(arg, env));

  return fn(...args);
};

const awaitCall = async (ast, env) => {
  return await evaluate(ast, env);
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

  // else branch
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
const makeLambda = (
  ast,
  env,
  name = "lambda",
  isMacro = false,
  isAsync = false
) => {
  const [args, ...body] = ast;
  const blockBody = list(Symbol.for("do"), ...body);
  const restIdx = args.findIndex((arg) => arg === "&");
  const variadic = restIdx > -1;
  const params = args.filter((arg) => arg !== "&");
  const length = variadic ? params.length - 1 : params.length;
  const danielFn = isAsync
    ? async (...args) =>
        await evalLambdaBody(params, args, blockBody, env, variadic, name)
    : (...args) => evalLambdaBody(params, args, blockBody, env, variadic, name);

  danielFn.daniel = true;
  danielFn.__name__ = name;
  danielFn.__length__ = length;
  danielFn.isMacro = isMacro;
  danielFn.isAsync = isAsync;

  return danielFn;
};

const evalLambdaBody = (params, args, blockBody, env, variadic, name) => {
  /**
   * @type {Env}
   */
  const scope = env.extend(name);
  // we're going to sloppily allow extra arguments to any function
  // because JS does and it's just easier that way
  params.forEach((param, i) => {
    if (variadic && i === length) {
      scope.define(param, args.slice(i));
    } else {
      scope.define(param, args[i]);
    }
  });

  return evaluate(blockBody, scope);
};

/**
 * Evaluates a function definition using define
 * @param {List} ast
 * @param {Env} env
 */
const evalFuncDef = (ast, env, isMacro = false, isAsync = false) => {
  const [, header, body] = ast;
  const name = header.first();
  const args = header.tail();

  if (typeof name !== "symbol") {
    throw new Error(
      `Function definition name must be a symbol; ${typeof name} given`
    );
  }

  const fn = makeLambda(
    list(args, body),
    env,
    Symbol.keyFor(name),
    isMacro,
    isAsync
  );

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
        return list(Symbol.for("cons"), el.get(1), l);
      }
      return list(quasiquote(el, env), ...l);
    }, new List());
  }

  return typeof ast === "symbol" && !isKeyword(ast)
    ? list(Symbol.for("quote"), ast)
    : ast;
};

/**
 * Defines a macro
 * @param {List} ast
 * @param {Env} env
 */
const evalDefMacro = (ast, env) => {
  return evalFuncDef(ast, env, true);
};

/**
 * Defines a class
 * @param {List} ast
 * @param {Env} env
 */
const evalClassDecl = (ast, env) => {
  let [, className, maybeExtends, maybeSuper] = [...ast];
  /**
   * @type {Function}
   */
  const superClass =
    isKeyword(maybeExtends) && maybeExtends === Symbol.for(":extends")
      ? evaluate(maybeSuper, env)
      : Object;
  const defns =
    isKeyword(maybeExtends) && maybeExtends === Symbol.for(":extends")
      ? ast.slice(4)
      : ast.slice(2);
  // includes both static methods and properties
  let staticMethods = new Map();
  let instanceMethods = new Map();
  let fields = [];

  for (let defn of defns) {
    const [fst, maybeStatic] = defn;

    if (fst === Symbol.for("new")) {
      fields = defineNew(defn);
    } else if (maybeStatic === Symbol.for(":static")) {
      const [, , init, body] = defn;

      // static property definition
      if (typeof init === "symbol") {
        staticMethods.set(
          isKeyword(init) ? init : Symbol.keyFor(init),
          evaluate(body, env)
        );
      } else {
        const [name] = init;
        staticMethods.set(
          isKeyword(name) ? name : Symbol.keyFor(name),
          defineMethod(
            defn.slice(2),
            env,
            Symbol.keyFor(className),
            superClass,
            true
          )
        );
      }
    } else {
      const [, init] = defn;
      const name = init?.get(0) ?? Symbol.for("");
      instanceMethods.set(
        isKeyword(name) ? name : Symbol.keyFor(name),
        defineMethod(defn.slice(1), env, Symbol.keyFor(className), superClass)
      );
    }
  }

  env.set(
    className,
    makeClass(className, fields, instanceMethods, staticMethods, superClass)
  );
};

/**
 * Defines a method on a class or instance
 * @param {List} ast
 * @param {Env} env
 */
const defineMethod = (ast, env, className, superClass, static = false) => {
  const [args, ...body] = ast;
  const blockBody = list(Symbol.for("do"), ...body);
  const params = args.reduce(
    (args, arg) => (arg === "&" ? args : [...args, arg]),
    []
  );
  const restIdx = args.findIndex((arg) => arg === "&");
  const variadic = restIdx > -1;
  const length = variadic ? params.length - 1 : params.length;

  const method = function (...args) {
    const scope = env.extend(className);
    scope.define(
      Symbol.for("super"),
      static ? superClass : superClass.prototype
    );

    params.forEach((param, i) => {
      if (i === 0) {
        scope.define(param, this);
      } else if (variadic && i === length) {
        scope.define(param, args.slice(i));
      } else {
        scope.define(param, args[i]);
      }
    });

    return evaluate(blockBody, scope);
  };

  return method;
};

/**
 * Defines the new constructor that sets fields for a class
 * @param {List} ast
 * @param {Env} env
 */
const defineNew = (ast) => {
  const [, ...args] = ast;
  return args.reduce((args, arg) => {
    if (arg === "&") {
      return args;
    }
    return [...args, Symbol.keyFor(arg)];
  }, []);
};

/**
 * Evaluate a try/catch block
 * @param {List} ast
 * @param {Env} env
 */
const evalTryCatch = (ast, env) => {
  const [, tryExpr, catchClause] = ast;

  try {
    return evaluate(tryExpr, env);
  } catch (e) {
    const [, exn, catchExpr] = catchClause;

    if (typeof exn !== "symbol") {
      throw new Error(`Catch argument must be a symbol; ${typeof exn} given`);
    }

    const scope = env.extend("try/catch");
    scope.set(exn, e);
    return evaluate(catchExpr, scope);
  }
};

exports.evaluate = evaluate;
