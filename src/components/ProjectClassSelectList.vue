<template>
  <ion-grid><!-- v-if="learning_sessions.loaded">-->
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card
          :title="getCustomMessage('title', getCurrentElement($route.name == 'ordinary_classes' ? 'classes' : 'learning_sessions'))"
          :emptiness_message="getCustomMessage(
            'emptiness_message',
            getCurrentElement($route.name == 'ordinary_classes' ? 'no_classes' : 'no_sessions')
          )
            " :cards_list="$route.name == 'ordinary_classes' ? ordinary_classes : learning_sessions_cards"
          @signal_event="changeSelection()" />
      </ion-col>
      <ion-col size="12" size-md="6">
        <custom-select v-if="$route.name != 'ordinary_classes' || (sections_use && user.user == 'teacher')" v-model="selected_option"
          :list="options" :label="getCurrentElement($route.name == 'ordinary_classes' ? 'section' : 'propositions') + ':'"
          :aria_label="getCurrentElement($route.name == 'ordinary_classes' ? 'section' : 'propositions')" :placeholder="getCurrentElement(
            is_nothing_selected()
              ? ($route.name == 'ordinary_classes'
                ? 'no_sections'
                : 'no_types_propositions')
              : ($route.name == 'ordinary_classes'
                ? 'section_choice'
                : 'propositions_choice'))
            " :getCompleteName="$route.name == 'ordinary_classes' ? undefined : (option: any) => option.title" />
        <list-card :key="trigger"
          :title="$route.name == 'ordinary_classes' ? getCustomMessage('title', getCurrentElement('students')) : undefined"
          :emptiness_message="getCustomMessage(
            'emptiness_message',
            getCurrentElement(
              is_nothing_selected()
                ? ($route.name == 'ordinary_classes'
                  ? 'ordinary_class_selection_message'
                  : (selected_option == 'project_classes'
                    ? 'project_classes_propositions_selection_message'
                    : 'courses_propositions_selection_message'))
                : ($route.name == 'ordinary_classes'
                  ? 'no_students'
                  : 'no_propositions')
            )
          )
            " :cards_list="$route.name == 'ordinary_classes' ? students : propositions" />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  OrderedCardsList,
  OrdinaryClassSummary,
  StudentSummaryProps,
  StudentSummary,
  User,
  LearningSession,
  CourseModel,
  CourseModelProps,
  CardsList,
} from "@/types";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { reactive, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import { executeLink, getCurrentElement, getCustomMessage } from "@/utils";
import { useRoute } from "vue-router";

type Indexes = {
  group: string;
  index: number;
};

const is_nothing_selected = () =>
  selected_element_indexes.group == "-1" && selected_element_indexes.index == -1;
const find_element = (
  list: OrderedCardsList<GeneralCardElements>,
  id?: string
): Indexes => {
  const groups = Object.keys(list.cards);

  let count = 0;
  let year: string;
  let index: number;

  do {
    year = groups[count];
    index = list.cards[year].findIndex((a: GeneralCardElements) => {
      if (id != undefined) {
        return a.id == id;
      } else {
        return a.selected;
      }
    });
    count++;
  } while (index == -1 && count < groups.length);

  return {
    group: year,
    index: index,
  };
};
const changeSelection = async () => {
  let tmp_element: GeneralCardElements;
  let group_changed: boolean;

  if (
    selected_element_indexes.group != "-1" &&
    selected_element_indexes.index != -1
  ) {
    selectedChange();
  }

  const tmp_selected = find_element($route.name == 'ordinary_classes' ? ordinary_classes : learning_sessions_cards, store.state.event.data.id);
  if (
    selected_element_indexes.group == tmp_selected.group &&
    selected_element_indexes.index == tmp_selected.index
  ) {
    selected_element_indexes = {
      group: "-1",
      index: -1,
    };
    if ($route.name == "ordinary_classes") {
      students.cards[""] = [];
      options = [];
      selected_option.value = "";
    } else {
      propositions.order = [{
        key: "to_approve",
        title: getCustomMessage("to_approve", getCurrentElement("to_approve"), "title")
      }, {
        key: "approved",
        title: getCustomMessage("approved", getCurrentElement("approved"), "title")
      }]
      propositions.cards = {
        "to_approve": [],
        "approved": [],
      }
      selected_option.value = "project_classes";
    }
  } else {
    group_changed = selected_element_indexes.group != tmp_selected.group;
    selected_element_indexes = tmp_selected;
    if ($route.name == "ordinary_classes") {
      tmp_element = ordinary_classes.cards[selected_element_indexes.group][
        selected_element_indexes.index
      ];
      options =
        all_sections[parseInt(selected_element_indexes.group)][tmp_element.id];
      selected_option.value = options[0].id;
      selectedChange();
      students.cards = await getStudents();
    } else {
      tmp_element = learning_sessions_cards.cards[selected_element_indexes.group][
        selected_element_indexes.index
      ];
      selectedChange();
      if (selected_option.value != "courses" || group_changed) {
        propositions.order = [{
          key: "to_approve",
          title: getCustomMessage("to_approve", getCurrentElement("to_approve"), "title")
        }, {
          key: "approved",
          title: getCustomMessage("approved", getCurrentElement("approved"), "title")
        }];
        propositions.cards = await getPropositions();
      }
    }
  }
};
const selectedChange = (
  group = selected_element_indexes.group,
  index = selected_element_indexes.index,
  value = !($route.name == "ordinary_classes" ? ordinary_classes : learning_sessions_cards).cards[group][index].selected
) => {
  ($route.name == "ordinary_classes" ? ordinary_classes : learning_sessions_cards).cards[group][index].selected = value;
  trigger.value++;
};
const getStudents = async () => {
  const class_keys =
    ordinary_classes.cards[selected_element_indexes.group][
      selected_element_indexes.index
    ].id.split(" ");
  return await executeLink(
    "/v1/ordinary_classes/" +
    class_keys[0] +
    "/" +
    class_keys[1] +
    "/components?section=" +
    selected_option.value +
    "&school_year=" +
    selected_element_indexes.group,
    (response: any) => {
      return {
        "": response.data.data.map((a: StudentSummaryProps) =>
          new StudentSummary(a).toCard("/students/" + a.id)
        )
      }
    }
  );
};
const getPropositions = async () => {
  const session_propositions: CourseModel[] = await (selected_option.value == "project_classes"
    ? executeLink(
      "/v1/propositions?recent_models=false&session_id=" + learning_sessions_cards.cards[selected_element_indexes.group][selected_element_indexes.index].id,
      async (response: any) => Promise.all(response.data.data.map(async (a: CourseModelProps) => {
        const tmp_proposition = new CourseModel(a, learning_sessions.find(b => b.id == a.learning_session_id));
        //await tmp_proposition.loadParms()
        return tmp_proposition;
      })),
      () => []
    )
    : executeLink(
      "/v1/propositions?recent_models=false&session_id=" + learning_sessions_cards.cards[selected_element_indexes.group][selected_element_indexes.index].id + "&school_year=" + selected_element_indexes.group,
      (response: any) => response.data.data.map((a: CourseModelProps) => new CourseModel(a)),
      () => []
    ));
    
  const cards: CardsList<GeneralCardElements> = {
    "approved": [],
    "to_approve": [],
  };

  for (const proposition of session_propositions) {
    if (selected_option.value == "project_classes") {
      if (
        proposition.creation_school_year == parseInt(selected_element_indexes.group)
        && ("" + proposition.learning_session?.id) == learning_sessions_cards.cards[selected_element_indexes.group][selected_element_indexes.index].id
      ) {
        cards[proposition.isApproved() ? "approved" : "to_approve"].push(proposition.toCard(user, true));
      }
    } else {
      if (
        proposition.creation_school_year ==
        parseInt(selected_element_indexes.group)
      ) {
        cards[proposition.isApproved() ? "approved" : "to_approve"].push(proposition.toCard(user, true));
      }
    }
  }

  return cards;
}

const store = useStore();
const user = User.getLoggedUser() as User;
const $route = useRoute();
const sections_use: boolean = store.state.sections_use;

const promises: Promise<any>[] = [];
const ordinary_classes: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const learning_sessions_cards: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const students: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const propositions: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const school_years = await executeLink(
  "/v1/teachers/" + user.id + "/active_years",
  (response: any) => response.data.data.map((a: any) => a.year),
  () => []
);
const learning_sessions: LearningSession[] = []/* await executeLink(
      "/v1/learning_sessions?school_year=" + year,
      async (response) => {
        learning_sessions_cards.order.push({
          key: year,
          title: getCustomMessage("title", year, "title"),
        });
        learning_sessions_cards.cards[year] = [];
        for (const learning_session of response.data.data) {
          learning_sessions_cards.cards[year].push(
            await new LearningSession(learning_session).toCard(false)
          );
        }
      }
    )*/
const trigger = ref(0);
const all_sections: {
  [key: number]: {
    [key: string]: { id: string }[];
  };
} = {};
const selected_option: Ref<string> = ref($route.name == "ordinary_classes" ? "" : "project_classes");

let selected_element_indexes: Indexes = reactive({
  group: "-1",
  index: -1,
});
let ordinary_class: OrdinaryClassSummary;
let class_key: string;
let add_class: boolean;
let options: {
  id: string,
  title?: string,
}[] = $route.name == "ordinary_classes" ? [] : [{
  id: "project_classes",
  title: getCurrentElement("project_classes_propositions"),
}, {
  id: "courses",
  title: getCurrentElement("courses_propositions_per_year"),
}];

for (const year of school_years) {
  promises.push(
    $route.name == "ordinary_classes" ? executeLink(
      "/v1/teachers/" + user.id + "/my_ordinary_classes?school_year=" + year,
      (response) => {
        ordinary_classes.order.push({
          key: year,
          title: getCustomMessage("title", year, "title"),
        });
        for (const tmp_class of response.data.data) {
          ordinary_class = new OrdinaryClassSummary(tmp_class);
          class_key = ordinary_class.toString(false);
          if (ordinary_classes.cards[year] == undefined) {
            ordinary_classes.cards[year] = [];
            all_sections[year] = {};
          }
          if (all_sections[year][class_key] == undefined) {
            all_sections[year][class_key] = [];
            add_class = true;
          } else {
            add_class = false;
          }
          all_sections[year][class_key].push({ id: ordinary_class.section });
          if (add_class) {
            ordinary_classes.cards[year].push(ordinary_class.toCard(false));
          }
        }
      }
    ) : executeLink(
      "/v1/learning_sessions?school_year=" + year,
      async (response) => {
        learning_sessions_cards.order.push({
          key: year,
          title: getCustomMessage("title", year, "title"),
        });
        learning_sessions_cards.cards[year] = [];
        for (const learning_session of response.data.data) {
          learning_sessions.push(new LearningSession(learning_session))
          learning_sessions_cards.cards[year].push(
            await new LearningSession(learning_session).toCard(false)
          );
        }
      }
    )
  );
}
await Promise.all(promises);

watch(selected_option, async (new_option) => {
  console.log("Sì",new_option);
  if (new_option != undefined && new_option != "") {
    console.log("Ok");
    if ($route.name == "ordinary_classes") {
      students.cards = await getStudents()
    } else {
      console.log("Va bene",selected_element_indexes);
      if (selected_element_indexes.group != "-1" && selected_element_indexes.index != -1) {
        console.log("Quingi");
        propositions.cards = await getPropositions();
      }
    }
    trigger.value++;
  }
});
</script>

<style></style>