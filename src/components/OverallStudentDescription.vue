<template>
    <student-description :id="student_id" />
    <curriculum-list :student_id="student_id" />
</template>

<script setup lang="ts">
import { executeLink } from "@/utils";
import { AxiosInstance } from "axios";
import { inject } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const $route = useRoute();
const student_id: string = $route.params.id as string;
</script>

<style>

</style>