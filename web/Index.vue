<template>
<div>
    <v-app-bar dense>
      <v-toolbar-title>小程序包体分析</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn-toggle
        v-model="tab"
        tile
        color="deep-purple accent-3"
        group
        @change="onTabChanged"
      >
        <v-btn value="/page/pkg-size">包体大小</v-btn>
        <v-btn value="/page/deps-ana">依赖分析</v-btn>
      </v-btn-toggle>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
</div>
</template>

<script>
export default {
    name: "Index",
    data() {
        return {
            tab: this.$route.path
        }
    },
    methods: {
        onTabChanged(value) {
            this.$router.push(value)
        }
    }
}
</script>

<style>
</style>