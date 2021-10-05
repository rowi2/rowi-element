export default class RowiElement extends HTMLElement {
    constructor() {
        super()
        this.__attrs__ = {}
        this.__refs__ = {}
        this.__initialValues__ = {}
        this.__initialValuesStarted__ = false

        let props = this.props || {}
        Object.defineProperties(this, Object.entries(props).reduce(
            (accum, [key, prop]) => {
                let attr = prop.attr || this.__getDefaulAttr__(key)
                this.__attrs__[attr] = {name: key, prop}
                if (prop.handler != null) {
                    this.addEventListener('$' + key, ev => {
                        prop.handler.apply(this, [ev.detail])
                    })
                }
                if (this.hasOwnProperty(key))
                    this.__initialValues__[key] = this[key]
                accum[key] = {
                    get: () => {
                        this.__setInitialValues__()
                        let v = this.getAttribute(attr)
                        return (v == null || v === "") && prop.type != 'boolean'
                            ? prop.default : this.__attrToProp__(v, prop.type)
                    },
                    set: (v) => {
                        this.__setInitialValues__(key)
                        this.__checkType__(key, v, prop.type)
                        if (prop.type === 'boolean') {
                            if (v) this.setAttribute(attr, '')
                            else this.removeAttribute(attr)
                        } else {
                            this.setAttribute(attr, v)
                        }
                    }
                }
                return accum
            }, {}
        ))
    }

    __setInitialValues__(propSetting) {
        if (this.__initialValuesStarted__) return
        this.__initialValuesStarted__ = true
        for (let key in this.__initialValues__) {
            if (key === propSetting) continue
            this[key] = this.__initialValues__[key]
        }
    }

    __getDefaulAttr__(prop) {
        return 'data-' + prop.replaceAll(/[A-Z]/g, l => `-${l.toLowerCase()}`)
    }

    __checkType__(name, value, type) {
        if (
            (type == 'integer' && !Number.isInteger(value))
            || (
                ['string', 'boolean', 'number'].includes(type)
                && !(typeof value === type)
            )
        ) {
            throw new TypeError(
                `Type of "${name}" is ${type}. Value given: ${value}`
            )
        }
    }

    __attrToProp__(value, type) {
        if (type === 'number' || type === 'integer') return Number(value)
        else if (type === 'boolean') return value != null
        else return value
    }

    connectedCallback() { this.__setInitialValues__() }

    attributeChangedCallback(name, oldValue, newValue) {
        let attrElement = this.__attrs__[name]
        let propName = attrElement.name, prop = attrElement.prop

        let initialValuesStarted = this.__initialValuesStarted__
        this.__setInitialValues__()
        if (!initialValuesStarted && propName in this.__initialValues__)
            return

        if (oldValue !== newValue) {
            if (propName == null) return
            if (prop.type != 'boolean') {
                let propValue = this.__attrToProp__(newValue, prop.type)
                try {
                    this.__checkType__(propName, propValue, prop.type)
                    if (prop.validator) {
                        const valid = prop.validator.apply(this, [newValue])
                        if (!valid)
                            throw `Prop "${name}" value ${value} is not valid`
                    }
                } catch (error) {
                    console.error(error)
                    if (oldValue == null) this.removeAttribute(attrName) 
                    else this.setAttribute(attrName, oldValue)
                    return
                }
            }

            this.dispatchEvent(new CustomEvent('$' + propName,
                {detail: {oldValue, newValue}}
            ))
        }
    }
    
    __createElement__(tag, opts, children) {
        const {id, on, attrs, name, props} = opts
        const elem_ = typeof tag === 'string' ? document.createElement(tag) : tag

        if (opts.class != null) elem_.className = opts.class
        if (id != null) elem_.id = id
        if (name != null ) this.__refs__[name] = elem_

        for (const event in on || {}) {
            elem_.addEventListener(event, on[event])
        }

        if (typeof children  === 'string') children = [children]
        for (const child of children) {
            if (typeof child  === 'string')
                elem_.appendChild(document.createTextNode(child))
            else if (Array.isArray(child)) {
                elem_.appendChild(this.createElement(child))
            }
        }

        for (const attr in attrs || {}) {
            elem_.setAttribute(attr, attrs[attr])
        }
        for (const prop in props) {
            elem_[prop] = props[prop]
        }
        return elem_
    }

    createElement(elem) {
        let tag = 'div'
        let opts = {}
        let children = elem
        if (
            elem[0] instanceof Element || elem[0] instanceof DocumentFragment
            || typeof elem[0] === 'string'
        ) {
            tag = elem[0]
            children = children.slice(1)
        }
        if (
            typeof elem[1] === 'object' && elem[1] != null
            && !Array.isArray(elem[1])
        ) {
            opts = elem[1]
            children = children.slice(1)
        }
        return this.__createElement__(tag, opts, children)
    }    
}
