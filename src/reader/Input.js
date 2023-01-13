/**
 * Class to manage input string state
 * @property {String} input
 * @property {Number} pos
 * @property {Number} length length of the input buffer
 */
exports.Input = class Input {
  /**
   * Constructs the Input object
   * @param {String} input
   */
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.length = input.length;
  }

  /**
   * Check if we've reached the end of the input
   * @returns {Boolean}
   */
  eof() {
    return this.pos >= this.length;
  }

  /**
   * Get the character at the current position and advance the pointer by one
   * @returns {String}
   */
  next() {
    return this.input[this.pos++];
  }

  /**
   * Get the character at the current position
   * @returns {String}
   */
  peek() {
    return this.input[this.pos];
  }

  /**
   * Keep collecting text as long as test is true
   * @param {Function} test predicate to test if we should keep reading or not
   */
  readWhile(test) {
    let result = "";

    while (test(this.peek()) && !this.eof()) {
      result += this.next();
    }

    return result;
  }
};
