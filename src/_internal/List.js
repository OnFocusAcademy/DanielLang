const { printList } = require("../printer/print");
const { Cons } = require("./Cons.js");

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

    let i = 0;
    for (let value of this) {
      if (fn(value, i)) {
        filtered.append(value);
      }

      i++;
    }

    return filtered.length ? filtered : null;
  }

  /**
   * Get the first element in the list
   */
  first() {
    return this.head?.head ?? null;
  }

  /**
   * Applies a function to every element of the list
   * @param {Function} fn
   */
  forEach(fn) {
    let i = 0;
    for (let value of this) {
      fn(value, i++);
    }
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

    return null;
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
   * Alias for first
   */
  head() {
    return this.first();
  }

  /**
   * Helper method to indicate this is a list
   */
  isList() {
    return true;
  }

  /**
   * Joins the list elements into a string, casting each element to a string
   * @param {String} [separator=""]
   * @returns {String}
   */
  join(separator = "", stringifier = String) {
    return this.reduce((str, el, i) => {
      if (i === 0) {
        return stringifier(el);
      }

      return `${str}${separator}${stringifier(el)}`;
    }, "");
  }

  /**
   * Get last element of list
   */
  last() {
    if (this.length === 0) return null;
    return this.end.value;
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

    return mapped.length ? mapped : null;
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

    let i = 0;
    for (let value of this) {
      accum = fn(accum, value, i);
      i++;
    }

    return accum;
  }

  /**
   * Get the tail of the list as a list
   */
  tail() {
    if (this.length === 0 || this.length === 1) {
      return null;
    }

    // eslint-disable-next-line
    const [_, ...tail] = this;
    return list(...tail);
  }

  *[Symbol.iterator]() {
    let head = this.head;

    while (head) {
      yield head.head;
      head = head.tail;
    }
  }

  toString() {
    return printList(this);
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

const isList = (obj) => obj instanceof List;

module.exports = {
  List,
  cons,
  list,
  isList,
};
