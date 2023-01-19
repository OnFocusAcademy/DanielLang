const { curry } = require("ramda");
const { Lambda } = require("./Lambda");

const isKeyword = (obj) =>
  typeof obj === "symbol" && obj.description.startsWith(":");
exports.isKeyword = isKeyword;
const isFalsy = (val) => val === false || val == null;
exports.isFalsy = isFalsy;
exports.isTruthy = (val) => isFalsy(val);

// Self-quoting data is AST data that evaluates to itself, i.e.
// doesn't have to be looked up in an environment. Native
// functions are self-quoting objects for our purposes
const isSelfQuoting = (val) =>
  ["string", "number", "boolean", "undefined", "function"].includes(
    typeof val
  ) ||
  // make sure it's not a Daniel function
  (typeof val === "object" && !val?.daniel && !(val?.isList && val.isList())) ||
  isKeyword(val);
exports.isSelfQuoting = isSelfQuoting;

const evalDanielFuncCall = (fn, evaluator, ...args) => {
  /**
   * @type {Env}
   */
  const scope = fn.env.extend(fn.__name__);
  // we're going to sloppily allow extra arguments to any function
  // because JS does and it's just easier that way
  fn.params.forEach((param, i) => {
    if (fn.variadic && i === fn.length) {
      scope.define(param, args.slice(i));
    } else {
      scope.define(param, args[i]);
    }
  });

  // Body is do block, using loop to eliminate at least 1 recursive call
  let value = null;

  // skip do symbol
  for (let expr of fn.body.tail()) {
    // avoid recursive calls to evaluate as much as possible
    // so we can have more recursion with in-language
    // functions before we blow the stack - I think
    // this is as close to TCO as we can get
    if (isSelfQuoting(expr)) {
      value = expr;
    } else if (typeof expr === "symbol") {
      value = scope.get(expr);
    } else {
      value = evaluator(expr, scope);
    }
  }

  return value;
};
exports.evalDanielFuncCall = evalDanielFuncCall;

exports.curry = (fn, evaluator) => {
  if (!fn.daniel) {
    // native function
    return curry(fn);
  }
  // Daniel function
  // call the function with the given arguments and return a new
  // Lambda with the given arguments bound to their names and the
  // unused parameters as the parameters to the new function
  const curried = (...args) => {
    if (args.length < fn.length) {
      const usedParams = fn.params.slice(0, args.length - 1);
      let i = 0;
      for (let param of usedParams) {
        fn.env.define(param, args[i]);
        i++;
      }
      const newParams = fn.params.slice(args.length - 1);
      const fn = new Lambda(
        fn.env,
        newParams,
        fn.variadic,
        fn.body,
        fn.variadic ? newParams.length - 1 : newParams.length,
        `${fn.__name__} (partial ${usedParams.length})`
      );
      const danielFn = (...args) => evalDanielFuncCall(fn, evaluator, ...args);

      return danielFn;
    }
  };
  return curried;
};
