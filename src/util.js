import Vue from 'vue'
/**
 *
 * @param {obj} params
 */
const inlineListen = ({
  method,
  options,
  instance
}) => {
  let listener = `on${method}`
  instance[listener] = options[method]
  instance.$on(method, function (data) {
    this[listener](data)
  })
}
/**
 *
 * @param {vue} component 传入组件
 * @returns {obj} instance 构造后的实例
 */
export const transform = (component) => {
  const _constructor = Vue.extend(component)
  return function (options = {}) {
    const {
      propsData,
      done,
      cancel
    } = options
    let instance = new _constructor({
      propsData
    }).$mount(document.createElement('div'))

    done && inlineListen({
      method: 'done',
      options,
      instance
    })
    cancel && inlineListen({
      method: 'cancel',
      options,
      instance
    })

    return instance
  }
}
