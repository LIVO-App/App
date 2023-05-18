<template>
    <div class="ion-padding-horizontal">
        <custom-select v-model="selected_year" :list="school_years" label="Anno scolastico:" aria_label="Anno scolastico" placeholder="Scegli un anno scolastico" />
        <!--<list-card :key="trigger" @execute_link="changeEnrollment($axios,remainingCredits,selected_area)" :emptiness_message="elements[language].noCourses" v-model:cards="courses" />-->
    </div>
</template>

<script setup lang="ts">
import { ElementsList, Language } from "@/types";
import { executeLink } from "@/utils";
import { AxiosInstance } from "axios";
import { inject, ref, Ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");
const language : Language = store.state.language
const elements : ElementsList = store.state.elements;
const user_id : string = store.state.user.id;

let school_years : any[] = [];

let selected_year : Ref<any>;

if ($axios != undefined) {
    //executeLink($axios,store,response => response.data.data,() => [],"/v1/ordinary_classes?descending=true&student_id=" + user_id)
    school_years = await $axios.get("/v1/ordinary_classes?descending=true&student_id=" + user_id)
        .then(response => {
            return response.data.data.map((a: any) => {
                return {
                    id: a.school_year
                }
            });
        })
        .catch(() => []);
    selected_year = ref(school_years[0].id);
}
</script>

<style>

</style>