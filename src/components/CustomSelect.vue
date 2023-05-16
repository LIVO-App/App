<template>
    <ion-select :value="selected_area" @input="$emit('update:selected_area', $event.target.value)" label="Learning area:" justify="start" aria-label="learning area" placeholder="Select learning area" class="ion-padding" fill="solid"> <!-- interface="popover" è più carino, ma da warnings-->
        <ion-select-option v-for="area in props.learning_areas" :value="area.id" :key="area.id" :aria-label="getCorrectName(store,area)">
            {{ getCorrectName(store,area) }}
        </ion-select-option>
    </ion-select>
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption } from '@ionic/vue';
import { Language, LearningArea } from '@/types';
import { PropType } from 'vue';
import { Store, useStore } from 'vuex';

function getCorrectName(store : Store<any>, area: LearningArea) {
    const language : Language = store.state.language;
    return area[`${language}_title`];
}

const props = defineProps({
    "selected_area": {
        type: String
    },
    "learning_areas": {
        type: Object as PropType<{
            [key: string]: LearningArea
        }>,
        required: true
    }
});
defineEmits(["update:selected_area"]);

const store = useStore();
</script>

<style>

</style>