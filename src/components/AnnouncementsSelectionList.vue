<template>
    <ion-grid><!-- v-if="learning_blocks.loaded">-->
        <ion-row>
            <ion-col size="12" size-md="6">
              <list-card :title="getCurrentElement(store,'learning_blocks')" :emptiness_message="getCurrentElement(store,'no_blocks')" :cards_list="learning_blocks" @signal_event="change_selection()" />
            </ion-col>
            <ion-col size="12" size-md="6">
              <list-card :key="trigger" :title="getCurrentElement(store,'courses')" :emptiness_message="getCurrentElement(store,is_nothing_selected() ? 'student_learning_block_selection_message' : 'no_courses')" :cards_list="courses" />
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
import { GeneralCardElements, LearningBlock, OrderedCardsList, TeacherBlockCardElements, MinimumCourseProps, MinimizedCourse } from '@/types';
import { IonGrid, IonRow, IonCol } from "@ionic/vue"
import { inject, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import type {AxiosInstance} from 'axios';
import { executeLink, getCurrentElement } from '@/utils'

type Indexes = {
  year: string,
  index: number
}

const is_nothing_selected = () => selected_block_indexes.year == '-1' && selected_block_indexes.index == -1;
const find_block = (learning_blocks : OrderedCardsList<TeacherBlockCardElements>, id? : string) : Indexes => {

  const years = Object.keys(learning_blocks.cards);

  let count = 0;
  let year : string;
  let index : number;

  do {
    year = years[count];
    index = learning_blocks.cards[year].findIndex((a : TeacherBlockCardElements) => {
      if (id != undefined) {
        return a.id == id
      } else {
        return a.selected;
      }
    })
    count++;
  } while (index == -1 && count < years.length);

  return {
    year: year,
    index: index
  };
}
const change_selection = async () => {
  if (selected_block_indexes.year != "-1" && selected_block_indexes.index != -1) {
    learning_blocks.cards[selected_block_indexes.year][selected_block_indexes.index].selected = !learning_blocks.cards[selected_block_indexes.year][selected_block_indexes.index].selected;
  }
  const tmp_selected = find_block(learning_blocks,store.state.event.data.id);

  if (selected_block_indexes.year == tmp_selected.year && selected_block_indexes.index == tmp_selected.index) {
    selected_block_indexes = {
      year: "-1",
      index: -1
    };
    courses.cards = {
      teacher: [],
      associated: []
    };
  } else {
    selected_block_indexes = tmp_selected;
    courses.cards[""] = await executeLink($axios,"/v1/students/" + user.id + "/project_classes?block_id=" + learning_blocks.cards[selected_block_indexes.year][selected_block_indexes.index].id + "&token=" + user.token,
      (response : any) => response.data.data.map((a: MinimumCourseProps) => (new MinimizedCourse(a)).toCard(store,"/announcements/" + a.id + "/" + learning_blocks.cards[selected_block_indexes.year][selected_block_indexes.index].id)));
  }
  trigger.value++;
  learning_blocks.cards[selected_block_indexes.year][selected_block_indexes.index].selected = !learning_blocks.cards[selected_block_indexes.year][selected_block_indexes.index].selected;
}

const $axios : AxiosInstance | undefined = inject("$axios");
const store = useStore();
const user = store.state.user;

const promises : Promise<any>[] = [];
const learning_blocks : OrderedCardsList<TeacherBlockCardElements> = reactive({
  order: [],
  cards: {}
});
const courses : OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {}
});
const school_years = await executeLink($axios,"/v1/ordinary_classes?student_id=" + user.id,
  (response : any) => response.data.data.map((a: any) => a.school_year),
  () => []);
const trigger = ref(0);

let selected_block_indexes : Indexes = reactive({
  year: "-1",
  index: -1
});

for (const year of school_years) {
  promises.push(executeLink($axios,"/v1/learning_blocks?school_year=" + year,
  response => {
      learning_blocks.order.push({
        key: year,
        title: year
      });
      learning_blocks.cards[year] = response.data.data.map((a : any) => (new LearningBlock(a)).toHighlightCard(store));
    }
  ));
}
await Promise.all(promises);
</script>

<style>

</style>