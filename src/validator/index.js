import events from 'events'

class ValidatorEmmiter extends events {
  constructor() {
    super()
  }
}

const validatorEmmiter = new ValidatorEmmiter()
validatorEmmiter.setMaxListeners(100)
const isDef = (v) => v !== undefined

export const validatorMixin = {
  data() {
    return {
      validateResult: {},
    }
  },
  beforeCreate() {
    if (isDef(this.$options.validator)) {
      const {
        _uid,
        $options: {
          validator
        }
      } = this
      const _validator = validator.call(this)
      const propConfig = {
        writable: false,
        enumerable: false,
      }
      // on
      Object.keys(_validator).forEach((key) => {
        this.$nextTick(() => {
          this.$set(this.validateResult, key, '')
        })
      })
      // init releated method
      Object.defineProperties(_validator, {
        validate: {
          value(key) {
            validatorEmmiter.emit(`${_uid}-${key}`)
          },
          ...propConfig,
        },
        reset: {
          value: (key) => {
            this.validateResult[key] = ''
          },
          ...propConfig,
        },
        validateAll: {
          value: () => {
            Object.keys(_validator).forEach((key) => {
              const haveListeners = (eventName) =>
                validatorEmmiter.listenerCount(eventName)
              if (haveListeners(`${_uid}-${key}`)) {
                validatorEmmiter.emit(`${_uid}-${key}`)
              }
            })
            return Object.keys(this.validateResult).every(
              (item) => this.validateResult[item] === ''
            )
          },
          ...propConfig,
        },
        resetAll: {
          value: () => {
            Object.keys(_validator).forEach((key) => {
              this.validateResult[key] = ''
            })
          },
          ...propConfig,
        },
      })

      this.$validator = _validator
    }
  },
}

export default {
  install(Vue) {
    Vue.directive('validate', {
      bind(el, binding, vnode) {
        const {
          modifiers,
          value: key
        } = binding
        const {
          context: {
            _uid
          }
        } = vnode
        const method = Object.keys(modifiers)[0]
        // 订阅
        validatorEmmiter.on(`${_uid}-${key}`, () => {
          const {
            context: {
              validateResult,
              $validator
            }
          } = vnode
          const result = $validator[key].find((item) => !item.need())

          validateResult[key] = isDef(result) ? result.warn : ''
        })
        // 发布
        vnode.componentInstance.$on(method, () => {
          validatorEmmiter.emit(`${_uid}-${key}`)
        })
      },
      unbind: function (el, binding, vnode) {
        const {
          modifiers,
          value: key
        } = binding
        const {
          context: {
            _uid
          }
        } = vnode
        const method = Object.keys(modifiers)[0]

        validatorEmmiter.removeAllListeners(`${_uid}-${key}`)
        vnode.componentInstance.$off(method)
      },
    })
  },
}
