<template>
  <div class="form-item-wrapper">
    <div class="form-item__tile">
      {{ title }}
    </div>
    <div class="form-item__content">
      <slot></slot>
      <span class="form-item__info" v-if="info">{{ info }}</span>
      <span class="form-item__warn">{{ warn }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    info: { type: String, default: "" },
    warn: { type: String, default: "" }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.form-item-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  font-size: 14px;
}
.form-item__tile {
  margin-right: 12px;
  min-width: 60px;
}
.form-item__content {
  position: relative;
  flex: 1;
}
.form-item__info,
.form-item__warn {
  position: absolute;
  left: 0;
  bottom: -1.5em;
  font-size: 12px;
  color: #bbb;
}
.form-item__warn {
  color: #ee0000;
}
.form-item__info + .form-item__warn {
  bottom: -2.7em;
}
</style>
