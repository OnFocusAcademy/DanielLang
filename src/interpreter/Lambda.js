/**
 * @property {Env} env
 * @property {List} params
 * @property {Boolean} variadic
 * @property {List} body
 * @property {Number} length
 * @property {String} __name__
 * @property {true} daniel
 */
class Lambda {
  /**
   * @param {Env} env
   * @param {List} params
   * @param {Boolean} variadic
   * @param {List} body
   * @param {Number} length
   * @param {String} __name__
   */
  constructor(env, params, variadic, body, length, __name__) {
    this.env = env;
    this.params = params;
    this.variadic = variadic;
    this.body = body;
    this.length = length;
    this.__name__ = __name__;
    /**
     * @type {true}
     */
    this.daniel = true;
  }
}
exports.Lambda = Lambda;
