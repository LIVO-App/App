<template>
    <ion-item lines="none">
        <ion-card color="tertiary" style="width: 100%;">
            <ion-card-content>
                <ion-grid>
                    <ion-row>
                        <ion-col size="auto" style="border-right: 1px solid black;"> <!--Sistemare colore-->
                            <ion-text>{{ elements[language].credits + ": " + props.credits }}</ion-text>
                        </ion-col>
                        <ion-col>
                            <div v-html="content" style="width: fit-content;"></div>
                        </ion-col>
                        <ion-col size="auto">
                            <ion-text :color="enrollment.isPending() ? 'waring'
                                                                            : (props.enrollment.enrollment === true ? 'success' : 'danger')">
                                {{ props.enrollment.isPending() ? elements[language].pending
                                                                : (props.enrollment.enrollment === true ? elements[language].enrolled
                                                                                                        : elements[language].not_enrolled) }}
                            </ion-text>
                        </ion-col>
                        <ion-col v-if="button" size="auto" style="border-left: 1px solid black;"> <!--Sistemare colore-->
                            <ion-button fill="clear" @click="() => {
                                    store.state.request = {
                                        url: url,
                                        method: enrollment.getChangingMethod(),
                                    };
                                    $emit('execute_link');
                                }">
                                <ion-icon v-if="enrollment.enrollment === false" :ios="icons['add'].ios" :md="icons['add'].md"></ion-icon>
                                <ion-icon v-else :ios="icons['close'].ios" :md="icons['close'].md"></ion-icon>
                            </ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-card-content>
        </ion-card>
    </ion-item>
</template>

<script setup lang="ts">
import { ElementsList, Enrollment, IconsList, Language } from "@/types";
import { IonItem,IonCard,IonCardContent,IonGrid,IonRow,IonCol,IonText,IonButton,IonIcon } from "@ionic/vue";
import { AxiosInstance } from "axios";
import { inject } from "vue";
import { useStore } from "vuex";

const store = useStore();
const $axios : AxiosInstance | undefined = inject("$axios");

const language : Language = store.state.language;
const elements : ElementsList = store.state.elements;
const icons : IconsList = store.state.icons;

const props = defineProps({
    "credits": {
        type: Number,
        required: true
    },
    "content": {
        type: String,
        required: true
    },
    "enrollment": {
        type: Enrollment,
        required: true
    },
    "url": String
});
defineEmits(["execute_link"])
const button = props.url != undefined && props.url != '';
</script>

<style>

</style>