<template>
  <div>
    <v-container class="px-0" fluid>
      <div>总包数：{{ chartData.rows.length }}</div>
      <div>总大小：{{ pkgSize }}</div>
    </v-container>
    <ve-bar
      :data="chartData"
      :settings="chartSettings"
      :extend="chartExtend"
      height="1000px"
    ></ve-bar>
  </div>
</template>

<script>
const filesize = require('filesize')
const data = require("../data");

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
    this.pkgSize = filesize(Object.keys(data.pkgSizes).map(_ => data.pkgSizes[_].size).reduce((a, b) => a + b))
    return {
      chartData: {
        columns: ["名称", "包体大小", "size"],
        rows: Object.keys(data.pkgSizes)
          .map((key) => {
            return {
              名称: key,
              包体大小: data.pkgSizes[key].size,
              size: data.pkgSizes[key].size,
              human: data.pkgSizes[key].human,
            };
          })
          .sort((a, b) => a.size - b.size),
      },
    };
  },
};
</script>

<style>
</style>