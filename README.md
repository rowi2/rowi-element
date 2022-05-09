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

If you use `connectedCalback` method in your subclass, you have to call the parent's method, like this:

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

There are also some helper functions:

- `$checkType(value, type)`: to check if `value` is of type `type`. `type` can be `["integer", "number", "boolean", "string", "object", "array"]`.

- `$set(propName, value, preventEvent = true)`: to set the value of one of the props. If preventEvent is true, the event emitted when the prop is changed will not be emitted. This is helpfull when we want to change the value without triggering its event.

- `$createElement(elem, refs)`: To create a html element and its structure using array. `elem` is an array with instructions to build the element. You can set the element's tag and its attributes by passing as the first element of the array an HTMLElement or a string with the name of the tag, and as the second element an object with any of the following keys:
  - `id`: the id of the element.
  - `on`: an object with listeners of events coming from this element.
  - `attrs`: an object with the attributes of this element.
  - `name`: if a string, this element will be stored in `refs` argument under the key provided here.
  - `props`: an object with the properties of this element. 
  - `class`: a string with the class/es of this element.

  If the first element is an object, it's assumed that the element is a div, and the object is used as the attributes of the element that was just described.

  If there's no tag or object, it's assumed that the element is a div and there are no attributes.
  
  The rest of the elements in the array are the children of the element, and they can be a string (for TextNodes) or an array like the one we describe here.

- `$buildShadow(content)`: This creates the shadow root element and calls `$createElement` passing the shadow root element as the parent, and saving the references of the named elements inside `content` in the property `this.$`.

Elements inheriting from this class emit events every time a prop is changed, and this events are named like this: `$<PROP_NAME>`.