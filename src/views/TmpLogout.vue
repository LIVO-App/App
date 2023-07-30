<template>Loging out</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const $router = useRouter();
const store = useStore();

await store.dispatch("logout");
$router.push("/auth");
</script>

<style>
</style>