<template>
    <ion-grid><!-- v-if="learning_blocks.loaded">-->
        <ion-row>
            <ion-col size="12" size-md="6">
                <list-card :title="elements[language].current" :emptiness_message="elements[language].noBlocks" :cards_list="learning_blocks.current" />
                <list-card :title="elements[language].future" :emptiness_message="elements[language].noBlocks" :cards_list="learning_blocks.future" />
            </ion-col>
            <ion-col size="12" size-md="6">
                <list-card :title="elements[language].upcoming" :emptiness_message="elements[language].noBlocks" :cards_list="learning_blocks.upcoming" />
                <list-card :title="elements[language].completed" :emptiness_message="elements[language].noBlocks" :cards_list="learning_blocks.completed" />
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
import { Language, GeneralCardElements, LearningBlockStatus, OrdinaryClass, LearningBlock, ElementsList, OrderedCardsList } from '@/types';
import { IonGrid, IonRow, IonCol } from "@ionic/vue"
import { inject, reactive } from 'vue';
import { useStore } from 'vuex';
import type {AxiosInstance} from 'axios';
import { executeLink, getCurrentSchoolYear } from '@/utils'

const $axios : AxiosInstance | undefined = inject("$axios");
const store = useStore();
const language : Language = store.state.language;
const elements : ElementsList = store.state.elements;
const learning_blocks : {
    current: OrderedCardsList<GeneralCardElements>,
    future: OrderedCardsList<GeneralCardElements>,
    upcoming: OrderedCardsList<GeneralCardElements>,
    completed: OrderedCardsList<GeneralCardElements>
} = reactive({  
  current: {
    order: [],
    cards: {}
  },
  future: {
    order: [],
    cards: {}
  },
  upcoming: {
    order: [],
    cards: {}
  },
  completed: {
    order: [],
    cards: {}
  }
});

const promises : Promise<any>[] = [];
let ordinary_classes : OrdinaryClass[],
  current_class : OrdinaryClass | undefined,
  current_school_year : number,
  tmp_element : GeneralCardElements | undefined,
  learning_block : LearningBlock;
if ($axios != undefined) {
  ordinary_classes = await executeLink($axios,"/v1/ordinary_classes?student_id=" + store.state.user.id,
    response => response.data.data);/* = [{
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
      promises.push(executeLink($axios,"/v1/learning_blocks?school_year=" + oc.school_year,
        async (response) => {
          learning_blocks.completed.order.push({
            key: oc.school_year,
            title: oc.school_year
          });
          learning_blocks.completed.cards[oc.school_year] = [];
          for (const block of response.data.data) {
            learning_block = new LearningBlock(block)
            learning_blocks.completed.cards[oc.school_year].push(await learning_block.toCard($axios,store));
          }
        },
        () => console.error("Learning blocks not retrieved")));
    }
    promises.push(executeLink($axios,"/v1/learning_blocks?school_year=" + current_school_year,
      async (response) => {
        for (const block of response.data.data) {
          learning_block = new LearningBlock(block);
          tmp_element = await learning_block.toCard($axios,store);
          
          switch (learning_block.getStatus()) {
            case LearningBlockStatus.FUTURE:
              if (learning_blocks.future.cards["planned"] == null){
                learning_blocks.future.cards["planned"] = [tmp_element];
              } else {
                learning_blocks.future.cards["planned"].push(tmp_element);
              }
              break;
            case LearningBlockStatus.UPCOMING:
              learning_blocks.upcoming.cards[""] = [tmp_element];
              break;
            case LearningBlockStatus.CURRENT:
              learning_blocks.current.cards[""] = [tmp_element];
              break;
            case LearningBlockStatus.COMPLETED:
              if (learning_blocks.completed.cards[block.school_year] == undefined) {
                learning_blocks.completed.cards[block.school_year] = [tmp_element];
              } else {
                learning_blocks.completed.cards[block.school_year].push(tmp_element);
              }
              break;
          }
        }
        learning_blocks.completed.order.push({
          key: current_school_year,
          title: current_school_year
        });
        learning_blocks.future.order = learning_blocks.future.order.concat({
          key: "open_enrollment",
          title: elements[language].open_enrollment
        },{
          key: "planned",
          title: elements[language].planned
        });
        tmp_element = learning_blocks.future.cards["planned"].shift();
        learning_blocks.future.cards["open_enrollment"] = tmp_element != undefined ? [tmp_element] : [];
      }));
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