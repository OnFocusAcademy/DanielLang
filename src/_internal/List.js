const Cons = require("./Cons.js");

/**
 * Singly linked list class to use as AST
 *
 * Maintains a reference to the last node in the list to make some operations easier
 *
 * @property {Any} head
 * @property {Cons | null} end
 * @property {Number} length
 */
class List {
  constructor() {
    this.head = null;
    this.end = null;
    this.length = 0;
  }

  /**
   * Append a new node to the end of the list
   * @param {Any} value
   * @returns {this}
   */
  append(value) {
    const node = cons(value, null);

    if (!this.head) {
      this.head = node;
      this.end = node;
    } else {
      const last = this.end;
      last.tail = node;
      this.end = node;
    }

    this.length++;
    return this;
  }

  /**
   * Return a new list with every element in the current list that satisfies fn
   * @param {Function} fn filter predicate
   */
  filter(fn) {
    let filtered = new List();

    for (let value of this) {
      if (fn(value)) {
        filtered.append(value);
      }
    }

    return this.length ? filtered : null;
  }

  /**
   * Get the value at i in the current List
   * @param {Number} i index
   */
  get(i) {
    let idx = 0;

    for (let value of this) {
      if (i === idx) {
        return value;
      }

      idx++;
    }

    throw new Error(
      `Index out of bounds error: list does not contain ${i} elements`
    );
  }

  /**
   * Check if list has an element at index i
   * @param {Number} i
   * @returns {Boolean}
   */
  has(i) {
    let idx = 0;

    // eslint-disable-next-line
    for (let _ of this) {
      if (i === idx) {
        return true;
      }
    }

    return false;
  }

  /**
   * Return a new list with each element of the current list transformed by fn
   * @param {Function} fn mapper function
   */
  map(fn) {
    let mapped = new List();

    for (let value of this) {
      mapped.append(fn(value));
    }

    return this.length ? mapped : null;
  }

  /**
   * Cons a value onto the head of the list
   * @param {Any} value
   */
  prepend(value) {
    const head = this.head;
    const node = cons(value, head);
    this.head = node;

    this.length++;
    return this;
  }

  /**
   * Apply a reducer function to the current list and return the final value
   * @param {Function} fn reducer
   * @param {Any} init initial accumulator value
   */
  reduce(fn, init) {
    let accum = init;

    for (let value of this) {
      accum = fn(accum, value);
    }

    return accum;
  }

  *[Symbol.iterator]() {
    let head = this.head;

    while (head) {
      yield head.head;
      head = head.tail;
    }
  }
}

/**
 *
 * @param {Any} head
 * @param {Any} tail
 * @returns {Cons}
 */
const cons = (head, tail) => {
  if (tail instanceof List) {
    return list(head, ...tail);
  } else if (tail == null) {
    return list(head);
  }

  return new Cons(head, tail);
};

const list = (...args) => {
  const l = new List();

  for (let arg of args) {
    l.append(arg);
  }

  return l;
};
