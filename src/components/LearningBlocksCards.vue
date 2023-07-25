<template>
    <ion-grid><!-- v-if="learning_blocks.loaded">-->
        <ion-row>
            <ion-col size="12" size-md="6">
                <list-card :title="getCurrentElement(store,'current')" :emptiness_message="no_blocks" :cards_list="learning_blocks.current" />
                <list-card :title="getCurrentElement(store,'future')" :emptiness_message="no_blocks" :cards_list="learning_blocks.future" />
            </ion-col>
            <ion-col size="12" size-md="6">
                <list-card :title="getCurrentElement(store,'upcoming')" :emptiness_message="no_blocks" :cards_list="learning_blocks.upcoming" />
                <list-card :title="getCurrentElement(store,'completed')" :emptiness_message="no_blocks" :cards_list="learning_blocks.completed" />
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
import { GeneralCardElements, LearningBlockStatus, OrdinaryClassProps, LearningBlock, OrderedCardsList } from '@/types';
import { IonGrid, IonRow, IonCol } from "@ionic/vue"
import { inject, reactive } from 'vue';
import { useStore } from 'vuex';
import type {AxiosInstance} from 'axios';
import { executeLink, getCurrentElement, getCurrentSchoolYear } from '@/utils'

const $axios : AxiosInstance | undefined = inject("$axios");
const store = useStore();

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
const no_blocks = getCurrentElement(store,'no_blocks');

let ordinary_classes : OrdinaryClassProps[],
  current_class : OrdinaryClassProps | undefined,
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
          title: getCurrentElement(store,'open_enrollment')
        },{
          key: "planned",
          title: getCurrentElement(store,'planned')
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