import events from "events";

class ValidatorEmitter extends events {
  constructor() {
    super();
  }
}

const validatorEmitter = new ValidatorEmitter();
validatorEmitter.setMaxListeners(100);
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
            validatorEmitter.emit(`${_uid}-${key}`);
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
            const haveListeners = eventName =>
              validatorEmitter.listenerCount(eventName);
            const promises = Object.keys(_validator).map(
              key =>
                new Promise(resolve => {
                  if (haveListeners(`${_uid}-${key}`)) {
                    validatorEmitter.emit(`${_uid}-${key}`, resolve);
                  } else {
                    resolve("");
                  }
                })
            );

            return Promise.all(promises).then(() => {
              return Object.keys(this.validateResult).every(
                item => this.validateResult[item] === ""
              );
            });
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
        // event handler
        validatorEmitter.on(`${_uid}-${key}`, next => {
          const {
            context: { validateResult, $validator }
          } = vnode;
          const rules = $validator[key];
          const validateRules = rules => {
            return new Promise(resolve => {
              let len = 0;

              rules.reduce((pre, cur) => {
                return pre.then(() => {
                  const { need, warn } = cur;
                  const needPromise = Promise.resolve(need());

                  return needPromise.then(res => {
                    ++len;
                    // Termination condition：rule failed || last one rule
                    if (res === false || len === rules.length) {
                      next && next(res ? "" : warn);
                      resolve(res ? "" : warn);
                    }
                  });
                });
              }, Promise.resolve(true));
            });
          };
          validateRules(rules).then(warn => {
            validateResult[key] = isDef(warn) ? warn : "";
          });
        });
        // listen event
        if (method) {
          eventHandler[`${_uid}-${key}`] = () => {
            validatorEmitter.emit(`${_uid}-${key}`);
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
        validatorEmitter.removeAllListeners(`${_uid}-${key}`);
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
