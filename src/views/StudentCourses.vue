<template>
  <ion-page>
    <outer-header :subtitle="elements.subtitle[store.state.language]" /> <!--:title="store.state.menu[store.state.user.user][store.state.menuIndex].title[store.state.language]" />-->

    <ion-content :fullscreen="true">
      <inner-header :subtitle="elements.subtitle[store.state.language]" /> <!--:title="store.state.menu[store.state.user.user][store.state.menuIndex].title[store.state.language]" />-->

      <suspense>
        <template #default>
          <block-description :id="$route.params.id" />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
      
      <!--<ion-select>
        <ion-select-option v-for="area in props.learning_areas" :value="area.id" :key="area.id">
          {{ getCorrectArea(area) }}
        </ion-select-option>
      </ion-select>-->
      <!--<suspense>
        <template #default>
          <learning-blocks-cards />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>-->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Language } from '@/types';
import { ElementsList, LearningArea } from '@/types';
import { IonContent, IonPage, IonSelect, IonSelectOption } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

function getCorrectArea(area: LearningArea) {
    return area[`${store.state.language as Language}_title`];
}

const elements : ElementsList = {
    subtitle: {
        "italian": "Corsi",
        "english": "Courses"
    },
    learning_area: {
        "italian": "Area di apprendimento",
        "english": "Learning area"
    }
}

const store = useStore();
const $route = useRoute();

</script>

<style>

</style>