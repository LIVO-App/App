<template>
    <ion-grid><!-- v-if="learning_blocks.loaded">-->
        <ion-row>
            <ion-col size="12" size-md="6">
                <list-card :title="elements[language].current" :emptiness_message="elements[language].noBlocks" :cards="learning_blocks.current" />
                <list-card :title="elements[language].future" :emptiness_message="elements[language].noBlocks" :cards="learning_blocks.future" />
            </ion-col>
            <ion-col size="12" size-md="6">
                <list-card :title="elements[language].upcoming" :emptiness_message="elements[language].noBlocks" :cards="learning_blocks.upcoming" />
                <list-card :title="elements[language].completed" :emptiness_message="elements[language].noBlocks" :cards="learning_blocks.completed" />
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
import { Language, GeneralCardElements, LearningBlockStatus, OrdinaryClass, LearningBlock, ElementsList } from '@/types';
import { IonGrid, IonRow, IonCol } from "@ionic/vue"
import { inject, reactive } from 'vue';
import { useStore } from 'vuex';
import type {AxiosInstance} from 'axios';
import { getCurrentSchoolYear } from '@/utils'

const $axios : AxiosInstance | undefined = inject("$axios");
const store = useStore();
const language : Language = store.state.language;
const elements : ElementsList = store.state.elements;
const learning_blocks : {
    current: {
        [key: string]: GeneralCardElements[]
    },
    future: {
        [key: string]: GeneralCardElements[]
    },
    upcoming: {
        [key: string]: GeneralCardElements[]
    },
    completed: {
        [key: number]: GeneralCardElements[]
    }
} = reactive({  
    "current": {},
    "future": {},
    "upcoming": {},
    "completed": {}
});

const promises : Promise<any>[] = [];
const today = new Date();
let ordinary_classes : OrdinaryClass[],
  current_class : OrdinaryClass | undefined,
  current_school_year : number,
  tmp_element : GeneralCardElements,
  learning_block : LearningBlock;
if ($axios != undefined) {
  ordinary_classes = await $axios.get("/v1/ordinary_classes?student_id=" + store.state.user.id)
    .then(response => response.data.data);/* = [{
    study_year_id: 1,
    study_address_id: "BIO",
    school_year: 2021
  },{
    study_year_id: 2,
    study_address_id: "BIO",
    school_year: 2022
  }];
  ordinary_classes.sort((a,b) => a.school_year < b.school_year ? 1 : a.school_year > b.school_year ? -1 : 0);*/
  current_class = ordinary_classes.shift();
  current_school_year = current_class != undefined ? current_class.school_year : getCurrentSchoolYear();
  if (current_class != undefined) {
    for (const oc of ordinary_classes) {
      promises.push($axios.get("/v1/learning_blocks?school_year=" + oc.school_year).then(async (response) => {
        learning_blocks.completed[oc.school_year] = [];
        for (const block of response.data.data) {
          learning_block = new LearningBlock(block)
          learning_blocks.completed[oc.school_year].push(await learning_block.toCard($axios,store,today));
        }
      }).catch(() => console.error("Learning blocks not retrieved")));
    }
    promises.push($axios.get("/v1/learning_blocks?school_year=" + current_school_year).then(async (response) => {
      for (const block of response.data.data) {
        learning_block = new LearningBlock(block);
        tmp_element = await learning_block.toCard($axios,store,today);
        
        switch (learning_block.getStatus(today)) {
          case LearningBlockStatus.FUTURE:
            if (learning_blocks.future[''] == null){
              learning_blocks.future[''] = [tmp_element];
            } else {
              learning_blocks.future[''].push(tmp_element);
            }
            break;
          case LearningBlockStatus.UPCOMING:
            learning_blocks.upcoming[''] = [tmp_element];
            break;
          case LearningBlockStatus.CURRENT:
            learning_blocks.current[''] = [tmp_element];
            break;
          case LearningBlockStatus.COMPLETED:
            if (learning_blocks.completed[block.school_year] == undefined) {
              learning_blocks.completed[block.school_year] = [tmp_element];
            } else {
              learning_blocks.completed[block.school_year].push(tmp_element);
            }
            break;
        }
      }
    }).catch(err => console.error(err)));
    await Promise.all(promises)/*.then(() => {
      learning_blocks.loaded = true;
    });*/
  } else {
    console.error("Connection failed");
  }
}
</script>

<style>

</style>