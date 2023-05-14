<template>
    <div>
        <ion-icon @click="$router.go(-1)" aria-hidden="true" class="ion-padding-end" :ios="arrow_icon.ios" :md="arrow_icon.md"></ion-icon> <!--Da sistemare-->
        <ion-title>{{ head_content.title }}</ion-title>
        <ion-text>{{ head_content.subtitle }}</ion-text>
    </div>
    <div class="ion-padding">
        <div v-html="head_content.content"></div>
    </div>
</template>

<script setup lang="ts">
import { LearningBlock } from "@/types";
import { IonIcon, IonTitle, IonText } from "@ionic/vue";
import { AxiosInstance } from "axios";
import { arrowBackOutline, arrowBackSharp } from "ionicons/icons";
import { inject } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const $router = useRouter();
const $axios : AxiosInstance | undefined = inject("$axios");
const props = defineProps({
    "id": {
        type: String,
        required: true
    }
});
const arrow_icon = {
    ios: arrowBackOutline,
    md: arrowBackSharp
};
const head_content = {
    title: "",
    subtitle: "",
    content: ""
};

if ($axios != undefined) {
    await $axios.get("/v1/learning_blocks/" + props.id)
        .then(async (response) => {
            const learning_block_card = await (new LearningBlock(response.data.data)).toCard($axios,store,new Date(),true,false);
            head_content.title = learning_block_card.title;
            head_content.subtitle = learning_block_card.subtitle;
            head_content.content = learning_block_card.content;
        })
        .catch((error) => {
            console.log(error);
        });
} else {
    console.error("Connection failed");
}
</script>

<style>

</style>