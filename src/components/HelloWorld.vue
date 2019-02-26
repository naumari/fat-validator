<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>
      Essential Links {{ validateResult.input }} {{ validateResult.checkbox }}
    </h2>

    <div class="form-example-wrap">
      <el-button type="text" @click="clickHandler('base')">基本功能</el-button>

      <el-button type="text" @click="clickHandler('handle')"
        >处理表单联动关系</el-button
      >

      <el-button type="text" @click="clickHandler('validate')"
        >校验与重置</el-button
      >
    </div>
  </div>
</template>

<script>
import baseFunctionForm from "../forms/base-function";
import linkage from "../forms/linkage";
import validator from "../forms/validator";

import { validatorMixin } from "../validator/index";
import { transform } from "../util";

export default {
  mixins: [validatorMixin],
  name: "HelloWorld",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
    };
  },
  methods: {
    _baseFunctionForm: transform(baseFunctionForm),
    _linkage: transform(linkage),
    _validator: transform(validator),

    clickHandler(type) {
      const handlers = {
        base: () => this._baseFunctionForm(),
        handle: () => this._linkage(),
        validate: () => this._validator()
      };
      handlers[type]();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.form-example-wrap {
  display: inline-flex;
  justify-content: space-evenly;
  width: 600px;
}
</style>
