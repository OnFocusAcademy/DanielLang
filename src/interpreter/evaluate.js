// eslint-disable-next-line
const { isList, List } = require("../_internal/List");
const { Forms } = require("./forms");
const { isKeyword } = require("./utils");
/**
 * Evaluate an AST as code
 * @param {import("../reader/read").AST} ast
 */
const evaluate = (ast) => {
  if (isList(ast)) {
    // evaluate form
    return evalList(ast);
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
      return evalSymbol(ast);
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
      throw new Error(`Unrecognized AST value ${fst}`);
  }
};

/**
 * Evaluate subexpressions of a block in order
 * @param {List} ast
 * @returns {import("../reader/read").AST|Object}
 */
const evalDoBlock = (ast) => {
  let value;

  for (let expr of ast) {
    value = evaluate(expr);
  }

  return value;
};

const evalSymbol = () => {};

exports.evaluate = evaluate;
