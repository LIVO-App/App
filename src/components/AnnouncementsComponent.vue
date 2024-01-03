<template>
  <div class="ion-padding-horizontal">
    <ion-alert
      :is-open="alert_open"
      :header="alert_information.title"
      :message="alert_information.message"
      :buttons="alert_information.buttons"
      @didDismiss="closeModal(store.state.event.event)"
    ></ion-alert>
    <ion-modal
      id="publish_announcement"
      :is-open="publishment_open"
      @didDismiss="closeModal('publish_announcement')"
      class="fit"
    >
      <suspense>
        <template #default>
          <announcements-publisher
            :sections="sections"
            :current_section_index="
              sections.findIndex((a) => a.id == selected_section)
            "
            @signal_event="setupModalAndOpen()"
            @close="closeModal('publish_announcement')"
          />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <ion-modal
      id="announcement"
      :is-open="announcement_open"
      @didDismiss="closeModal('announcement')"
      class="fit"
    >
      <suspense>
        <template #default>
          <announcement-viewer
            :title="announcement_title"
            :id="announcement_id"
            @close="closeModal('announcement')"
          />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>
    <div v-if="user.user == 'teacher'">
      <ionic-element
        v-for="button in buttons"
        :key="button.id"
        :element="button"
        @signal_event="setupModalAndOpen()"
      />
    </div>
    <custom-select
      v-if="sections_use && user.user == 'teacher'"
      v-model="selected_section"
      :list="sections"
      :label="getCurrentElement('section') + ':'"
      :aria_label="getCurrentElement('section')"
      :placeholder="getCurrentElement('section_choice')"
    />
    <suspense>
      <template #default>
        <list-card
          :key="trigger"
          :cards_list="messages"
          :emptiness_message="
            getCustomMessage(
              'emptiness_message',
              getCurrentElement('no_messages')
            )
          "
          @signal_event="setupModalAndOpen()"
        />
      </template>
      <template #fallback>
        <loading-component />
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
import {
  AnnouncementSummary,
  AnnouncementSummaryProps,
  CustomElement,
  OrderedCardsList,
  User,
} from "@/types";
import {
  executeLink,
  getCurrentElement,
  getCustomMessage,
  getIcon,
} from "@/utils";
import { IonModal, IonAlert } from "@ionic/vue";
import { ref, Ref, watch } from "vue";
import { useStore } from "vuex";

type availableModal =
  | "announcement"
  | "publish_announcement"
  | "empty_titles_or_messages"
  | "no_selected_sections"
  | "publish";

const setupModalAndOpen = async () => {
  const window: availableModal = store.state.event.event;
  const failed_sections: string[] = [];

  switch (window) {
    case "announcement":
      announcement_title = store.state.event.data.title;
      announcement_id = store.state.event.data.announcement_id;
      announcement_open.value = true;
      break;
    case "publish_announcement":
      publishment_open.value = true;
      break;
    case "empty_titles_or_messages":
      alert_information.message = getCurrentElement("empty_titles_or_messages");
      alert_open.value = true;
      break;
    case "no_selected_sections": //<!-- TODO (5): non ha funzionato
      alert_information.message = getCurrentElement("no_selected_sections");
      alert_open.value = true;
      break;
    case "publish":
      await executeLink(
        "/v1/announcements?teacher_id=" +
          user.id +
          "&course_id=" +
          course_id +
          "&session_id=" +
          session_id,
        () => "",
        (err) => {
          console.error(err);
        },
        "post",
        {
          sections: store.state.event.data.sections,
          italian_title: store.state.event.data.title,
          english_title: store.state.event.data.title,
          italian_message: store.state.event.data.message,
          english_message: store.state.event.data.message,
        }
      );
      if (failed_sections.length > 0) {
        alert_information.message =
          getCurrentElement("message_not_sent_sections") +
          ": " +
          failed_sections.join(" ");
        alert_open.value = true;
      }
      updateMessages();
      break;
  }
};
const closeModal = (window: availableModal) => {
  switch (window) {
    case "announcement":
      announcement_open.value = false;
      break;
    case "publish_announcement":
      publishment_open.value = false;
      break;
  }
};

const updateMessages = async () => {
  messages.cards[""] = await executeLink(
    "/v1/project_classes/" +
      course_id +
      "/" +
      session_id +
      "/announcements?" +
      (user.user == "teacher" ? "&section=" + selected_section.value : ""),
    (response) =>
      response.data.data.map((a: AnnouncementSummaryProps) =>
        new AnnouncementSummary(a).toCard()
      ),
    (err) => {
      console.log(err);
      return [];
    }
  );
  trigger.value++;
};

const store = useStore();
const user = User.getLoggedUser() as User;
const sections_use: boolean = store.state.sections_use;

const announcement_open = ref(false);
const publishment_open = ref(false);
const divided_path = window.location.pathname.split("/");
const course_id = divided_path[divided_path.length - 2];
const session_id = divided_path[divided_path.length - 1];
const trigger = ref(0);
const sections: { id: string }[] = [];
const tmp_sections: Set<string> = new Set();
const buttons: CustomElement[] = [
  {
    id: "new_announcement",
    type: "icon",
    linkType: "event",
    content: {
      event: "publish_announcement",
      icon: getIcon("add"),
    },
  },
];
const alert_open = ref(false);
const alert_information = {
  title: getCurrentElement("error"),
  message: "",
  buttons: [getCurrentElement("ok")],
};
const messages: OrderedCardsList = {
  order: [],
  cards: {
    "": [],
  },
};

let selected_section: Ref<string>;
let announcement_title: string;
let announcement_id: string;

if (user.user == "teacher") {
  await executeLink(
    "/v2/teachers/" +
      user.id +
      "/my_project_classes?session_id=" +
      session_id +
      "&course_id=" +
      course_id,
    (response) =>
      response.data.data.map((a: any) => tmp_sections.add(a.section))
  );
  await executeLink(
    "/v2/teachers/" +
      user.id +
      "/associated_project_classes?session_id=" +
      session_id +
      "&course_id=" +
      course_id,
    (response) =>
      response.data.data.map((a: any) => tmp_sections.add(a.section))
  );

  for (const section of tmp_sections) {
    sections.push({
      id: section,
    });
  }
  selected_section = ref(sections[0].id);
  watch(selected_section, async () => {
    await updateMessages();
  });
}

await updateMessages();
</script>

<style>
.fit {
  --width: fit-content;
  --height: fit-content;
}
</style>
