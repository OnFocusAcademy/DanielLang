import { Cons, cons } from "./Cons";

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

    if (!head) {
      this.head = node;
      this.end = node;
    } else {
      const last = this.end;
      last.tail = node;
      this.end = node;
    }

    return this;
  }
}

export const list = (...args) => {
  const l = new List();

  for (let arg of args) {
    l.append(arg);
  }

  return l;
};
