# Core Module

Documentation for the Core module functions.

Core is defined in the host language (JavaScript).

This module is automatically loaded as part of the global environment and does not need to be explicitly imported.

## Functions

### Basic List and Pair Functions

These functions work on lists and pairs

#### Cons

Links 2 items together in a pair. If the 2nd item is a list, the result is a new list with the 1st item at the head of the list. Named for historical reasons.

Usage: `(cons arg1 arg2)`

```clojure
(cons 1 2) ;=> (1 . 2)

(cons 1 [2 3 4 5]) ;=> (1 2 3 4 5)

(cons 1 (cons 2 (cons 3 nil))) ;=> (1 2 3)
```

#### Pair

Alias for `cons`.

#### List

Creates a list of its arguments.

Usage: `(list arg1 ...)`

```clojure
(list 1 2 3) ;=> (1 2 3)
```

#### Head

Returns the first item in a list or pair.

Usage: `(head pair-or-list)`

```clojure
(head [1 2]) ;=> 1

(head (cons "Jason " "Barr")) ;=> "Jason"
```

#### Car

Alias for `head`, included for historical reasons.

#### Tail

Returns the 2nd item in a pair or a list of everything after the 1st item in a list.

Usage: `(tail pair-or-list)`

```clojure
(tail (cons 1 2)) ;=> 2

(tail [1 2 3 4 5]) ;=> [2 3 4 5]
```

#### Cdr

Alias for `tail`, included for historical reasons.

#### Last

Returns the last item in a list or the 2nd item in a pair.

Usage: `(tail pair-or-list)`

```clojure
(last (cons 1 2)) ;=> 2

(last [1 2 3 4 5]) ;=> 5
```

### List Functions

These functions are for working with lists.

#### Map

Transforms a list into a new list of items with a function applied to each item of the original list. Does not modify the original list.

Usage: `(map callback list)`

```clojure
(define nums [1 2 3 4 5])

; Get a list of squares
(map (lambda (x) (* x x)) nums) ;=> (1 4 9 16 25)
```

The callback can receive up to 3 arguments: the current list item, the index in the list of the current item, and the list itself. This is for parity with JavaScript's `Array.prototype.map`.

#### Filter

Transforms a list into a new list that only contains items that pass a predicate check. Does not modify the original list.

Usage: `(filter predicate list)`

```clojure
(define nums [1 2 3 4 5 6])

(filter (lambda (x) (even? x)) nums) ;=> (2 4 6)
```

The callback can receive up to the same 3 arguments as `map`.

#### Each

Applies a function to each item of a list and returns nil. Usually used for performing a side effect with each list item.

Usage: `(each callback list)`

```clojure
(define names ["Jason", "Gretchen", "Daniel"])

(each println names)

; prints:
; Jason
; Gretchen
; Daniel
```

The callback can receive up to the same 3 arguments as `map`.

#### Reduce

Applies a reducer function to a list and derives a value from the list. Does not modify the original list.

Usage: `(reduce reducer initial-value list)`

```clojure
(define nums [1 2 3 4 5])

(reduce (lambda (sum n) (+ sum n)) 0 nums) ;=> 15
```

The reducer can receive up to the same 3 arguments as `map`.

#### Foldl

Alias for `reduce`.

#### Foldr

Like `reduce`, but iterates over the list from right-to-left (i.e. in the opposite order).

Usage: `(foldr reducer init list)`

```clojure
(foldr (lambda (sum n) (+ sum n)) 0 [1 2 3 4 5]) ;=> 15
```

The reducer can receive up to the same 3 arguments as `map`.

### Map Functions

Functions for working with maps.

#### Assoc

Takes a map and a list of key/value pairs. Updates the keys in the map to the specified values. Does not modify the original map.

Usage: `(assoc my-map [(cons :key1 value1) ...])`

```clojure
(define person {:name "Jason" :age 42})
(assoc person (cons :age 43)) ;=> {:name "Jason" :age 43}
```

#### Dissoc

Takes a map and a list of keys. Deletes the specified keys from the map. Does not moddify the original map.

Usage: `(dissoc map [:key1 ...])`

```clojure
(define person {:name "Jason" :age 42})
(dissoc person [:age]) ;=> {:name "Jason"}
```

#### Make-map

Takes a list of cons cells as entries and constructs a map from them.

Usage: `(make-map [(cons :key value) ...])`

```clojure
(define person (make-map
    [(cons :name "Jason"), (cons :age 42)]))
```

#### Keys

Returns a list containing the map keys

Usage: `(keys my-map)`

```clojure
(define person {:name "Jason" :age 42})
(keys person) ;=> (:name :age)
```

#### Values

Returns a list containing the map values.

Usage: `(values my-map)`

```clojure
(define person {:name "Jason" :age 42})
(values person) ;=> ("Jason" 42)
```

#### Entries

Returns a list of the key/value pairs of the map's entries.

Usage: `(entries my-map)`

```clojure
(define person {:name "Jason" :age 42})
(entries person) ;=> ((:name . "Jason"), (:age . 42))
```

#### Merge

Merges 2 or more maps into 1. Does not modify the original maps. In the case of conflicting keys, the keys of the last map containing those keys wins.

Usage: `(merge map1 map2 ...)`

```clojure
(merge {:name "Jason"}, {:age 42}) ;=> {:name "Jason" :age 42}
```

### List and Map Functions

These functions work with both lists and maps.

#### Get

Gets the map value at `key` or the list item at index `key`.

Usage: `(get :name map)`

```clojure
(get :name {:name "Jason" :age 42}) ;=> "Jason"
(get 2 [1 2 3 4 5]) ;=> 3
```

#### Set

Sets the map value at `key` with `value` or the list item at index `key` with `value`. Note that this function DOES modify the original map or list. If you need referential transparency, use `assoc` instead.

Usage: `(set :key value map)`

```clojure
(set :name "Bob" {:name "Jason"}) ;=> {:name "Bob"}
(set 1 "Hi" [1 2 3 4]) ;=> (1 "Hi" 3 4)
```

#### Has?

Check to see if a map has a value for `key` or if a list has a value at index `key`.

Usage: `(has? key my-list)`

```clojure
(has? :name {:name "Jason" :age 42}) ;=> true
(has? 5 [1 2 3 4 5]) ;=> false
```

#### Copy

Make a copy of the given list or map. Also works with pairs and objects. If the list/map/pair/object has values that are reference types (list, map, or object), the value for the same key/index in the new object will be a reference to the same value as was in the old one. In other words, this is a shallow copy.

Usage: `(copy my-map)`

```clojure
(copy {:name "Jason" :age 42}) ;=> {:name "Jason" :age 42}
```

### Iterator Functions

#### Range

Create a range of numbers from `start` to `end` by `step`. Works similarly to Python's `range` function. Can call with 1, 2, or 3 arguments. Note that `end` is not inclusive, so it will stop iterating ` `step`before`end`.

Usage: `(range start [stop [end]])`

```clojure
(range 10) ;=> Range {0, 10, 1} - counts from 0 to 9
(range (1 20)) ;=> Range {1, 20, 1} - counts from 1 to 19
(range (10 0 2)) ;=> Range (10, 0, 1) - counts down from 10 to 1 by twos
```

Note that Lists and Maps are also iterable. The difference between a Range and a List of numbers is that the List actually contains the values for every number, whereas a Range only produces a number when it is needed.

### Input/Output Functions

#### Print

Prints a value or values as a string without a trailing newline.

Usage: `(print arg1 ...)`

```clojure
(print "Daniel", " ", "Programming Language")
```

#### Println

Prints a value or values with a trailing newline.

Usage: `(println arg1 ...)`

```clojure
(println "Daniel", " ", "Programming Language")
```

#### Input

Shows `prompt` then takes the user's response from stdin.

Usage: `(input prompt)`

```clojure
(input "What is your name? ")
```

#### Readfile

Reads a file into memory. Defaults to a text file with UTF-8 encoding. Options is an object that takes the same properties as the optional argument to Node.js `fs.writeFileSync` ([link](https://nodejs.org/api/fs.html#fsreadfilesyncpath-options)).

Usage: `(readfile filename [options])`

```clojure
(readfile "/home/user/Documents/file.txt")
```

#### Writefile

Writes a file to disk. Defaults to text data with UTF-8 encoding. Options is an object that takes the same properties as the optional argument to Node.js `fs.writeFileSync` ([link](https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options)).

Usage: `(writefile path data [options])`

```clojure
(writefile "/home/user/Documents/file.txt" "Hello, world!\n", {encoding: "utf-16"})
```

#### File-exists?

Checks to see if the string `path` points to a valid file on the disk.

Usage: `(file-exists? path-to-file)`

```clojure
(file-exists? "/home/user/Documents/file.txt")
```

### Conversion functions

#### String

Converts any value or values to a string.

Usage: `(string arg1 ...)`

```clojure
(define pi-string (string 3.14159)) ;=> "3.14159"
```

#### Number

Converts a string value to a number. Returns `NaN` if the string is not a valid number.

Usage: `(number string-value)`

```clojure
(define pi-num "3.14159") ;=> 3.14159
```

#### Boolean

Converts any value to a Boolean. Truthy values return `true` and falsy values return `false`. Remember that `nil` and `false` are the only falsy values in Daniel.

Usage: `(boolean value)`

```clojure
(boolean "") ;=> true
(boolean nil) ;=> false
```

#### Symbol

Converts any string to a quoted symbol value.

Usage: `(symbol string-value)`

```clojure
(symbol "Hello") ;=> 'Hello
```

#### Keyword

Converts any string to a keyword value

Usage: `(keyword string-value)`

```clojure
(keyword "Hello") ;=> :Hello
```

### Arithmetic Operator Functions

#### +

Works with numbers and strings. Adds 2 or more numbers, and concatenates 2 or more strings. Variadic, so can take any number of arguments, but is curried to 2 arguments so if you just give it a single argument you'll get back a new function that's partially applied.

Usage: `(+ arg1 arg2 ...)`

```clojure
(+ 1 2) ;=> 3
(+ 1 2 3 4 5) ;=> 15
(+ 1) ;=> Function equivalent to (+ 1 & args)
```

#### -

Subtract 2 or more numbers. Curried to 2 arguments just like `+`.

Usage: `(- arg1 arg2 ...)`

```clojure
(- 10 5) ;=> 5
(- 10 4 2) ;=> 4
(- 1) ;=> Function equivalent to (- 1 & args)
```

#### \*

Multiplies 2 or more numbers. Curried like `+`.

Usage: `(* arg1 arg2 ...)`

```clojure
(* 2 3 4) ;=> 24
```

#### /

Divides 2 or more numbers. Curried like `+`.

Usage: `(/ arg1 arg2 ...)`

```clojure
(/ 10 2)
```

Note that since numbers are double precision floating point numbers under the hood, dividing by 0 will return Infinity. Dividing by -0 will return -Infinity.

#### //

Integer or floor division. Divides 2 or more numbers, taking the floor value of each successive division. Curried like `+`.

Usage: `(// arg1 arg2 ...)`

```clojure
(// 5 2) ;=> 2
```

Note that dividing by 0 will give you Infinity, and dividing by -0 will give you -Infinity.

#### %

Gets the remainder from dividing 2 or more numbers. Curried like `+`.

Usage: `(% num1 num2 ...)`

```clojure
(% 5 2) ;=> 1
```

Note that taking the remainder of any number by 0 will return `NaN`.

### Comparison Functions

#### !=

Reference inequality for any type. Simple comparison for value types.

Usage: `(!= arg1 arg2)`

```clojure
(!= 2 3) ;=> true
(!= {:name "Jason"}, {:name "Jason"}) ;=> true

(define jason {:name "Jason"})
(define jason2 jason) ; alias the first Map

(!= jason jason2) ;=> false
```

#### =

Reference equality for any type. Simple comparison for value types.

Usage: `(= arg1 arg2)`

```clojure
(= 2 (+1 1)) ;=> true
(= {:name "Jason"}, {:name "Jason"}) ;=> false
```

#### Equal?

Value/structural equality for any type. Deep equality for Lists, Maps, and Objects.

Usage: `(equal? arg1 arg2)`

```clojure
(equal? 2 (+ 1 1)) ;=> true
(equal? {:name "Jason"}, {:name "Jason"}) ;=> true
(equal? "Hello" "World") ;=> false
```

#### >

Check if `arg1` is greater than `arg2`.

Usage: `(> arg1 arg2)`

```clojure
(> 2 1) ;=> true
(> 0 0) ;=> false
```

#### >=

Check if `arg1` is equal to or greater than `arg2`.

Usage: `(>= arg1 arg2)`

```clojure
(>= 3 2) ;=> true
(>= 3 3) ;=> true
(>= 2 3) ;=> false
```

#### <

Check if `arg1` is less than `arg2`.

Usage: `(< arg1 arg2)`

```clojure
(< 2 3) ;=> true
```

#### <=

Check if `arg1` is less than or equal to `arg2`.

Usage: `(<= arg1 arg2)`

```clojure
(<= 3 3) ;=> true
```

#### <=>

If `arg1` is greater than `arg2`, returns 1. If less than, it returns -1. If they are equal, it returns 0.

Usage: `(<=> arg1 arg2)`

```clojure
(<=> 3 2) ;=> 1
(<=> 2 3) ;=> -1
(<=> 3 3) ;=> 0
```

### Functions that Work on Lists and Strings

#### Length

Returns the length of a list or string.

Usage: `(length value)`

```clojure
(length [1 2 3 4 5]) ;=> 5
(length "Hello") ;=> 5
```

#### Concat

Concatenates 2 or more lists together, or 2 or more strings.

Usage: `(concat arg1 arg2 ...)`

```clojure
(concat [1 2 3], [4 5 6], [7 8 9]) ;=> (1 2 3 4 5 6 7 8 9)
```

#### Append

Appends a string to the end of another string, or an item to the end of a list.

Usage: `(append arg1 arg2)`

```clojure
(append "Hello", "World") ;=> "HelloWorld"
(append [1 2 3] 4) ;=> (1 2 3 4)
```

### Predicates

#### Number?

Check if a value is a number.

Usage: `(number? arg)`

#### String?

Check if a value is a string.

Usage: `(string? arg)`

#### Boolean?

Check if a value is a boolean.

Usage: `(boolean? arg)`

#### Nil?

Check if a value is nil.

Usage: `(nil? arg)`

#### List?

Check if a value is a list. Remember, `nil` is an empty list.

Usage: `(list? arg)`

#### Empty?

Check if a value is an empty list (nil).

Usage: `(empty? arg)`

#### Pair?

Check if a value is a pair. Remember, lists are also pairs.

Usage: `(pair? arg)`

#### Function?

Check if a value is a function.

Usage: `(function? arg)`

#### Symbol?

Check if a value is a symbol.

Usage: `(symbol? arg)`

#### Map?

Check if a value is a map.

Usage: `(map? arg)`

#### Keyword?

Check if a value is a keyword.

Usage: `(keyword? arg)`

#### True?

Check if a value is literally true (not just truthy).

Usage: `(true? arg)`

#### False?

Check if a value is literally false (not just falsy).

Usage: `(false? arg)`

### Symbol Function

#### Gensym

Creates a random symbol value.

Usage: `(gensym)`

### Function Functions

#### Curry

Auto-curries a function so it can be partially applied. For variadic functions, curries up to the `__length__` property on the function (i.e. up to but not including the variadic parameter).

Usage: `(curry fn)`

```clojure
(define (make-3-tuple a b c)
    (cons a (cons b c)))

(define (make-3-tuple-curried)
    (curry make-3-tuple))

(make-3-tuple-curried 1 2) ;=> Function equivalent to (make-3-tuple 1 2 n)
```

#### Apply

Applies a list of arguments to a function. Helpful when you have a variadic function and need to give it arguments that are already in a list.

Usage: `(apply fn args)`

```clojure
(define (sum-fn & args)
    (reduce sum 0 args))
(define nums [1 2 3 4 5])

(apply sum-fn nums) ;=> 15
```

#### |>

Pipelines a value through a series of composed unary functions (L to R).

Usage: `(|> val ...fns)`

```clojure
(define (square x) (* x x))
(define (curried-map)
    (curry map))
(define (curried-filter)
    (curry filter))
(define nums [1 2 3 4 5 6])

(|> nums (curried-filter even?) (curried-map square)) ;=> (4 16 36)
```

#### Compose

Combines 2 unary functions into a single composed function (L to R).

Usage: `(compose f g)`

```clojure
(define (inc x) (+ x 1))
(define (square x) (* x x))

((compose inc square) 10) ;=> 121
```

#### Pipe

Composes 2 or more unary functions into a single composed function (L to R)

Usage: `(pipe f g h)`

```clojure
(define (inc x) (+ x 1))
(define (square x) (* x x))
(define (dec x) (- x 1))
(define (inc-square-dec) (pipe inc square dec))

(inc-square-dec 10) ;=> 120
```

### Functions that Work with Native JavaScript

#### Require-js

Require a CommonJS module.

Usage: `(js-require module)`

```clojure
(define fs (js-require "fs")) ;=> namespaces the Node.js fs module to fs
```

#### Eval-js

Evaluate a string as JavaScript code. Subject to all the same pitfalls as native JavaScript `eval`.

Usage: `(js-eval code)`

```clojure
(js-eval "10 + 2") ;=> 12
```

### Errors and Throwing Errors

#### Exception

The base error class for in-language error propagation and handling.

#### RuntimeException

An in-language Runtime Exception.

#### Fail

Function that throws an exception. Optional 2nd argument to specify the exception class, which defaults to `Exception`.

Usage: `(fail msg [exn=Exception])`

```clojure
(fail "lol what?")
(fail "No such file" FileIOException) ; assuming FileIOException has been created somewhere
```

### Functions that Work on Objects

#### Prop

Accesses `property` on `object`.

Usage: `(prop property object)`

```clojure
(define jason (object {"name" "Jason"}))
(prop "name" jason) ;=> "Jason"
```

#### New

Constructs an instance of a class.

Usage: `(new class-name arg1 ...)`

```clojure
(class Fish
    (new energy)
    (define (eat self calories)
        (+ self.energy calories)))

(define nemo (new Fish 10))
```

#### Set-field!

Sets `field` on `obj` to `value`. Modifies the original object. Can be used to add new fields to an object instance (though you probably shouldn't).

Usage: `(set-field! field value obj)`

```clojure
(define nemo (new Fish 10))
(set-field! "name" "Nemo" nemo)
```

#### Object

Constructs a new object from a Map literal.

Usage: `(object my-map)`

```clojure
(object {:name "Jason" :age 42}) ;=> Object {:name "Jason" :age 42}
```

### Functions that Work with Daniel Code

#### Read

Read takes a string of Daniel code and outputs an Abstract Syntax Tree as a list of Daniel values

```clojure
(read "(+ 1 2)") ;=> ('+ 1 2)
```

#### Eval

Eval takes an AST and evaluates it. Note that this means all quoted symbols will be looked up in the current environment.
