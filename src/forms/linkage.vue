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
            v-model="name"
            placeholder="请输入内容"
            v-validate.input="'name'"
          />
        </form-item>

        <form-item title="性别" :warn="validateResult.gender">
          <el-radio-group v-model="gender" v-validate.change="'gender'">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </form-item>

        <form-item title="出生地" :warn="validateResult.places">
          <el-checkbox-group v-model="places" v-validate.change="'places'">
            <el-checkbox v-for="city in cities" :label="city" :key="city">{{
              city
            }}</el-checkbox>
          </el-checkbox-group>
        </form-item>

        <form-item
          title="爱吃的菜"
          v-if="gender === 2"
          :warn="validateResult.dish"
        >
          <el-select
            v-model="value"
            placeholder="请选择"
            v-validate.change="'dish'"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </form-item>
      </div>

      <div class="footer">
        <el-button type="primary" @click="handleClick({ type: 'confirm' })"
          >确定</el-button
        >

        <el-button type="primary" @click="handleClick({ type: 'reset' })"
          >重置</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import popupWin from "./popup-win.js";
import formItem from "../components/form-item";

import { validatorMixin } from "../validator/index";

export default {
  mixins: [popupWin, validatorMixin],

  components: {
    formItem
  },

  data() {
    return {
      cities: ["上海", "北京", "广州", "深圳"],
      options: [
        {
          value: "选项1",
          label: "黄金糕"
        },
        {
          value: "选项2",
          label: "双皮奶"
        },
        {
          value: "选项3",
          label: "蚵仔煎"
        },
        {
          value: "选项4",
          label: "龙须面"
        },
        {
          value: "选项5",
          label: "北京烤鸭"
        }
      ],

      name: "",
      gender: "",
      places: [],
      value: []
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
      ],
      gender: [
        {
          need: () => !!this.gender,
          warn: "请选择性别"
        }
      ],
      places: [
        {
          need: () => this.places.length,
          warn: "请选择城市"
        }
      ],
      dish: [
        {
          need: () => !!this.value,
          warn: "请选择喜欢的菜"
        }
      ]
    };
  },

  methods: {
    handleClick({ type }) {
      const handler = {
        reset: () => this.$validator.resetAll(),
        confirm: () => {
          if (this.$validator.validateAll()) {
            this.$emit("done");
            this.close();
          }
        }
      };

      handler[type] && handler[type]();
    }
  }
};
</script>
<style scoped>
.mock {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;

  background: rgba(0, 0, 0, 0.2);
}
.form-wrapper {
  position: relative;

  display: flex;
  flex-direction: column;
  padding: 32px 16px 16px 32px;
  width: 400px;

  border-radius: 2px;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
  background: white;
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}

.header,
.content,
.footer {
  margin-bottom: 16px;
}

.header {
  font-size: 16px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;

  justify-content: space-between;
}

.content .item {
  display: flex;
  align-items: center;

  flex: 1;

  font-size: 14px;
}

.item .item-title {
  margin-right: 12px;
  width: 50px;
}

.item .item-content {
  flex: 1;
}

.footer {
  display: flex;
  justify-content: space-evenly;
}
</style>
