<template>
  <div>
    <div v-if="loaded">
      <div class="tree">
        <tree-item 
          v-for="(item, idx) in data" :key="idx"
          :item="item"
          :prefetch="true"
          :fetch-children='fetchChildren'
        >
          <template #node="{item}">
            <div class="node" :class="{ 'zero-size': item.node.totalSize === 0 }">
              <span v-if="item.root">📦</span>
              <span v-if="item.node.page">📃</span>
              <span v-if="item.node.component">🔸</span>
              <span v-if="item.name === 'usingComponents'">⛓️</span>
              <span class="name" :class="{ recursive: item.node.recursive, cache: item.node.cache }">{{item.name}}</span>
              <span class="label size">{{ humanSize(item.node.totalSize) }}</span>
              <span v-if="item.node.recursive" class="label recursive">循环引用</span>
              <span v-if="item.node.cache" class="label cache">多引用源</span>
              <span v-if="item.node.mainDep" class="label main">主包</span>
              <span v-if="item.node.noExists" class="label no-exists">文件不存在</span>
            </div>
          </template>
        </tree-item>
      </div>
    </div>
  </div>
</template>

<script>
import filesize from "filesize"
import TreeItem from '../component/TreeItem'
import data from "../data"

console.log(data);

export default {
  name: "PageAna",
  components: {
    TreeItem
  },
  data() {
    return {
      loaded: false,
      data: []
    };
  },
  mounted() {
    this.loadData()
  },
  methods: {
    humanSize(size) {
      return filesize(size)
    },
    loadData() {
      this.data = Object.keys(data.pageDeps.pkgs)
        .map((key) => {
          return {
            name: key,
            root: true,
            node: data.pageDeps.pkgs[key],
            children: [],
          }
        }).sort((a, b) => b.node.totalSize - a.node.totalSize)
      this.loaded = true
    },
    fetchChildren(item) {
      let children
      if (item.root) {
        children = Object.keys(item.node.pages).map(key => {
          const node = item.node.pages[key]
          return {
            name: key,
            node: node,
            children: []
          }
        })
      } else {
        let deps
        if (item.node.cache) {
          deps = data.pageDeps.cache[item.node.file].deps
        } else if (item.node.recursive) {
          deps = []
        } else {
          deps = item.node.deps
        }
        children = deps.map(dep => {
          return {
            name: dep.file,
            node: dep,
            children: []
          }
        })
      }
      item.children = children
      item.children.sort((a, b) => b.node.totalSize - a.node.totalSize)

      if (item.name === 'main') {
        item.children.unshift({
          name: 'app.js',
          node: data.pageDeps.pkgs.main.app,
          children: [],
        })
      }
      return item
    },
  },
};
</script>

<style scoped>
.node {
  display: inline-block;
  font-size: 14px;
}
.node.zero-size {
  color: #999;
}
.label {
  border-radius: 3px;
  background: #eee;
  font-size: 12px;
  padding: 2px 4px 2px 4px;
}
.label.recursive {
  background: red;
  color: white;
}
.label.no-exists {
  background: red;
  color: white;
}

</style>