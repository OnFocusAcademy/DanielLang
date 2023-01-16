// eslint-disable-next-line
const { TokenTypes } = require("./TokenTypes");

/**
 * Represents a single lexeme
 * @property {TokenTypes} type
 * @property {String} value
 * @property {Number} pos
 */
class Token {
  /**
   * Constructor for Token class
   * @param {TokenTypes} type
   * @param {String} value
   * @param {Number} pos
   */
  constructor(type, value, pos) {
    this.type = type;
    this.value = value;
    this.pos = pos;
  }

  /**
   * Determines if the current token matches type
   * @param {String} type token type
   * @returns {Boolean}
   */
  match(type) {
    return this.type === type;
  }
}

/**
 * Constructs a new Token
 * @param {TokenTypes} type
 * @param {String} value
 * @param {Number} pos
 * @returns {Token}
 */
const token = (type, value, pos) => new Token(type, value, pos);

module.exports = { Token, token };
