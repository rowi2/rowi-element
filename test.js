import RowiElement from "./rowi-element.js";

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
          console.log('intProp', this.intProp);
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
        attr: 'data-bool-prop'
      },
      strProp: {
        type: 'string',
        default: 'hello world',
        attr: 'data-str-prop',
        handler() {
          this.__refs__.thing.innerText = this.strProp
        }
      }
    }
  }

  constructor () { 
    super();
    this.attachShadow({mode: 'open'})
    this.createElement([this.shadowRoot,
      ['div', {name: 'thing'}],
      ['input', {on: {input: ev => this.strProp = ev.target.value}}]  
    ])
    console.log(this.__refs__) 
  }
}

customElements.define('my-input', MyComponent)