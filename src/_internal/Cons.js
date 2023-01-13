/**
 * Cons cell that makes up the basic data structure for Lisp code
 *
 * If tail is a Cons or null, it is a proper list.
 * @property {Any} head
 * @property {Any} tail
 */
class Cons {
  /**
   *
   * @param {Any} head
   * @param {Any} tail
   */
  constructor(head, tail) {
    this.head = head;
    this.tail = tail;
  }
}

module.exports = Cons;
