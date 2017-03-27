# jscodemods

This repository contains [`jscodeshift`](jscodeshift) tranformation scripts used by DataFox.

## `decaffeinate`

Tranformation scripts in the `decaffeinate` directory are scripts meant to be run on [`decaffeinate`](decaffeinate) tranpiled CoffeeScript -> ES6 code.
These scripts are mainly meant to fix style rather than correctness.
The style issues are mainly those imposed by the [Airbnb JavaScript style guide](airbnb) that were unable to be fixed by `eslint --fix` in the `bulk-decaffeinate` process.
These scripts are operating on files run with decaffeinate's `--keep-commonjs` and `--prefer-const` flags on.


### `fix-multi-assign-class-export`

#### CoffeeScript source

```coffeescript
module.exports = class Foo
```

#### Decaffeinated JavaScript

```javascript
let Foo;
module.exports = Foo = class Foo {};
```

#### Fixed JavaScript

```javascript
module.exports = class Foo {};
```


### `fix-implicit-return-assignment`

#### CoffeeScript source

```coffeescript
class Foo
  setBar: (bar) ->
    this.bar = 42
```

#### Decaffeinated JavaScript

```javascript
class Foo {
  setBar(bar) {
    return this.bar = 42;
  }
}
```

#### Fixed JavaScript

```javascript
class Foo {
  setBar(bar) {
    this.bar = 42;
  }
}
```


### `fix-existential-conditional-assignment`

#### CoffeeScript source

```coffeescript
bar = foo() ? ''
```

#### Decaffeinated JavaScript

```javascript
let left;
const bar = (left = foo()) != null ? left : '';
```

#### Fixed JavaScript

```javascript
const bar = foo() || '';
```


### `fix-for-of-statement`

#### CoffeeScript source

```coffeescript
for x in [1, 2, 3, 4, 5]
  console.log(x)
```

#### Decaffeinated JavaScript

```javascript
for (let x of [1, 2, 3, 4, 5]) {
  console.log(x);
}
```

#### Fixed JavaScript

```javascript
[1, 2, 3, 4, 5].forEach((x) => {
  console.log(x);
});
```


<!-- Links -->
[jscodeshift]: https://github.com/facebook/jscodeshift
[decaffeinate]: https://github.com/decaffeinate/decaffeinate
[airbnb]: https://github.com/airbnb/javascript

