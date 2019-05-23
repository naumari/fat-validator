
# 重构：从 0.1 构建一个 Vue 表单验证插件

> 工程谚语：如果它没坏，就不要动它。

<span style="color: #bbb;">Published: 2019-03-19</span>

之前在开发中后台业务时候，基于 Vue 写了一个表单验证的插件，由于时间比较急，再加上看过的源码比较少，就草草的实现了。过年期间看了 Vuex 以及 Vue-router 的源码，对插件的实现有了一定的了解，再加上年后公司在裁员，业务有些停滞了，所以抽了两天把它重构一下，也就应了标题的从0.1开发。

1. 为什么要进行重构；
2. 业务场景下的基础用法；
3. 具体结构变动以及实现；
4. 总结。

### 为什么用进行重构

<span style="color: #bbb;">重构之前，[here](https://juejin.im/post/5be965ea6fb9a04a102ecf94)</span>

![数据流](https://user-gold-cdn.xitu.io/2018/11/12/16707b781bb15e60?w=535&h=416&f=png&s=22303)

**原因：**

- 错用设计模式，导致代码耦合严重，在重构之前，维护了一个 `eventHandler` ，用于管理校验规则与结果，却没有进行很好的管理；
- 利用 Vue 的自定义指令 `v-validat` 将来传递校验规则，实现方式繁琐，且所有状态结果都耦合在组件的 `data` 中，但是其庞大、不易维护；
- 利用 `context.$forceUpdate()`，引入脏检测，导致整体效率偏低；
- 部分功能实现方式有问题。

**重构之后的结构：**

![](https://user-gold-cdn.xitu.io/2019/3/19/16995f087d75c415?w=670&h=437&f=png&s=52880)

- 将校验规则、结果维护在当前组件中，`v-validate` 指令，只是做为介质，传递校验的 action、rule。

### 业务场景下的基础用法

------

<span style="color: #bbb;">本章用例，[here](https://github.com/FatGe/fat-validator)</span>

首先在全局安装插件

```js
import validator from "fat-validator";

Vue.use(validator);
```

之后以 element-ui 的组件库为例，创建一个表单

```js
<template>
  <div class="mock" v-if="isVisible">
    <div class="form-wrapper">
      <i class="el-icon-close close-btn" @click.stop="close"></i>

      <div class="header">
        <span>用户注册</span>
        <span></span>
      </div>

      <div class="content">
        <form-item title="姓名" info="姓名不能修改" :warn="validateResult.name">
          <el-input
            placeholder="请输入内容"
            v-model="name"
            v-validate.input="'name'"
            @change="handleChange"
          />
        </form-item>
      </div>

      <div class="footer">
        <el-button type="primary" @click="handleClick({ type: 'confirm' })"
          >确定</el-button
        >

        <el-button type="primary" @click="handleClick({ type: 'reset' })"
          >重置姓名</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import popupWin from "./popup-win.js";
import formItem from "../components/form-item";
// 引入mixin的组件validatorMixin
import { validatorMixin } from "./src/validator/index";

export default {
  mixins: [popupWin, validatorMixin],

  components: {
    formItem
  },

  data() {
    return {
      name: ""
    };
  },

  validator() {
    return {
      name: [
        {
          need: () => !!this.name,
          warn: "不能为空"
        },
        {
          need: () => this.name.length <= 20,
          warn: "不能超过20个字符"
        }
      ]
    };
  },

  methods: {
    handleClick({ type }) {
      const handler = {
        reset: () => this.$validator.reset("name"),
        confirm: () => {
          if (this.$validator.validateAll()) {
            this.$emit("done", name);
          }
        }
      };

      handler[type] && handler[type]();
    },
    handleChange() {
      this.$validator.validate("name");
    }
  }
};
</script>
```

利用 `v-validate.input="'name'"`，在组件上绑定指令，其中 input 代表校验触发时，所需要的事件，'name' 代表所属的校验规则

```js
validator() {
    return {
        name: [
            {
                need: () => !!this.name,
                warn: "不能为空"
            },
            {
                need: () => this.name.length <= 20,
                warn: "不能超过20个字符"
            }
        ]
    };
}
```

同时默认添加状态 `validateResult.name` 代表校验的结果

`this.$validator` 可以调用四个方法：

- `validate` 用于验证单个规则，参数是key，例如上述 `v-validate.input="'name'"`， 可以写为 `@input="$validator.validate('name')"`
- `reset` 用于重置某个验证结果，例如要重置上述验证结果`this.$validator.reset('name')`
- `validateAll` 用于验证所有规则，例如`this.$validator.validateAll()`
- `resetAll` 用于重置所有规则，例如 `this.$validator.resetAll()`。

### 具体结构变动以及实现

------

<span style="color: #bbb;">本章代码，[here](https://github.com/FatGe/fat-validator)</span>

首先利用 `mixins` 对表单进行扩展，将 `validatorMixin` 注入到表单组件中，主要完成两个任务

- 其一：将 `validateResult` mixin 到组件中，方便组件利用校验结果来展示不同信息；

  ```js
  const validatorMixin = {
      data() {
          return {
              validateResult: {},
          }
      }
     	...
  }
  ```

- 其二：对组件扩展，添加 `$validator` 对象，用于实现 `validate` 、`reset`、`validateAll` 等方法；

  ```js
  beforeCreate() {
      if (isDef(this.$options.validator)) {
          const { _uid, $options: { validator } } = this
          const _validator = validator.call(this)
          ...
          this.$validator = _validator
      }
  }
  ```

主要对第二点进行下介绍，将`validatorMixin` mixin 到组件中

```js
// validatorMixin
{
    data() {
        return {
            validateResult: {},
        }
    },
    beforeCreate() {
        if (isDef(this.$options.validator)) {
            const { _uid, $options: { validator } } = this
            const _validator = validator.call(this)
            ...
            this.$validator = _validator
        }
    },
}
// 组件
{
    mixins: [validatorMixin],
    data() {
        return {
            name: ""
        };
    },
    validator() {
        return {
            name: [{
                    need: () => !!this.name,
                    warn: "不能为空"
                },
                {
                    need: () => this.name.length <= 20,
                    warn: "不能超过20个字符"
                }
            ]
        };
    },
}
```

在 `beforeCreate` 生命周期中，对组件的 `$options` 进行访问，获取到当前组件的 `_uid`、自定义的 `validator` 

利用 `validator.call(this)`，将 `validator` 的 context 绑定在当前组件中，这样方便后续利用 `this` 指针来获取当前组件的 `data`，简化验证规则。

```js
const _validator = validator.call(this)
// 定义propConfig，防止方法被 enum 以及 write
const propConfig = {
    writable: false,
    enumerable: false,
}
// init
Object.keys(_validator).forEach((key) => {
    this.$nextTick(() => {
        this.$set(this.validateResult, key, '')
    })
})
```

之后利用 `this.$set` 对之前 mixin  `validateResult` 对象进行初始化，使得每个校验结果都变为响应式。

**PS：**为什么利用 `this.$nextTick` ，是要在 mixin 、组件化完成再对 validateResult 进行修改。

```js
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
```

之后利用 `Object.defineProperties` 对 `_validator` 进行扩展，添加 `validate`、`reset`、`validateAll` 等方法，每个方法的逻辑都比较简单，其中 `validatorEmmiter` 是用来管理校验Action'的，接下后详细介绍。

```js
import events from 'events'

class ValidatorEmmiter extends events {
    constructor() {
        super()
    }
}

const validatorEmmiter = new ValidatorEmmiter()
validatorEmmiter.setMaxListeners(100)
```

`validatorEmmiter` 的实现，特别简易，利用了 node 的 events 模块

**class ValidatorEmmiter extends events**：为什么要存在，方便后续对 `ValidatorEmmiter` 进行扩展，管理事件。

上述简单介绍了注入组件的校验结果模块，接下介绍如何传递校验规则、校验Action，与之前一致的是，依然利用指令 `v-validate` 传递校验规则

具体形式如 `v-validate.input="'name'"`，代表着组件触发 input 事件时候进行校验，校验规则为 `name`

```js
{
    install(Vue) {
        const eventHandler = {}

        Vue.directive('validate', {
            bind(el, binding, vnode) {
                const { modifiers, value: key } = binding
                const { context: { _uid } } = vnode
                const method = Object.keys(modifiers)[0]
                ...
            },
 			...unbind
        })
    },
}
```

具体API见 [Vue插件](https://cn.vuejs.org/v2/guide/plugins.html)，利用参数 `(el, binding, vnode)` 获取上述的组件的 `_uid`，校验规则的 `key`，校验的Action `method` 

之后利用 `validatorEmmiter` 进行订阅与发布，具体时机为

- 指令开始进行 `bind` 时，也就是组件 render 时，`validatorEmmiter`

```js
// on
validatorEmmiter.on(`${_uid}-${key}`, () => {
    const { context: { validateResult, $validator } } = vnode
    // 找到不满足的 rule
    const result = $validator[key].find((item) => !item.need())

    validateResult[key] = isDef(result) ? result.warn : ''
})
// emit
if (method) {
    eventHandler[`${_uid}-${key}`] = () => {
        validatorEmmiter.emit(`${_uid}-${key}`)
    }
    // 用户监听组件的事件，来emit对应的规则
    vnode.componentInstance.$on(
        method,
        eventHandler[`${_uid}-${key}`]
    )
}
```

- 当组件 destroyed 时，会触发对应指令的 `unbind` ，需要对已监听的事件进行 `remove` 以及 `$off`

```js
unbind: function(el, binding, vnode) {
    const { modifiers, value: key } = binding
    const { context: { _uid, $validator } } = vnode
    const method = Object.keys(modifiers)[0]

    // reset & remove event
    $validator.reset(key)
    validatorEmmiter.removeAllListeners(`${_uid}-${key}`)
    if (method) {
        vnode.componentInstance.$off(
            method,
            eventHandler[`${_uid}-${key}`]
        )
    }
},
```

### 总结

------

这篇主要是用来总结之前重构知识的吧，还有就是看了一些源码，总要有产出的吧。