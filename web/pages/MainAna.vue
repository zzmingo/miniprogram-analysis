<template>
  <div>
    <div class="toolbar">
      <div>
        <span>排序：</span>
        <select v-model="sort">
          <option value="size">Size</option>
          <option value="main">主包依赖数</option>
          <option value="count">依赖数</option>
        </select>
      </div>
    </div>
    <table>
      <tr>
        <th></th>
        <th>File</th>
        <th>Size</th>
        <th>主包依赖数</th>
        <th>总依赖数</th>
        <th>主包节省</th>
        <th>总节省</th>
      </tr>
      <tr
        v-for="(item, idx) in displayItems"
        :key="item.file"
        :class="{ odd: idx % 2 === 1 }"
      >
        <td class="align-center">{{ idx + 1 }}</td>
        <td>{{ item.file }}</td>
        <td class="align-center">{{ item.human }}</td>
        <td class="align-center">{{ item.main }}</td>
        <td class="align-center">{{ item.count }}</td>
        <td class="align-center">{{ item.mainSave }}</td>
        <td class="align-center">{{ item.allSave }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
const filesize = require("filesize");
const data = require("../data");

export default {
  name: "MainAna",
  computed: {
    displayItems() {
      const key = this.sort
      return this.items.sort((a, b) => b[key] - a[key])
    },
  },
  data() {
    return {
      sort: "size",
      items: Object.keys(data.mainAna)
        .map((file) => {
          const item = data.mainAna[file];
          return {
            file,
            human: filesize(item.size),
            ...item,
            mainSave: filesize((file.length - 3) * item.main),
            allSave: filesize((file.length - 3) * item.count)
          };
        })
        .filter((item) => item.file.indexOf(".js") !== -1)
    };
  },
};
</script>

<style scoped>
.toolbar {
  padding: 0 10px 10px 10px;
}
table {
  width: 100%;
}
table,
tr,
th,
td {
  border-collapse: collapse;
  border: 1px solid #e6e6e6;
  color: #444;
}
th {
  background: #eeeeee;
  padding: 5px 10px;
}
td {
  padding: 2px 5px;
}
.align-center {
  text-align: center;
}
tr.odd {
  background: #f9f9f9;
}
</style>