<template>
  <div>
    <table>
        <tr>
            <th></th>
            <th>File</th>
            <th>Size</th>
            <th>依赖数</th>
            <th>主包依赖</th>
        </tr>
        <tr v-for="(item, idx) in items" :key="item.file" :class="{ odd: idx % 2 === 1 }">
            <td class="align-center">{{ idx + 1 }}</td>
            <td>{{item.file}}</td>
            <td class="align-center">{{item.human}}</td>
            <td class="align-center">{{item.count}}</td>
            <td class="align-center">{{item.main}}</td>
        </tr>
    </table>
  </div>
</template>

<script>
const filesize = require('filesize')
const data = require("../data")

export default {
  name: "MainAna",
  data() {
    return {
        items: Object.keys(data.mainAna).map(file => {
            const item = data.mainAna[file]
            return {
                file,
                human: filesize(item.size),
                ...item,
            }
        }).filter(item => !item.main).filter(item => item.file.indexOf('.js') !== -1).sort((a, b) => b.size - a.size)
    }
  },
};
</script>

<style scoped>
table {
    width: 100%;
}
table, tr, th, td {
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