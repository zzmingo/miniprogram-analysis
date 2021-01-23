<template>
  <div>
    <div class="toolbar">
        <v-checkbox v-model="onlyMain" :label="`仅显示主包文件`"></v-checkbox>
        <v-checkbox v-model="depBySub" :label="`仅显示子包依赖`"></v-checkbox>
    </div>
    <table>
      <tr>
        <th></th>
        <th>文件</th>
        <th>大小</th>
        <th>主包</th>
        <th>依赖数</th>
        <th>主包依赖</th>
      </tr>
      <tr v-for="(item, idx) in filteredTable" :key="idx">
        <td>{{ idx }}</td>
        <td>{{ item.file }}</td>
        <td>{{ item.size }}</td>
        <td>{{ item.main }}</td>
        <td>{{ item.count }} ({{ item.pkgs.length }})</td>
        <td>{{ item.mainDeps }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
const filesize = require("filesize");
const data = require("../data");

console.log(data);

export default {
  name: "DepsAna",
  computed: {
    filteredTable() {
      let result = this.table;
      if (this.depBySub) {
        result = result.filter((_) => !_.mainDeps);
      }
      if (this.onlyMain) {
        result = result.filter((_) => _.main);
      }
      return result;
    },
  },
  data() {
    return {
      onlyMain: false,
      depBySub: false,
      table: data.depsCount
        .map((item, idx) => {
          return {
            file: data.files[idx],
            size: filesize(data.sizes[idx]),
            count: item.count,
            main: item.main,
            pkgs: item.pkgs,
            mainDeps: item.pkgs.indexOf("main") !== -1,
          };
        })
        .sort((a, b) => b.count - a.count),
    };
  },
};
</script>

<style>
.toolbar {
    display: flex;
    flex-direction: row;
}
.toolbar > * {
  width: 140px;
}
table,
th,
tr,
td {
  border-collapse: collapse;
  border: 1px solid #ddd;
  font-size: 14px;
}
table {
  width: 100%;
}
th {
  background: #eee;
}
th,
td {
  padding: 10px;
}
</style>