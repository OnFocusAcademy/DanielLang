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
const evalList = (ast) => {
  const [fst] = ast;

  switch (fst.description) {
    case Forms.Do:
      return evalDoBlock(ast);
    default:
      throw new Error(`Unrecognized AST value ${String(fst)}`);
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

exports.evaluate = evaluate;
