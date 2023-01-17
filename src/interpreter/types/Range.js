/**
 * Iterable range that doesn't have the memory overhead of a list
 * @property {Number} start
 * @property {Number} end
 * @property {Number} step
 * @property {Number} length
 */
class Range {
  /**
   * Constructs the Range class
   * @param {Number} start
   * @param {Number} end
   * @param {Number} step
   */
  constructor(start, end, step) {
    this.start = start;
    this.end = end;
    this.step = Math.abs(step);
    this.length = Math.abs(this.end - this.start);
  }

  *[Symbol.iterator]() {
    let i = this.start;
    if (this.end < this.start) {
      while (i > this.end) {
        yield i;
        i -= this.step;
      }
    } else {
      while (i < this.end) {
        yield i;
        i += this.step;
      }
    }
  }

  toString() {
    return `Range { start: ${this.start} end: ${this.end} step: ${this.step} }`;
  }
}

exports.range = (start, end, step = 1) => {
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }

  return new Range(start, end, step);
};
