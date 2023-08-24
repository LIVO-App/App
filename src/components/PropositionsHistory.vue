<template>
  <ion-grid
    ><!-- v-if="learning_sessions.loaded">-->
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card
          :title="getCurrentElement(store, 'school_years')"
          :emptiness_message="getCurrentElement(store, 'no_school_years')"
          :cards_list="school_years"
          @signal_event="changeSelection()"
        />
      </ion-col>
      <ion-col size="12" size-md="6">
        <list-card
          :key="trigger"
          :title="getCurrentElement(store, 'courses')"
          :emptiness_message="
            getCurrentElement(
              store,
              is_nothing_selected()
                ? 'teacher_learning_session_selection_message'
                : 'no_project_classes'
            )
          "
          :cards_list="is_nothing_selected() ? empty_propositions : year_propositions"
        />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  OrderedCardsList,
  CourseSectionsTeachings,
  HiglightCardElements,
  User,
  CourseModel,
  CourseModelProps,
} from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { inject, reactive, ref } from "vue";
import { useStore } from "vuex";
import type { AxiosInstance } from "axios";
import { executeLink, getCurrentElement } from "@/utils";

const is_nothing_selected = () =>
  selected_year_index.value == -1;
const find_session = (
  school_years: OrderedCardsList<HiglightCardElements>,
  id?: string
) => school_years.cards[""].findIndex(
    (a: HiglightCardElements) => {
      if (id != undefined) {
        return a.id == id;
      } else {
        return a.selected;
      }
    }
  );
const changeSelection = async () => {
  const tmp_propositions: {
    "": {
      [key: number]: CourseModel;
    };
  } = {
    "": {},
  };

  if (
    selected_year_index.value != -1
  ) {
    selectedChange();
  }

  const tmp_selected = find_session(school_years, store.state.event.data.id);
  if (
    selected_year_index.value == tmp_selected
  ) {
    selected_year_index.value = -1;
    year_propositions.cards = {
      "": [],
    };
  } else {
    selected_year_index.value = tmp_selected;
    selectedChange();
    
    for (const proposition of propositions) {
      if (proposition.creation_school_year == parseInt(school_years.cards[""][selected_year_index.value].id)) {
        year_propositions.cards[""].push(proposition.toCard(store,user,true));
      }
    }
  }
};
const selectedChange = (
  index = selected_year_index.value,
  value = !school_years.cards[""][index].selected
) => {
  school_years.cards[""][index].selected = value;
  trigger.value++;
};

const $axios: AxiosInstance | undefined = inject("$axios");
const store = useStore();
const user = User.getLoggedUser() as User;

const school_years: OrderedCardsList<HiglightCardElements> = reactive({
  order: [],
  cards: {},
});
const empty_propositions: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const year_propositions: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {
    "": [],
  },
});
const trigger = ref(0);
const propositions: CourseModel[] = await executeLink(
  $axios,
  "/v1/propositions?token=" + user.token, // Da sistemare: /v1/propositions?token=<token teacher2> da due corsi (id: 5) uguali
  (response: any) => response.data.data.map((a: CourseModelProps) => new CourseModel(a)), // Due modelli con titoli diversi non dovrebbero avere id diversi?
  () => []
);
console.log(propositions);
const actual_teacher_id = user.id;
const selected_year_index = ref(-1);

await executeLink(
  $axios,
  "/v1/teachers/" + actual_teacher_id + "/active_years", // Da sistemare: trovare api per admin
  (response) => {
    school_years.cards[""] = response.data.data.map((a: any) =>
      {
        return {
            id: "" + a.year,
            group: "",
            title: "" + a.year,
            selected: false
        }
      }
    );
  }
);
</script>

<style>
</style>