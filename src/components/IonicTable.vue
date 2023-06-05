<template>
    <ion-grid class="ion-margin">
        <ion-row v-if="first_row != undefined" class="row header ion-text-center">
            <ion-col v-for="(cell,index) in first_row" :key="cell.id" :size="'' + column_sizes[index]" class="col">
                <ionic-element :key="cell.id" :element="cell"></ionic-element>
            </ion-col>
        </ion-row>
        <ion-row v-for="(row,index) in data" :key="index" class="row ion-text-center">
            <ion-col v-if="first_col != undefined" :size="'' + column_sizes[0]" class="col header">
                <ionic-element :key="first_col[index].id" :element="first_col[index]"></ionic-element>
            </ion-col>
            <ion-col v-for="(cell,i) in row" :key="cell.id" :size="'' + column_sizes[i]" class="col">
                <ionic-element :key="cell.id" :element="cell" @execute_link="$emit('execute_link')" @signal_event="$emit('signal_event')"></ionic-element>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
import { CustomElement } from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";

defineProps({
    data: {
        type: Array<Array<CustomElement>>,
        required: true
    },
    first_row: {
        type: Array<CustomElement>
    },
    first_col: { //No cell (0,0)
        type: Array<CustomElement>
    },
    column_sizes: {
        type: Array<number>,
        required: true
    }
});

defineEmits(["execute_link","signal_event"]);
</script>

<style>
.header .col {
    background-color: var(--ion-color-primary);
    color: var(--ion-color-tertiary);
}

.col {
    border: solid 1px var(--ion-color-dark);
    border-bottom-style: none;
    border-right-style: none;
}

.col:last-child {
    border-right: solid 1px var(--ion-color-dark);
}

.row:last-child .col {
    border-bottom: solid 1px var(--ion-color-dark);
}

.row:first-child .col:first-child {
    border-top-left-radius: 10px;
}

.row:first-child .col:last-child {
    border-top-right-radius: 10px;
}

.row:last-child .col:first-child {
    border-bottom-left-radius: 10px;
}

.row:last-child .col:last-child {
    border-bottom-right-radius: 10px;
}
</style>