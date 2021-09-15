# rowi-element
A Web Component base class to handle synchronization between properties and attributes

# How to use it?
Just extend the class in `rowi-element.js` and create the following two mandatory getters inside your class, like this:

```js
class MyComponent extends RowiElement {
  static get observedAttributes () {
    return [
      'data-int-prop',
      'data-num-prop',
      'data-bool-prop',
      'data-str-prop'
    ]
  }
  get props() {
    return {
      intProp: {
        type: 'integer',
        default: 0,
        attr: 'data-int-prop',
        handler() {
          console.log(this.intProp);
        }
      },
      numProp: {
        type: 'number',
        default: 2.1,
        attr: 'data-num-prop',
        handler() {
          console.log(numProp);
        }
      },
      boolProp: {
        type: 'boolean',
        default: true,
        attr: 'data-bool-prop',
        handler() {
          console.log(this.boolProp);
        }
      },
      strProp: {
        type: 'string',
        default: 'hello world',
        attr: 'data-str-prop',
        validator (value) {
          return ['a', 'b'].includes(value)
        },
        handler() {
          console.log(this.strProp);
        }
      }
    }
  }
}
```

The keys you define in getter `props` are going to be properties and attributes synced with each other. Each key in props object should have an object containing at least property `type`, to tell how to convert from attribute (always a string) to property (any primitive).

A prop object can have also a `default` value, a `attr` to tell which html attribute is going to be synced with, a `validator` that returns `true` if the new value (passed as argument) is valid and `false` otherwise, and a `handler` function to tell what have to be done after a prop has been changed.

If `attr` is not defined, the attribute that the prop is going to be synced to is going to be like this `data-${prop name in kebab case}`.

The `attr` values for each prop must be included in the array returned by static getter method `observedAttributes` for synchronization to work.

Also, as with constructor in a regular custom element, `super()` must be called if a constructor is used in the subclass, like this:

```js
class MyComponent extends RowiElement {
  constructor() {
    super();
    ...
  }
...
}
```

And finally, if you use `connectedCalback` method in your subclass, you have to call the parent's method, like this:

```js
class MyComponent extends RowiElement {
...
  connectedCallback() {
    super.connectedCallback();
    ...
  }
...
}
```
