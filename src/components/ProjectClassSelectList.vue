<template>
  <ion-alert
    :is-open="alert_open"
    :header="alert_information.title"
    :message="alert_information.message"
    :buttons="alert_information.buttons"
    @didDismiss="closeModal('success')"
  />
  <ion-grid
    ><!-- v-if="learning_sessions.loaded">-->
    <ion-row>
      <ionic-element
        :element="
          getCustomMessage(
            'export_description',
            getCurrentElement('non_confirmed_export') + ':',
            'string',
            undefined,
            {
              label: {
                'ion-padding': true,
              },
            }
          )
        "
      />
      <ionic-element :element="buttons[0]" @execute_link="exportPropositions" />
    </ion-row>
    <ion-row>
      <ion-col size="12" size-md="6">
        <list-card
          :title="
            getCustomMessage('title', getCurrentElement('learning_sessions'))
          "
          :emptiness_message="
            getCustomMessage(
              'emptiness_message',
              getCurrentElement('no_sessions')
            )
          "
          :cards_list="learning_sessions_cards"
          @signal_event="changeSelection()"
        />
      </ion-col>
      <ion-col size="12" size-md="6">
        <custom-select
          v-model="selected_option"
          :list="options"
          :label="getCurrentElement('propositions') + ':'"
          :aria_label="getCurrentElement('propositions')"
          :placeholder="
            getCurrentElement(
              is_nothing_selected()
                ? 'no_types_propositions'
                : 'propositions_choice'
            )
          "
          :getCompleteName="(option: any) => option.title"
        />
        <list-card
          :key="trigger"
          :emptiness_message="
            getCustomMessage(
              'emptiness_message',
              getCurrentElement(
                is_nothing_selected()
                  ? selected_option == 'project_classes'
                    ? 'project_classes_propositions_selection_message'
                    : 'courses_propositions_selection_message'
                  : 'no_propositions'
              )
            )
          "
          :cards_list="propositions"
        />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  OrderedCardsList,
  User,
  LearningSession,
  CourseModel,
  CourseModelProps,
  CardsList,
  AlertInformation,
} from "@/types";
import { IonGrid, IonRow, IonCol, IonAlert } from "@ionic/vue";
import { reactive, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import {
  executeLink,
  getCurrentElement,
  getCustomMessage,
  getIcon,
} from "@/utils";
import { useRoute } from "vue-router";
import { list } from "ionicons/icons";

type Indexes = {
  group: string;
  index: number;
};

type AvailableModal = "success" | "error";

const is_nothing_selected = () =>
  selected_element_indexes.group == "-1" &&
  selected_element_indexes.index == -1;
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
  let group_changed: boolean;

  if (
    selected_element_indexes.group != "-1" &&
    selected_element_indexes.index != -1
  ) {
    selectedChange(learning_sessions_cards);
  }

  const tmp_selected = find_element(
    learning_sessions_cards,
    store.state.event.data.id
  );
  if (
    selected_element_indexes.group == tmp_selected.group &&
    selected_element_indexes.index == tmp_selected.index
  ) {
    selected_element_indexes = {
      group: "-1",
      index: -1,
    };
    propositions.order = [
      {
        key: "to_approve",
        title: getCustomMessage(
          "to_approve",
          getCurrentElement("to_approve"),
          "title"
        ),
      },
      {
        key: "approved",
        title: getCustomMessage(
          "approved",
          getCurrentElement("approved"),
          "title"
        ),
      },
    ];
    propositions.cards = {
      to_approve: [],
      approved: [],
    };
    selected_option.value = "project_classes";
  } else {
    group_changed = selected_element_indexes.group != tmp_selected.group;
    selected_element_indexes = tmp_selected;
    selectedChange(learning_sessions_cards);
    if (selected_option.value != "courses" || group_changed) {
      propositions.order = [
        {
          key: "to_approve",
          title: getCustomMessage(
            "to_approve",
            getCurrentElement("to_approve"),
            "title"
          ),
        },
        {
          key: "approved",
          title: getCustomMessage(
            "approved",
            getCurrentElement("approved"),
            "title"
          ),
        },
      ];
      propositions.cards = await getPropositions();
    }
  }
};
const selectedChange = (
  list: OrderedCardsList<GeneralCardElements>,
  group = selected_element_indexes.group,
  index = selected_element_indexes.index,
  value = !learning_sessions_cards.cards[group][index].selected
) => {
  list.cards[group][index].selected = value;
  trigger.value++;
};
const getPropositions = async () => {
  const session_propositions: CourseModel[] = await (selected_option.value ==
  "project_classes"
    ? executeLink(
        "/v1/propositions?recent_models=false&session_id=" +
          learning_sessions_cards.cards[selected_element_indexes.group][
            selected_element_indexes.index
          ].id,
        async (response: any) =>
          Promise.all(
            response.data.data.map(async (a: CourseModelProps) => {
              const tmp_proposition = new CourseModel(
                a,
                learning_sessions.find((b) => b.id == a.learning_session_id)
              );
              //await tmp_proposition.loadParms()
              return tmp_proposition;
            })
          ),
        () => []
      )
    : executeLink(
        "/v1/propositions?recent_models=false&session_id=" +
          learning_sessions_cards.cards[selected_element_indexes.group][
            selected_element_indexes.index
          ].id +
          "&school_year=" +
          selected_element_indexes.group,
        (response: any) =>
          response.data.data.map((a: CourseModelProps) => new CourseModel(a)),
        () => []
      ));

  const cards: CardsList<GeneralCardElements> = {
    approved: [],
    to_approve: [],
  };

  for (const proposition of session_propositions) {
    if (selected_option.value == "project_classes") {
      if (
        proposition.creation_school_year ==
          parseInt(selected_element_indexes.group) &&
        "" + proposition.learning_session?.id ==
          learning_sessions_cards.cards[selected_element_indexes.group][
            selected_element_indexes.index
          ].id
      ) {
        cards[proposition.isApproved() ? "approved" : "to_approve"].push(
          proposition.toCard(user, true)
        );
      }
    } else {
      if (
        proposition.creation_school_year ==
        parseInt(selected_element_indexes.group)
      ) {
        cards[proposition.isApproved() ? "approved" : "to_approve"].push(
          proposition.toCard(user, true)
        );
      }
    }
  }

  return cards;
};
const setupError = (message?: string) => {
  alert_information.title = getCurrentElement("error");
  alert_information.message = message ?? getCurrentElement("general_error");
  alert_information.buttons = [getCurrentElement("ok")];
};
const setupModalAndOpen = (window?: AvailableModal, message?: string) => {
  const actual_window: AvailableModal = window ?? store.state.event.event;
  const actual_message: string = message ?? store.state.event.data?.message;

  switch (actual_window) {
    case "success":
      alert_information.title = "";
      alert_information.message =
        message ?? getCurrentElement(getCurrentElement("successful_operation"));
      alert_information.buttons = [getCurrentElement("ok")];
      alert_open.value = true;
      break;
    case "error":
      setupError(actual_message);
      alert_open.value = true;
      break;
  }
};
const closeModal = (window: AvailableModal) => {
  switch (window) {
    case "success":
    case "error":
      alert_open.value = false;
      break;
  }
};
const exportPropositions = () => {
  executeLink(
    undefined,
    (response) =>
      setTimeout(() => {
        console.log(response);
        setupModalAndOpen(
          "success",
          getCurrentElement("propositions_exported")
        );
      }, 300),
    () => setTimeout(() => setupModalAndOpen("error"), 300)
  );
};

const store = useStore();
const user = User.getLoggedUser() as User;
const $route = useRoute();

const promises: Promise<any>[] = [];
const learning_sessions_cards: OrderedCardsList<GeneralCardElements> = reactive(
  {
    order: [],
    cards: {},
  }
);
const propositions: OrderedCardsList<GeneralCardElements> = reactive({
  order: [],
  cards: {},
});
const school_years = await executeLink(
  "/v1/teachers/" + user.id + "/active_years",
  (response: any) => response.data.data.map((a: any) => a.year),
  () => []
);
const learning_sessions: LearningSession[] = []; /* await executeLink(
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
const selected_option: Ref<string> = ref(
  $route.name == "ordinary_classes" ? "" : "project_classes"
);
const alert_open = ref(false);
const alert_information: AlertInformation = {
  title: "",
  message: "",
  buttons: [],
};
const buttons = [
  {
    id: "export",
    type: "string_icon",
    linkType: "request",
    content: {
      text: getCurrentElement("export"),
      icon: getIcon("download"),
      url: "/v1/propositions/export",
      method: "get",
      whole_link: true,
    },
    colors: {
      text: {
        name: "white",
        type: "var",
      },
      background: {
        name: "primary",
        type: "var",
      },
    },
    classes: {
      button: {
        radius: true,
      },
    },
  },
];

let selected_element_indexes: Indexes = reactive({
  group: "-1",
  index: -1,
});
const options: {
  id: string;
  title?: string;
}[] =
  $route.name == "ordinary_classes"
    ? []
    : [
        {
          id: "project_classes",
          title: getCurrentElement("project_classes_propositions"),
        },
        {
          id: "courses",
          title: getCurrentElement("courses_propositions_per_year"),
        },
      ];

for (const year of school_years) {
  promises.push(
    executeLink(
      "/v1/learning_sessions?school_year=" + year,
      async (response) => {
        learning_sessions_cards.order.push({
          key: year,
          title: getCustomMessage("title", year, "title"),
        });
        learning_sessions_cards.cards[year] = [];
        for (const learning_session of response.data.data) {
          learning_sessions.push(new LearningSession(learning_session));
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
  if (new_option != undefined && new_option != "") {
    if (
      selected_element_indexes.group != "-1" &&
      selected_element_indexes.index != -1
    ) {
      propositions.cards = await getPropositions();
    }
  }
  trigger.value++;
});
</script>

<style></style>
