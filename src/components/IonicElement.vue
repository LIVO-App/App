<template>
    <template v-if="element.linkType == undefined || element.type == 'html'">
        <ion-label v-if="element.type == 'string'">{{ element.content }}</ion-label>
        <div v-if="element.type == 'html'" v-html="element.content"></div>
        <ion-icon v-else-if="element.type == 'icon'" :ios="castIconAlternatives(element.content).ios" :md="castIconAlternatives(element.content).md"></ion-icon>
        <ion-label v-else-if="element.type == 'title'"><h2>{{ element.content }}</h2></ion-label>
    </template>
    <template v-else>
        <ion-button v-if="element.type == 'icon'" fill="clear" @click="() => {
            if (element.linkType == 'request') {
                store.state.request = {
                    url: castRequestIcon(element.content).url,
                    method: castRequestIcon(element.content).method,
                };
                $emit('execute_link');
            } else if (element.linkType == 'event') {
                store.state.event = {
                    name: castEventIcon(props.element.content).event,
                    data: castEventIcon(props.element.content).data
                }
                $emit('signal_event');
            }
        }">
            <ion-icon :ios="castRequestIcon(element.content).icon.ios" :md="castRequestIcon(element.content).icon.md"></ion-icon>
        </ion-button>
        <ion-label v-else-if="element.type == 'string'" @click="() => {
            if (element.linkType == 'request') {
                store.state.request = {
                    url: castRequestString(element.content).url,
                    method: castRequestString(element.content).method,
                };
                $emit('execute_link');
            } else if (element.linkType == 'event') {
                store.state.event = {
                    name: castEventString(props.element.content).event,
                    data: castEventString(props.element.content).data
                };
                $emit('signal_event');
            }
        }">
            {{ castEventString(element.content).text }}
        </ion-label>
    </template>
</template>

<script setup lang="ts">
import { RequestIcon,CustomElement, EventString, EventIcon, IconAlternatives, RequestString } from "@/types";
import { IonButton, IonLabel, IonIcon, IonTitle } from "@ionic/vue";
import { PropType } from "vue";
import { useStore } from "vuex";

const castIconAlternatives = (a: any) => (a as IconAlternatives)
const castRequestIcon = (a: any) => (a as RequestIcon);
const castEventIcon = (a: any) => (a as EventIcon);
const castRequestString = (a: any) => (a as RequestString);
const castEventString = (a: any) => (a as EventString);

const store = useStore();
const props = defineProps({
    element: {
        type: Object as PropType<CustomElement>,
        required: true
    }
})
defineEmits(["execute_link","signal_event"]);
</script>

<style>

</style>