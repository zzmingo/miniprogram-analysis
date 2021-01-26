<template>
  <div class="tree-item">
    <div @click="toggle">
      <span class="icon" v-if="hasChild">{{ isOpen ? "▾" : "▸" }}</span>
      <span class="icon" v-else>&nbsp;</span>
      <slot name="node" :item="item">{{ item.name }}</slot>
    </div>
    <div class="tree-children" v-if="isOpen">
      <tree-item
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
        :prefetch="true"
        :fetch-children="fetchChildren"
      >
        <template #node="{ item: child }">
          <slot name="node" :item="child" />
        </template>
      </tree-item>
    </div>
  </div>
</template>

<script>
export default {
  name: "TreeItem",
  props: {
    item: Object,
    prefetch: Boolean,
    fetchChildren: Function,
  },
  data() {
    return {
      isOpen: false,
      hasChild: true,
    };
  },
  mounted() {
    if (this.prefetch) {
      if (this.item.children.length === 0) {
        this.fetchChildren(this.item)
        this.updateNode()
      }
    }
  },
  methods: {
    toggle () {
      this.isOpen = !this.isOpen;
    },
    updateNode() {
      this.hasChild = this.item.children.length > 0
    }
  },
};
</script>

<style>
.tree-children {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: none;
}
.tree-item {
  cursor: default;
}
.tree-item .icon {
  width: 12px;
  display: inline-block;
}
</style>