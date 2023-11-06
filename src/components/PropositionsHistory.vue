<template>
  <ion-grid><!-- v-if="learning_sessions.loaded">-->
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card :title="getCustomMessage('title', getCurrentElement('school_years'))" :emptiness_message="getCustomMessage(
          'emptiness_message',
          getCurrentElement('no_school_years')
        )
          " :cards_list="school_years" @signal_event="changeSelection()" />
      </ion-col>
      <ion-col size="12" size-md="6">
        <list-card :key="trigger" :title="getCustomMessage('title', getCurrentElement('courses'))" :emptiness_message="getCustomMessage(
          'emptiness_message',
          getCurrentElement(
            is_nothing_selected()
              ? 'teacher_learning_session_selection_message'
              : 'no_project_classes'
          )
        )
          " :cards_list="is_nothing_selected() ? empty_propositions : year_propositions
    " />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  OrderedCardsList,
  User,
  CourseModel,
  CourseModelProps,
} from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { reactive, ref } from "vue";
import { useStore } from "vuex";
import { executeLink, getCurrentElement, getCustomMessage } from "@/utils";

const is_nothing_selected = () => selected_year_index.value == -1;
const find_session = (
  school_years: OrderedCardsList<GeneralCardElements>,
  id?: string
) =>
  school_years.cards[""].findIndex((a: GeneralCardElements) => {
    if (id != undefined) {
      return a.id == id;
    } else {
      return a.selected;
    }
  });
const changeSelection = async () => {
  if (selected_year_index.value != -1) {
    selectedChange();
  }

  const tmp_selected = find_session(school_years, store.state.event.data.id);
  if (selected_year_index.value == tmp_selected) {
    selected_year_index.value = -1;
    year_propositions.cards = {
      "": [],
    };
  } else {
    selected_year_index.value = tmp_selected;
    selectedChange();

    for (const proposition of propositions) {
      if (
        proposition.creation_school_year ==
        parseInt(school_years.cards[""][selected_year_index.value].id)
      ) {
        year_propositions.cards[""].push(proposition.toCard(user, true)); //<!-- ! (1): mettere preferenze pending (sia qui che in project class)
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

const store = useStore();
const user = User.getLoggedUser() as User;

const school_years: OrderedCardsList<GeneralCardElements> = reactive({
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
  "/v1/propositions?recent_models=false",
  async (response: any) => Promise.all(response.data.data.map(async (a: CourseModelProps) => {
    const tmp_proposition = new CourseModel(a);
    await tmp_proposition.loadParms();
    return tmp_proposition;
  })),
  () => []
);
const actual_teacher_id = user.id;
const selected_year_index = ref(-1);

await executeLink(
  "/v1/teachers/" + actual_teacher_id + "/active_years", //<!-- TODO (5): trovare api per admin
  (response) => {
    let id: string;

    school_years.cards[""] = response.data.data.map((a: any) => {
      id = "" + a.year;

      return {
        id: id,
        group: "",
        title: getCustomMessage("title", "" + a.year),
        selected: false,
        link: {
          event: "change_selection",
          data: {
            id: id,
          },
        },
      };
    });
  }
);
</script>

<style></style>