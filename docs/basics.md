# Daniel Language Basics

## Primitives and Literals

Comments begin with a semicolon and continue until the end of the line

```clojure
; this is a comment
```

Daniel has several primitives, like you'd expect from any language. Note that there is only one number type, so integers and floats are both JavaScript numbers. Keywords are symbols in JavaScript and mostly used for things like map keys, and nil is equivalent to either null OR undefined in JavaScript:

```clojure
10
5.3
-2
"Hello"
true
:this-is-a-keyword
nil
```

You can also create literal lists by enclosing values in brackets:

```clojure
[1 2 3 4 5]
```

And literal maps by enclosing key/value pairs in curly braces:

```clojure
{:a 1 :b 2 :c "hello"}
```

You can separate values with commas if you think it makes it easier to read:

```clojure
{:a 1, :b "hello"}

; or for a list

[1, 2, 3]
```

Note that Lists, Maps, and Objects are all reference types. All others are value types.

## Function Calls

A parenthesized list is either a function call or a special form. For a function call, the first item of the list must be a valid function. The remaining list items are its arguments.

```clojure
(println "Hello, " name)
```

Special forms are demonstrated below.

## Variable and Function Definitions

Define variables with the `define` form:

```clojure
(define greeting "hi")
```

Use the `lambda` form to create anonymous functions. You can immediately invoke a lambda:

```clojure
((lambda (x) (+ x 1)) 10)  ;=> 11
```

You can define functions by combining the `define` and `lambda` forms:

```clojure
(define greet (lambda (name)
    (println "hello ", name)))
```

Or use the shorthand form:

```clojure
(define (greet name)
    (println "hello ", name))
```

Mutating variables is generally discouraged, but if you absolutely MUST mutate a variable use the `set!` form:

```clojure
(define counter 0)
(set! counter (+ counter 1))
```

Functions can be variadic (that is, take an unspecified number of parameters). The variadic argument will be a list containing all arguments not defined explicitly before the &:

```clojure
(define (sum num & nums)
    (reduce (lambda (a b) (+ a b)) num nums))
```

## Blocks

You can define a block with the `do` form. Blocks can contain multiple expressions, including definitions, and the block evaluates to the value of its last expression:

```clojure
(do
    (println "first expression")
    (define greeting "Hi")
    (println greeting " fellow programmer"))
```

Lambdas only have a single expression in the body, but you can use a block to evaluate multiple expressions:

```clojure
((lambda (x) (do
    (println "about to increment:")
    (+ x 1))) 10)  ;=> 11
```

The shorthand function definition form has an implicit block for the body:

```clojure
(define (inc-with-print x)
    (println "about to increment x:")
    (+ x 1))
```

## Branching and Looping

Daniel has an `if` form that allows conditional evaluation. It's an expression, unlike in JavaScript, so it evaluates to the value of the expression that is evaluated:

```clojure
(define age (number (input "How old are you?")))

(if (<= age 18)
    (println "You are legally an adult")
    (println "You are not yet a legal adult"))
```

You can also use the `for` form to loop. The body of the expression has an implicit block:

```clojure
;  You should generally avoid mutation - this is just for demonstration purposes
(define sum 0)
(for (i (range 10))
    (println "Looping")
    (set! sum (+ sum i)))
(println sum)  ;=> 55
```

The `for` form returns the value of its final expression the last time through the loop.

There is also a list comprehension form:

```clojure
(define squares (for/list (i (range 10))
    (* i i)))
; squares == (1 4 9 ...)
```

## Map Keyword Access

You can use a keyword key for a map as if it were an accessor function for that map value:

```clojure
(define jason {:name "Jason", age: 42})
(:name jason) ;=> "Jason"
```

## Objects and Classes

You can create literal objects by giving a map to the `object` function:

```clojure
(object {"name" "Jason", "age" 42})  ; creates an object with string keys name and age
```

Dot notation is syntactic sugar for using the `prop` function:

```clojure
(define jason (object {"name" "Jason", "age" 42}))
(println jason.name)  ; prints "Jason"
(println (prop "name" jason)) ; also prints "Jason"
```

Note that if an object or map key is a keyword, you can access its value by using the keyword like a function:

```clojure
(define jason {:name "Jason" :age 42})
(println (:name jason)) ; prints "Jason"
```

While you could theoretically define methods with the lambda form while creating a literal object, in most cases it will be more useful to define a class:

```clojure
(class Fish
    (new energy)  ; new defines the fields available on an object instance
    (define :static num-fish 0)
    (define (init self kwargs)  ; kwargs is an object with key/value pairs for all the fields and the values set by the new form
        (set-field! "num-fish" Fish (+ Fish.num-fish 1))  ; increments the static variable num-fish when a new Fish is created
        (println "Creating the " Fish.num-fish "st fish with energy of " kwargs.energy))
    (define (eat self calories)  ; note that you must explicitly pass the instance as a parameter for the method
        (set-field! "energy" self (+ self.energy calories)))
    (define (swim self speed)
        (set-field! "energy" self (- self.energy speed))))
```

Note that, as in Python, you must explicitly pass the `self` parameter to methods.

Create a class instance with the `new` form:

```clojure
(new Fish 10)  ; constructs an instance of Fish with energy of 10
```

As you would expect, you can create a subclass that inherits from its superclass (single inheritance only):

```clojure
(class Trout :extends Fish
    (new energy has-spawned)
    (define (init self) ;  note that you don't actually need to specify the kwargs parameter if it's not used
        (super.init self)) ;  super.init is required since the superclass has an init method
    (define (swim self speed direction)
        (super.swim speed)
        (println "The fish swims to the " direction))
    (define (spawn self)
        (set-field! "has-spawned" self true)))
```

When creating an instance, the `new` form passes the superclass constructor arguments into the superclass:

```clojure
(new Trout 20 false)
```

Daniel uses JavaScript's prototypal delegation behind the scenes. The superclass itself is the prototype for the subclass, and `Superclass.prototype` is the prototype for `Subclass.prototype`. That means both static and instance methods are inherited, and superclass methods can be accessed using the `super` form.

## Quoting and Macros

The `quote` form causes data to be evaluated just as data, not as expressions. That means you can quote identifiers and they will evaluate to symbol values:

```clojure
(quote greeting)  ;=> (symbol "greeting")
(quote (+ 1 a))  ;=> (list '+ 1 'a)
```

Quote has a shorthand form:

```clojure
'greeting
```

All other kinds of data are "self-quoting," which means they don't need to be explicitly quoted to use them as data.

`quasiquote` is like `quote`, but it leaves an "escape hatch" for you to allow symbols to be evaluated as identifiers:

```clojure
(quasiquote (+ 1 a))  ;=> same as quoted example
```

There is also a `quasiquote` shorthand form:

```clojure
`(+ 1 a)
```

When you combine `quasiquote` with `unquote,` the unquoted data is evaluated as an expression:

```clojure
(define x 10)
`(+ 1 (unquote x))  ; x evaluates to the value 10
```

Unsurprisingly, `unquote` has a shorthand form:

```clojure
`(+ 1 ~x)
```

You can `eval` a quoted form to evaluate it as an expression:

```clojure
(define x 10)
(define plus-expr '(+ 1 x))
(eval plus-expr)  ;=> 11
```

Use the `splice-unquote` form to splice a list into a quasiquote expression:

```clojure
(define l [3 4 5 6])
(define l1 `(1 2 (splice-unquote l)))

; or use the shorthand form

(define l2 `(1 2 ~@l))  ;=> (1 2 3 4 5 6)
```

The `quote`, `quasiquote`, `unquote`, and `splice-unquote` forms enable you to do something that is impossible in most languages: treat code itself as a data structure. This is possible because Daniel is homoiconic. That means the code and the data structure you get when parsing the code are interchangeable for each other. This makes it possible to define new syntax within the language itself. A new syntactic form defined in the language itself is called a macro.

Define new macros with the `defmacro` form:

```clojure
(defmacro (unless pred a b) `(if ~pred ~b ~a))  ; only one of a or b is evaluated depending on the if check
(unless true 7 8)  ;=> 8
```

## Exception Handling

Throw exceptions with the `fail` function:

```clojure
(fail "Something bad happened")
```

Handle possible exceptions with `try`/`catch` blocks:

```clojure
(try
    (function-that-may-throw args)
    (catch exn
        (println exn.message)))
```

## Modules

You can create modules with the `module` form. Note that a module must have the same name as the file it's contained in (case sensitive).

```clojure
(module Example
    (define (inc x)
        (+ 1 x))

    (provide inc))
```

Then `import` the module and use it as a namespace.

```clojure
(import Example)

(Example.inc 5) ;=> 6
```

## Async/Await

Create async functions with the `async` form. These functions will always return a promise.

```clojure
(async (promise-fn x) x)
```

Use the `:await` keyword to work with a promise value as if it were a regular value:

```clojure
(async (fetch url)
    (:await (http-get url)))
```
