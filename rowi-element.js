export default class RowiElement extends HTMLElement {
    #attrs = {}
    #initialValues = {}
    #initialValuesStarted = false
    #handlers = {}
    #allowedTypes = new Set(['number', 'integer', 'string', 'boolean'])

    constructor() {
        super()
        this.$ = {}
        let props = this.props || {}
        Object.defineProperties(this, Object.entries(props).reduce(
            (accum, [key, prop]) => {
                let attr = prop.attr || this.#getDefaulAttr(key)
                this.#attrs[attr] = {name: key, prop}
                if (prop.handler != null) {
                    this.#handlers[key] = ev => prop.handler.apply(this, [ev.detail])
                    this.addEventListener('$' + key, this.#handlers[key])
                }
                if (this.hasOwnProperty(key))
                    this.#initialValues[key] = this[key]
                else if (prop.type === 'boolean' && this.getAttribute(attr) == null && prop.default) {
                    this.#initialValues[key] = true
                }
                accum[key] = {
                    get: () => {
                        this.#setInitialValues()
                        let v = this.getAttribute(attr)
                        return (v == null || v === "") && prop.type !== 'boolean'
                            ? prop.default : this.#attrToProp(v, prop.type)
                    },
                    set: (v) => {
                        this.#setInitialValues(key)
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

    #setInitialValues(propSetting) {
        if (this.#initialValuesStarted) return
        this.#initialValuesStarted = true
        for (let key in this.#initialValues) {
            if (key === propSetting) continue
            this[key] = this.#initialValues[key]
        }
    }

    #getDefaulAttr(prop) {
        return 'data-' + prop.replaceAll(/[A-Z]/g, l => `-${l.toLowerCase()}`)
    }

    $checkType(value, type) {
        return (
            (type == 'integer' && Number.isInteger(value))
            || (
                ['string', 'boolean', 'number', 'object'].includes(type)
                && typeof value === type
            )
            || (type == 'array' && Array.isArray(value))
        )
    }

    #checkType(name, value, type) {
        if (!this.#allowedTypes.has(type)) {
            throw new TypeError(
                `Allowed types are "${this.#allowedTypes}". Type given: ${type}`
            )
        }
        if (!this.$checkType(value, type))
            throw new TypeError(
                `Type of "${name}" is ${type}. Value given: ${value}`
            )
    }

    #attrToProp(value, type) {
        if (type === 'number' || type === 'integer') return Number(value)
        else if (type === 'boolean') return value != null
        else return value
    }

    connectedCallback() { this.#setInitialValues() }

    attributeChangedCallback(name, oldValue, newValue) {
        let attrElement = this.#attrs[name]
        let propName = attrElement.name, prop = attrElement.prop

        let initialValuesStarted = this.#initialValuesStarted
        this.#setInitialValues()
        if (!initialValuesStarted && propName in this.#initialValues)
            return

        if (oldValue !== newValue) {
            if (propName == null) return
            let propValue = this.#attrToProp(newValue, prop.type)
            if (prop.type != 'boolean') {
                try {
                    this.#checkType(propName, propValue, prop.type)
                    if (prop.validator) {
                        const valid = prop.validator.apply(this, [propValue])
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

            const oldPropValue = this.#attrToProp(oldValue, prop.type)
            this.dispatchEvent(new CustomEvent('$' + propName,
                {detail: {oldValue: oldPropValue, newValue: propValue}}
            ))
        }
    }

    $set(propName, value, preventEvent = true) {
        const handler = this.#handlers[propName]
        if (preventEvent && handler != null)
            this.removeEventListener('$' + key, handler)
        this[propName] = value
        if (preventEvent && handler != null)
            setTimeout(() => this.addEventListener('$' + key, handler))
    }

    #createElementHelper(tag, opts, children, refs) {
        const {id, on, attrs, name, props} = opts
        const elem_ = typeof tag === 'string' ? document.createElement(tag) : tag

        if (opts.class != null) elem_.className = opts.class
        if (id != null) elem_.id = id
        if (name != null ) refs[name] = elem_

        for (const event in on || {}) {
            elem_.addEventListener(event, on[event])
        }

        if (typeof children  === 'string') children = [children]
        for (const child of children) {
            if (typeof child  === 'string')
                elem_.appendChild(document.createTextNode(child))
            else if (Array.isArray(child)) {
                elem_.appendChild(this.$createElement(child, refs))
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

    $createElement(elem, refs) {
        refs = refs || {}
        let tag = 'div'
        let opts = {}
        if (
            elem[0] instanceof Element || elem[0] instanceof DocumentFragment
            || typeof elem[0] === 'string'
        ) {
            tag = elem[0]
            elem = elem.slice(1)
        }
        if (
            typeof elem[0] === 'object' && elem[0] != null
            && !Array.isArray(elem[0])
        ) {
            opts = elem[0]
            elem = elem.slice(1)
        }
        return this.#createElementHelper(tag, opts, elem, refs)
    }

    $buildShadow(content, mode='open') {
        this.attachShadow({mode})
        this.$createElement([this.shadowRoot, ...content], this.$)
    }
}
