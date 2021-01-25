<template>
  <div>
    <div class="info">
      <div>总包数：{{ chartData.rows.length }}</div>
      <div>总大小：{{ pkgSize }}</div>
    </div>
    <ve-bar
      :data="chartData"
      :settings="chartSettings"
      :extend="chartExtend"
      :legend-visible="false"
      height="1000px"
    ></ve-bar>
  </div>
</template>

<script>
const filesize = require('filesize')
const data = require("../data")

export default {
  name: "PkgSize",
  data() {
    this.chartExtend = {
      tooltip(v) {
        v.formatter = function(items) {
          return items[0].name + ': ' + filesize(items[0].value)
        }
        return v;
      },
    };
    this.chartSettings = {
      dimension: ["名称"],
      metrics: ["包体大小"],
    };
    this.pkgSize = filesize(Object.keys(data.pkgSize).map(_ => data.pkgSize[_].size).reduce((a, b) => a + b))
    return {
      chartData: {
        columns: ["名称", "包体大小", "size"],
        rows: Object.keys(data.pkgSize)
          .map((key) => {
            return {
              名称: key,
              包体大小: data.pkgSize[key].size,
              size: data.pkgSize[key].size,
            };
          })
          .sort((a, b) => a.size - b.size),
      },
    };
  },
};
</script>

<style scoped>
.info {
  display: flex;
  flex-direction: row;
}
.info > * {
  margin: 0 20px 0 20px;
}
</style>