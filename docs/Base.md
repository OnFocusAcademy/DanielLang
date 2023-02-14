# Base Module Documentation

The Base module is defined in Daniel and automatically loaded into the global environment, so you do not need to import it.

## Functions

#### Inc

Increments a number by 1.

Usage: `(inc num)`

```clojure
(inc 5) ;=> 6
```

#### Dec

Decrements a number by 1.

Usage: `(dec num)`

```clojure
(dec 5) ;=> 4
```

#### Not

Negates a value. If truthy, returns `false` and vice versa.

Usage: `(not value)`

```clojure
(not true) ;=> false
(not nil) ;=> true
```

#### Unless

Macro. Like an inverted `if`. Returns `then` unless `pred` is true, then returns `else`.

Usage: `(unless pred then else)`

```clojure
(unless (>= a 18) "You are not an adult", "You are an adult")
```

#### And

Macro. If the first argument is falsy, return `false`. If the first argument is truthy, evaluate and return the second.

Usage: `(and a b)`

```clojure
(if (and (< num 10) (> num 20))
    (println "It is between 10 and 20")
    (println "It is not between 10 and 20"))
```

#### Or

Macro. If the first argument is truthy, return it. Otherwise evaluate and return the second.

Usage: `(or a b)`

```clojure
(if (or (equals? state "Success") (equals? state "Error"))
    (println "The task is completed")
    (println "The task is still going"))
```
