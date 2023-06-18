<template>
    <ion-item lines="none">
        <ion-card color="tertiary" style="width: 100%;">
            <ion-card-content>
                <ion-grid>
                    <ion-row>
                        <ion-col size="auto" style="border-right: 1px solid var(--ion-color-dark);">
                            <ionic-element :element="content[0]" />
                        </ion-col>
                        <ion-col>
                            <ionic-element :element="content[1]" @signal_event="$emit('signal_event')" />
                        </ion-col>
                        <ion-col size="auto">
                            <ion-text :color="enrollment.isPending() ? 'warning'
                                                                            : (props.enrollment.enrollment === true ? 'success' : 'danger')">
                                <ionic-element :element="content[2]" />
                            </ion-text>
                        </ion-col>
                        <ion-col v-if="button" size="auto" style="border-left: 1px solid var(--ion-color-dark);">
                            <ionic-element :element="content[3]" @execute_link="$emit('execute_link')" />
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-card-content>
        </ion-card>
    </ion-item>
</template>

<script setup lang="ts">
import { CustomElement } from "@/types";
import { Enrollment } from "@/types";
import { getCurrentElement, getIcon } from "@/utils";
import { IonItem,IonCard,IonCardContent,IonGrid,IonRow,IonCol,IonText,IonButton,IonIcon } from "@ionic/vue";
import { Method } from "axios";
import { PropType } from "vue";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
    "credits": {
        type: Number,
        required: true
    },
    "content": {
        type: Array as PropType<CustomElement[]>,
        required: true
    },
    "enrollment": {
        type: Object as PropType<Enrollment>,
        required: true
    }
});
defineEmits(["execute_link","signal_event"]);
const button = props.enrollment.editable && props.content.length > 3;
</script>

<style>

</style>