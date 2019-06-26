import events from "events";

class ValidatorEmmiter extends events {
  constructor() {
    super();
  }
}

const validatorEmmiter = new ValidatorEmmiter();
validatorEmmiter.setMaxListeners(100);
const isDef = v => v !== undefined;

export const validatorMixin = {
  data() {
    return {
      validateResult: {}
    };
  },
  beforeCreate() {
    if (isDef(this.$options.validator)) {
      const {
        _uid,
        $options: { validator }
      } = this;
      const _validator = validator.call(this);
      const propConfig = {
        writable: false,
        enumerable: false
      };
      // init
      Object.keys(_validator).forEach(key => {
        this.$nextTick(() => {
          this.$set(this.validateResult, key, "");
        });
      });
      // init releated method
      Object.defineProperties(_validator, {
        validate: {
          value(key) {
            validatorEmmiter.emit(`${_uid}-${key}`);
          },
          ...propConfig
        },
        reset: {
          value: key => {
            this.validateResult[key] = "";
          },
          ...propConfig
        },
        validateAll: {
          value: () => {
            Object.keys(_validator).forEach(key => {
              const haveListeners = eventName =>
                validatorEmmiter.listenerCount(eventName);
              if (haveListeners(`${_uid}-${key}`)) {
                validatorEmmiter.emit(`${_uid}-${key}`);
              }
            });
            return Object.keys(this.validateResult).every(
              item => this.validateResult[item] === ""
            );
          },
          ...propConfig
        },
        resetAll: {
          value: () => {
            Object.keys(_validator).forEach(key => {
              this.validateResult[key] = "";
            });
          },
          ...propConfig
        }
      });

      this.$validator = _validator;
    }
  }
};

export default {
  install(Vue) {
    const eventHandler = {};

    Vue.directive("validate", {
      bind(el, binding, vnode) {
        const { modifiers, value: key } = binding;
        const {
          context: { _uid }
        } = vnode;
        const method = Object.keys(modifiers)[0];
        // 订阅
        validatorEmmiter.on(`${_uid}-${key}`, () => {
          const {
            context: { validateResult, $validator }
          } = vnode;
          const result = $validator[key].find(item => !item.need());

          validateResult[key] = isDef(result) ? result.warn : "";
        });
        // listen event
        if (method) {
          eventHandler[`${_uid}-${key}`] = () => {
            validatorEmmiter.emit(`${_uid}-${key}`);
          };
          if (vnode.componentInstance)
            vnode.componentInstance.$on(method, eventHandler[`${_uid}-${key}`]);
          else el.addEventListener(method, eventHandler[`${_uid}-${key}`]);
        }
      },
      unbind: function(el, binding, vnode) {
        const { modifiers, value: key } = binding;
        const {
          context: { _uid, $validator }
        } = vnode;
        const method = Object.keys(modifiers)[0];

        // reset & remove event
        $validator.reset(key);
        validatorEmmiter.removeAllListeners(`${_uid}-${key}`);
        if (method) {
          if (vnode.componentInstance)
            vnode.componentInstance.$off(
              method,
              eventHandler[`${_uid}-${key}`]
            );
          else el.removeEventListener(method, eventHandler[`${_uid}-${key}`]);
        }
      }
    });
  }
};
