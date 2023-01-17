/**
 * Iterable range that doesn't have the memory overhead of a list
 * @property {Number} start
 * @property {Number} end
 * @property {Number} step
 * @property {Number} range
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
    this.step = step < 0 ? -step : step;
    this.length = Math.abs(this.end - this.start);
  }

  *[Symbol.iterator]() {
    let i = this.start;
    if (this.end < this.start) {
      while (i > this.end) {
        yield i--;
      }
    } else {
      while (i < this.end) {
        yield i++;
      }
    }
  }
}

exports.range = (start, end, step = 1) => {
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }

  return new Range(start, end, step);
};
