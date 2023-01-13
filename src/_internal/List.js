import { cons } from "./Cons.js";

/**
 * Singly linked list class to use as AST
 *
 * Maintains a reference to the last node in the list to make some operations easier
 *
 * @property {Any} head
 * @property {Cons | null} end
 */
export class List {
  constructor() {
    this.head = null;
    this.end = null;
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

    return this;
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
   * Cons a value onto the head of the list
   * @param {Any} value
   */
  prepend(value) {
    const head = this.head;
    const node = cons(value, head);
    this.head = node;

    return this;
  }

  *[Symbol.iterator]() {
    let head = this.head;

    while (head) {
      yield head.head;
      head = head.tail;
    }
  }
}

export const list = (...args) => {
  const l = new List();

  for (let arg of args) {
    l.append(arg);
  }

  return l;
};

let l = list(1, 2, 3, 4);
console.log(l);

for (let n of l) {
  console.log(n);
}
