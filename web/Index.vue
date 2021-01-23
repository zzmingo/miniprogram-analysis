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
        <v-btn value="/pages/pkg-size">
          包体大小
        </v-btn>

        <v-btn value="center">
          Center
        </v-btn>

        <v-btn value="right">
          Right
        </v-btn>

        <v-btn value="justify">
          Justify
        </v-btn>
      </v-btn-toggle>
    </v-app-bar>

    <v-main>
        <router-view />
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