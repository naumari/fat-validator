<!-- PROJECT SHIELDS -->
[![Build Status][build-shield]]()
[![Contributors][contributors-shield]]()
[![MIT License][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<p align="center">
  <h3 align="center">Fat-Validator</h3>

  <p align="center">
    An vue plugin to optimize HTML form development!
    <br />
    <a href="https://fatge.xyz/blog/fat-validator">View Demo</a>
    ·
    <a href="https://github.com/FatGe/fat-validator/issues">Report Bug</a>
    ·
    <a href="https://github.com/FatGe/fat-validator/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

- [Table of Contents](#Table-of-Contents)
- [About The Project](#About-The-Project)
  - [Built With](#Built-With)
- [Getting Started](#Getting-Started)
  - [Prerequisites](#Prerequisites)
  - [Installation](#Installation)
- [Usage](#Usage)
- [Contributing](#Contributing)
- [Contact](#Contact)



<!-- ABOUT THE PROJECT -->
## About The Project

Here's why dev it, [here](https://juejin.im/post/5c90e141e51d4579a6301451).

### Built With

* [Vue](https://vuejs.org/)


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* npm
```sh
npm install npm@latest -g
```

### Installation

1. Clone the repo
```sh
git clone https://github.com/FatGe/fat-validator
```
2. Install NPM packages
```sh
npm install
```
3. Run this repo
```JS
npm run serve
```



<!-- USAGE EXAMPLES -->
## Usage

1. Install fat-validator in item
```bash
npm i fat-validator
```
2. Install fat-validator in vue
```js
import validator from "./validator";

Vue.use(validator);
```
3. Mixin validatorMixin in component
```js
import { validatorMixin } from "../validator/index";

export default {
    mixins: [validatorMixin],
}
```
4. Set validator rules

`this` is Vue Component

```js
export default {
    data() {
        return {
            name: ''
        }
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
    }
}
```
5. Use v-validate.method="'validatorNam'"
```html
<el-input
    v-model="name"
    placeholder="请输入内容"
    v-validate.input="'name'"
/>
```
6. Get validate Result
```js
this.validateResult.name
// or
<template>
    validateResult.name
</template>
```
6. [Some other Api](https://github.com/FatGe/fat-validator/blob/master/src/validator/index.js)


_For more examples, please refer to the [Documentation](https://juejin.im/post/5c90e141e51d4579a6301451)_



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- CONTACT -->
## Contact

Ge - duangci@aliyun.com

Project Link: [https://github.com/FatGe/fat-validator](https://github.com/FatGe/fat-validator)


<!-- MARKDOWN LINKS & IMAGES -->
[build-shield]: https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square
[contributors-shield]: https://img.shields.io/badge/contributors-1-orange.svg?style=flat-square
[license-shield]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: https://choosealicense.com/licenses/mit
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: https://raw.githubusercontent.com/othneildrew/Best-README-Template/master/screenshot.png
