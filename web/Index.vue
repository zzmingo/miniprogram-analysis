<template>
  <div class="app">
    <div class="topbar">
      <div class="logo">小程序包体分析</div>
      <div class="spacer"></div>
      <div
        class="tab"
        :class="{ active: '/page/pkg-size' === this.tab }"
        data-route="/page/pkg-size"
        @click="onTabChanged"
      >
        包体大小
      </div>
      <div
        class="tab"
        :class="{ active: '/page/page-ana' === this.tab }"
        data-route="/page/page-ana"
        @click="onTabChanged"
      >
        页面分析
      </div>
      <div
        class="tab"
        :class="{ active: '/page/main-ana' === this.tab }"
        data-route="/page/main-ana"
        @click="onTabChanged"
      >
        主包依赖分析
      </div>
      <div style="width: 30px"></div>
    </div>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {
      tab: this.$route.path,
    };
  },
  methods: {
    onTabChanged(e) {
      const path = e.target.dataset.route
      this.tab = path
      this.$router.push(path);
    },
  },
};
</script>

<style>
body {
  padding: 0;
  margin: 0;
}
</style>

<style scoped>
.topbar {
  display: flex;
  flex-direction: row;
  box-shadow: #ddd 0px 5px 10px;
  align-items: center;
}
.topbar .logo {
  padding-left: 20px;
  font-size: 18px;
  font-weight: bold;
}
.topbar .spacer {
  width: 60px;
}
.topbar .tab {
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
}
.topbar .tab:hover {
  background: #f1f1f1;
}
.topbar .tab.active {
  background: #ddd;
}
.content {
  padding: 20px;
}
</style>