/**
 * Represents a single lexeme
 * @property {String} type
 * @property {String} value
 */
class Token {
  /**
   * Constructor for Token class
   * @param {String} type
   * @param {String} value
   */
  constructor(type, value) {
    this.type = type;
    this.value = value;
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
 * @param {String} type
 * @param {String} value
 * @returns {Token}
 */
const token = (type, value) => new Token(type, value);

module.exports = { Token, token };
