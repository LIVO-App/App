<template>
    <ion-grid>
        <ion-row>
            <ion-col size="auto">
                <ion-icon @click="$router.go(-1)" aria-hidden="true" class="ion-padding-end" :ios="icons['arrow_back'].ios" :md="icons['arrow_back'].md"></ion-icon> <!--Da sistemare-->
            </ion-col>
            <ion-col>
                <ion-title style="wid">{{ head_content.title }}</ion-title>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-text>{{ head_content.subtitle }}</ion-text>
        </ion-row>
        <ion-row>
            <div class="ion-padding">
                <div v-html="head_content.content"></div>
            </div>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
import { IconsList, LearningBlock } from "@/types";
import { IonGrid, IonRow, IonCol, IonIcon, IonTitle, IonText } from "@ionic/vue";
import { AxiosInstance } from "axios";
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
const icons : IconsList = store.state.icons;
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