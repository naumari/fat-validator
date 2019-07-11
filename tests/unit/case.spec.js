import { expect } from "chai";
import { mount, createLocalVue } from "@vue/test-utils";
import baseFunction from "@/forms/base-function.vue";
import linkage from "@/forms/linkage.vue";
import ElementUI from "element-ui";
import validator from "@/validator";
import { validatorMixin } from "@/validator";

const localVue = createLocalVue();

localVue.use(ElementUI);
localVue.use(validator);
localVue.mixin(validatorMixin);

/** base form unit test
 *  validator
 *  linkage
 */

const dataCases = [
  {
    data: {
      name: "",
      gender: "",
      places: []
    },
    result: {
      name: "不能为空",
      gender: "请选择性别",
      places: "请选择城市"
    }
  },
  {
    data: {
      name: "123456789012345678901",
      gender: "",
      places: []
    },
    result: {
      name: "不能超过20个字符",
      gender: "请选择性别",
      places: "请选择城市"
    }
  },
  {
    data: {
      name: "hello world",
      gender: "1",
      places: ["上海"]
    },
    result: {
      name: "",
      gender: "",
      places: ""
    }
  }
];

describe("baseFunction.vue", () => {
  it("validate baseFunction data rule", () => {
    const wrapper = mount(baseFunction, {
      localVue
    });

    for (const iterator of dataCases) {
      const { data, result } = iterator;
      wrapper.setData(data);
      wrapper.vm.$validator.validateAll();

      Object.keys(result).forEach(key => {
        const value = result[key];

        expect(wrapper.vm.validateResult[key]).to.equal(value);
      });
    }
  });
});

describe("linkage.vue", () => {
  it("check form linkage", () => {
    const wrapper = mount(linkage, {
      localVue
    });
    wrapper.setData({
      gender: 2
    });

    expect(wrapper.find(".form-item-wrapper:nth-of-type(4)").exists()).to.be
      .true;
  });
});
