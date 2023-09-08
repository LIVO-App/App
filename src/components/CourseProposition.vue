<template>
  <div class="ion-padding-horizontal">
    <ion-alert
      :is-open="alert_open"
      :header="alert_information.title"
      :message="alert_information.message"
      :buttons="alert_information.buttons"
      @didDismiss="closeModal(true)"
    ></ion-alert>
    <!--<ion-modal
      id="addition"
      :is-open="addition"
      @didDismiss="closeModal(false)"
      class="fit"
    >
      <suspense>
        <template #default>
          <course-additions
            :title="correspondences[pages[current_page_index]].card"
          />
        </template>
        <template #fallback>
          <loading-component />
        </template>
      </suspense>
    </ion-modal>-->
    <!-- Da sistemare: spostare dopo rework menu -->
    <ionic-element
      :element="buttons[3]"
      @execute_link="$router.push(store.state.request.url)"
    />
    <template v-if="user.user == 'admin'">
      <ionic-element :element="buttons[4]" @signal_event="approve()" />
      <ionic-element :element="buttons[5]" @signal_event="approve(false)" />
      <!-- Da sistemare: sistemare /approval quando finito da Pietro -->
      <ionic-element
        :element="action == 'view' ? buttons[6] : buttons[7]"
        @signal_event="changeModality(action == 'view' ? 'edit' : 'view')"
      />
    </template>
    <custom-select
      v-model="selected_model"
      :list="models"
      :label="getCurrentElement('reference_model') + ':'"
      :aria_label="getCurrentElement('reference_model')"
      :placeholder="getCurrentElement('possible_models')"
      :getCompleteName="modelToString"
      :disabled="action != 'propose'"
    />
    <ion-card :key="trigger">
      <ion-card-header color="primary">
        <ion-card-title class="ion-text-center">{{
          getCurrentElement(
            ModelProposition.getTitles()[pages[current_page_index]]
          )
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content style="overflow-y: auto">
        <ion-grid>
          <template
            v-if="
              pages[current_page_index] == 'title' ||
              ModelProposition.getProps('editor').findIndex(
                (a) => a == pages[current_page_index]
              ) != -1
            "
          >
            <ion-row v-for="language in languages" :key="language">
              <ion-col>
                <ion-input
                  v-if="pages[current_page_index] == 'title'"
                  type="text"
                  v-model="
                    castToTitles(course_proposition[pages[current_page_index]])[
                      `${language}_title`
                    ]
                  "
                  :label="getCurrentElement(language)"
                  :aria-label="getCurrentElement(language)"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
                <!-- Da sistemare: trovare un modo per rendere la chiamata generale -->
                <!--<ion-textarea
                  v-else
                  v-model="
                    castToLanguageObj(course_proposition[pages[current_page_index]])[`${language}_descr exp_l cri act`]
                  "
                  :label="getCurrentElement(language)"
                  :aria-label="getCurrentElement(language)"
                  fill="outline"
                  class="ion-margin-vertical"
                />-->
                <ion-textarea
                  v-else-if="pages[current_page_index] == 'description'"
                  v-model="
                    castToDescription(
                      course_proposition[pages[current_page_index]]
                    )[`${language}_descr`]
                  "
                  :label="getCurrentElement(language)"
                  :aria-label="getCurrentElement(language)"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
                <ion-textarea
                  v-else-if="
                    pages[current_page_index] == 'expected_learning_results'
                  "
                  v-model="
                    castToExpectedLearningResults(
                      course_proposition[pages[current_page_index]]
                    )[`${language}_exp_l`]
                  "
                  :label="getCurrentElement(language)"
                  :aria-label="getCurrentElement(language)"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
                <ion-textarea
                  v-else-if="pages[current_page_index] == 'criterions'"
                  v-model="
                    castToCriterions(
                      course_proposition[pages[current_page_index]]
                    )[`${language}_cri`]
                  "
                  :label="getCurrentElement(language)"
                  :aria-label="getCurrentElement(language)"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
                <ion-textarea
                  v-else-if="pages[current_page_index] == 'activities'"
                  v-model="
                    castToActivities(
                      course_proposition[pages[current_page_index]]
                    )[`${language}_act`]
                  "
                  :label="getCurrentElement(language)"
                  :aria-label="getCurrentElement(language)"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
              </ion-col>
            </ion-row>
          </template>
          <template v-else-if="pages[current_page_index] == 'characteristics1'">
            <ion-row>
              <ion-col>
                <ion-input
                  type="number"
                  v-model="
                    castToCharacteristics1(
                      course_proposition[pages[current_page_index]]
                    ).credits
                  "
                  :label="getCurrentElement('credits')"
                  :aria-label="getCurrentElement('credits')"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
              </ion-col>
              <ion-col>
                <ion-input
                  type="number"
                  v-model="
                    castToCharacteristics1(
                      course_proposition[pages[current_page_index]]
                    ).up_hours
                  "
                  :label="getCurrentElement('up_hours')"
                  :aria-label="getCurrentElement('up_hours')"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <ionic-element
                  :element="
                    getCustomMessage(
                      'title',
                      getCurrentElement('students_per_section') + ':'
                    )
                  "
                />
                <ion-input
                  type="number"
                  v-model="
                    castToCharacteristics1(
                      course_proposition[pages[current_page_index]]
                    ).min_students
                  "
                  :label="getCurrentElement('min_students')"
                  :aria-label="getCurrentElement('min_students')"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
                <ion-input
                  type="number"
                  v-model="
                    castToCharacteristics1(
                      course_proposition[pages[current_page_index]]
                    ).max_students
                  "
                  :label="getCurrentElement('max_students')"
                  :aria-label="getCurrentElement('max_students')"
                  fill="outline"
                  class="ion-margin-vertical"
                  :readonly="action == 'view'"
                />
              </ion-col>
              <ion-col>
                <custom-select
                  v-model="
                    castToCharacteristics1(
                      course_proposition[pages[current_page_index]]
                    ).area_id
                  "
                  :list="learning_areas"
                  :label="getCurrentElement('learning_area') + ':'"
                  :aria_label="getCurrentElement('learning_area')"
                  :placeholder="getCurrentElement('area_choice')"
                  :getCompleteName="learningAreaToString"
                  :disabled="action == 'view'"
                />
              </ion-col>
            </ion-row>
          </template>
          <template v-else-if="pages[current_page_index] == 'characteristics2'">
            <ion-row>
              <!--<custom-select
                  v-model="
                    castToCharacteristics2(
                      course_proposition[pages[current_page_index]]
                    ).growth_id
                  "
                  :list="growth_areas"
                  :label="getCurrentElement('growth_area') + ':'"
                  :aria_label="getCurrentElement('growth_area')"
                  :placeholder="getCurrentElement('growth_choice')"
                  :getCompleteName="growthAreaToString"
                  :disabled="action == 'view'"
                />-->
              <ion-col
                v-for="key in Object.keys(course_proposition.characteristics2)"
                :key="key"
              >
                <ionic-element
                  :element="
                    getCustomMessage(
                      'title',
                      getCurrentElement(
                        key == 'teaching_list' ? 'teachings' : 'growth_areas'
                      )
                    )
                  "
                />
                <template v-if="action != 'view'">
                  <custom-select
                    v-if="key == 'teaching_list'"
                    :key="trigger + '_teachings_select'"
                    v-model="selected_teaching"
                    :list="teachings.available"
                    :label="getCurrentElement('teaching') + ':'"
                    :aria_label="getCurrentElement('teaching')"
                    :placeholder="getCurrentElement('teaching_choices')"
                    :getCompleteName="getTitle"
                  />
                  <custom-select
                    v-else
                    :key="trigger + '_growth_areas_select'"
                    v-model="selected_growth_area"
                    :list="growth_areas.available"
                    :label="getCurrentElement('growth_area') + ':'"
                    :aria_label="getCurrentElement('growth_area')"
                    :placeholder="getCurrentElement('growth_area_choices')"
                    :getCompleteName="getTitle"
                  />
                  <ion-button
                    @click="addElement(key == 'teaching_list' ? 'teachings' : 'growth_areas')"
                    expand="block"
                    color="primary"
                    fill="solid"
                  >
                    {{ getCurrentElement("add") }}
                  </ion-button>
                </template>
                <list-card
                  :key="trigger + '_list'"
                  :cards_list="key == 'teaching_list' ? teachings_cards : growth_areas_cards"
                  :emptiness_message="
                    getCustomMessage(
                      'emptiness_message',
                      getCurrentElement(key == 'teaching_list' ? 'no_teachings' : 'no_growth_areas')
                    )
                  "
                  @signal_event="removeElement(key == 'teaching_list' ? 'teachings' : 'growth_areas')"
                />
              </ion-col>
            </ion-row>
          </template>
          <template v-else-if="pages[current_page_index] == 'access_object'">
            <ion-grid>
              <template v-if="action != 'view'">
                <ion-row>
                  <ion-col>
                    <custom-select
                      v-model="selected_learning_context"
                      :list="learning_contexts.available"
                      :label="getCurrentElement('learning_context') + ':'"
                      :aria_label="getCurrentElement('learning_context')"
                      :placeholder="
                        getCurrentElement('learning_context_choice')
                      "
                      :getCompleteName="learningContextToString"
                    />
                  </ion-col>
                  <ion-col>
                    <custom-select
                      :key="trigger + '_study_address'"
                      v-model="selected_study_address"
                      :list="
                        study_addresses.available[selected_learning_context] ??
                        []
                      "
                      :label="getCurrentElement('study_address') + ':'"
                      :aria_label="getCurrentElement('study_address')"
                      :placeholder="
                        selected_learning_context != ''
                          ? getCurrentElement('study_address_choice')
                          : getCurrentElement('learning_context_needed')
                      "
                      :getCompleteName="studyAddressToString"
                    />
                    <!--<ion-checkbox
                      v-model="presidium"
                      :aria-label="getCurrentElement('presidium')"
                      class="ion-padding-start"
                      label-placement="start"
                      >{{ getCurrentElement("presidium") }}</ion-checkbox
                    >-->
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col>
                    <custom-select
                      :key="trigger + '_study_year'"
                      v-model="selected_study_year"
                      :list="
                        study_years.available[selected_learning_context] !=
                        undefined
                          ? study_years.available[selected_learning_context][
                              selected_study_address
                            ] ?? []
                          : []
                      "
                      :label="getCurrentElement('study_year') + ':'"
                      :aria_label="getCurrentElement('study_year')"
                      :placeholder="
                        getCurrentElement(
                          selected_study_address != undefined
                            ? 'study_year_choice'
                            : 'study_address_needed'
                        )
                      "
                    />
                    <ion-checkbox
                      v-model="main_study_year"
                      :aria-label="getCurrentElement('main_study_year')"
                      class="ion-padding-start"
                      label-placement="start"
                      >{{ getCurrentElement("main_study_year") }}</ion-checkbox
                    >
                  </ion-col>
                </ion-row>
              </template>
              <ion-row>
                <ion-col>
                  <ion-button
                    v-if="action != 'view'"
                    @click="addElement('access')"
                    expand="block"
                    color="primary"
                    fill="solid"
                  >
                    {{ getCurrentElement("add") }}
                  </ion-button>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col>
                  <list-card
                    :key="trigger + '_list'"
                    :cards_list="access_propositions_cards"
                    :emptiness_message="
                      getCustomMessage(
                        'emptiness_message',
                        getCurrentElement('no_access_proposition')
                      )
                    "
                    @signal_event="removeElement('access')"
                  />
                </ion-col>
              </ion-row>
            </ion-grid>
          </template>
          <template
            v-else-if="pages[current_page_index] == 'specific_information'"
          >
            <ion-grid>
              <ion-row>
                <ion-col>
                  <custom-select
                    v-model="selected_session"
                    :list="learning_sessions"
                    :label="getCurrentElement('learning_sessions') + ':'"
                    :aria_label="getCurrentElement('learning_sessions')"
                    :placeholder="getCurrentElement('learning_sessions_choice')"
                    :getCompleteName="learningSessionToString"
                    :disabled="action == 'view'"
                  />
                  <custom-select
                    :key="trigger"
                    v-model="
                      castToSpecificInformation(
                        course_proposition[pages[current_page_index]]
                      ).class_group
                    "
                    :list="groups"
                    :label="getCurrentElement('group') + ':'"
                    :aria_label="getCurrentElement('group')"
                    :placeholder="
                      getCurrentElement(
                        selected_session == -1
                          ? 'learning_session_needed'
                          : 'group_choice'
                      )
                    "
                    :disabled="action == 'view'"
                  />
                  <ion-input
                    type="number"
                    v-model="num_section"
                    :label="getCurrentElement('num_section')"
                    :aria-label="getCurrentElement('num_section')"
                    fill="outline"
                    class="ion-margin-vertical ion-margin-start"
                    :readonly="action == 'view'"
                  />
                </ion-col>
                <ion-col>
                  <template v-if="action != 'view'">
                    <div>
                      <custom-select
                        :key="trigger + '_teacher'"
                        v-model="selected_teacher"
                        :list="teachers.available"
                        :label="getCurrentElement('teacher') + ':'"
                        :aria_label="getCurrentElement('teacher')"
                        :placeholder="getCurrentElement('teacher_choice')"
                        :getCompleteName="teacherToString"
                      />
                      <ionic-element
                        v-if="selected_teacher != 0"
                        :element="buttons[2]"
                        @signal_event="setupModalAndOpen('teacher_info')"
                      />
                    </div>
                    <!--
                      <ion-checkbox
                        v-model="main_teacher"
                        :aria-label="getCurrentElement('main_teacher')"
                        class="ion-padding-start"
                        label-placement="start"
                        >{{ getCurrentElement("main_teacher") }}</ion-checkbox
                      >
                    -->
                    <ion-text
                      >{{ getCurrentElement("sections") }}:
                      {{
                        parseInt(num_section) <= 0
                          ? getCurrentElement("num_section_needed")
                          : ""
                      }}</ion-text
                    >
                    <ion-list v-if="parseInt(num_section) > 0">
                      <ion-item
                        v-for="(value, index) in sections"
                        :key="numberToSection(index)"
                      >
                        <ion-checkbox
                          v-model="sections[index]"
                          :aria-label="numberToSection(index)"
                          class="ion-padding-start"
                          label-placement="start"
                          >{{ numberToSection(index) }}</ion-checkbox
                        >
                      </ion-item>
                    </ion-list>
                  </template>
                  <ion-button
                    v-if="action != 'view'"
                    @click="addElement('teachers')"
                    expand="block"
                    color="primary"
                    fill="solid"
                  >
                    {{ getCurrentElement("add") }}
                  </ion-button>
                  <list-card
                    :key="trigger + '_list'"
                    :cards_list="teachers_cards"
                    :emptiness_message="
                      getCustomMessage(
                        'emptiness_message',
                        getCurrentElement('no_teacher_proposition')
                      )
                    "
                    @signal_event="removeElement('teachers')"
                  />
                </ion-col>
              </ion-row>
            </ion-grid>
          </template>
          <ion-row
            class="ion-text-center"
            style="border-top: 1px solid var(--ion-color-dark)"
          >
            <ion-col>
              <ionic-element
                :element="buttons[0]"
                @signal_event="go(false)"
                :disabled="current_page_index == 0"
              />
            </ion-col>
            <ion-col>
              <ionic-element
                :element="buttons[1]"
                @signal_event="go(true)"
                :disabled="current_page_index == pages.length - 1"
              />
            </ion-col>
          </ion-row>
          <!--<template v-if="parameters_remaining">-->
          <!-- Da sistemare: sistemare remainings -->
          <ion-row>
            <ion-col>
              <ion-button
                v-if="action != 'view'"
                @click="propose"
                expand="block"
                color="primary"
                fill="solid"
              >
                {{ getCurrentElement("propose") }}
              </ion-button>
            </ion-col>
          </ion-row>
          <!--</template>-->
        </ion-grid>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import {
  CourseModelProps,
  ModelProposition,
  User,
  LearningArea,
  CourseModel,
  GrowthArea,
  CustomElement,
  Pages,
  Teaching,
  StudyAddress,
  LearningSession,
  PropositionTitles,
  PropositionCharacteristics1,
  PropositionCharacteristics2,
  OrderedCardsList,
  GeneralCardElements,
  TeachingProps,
  AccessProposition,
  LearningContext,
  Teacher,
  TeacherProps,
  TeacherProposition,
  PropositionDescription,
  PropositionExpectedLearningResults,
  PropositionActivities,
  PropositionCriterions,
  Course,
  AccessObject,
  PropositionTeacher,
  PropositionSpecificInformation,
  GrowthAreaProps,
} from "@/types";
import {
  executeLink,
  getAviableLanguages,
  getCurrentElement,
  getCurrentLanguage,
  getCustomMessage,
  getIcon,
  numberToSection,
} from "@/utils";
import {
  IonAlert,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
  IonText,
  IonTextarea,
  IonCheckbox,
  IonList,
  IonItem,
} from "@ionic/vue";
import { reactive, ref, Ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

type AvailableModal = Pages | "teacher_info";
type ListTypes = "access" | "teachers" | SimpleListTypes;
type Action = "view" | "edit" | "propose";
type SimpleListTypes = "growth_areas" | "teachings";
type SimpleList<T> = {
  available: T[];
  selected: T[];
};

const modelToString = (model: CourseModel) => model.toString();
const learningAreaToString = (learning_area: LearningArea) =>
  learning_area[`${language}_title`];
const growthAreaToString = (growth_area: GrowthArea) =>
  growth_area[`${language}_title`];
const go = (direction: boolean) => {
  if (direction && current_page_index.value < pages.length - 1) {
    current_page_index.value += 1;
  } else if (!direction && current_page_index.value > 0) {
    current_page_index.value -= 1;
  }
};
const propose = () => {
  executeLink(
    "/v1/propositions",
    undefined,
    () => setupModalAndOpen("title"),
    "post",
    course_proposition.toProposition()
  ); // Da sistemare: sistemare remainings e dopo setuPModalAndOpen
};
const closeModal = (alert: boolean) => {
  if (alert) {
    alert_open.value = false;
  } else {
    addition.value = false;
  }
};
const setupModalAndOpen = async (window: AvailableModal) => {
  // Da sistemare: fare le info degli insegnanti e i vari errori
  switch (window) {
    default:
      break;
  }
};
const getTitle = (obj: any) =>
  `${language}_title` in obj ? obj[`${language}_title`] : undefined;
const learningContextToString = (learning_context: LearningContext) =>
  learning_context[`${language}_title`];
const studyAddressToString = (study_address: StudyAddress) =>
  study_address[`${language}_title`];
const learningSessionToString = (session: LearningSession) =>
  session.number + " - " + session.school_year;
const teacherToString = (teacher: Teacher) =>
  teacher.name + " " + teacher.surname;
const castToTitles = (titles: any) => titles as PropositionTitles;
const castToCharacteristics1 = (characteristics: any) =>
  characteristics as PropositionCharacteristics1;
const castToCharacteristics2 = (characteristics: any) =>
  characteristics as PropositionCharacteristics2;
const castToDescription = (description: any) =>
  description as PropositionDescription;
const castToExpectedLearningResults = (expected_learning_results: any) =>
  expected_learning_results as PropositionExpectedLearningResults;
const castToCriterions = (criterions: any) =>
  criterions as PropositionCriterions;
const castToActivities = (activities: any) =>
  activities as PropositionActivities;
const castToSpecificInformation = (specific_information: any) =>
  specific_information as PropositionSpecificInformation;
const addToSimpleList = (type: SimpleListTypes, id?: string | number) => {
  let actual_id: string | number;
  let reference: SimpleList<Teaching | GrowthArea>;
  let cards_reference: OrderedCardsList<GeneralCardElements>;
  let tmp_index: number;
  let to_add: Teaching | GrowthArea;

  if (type == "teachings") {
    actual_id = id ?? selected_teaching.value;
    reference = teachings;
    cards_reference = teachings_cards;
  } else {
    actual_id = id ?? selected_growth_area.value;
    reference = growth_areas;
    cards_reference = growth_areas_cards;
  }
  
  if (
    actual_id != (type == "teachings" ? "" : 0) &&
    (tmp_index = reference.available.findIndex((a) => a.id == actual_id)) != -1
  ) {
    to_add = reference.available[tmp_index];
    cards_reference.cards[""].push(to_add.toCard(action.value == "view"));

    if (type == "teachings") {
      course_proposition.characteristics2.teaching_list.push(
        to_add.id as string
      );
      teachings.selected.push(to_add as Teaching);
      teachings.available.splice(tmp_index, 1);
      if (id == undefined) {
        selected_teaching.value = "";
      }
    } else {
      course_proposition.characteristics2.growth_list.push(to_add.id as number);
      growth_areas.selected.push(to_add as GrowthArea);
      growth_areas.available.splice(tmp_index, 1);
      if (id == undefined) {
        selected_growth_area.value = 0;
      }
    }

    trigger.value++;
  }
};
const addAccess = (
  learning_context_id?: string,
  access_object?: AccessObject
) => {
  const actual_learning_context_id =
    learning_context_id ?? selected_learning_context.value;
  let actual_study_address_id: string;
  let actual_study_year: number;
  let actual_presidium: boolean;
  let actual_main_study_year: boolean;

  let tmp_learning_context_index: number;
  let tmp_study_address_index: number;
  let tmp_study_year_index: number;
  let tmp_access_proposition: AccessProposition;
  let learning_context: LearningContext;
  let study_address: StudyAddress;
  let study_year: { id: number };

  if (access_object != undefined) {
    actual_study_address_id = access_object.study_address;
    actual_study_year = access_object.study_year;
    actual_presidium = access_object.presidium;
    actual_main_study_year = access_object.main_study_year;
  } else {
    actual_study_address_id = selected_study_address.value;
    actual_study_year = selected_study_year.value;
    actual_presidium = presidium.value;
    actual_main_study_year = main_study_year.value;
  }

  if (
    actual_learning_context_id != "" &&
    (tmp_learning_context_index = learning_contexts.available.findIndex(
      (a) => a.id == actual_learning_context_id
    )) != -1 &&
    actual_study_address_id != "" &&
    (tmp_study_address_index = study_addresses.available[
      actual_learning_context_id
    ].findIndex((a) => a.id == actual_study_address_id)) != -1 &&
    actual_study_year != 0 &&
    (tmp_study_year_index = study_years.available[actual_learning_context_id][
      actual_study_address_id
    ].findIndex((a) => a.id == actual_study_year)) != -1
  ) {
    learning_context = learning_contexts.available[tmp_learning_context_index];
    study_address =
      study_addresses.available[learning_context.id][tmp_study_address_index];
    study_year =
      study_years.available[learning_context.id][study_address.id][
        tmp_study_year_index
      ];

    tmp_access_proposition = new AccessProposition(
      study_year.id,
      study_address,
      actual_presidium,
      actual_main_study_year
    );

    if (course_proposition.access_object[learning_context.id] == undefined) {
      course_proposition.access_object[learning_context.id] = [];
    }
    course_proposition.access_object[learning_context.id].push(
      tmp_access_proposition.toAccessObj()
    );

    if (access_propositions_cards.cards[learning_context.id] == undefined) {
      access_propositions_cards.order.push({
        key: learning_context.id,
        title: getCustomMessage(
          "title",
          learning_context[`${language}_title`],
          "title"
        ),
      });
      access_propositions_cards.order.sort((a, b) =>
        a.key == b.key ? 0 : a.key > b.key ? 1 : -1
      );
      access_propositions_cards.cards[learning_context.id] = [];
    }
    access_propositions_cards.cards[learning_context.id].push(
      tmp_access_proposition.toCard(
        actual_learning_context_id,
        action.value == "view"
      )
    );

    if (study_years.selected[learning_context.id] == undefined) {
      study_years.selected[learning_context.id] = {};
    }
    if (
      study_years.selected[learning_context.id][study_address.id] == undefined
    ) {
      study_years.selected[learning_context.id][study_address.id] = [];
    }
    study_years.selected[learning_context.id][study_address.id].push(
      study_year
    );
    study_years.available[learning_context.id][study_address.id].splice(
      tmp_study_year_index,
      1
    );
    if (access_object == undefined) {
      selected_study_year.value = 0;
    }

    if (
      study_years.available[learning_context.id][study_address.id].length == 0
    ) {
      if (study_addresses.selected[learning_context.id] == undefined) {
        study_addresses.selected[learning_context.id] = [];
      }
      study_addresses.selected[learning_context.id].push(study_address);
      study_addresses.available[learning_context.id].splice(
        tmp_study_address_index,
        1
      );
      if (access_object == undefined) {
        selected_study_address.value = "";
      }
    }
    if (study_addresses.available[learning_context.id].length == 0) {
      learning_contexts.selected.push(learning_context);
      learning_contexts.available.splice(tmp_learning_context_index, 1);
      if (learning_context == undefined) {
        selected_learning_context.value = "";
      }
    }

    if (access_object == undefined) {
      presidium.value = false;
      main_study_year.value = false;
    }
  }
  trigger.value++;
};
const addTeacher = (proposition_teacher?: PropositionTeacher) => {
  let actual_teacher_id: number;
  let actual_main_teacher: boolean;
  let tmp_teacher_index: number;
  let teacher: Teacher;
  let teacher_proposition: TeacherProposition;

  if (proposition_teacher != undefined) {
    actual_teacher_id = proposition_teacher.teacher_id;
    actual_main_teacher = proposition_teacher.main;
  } else {
    actual_teacher_id = selected_teacher.value;
    actual_main_teacher = main_teacher.value;
  }

  if (
    actual_teacher_id != 0 &&
    (tmp_teacher_index = teachers.available.findIndex(
      (a) => a.id == actual_teacher_id
    )) != -1 &&
    (proposition_teacher != undefined
      ? proposition_teacher.sections.length > 0
      : sections.find((a) => a))
  ) {
    teacher = teachers.available[tmp_teacher_index];
    teacher_proposition = new TeacherProposition(
      teacher,
      actual_main_teacher,
      sections
    );

    course_proposition.specific_information.teacher_list.push(
      teacher_proposition.toTeacherObj()
    );

    teachers_cards.cards[""].push(
      teacher_proposition.toCard(action.value == "view")
    );

    teachers.selected.push(teacher);
    teachers.available.splice(tmp_teacher_index, 1);
    if (proposition_teacher == undefined) {
      selected_teacher.value = 0;
      main_teacher.value = false;
      for (const i in sections) {
        sections[i] = false;
      }
    }
  }
  trigger.value++;
};
const addElement = (type: ListTypes) => {
  // Da sistemare: trovare pezzi in comune negli switch per semplificare la funzione e la successiva
  switch (type) {
    case "teachings":
      addToSimpleList("teachings");
      break;
    case "growth_areas":
      addToSimpleList("growth_areas");
      break;
    case "access":
      addAccess();
      break;
    case "teachers":
      addTeacher();
      break;
  }
};
const removeSimpleElement = (type: SimpleListTypes) => {
  let reference: SimpleList<Teaching | GrowthArea>;
  let cards_reference: OrderedCardsList<GeneralCardElements>;

  if (type == "teachings") {
    reference = teachings;
    cards_reference = teachings_cards;
  } else {
    reference = growth_areas;
    cards_reference = growth_areas_cards;
  }

  const id: string | number = store.state.event.data.id;
  const tmp_index: number = reference.selected.findIndex((a) => a.id == id);

  if (type == "teachings") {
    course_proposition.characteristics2.teaching_list.splice(
      course_proposition.characteristics2.teaching_list.indexOf(id as string),
      1
    );
  } else {
    course_proposition.characteristics2.growth_list.splice(
      course_proposition.characteristics2.growth_list.indexOf(id as number),
      1
    );
  }

  cards_reference.cards[""].splice(
    cards_reference.cards[""].findIndex((a) => a.id == id),
    1
  );

  reference.available.push(reference.selected[tmp_index]);
  reference.available.sort((a, b) => (a.id == b.id ? 0 : a.id > b.id ? 1 : -1));
  reference.selected.splice(tmp_index, 1);
};
const removeElement = (type: ListTypes) => {
  let learning_context_id: string;
  let study_address_id: string;
  let study_year: number;
  let access_id: string;
  let tmp_learning_context_index: number;
  let tmp_study_address_index: number;
  let tmp_study_year_index: number;

  let teacher_id: number;
  let tmp_teacher_index: number;

  switch (type) {
    case "teachings":
      removeSimpleElement("teachings");
      break;
    case "growth_areas":
      removeSimpleElement("growth_areas");
      break;
    case "access":
      learning_context_id = store.state.event.data.learning_context_id;
      study_address_id = store.state.event.data.study_address_id;
      study_year = store.state.event.data.study_year;
      access_id =
        learning_context_id + "_" + study_address_id + "_" + study_year;

      tmp_learning_context_index = learning_contexts.selected.findIndex(
        (a) => a.id == learning_context_id
      );
      tmp_study_address_index =
        study_addresses.selected[learning_context_id] != undefined
          ? study_addresses.selected[learning_context_id].findIndex(
              (a) => a.id == study_address_id
            )
          : -1;
      tmp_study_year_index = study_years.selected[learning_context_id][
        study_address_id
      ].findIndex((a) => a.id == study_year);

      course_proposition.access_object[learning_context_id].splice(
        course_proposition.access_object[learning_context_id].findIndex(
          (a) =>
            a.study_address == study_address_id && a.study_year == study_year
        ),
        1
      );

      access_propositions_cards.cards[learning_context_id].splice(
        access_propositions_cards.cards[learning_context_id].findIndex(
          (a) => a.id == access_id
        ),
        1
      );
      if (access_propositions_cards.cards[learning_context_id].length == 0) {
        access_propositions_cards.order.splice(
          access_propositions_cards.order.findIndex(
            (a) => a.key == learning_context_id
          ),
          1
        );
        delete access_propositions_cards.cards[learning_context_id];
      }

      study_years.available[learning_context_id][study_address_id].push(
        study_years.selected[learning_context_id][study_address_id][
          tmp_study_year_index
        ]
      );
      study_years.available[learning_context_id][study_address_id].sort(
        (a, b) => (a.id == b.id ? 0 : a.id > b.id ? 1 : -1)
      );
      study_years.selected[learning_context_id][study_address_id].splice(
        tmp_study_year_index,
        1
      );
      if (
        tmp_study_address_index != -1 &&
        study_years.available[learning_context_id][study_address_id].length > 0
      ) {
        study_addresses.selected[learning_context_id].push(
          study_addresses.available[learning_context_id][0]
        );
        study_addresses.available[learning_context_id].sort((a, b) =>
          a.id == b.id ? 0 : a.id > b.id ? 1 : -1
        );
        study_addresses.available[learning_context_id].splice(0, 1);
      }
      if (
        tmp_learning_context_index != -1 &&
        study_addresses.available[learning_context_id].length > 0
      ) {
        learning_contexts.selected.push(learning_contexts.available[0]);
        learning_contexts.available.sort((a, b) =>
          a.id == b.id ? 0 : a.id > b.id ? 1 : -1
        );
        learning_contexts.available.splice(0, 1);
      }
      break;
    case "teachers":
      teacher_id = store.state.event.data.id;
      tmp_teacher_index = teachers.selected.findIndex(
        (a) => a.id == teacher_id
      );

      course_proposition.specific_information.teacher_list.splice(
        course_proposition.specific_information.teacher_list.findIndex(
          (a) => a.teacher_id == teacher_id
        ),
        1
      );
      teachers_cards.cards[""].splice(
        teachers_cards.cards[""].findIndex((a) => a.id == "" + teacher_id),
        1
      );

      teachers.available.push(teachers.selected[tmp_teacher_index]);
      teachers.available.sort((a, b) =>
        a.id == b.id ? 0 : a.id > b.id ? 1 : -1
      );
      teachers.selected.splice(tmp_teacher_index, 1);
      break;
  }
  trigger.value++;
};
const edit_course_proposition = async (course_id?: number) => {
  let course: Course;
  let learning_area: LearningArea;
  if (course_id != undefined && !Number.isNaN(course_id)) {
    course = await executeLink(
      "/v1/courses/" + course_id + "?admin_info=true",
      (response) => new Course(response.data.data)
    );
    learning_area = await executeLink("/v1/learning_areas", (response) => {
      const tmp = response.data.data.find(
        (a: LearningArea) =>
          a.italian_title == course.italian_learning_area &&
          a.english_title == course.english_learning_area
      ); // Da sistemare: aspettare che Pietro metta id
      return tmp != undefined
        ? tmp
        : {
            id: -1,
            italian_title: "",
            english_title: "",
          };
    });
    course_proposition = reactive(
      new ModelProposition({
        course_id: course_id,
        italian_title: course.italian_title,
        english_title: course.english_title,
        up_hours: course.up_hours,
        credits: course.credits,
        area_id: learning_area.id,
        growth_list: course.growth_list.map((a) => a.id),
        session_id: -1,
        class_group: -1,
        num_section: 0,
        min_students: course.min_students,
        max_students: course.max_students,
        teaching_list: course.teaching_list.map((a) => a.id),
        italian_descr: course.italian_description,
        english_descr: course.english_description,
        italian_exp_l: course.italian_expected_learning_results,
        english_exp_l: course.english_expected_learning_results,
        italian_cri: course.italian_criterions,
        english_cri: course.english_criterions,
        italian_act: course.italian_activities,
        english_act: course.english_activities,
        access_object: course.access_object,
        teacher_list: [],
      })
    );
    for (const teaching of course_proposition.characteristics2.teaching_list) {
      addToSimpleList("teachings",teaching);
    }
    for (const growth_area of course_proposition.characteristics2.growth_list) {
      addToSimpleList("growth_areas",growth_area);
    }
    for (const learning_context_id in course_proposition.access_object) {
      for (const access_object of course_proposition.access_object[
        learning_context_id
      ]) {
        addAccess(learning_context_id, access_object);
      }
    }
  } else {
    course_proposition = reactive(new ModelProposition());
  }
  trigger.value++;
};
const changeModality = (new_action: Action) => {
  action.value = new_action;
  // Da sistemare: mettere X a liste
  trigger.value++;
};
const approve = (outcome = true) => {
  executeLink(
    "/v1/propositions/approval?course_id=" +
      course_proposition.id +
      "&session_id=" +
      course_proposition.specific_information.session_id +
      "&approved=" +
      outcome,
    () => {
      // Da sistemare: controlla risposta e apri modal
      console.log(outcome ? "Accettato" : "Rifiutato");
    },
    () => {
      // Da sistemare: controlla risposta e apri modal
      console.log("Operazione non riuscita");
    },
    "put"
  );
};
/*const parameters_remaining = computed(
  () => course_proposition.remaining.length == 0
);*/

const store = useStore();
const user = User.getLoggedUser() as User;
const language = getCurrentLanguage();
const languages = getAviableLanguages();
const $route = useRoute();

const trigger = ref(0);
const selected_model: Ref<number | undefined> = ref(undefined);
const alert_open = ref(false);
const alert_information = {
  title: getCurrentElement("error"),
  message: "",
  buttons: [getCurrentElement("ok")],
};
const pages = ModelProposition.getProps("pages");
const current_page_index = ref(0);
const buttons: CustomElement[] = [
  {
    id: "back",
    type: "icon",
    linkType: "event",
    content: {
      event: "back",
      icon: getIcon("arrow_back"),
    },
  },
  {
    id: "next",
    type: "icon",
    linkType: "event",
    content: {
      event: "next",
      icon: getIcon("arrow_forward"),
    },
  },
  {
    id: "teacher_info",
    type: "icon",
    linkType: "event",
    content: {
      event: "teacher_info",
      icon: getIcon("information_circle"),
    },
  },
  {
    id: "history",
    type: "icon",
    linkType: "request",
    content: {
      url: "/propositions_history",
      method: "get",
      icon: getIcon("archive"), // Da sistemare: mettere in alto e fare popup
    },
  },
  {
    id: "approve",
    type: "icon",
    linkType: "event",
    content: {
      event: "approve",
      icon: getIcon("checkmark"),
    },
  },
  {
    id: "reject",
    type: "icon",
    linkType: "event",
    content: {
      event: "reject",
      icon: getIcon("close"),
    },
  },
  {
    id: "edit",
    type: "icon",
    linkType: "event",
    content: {
      event: "edit",
      icon: getIcon("pencil"),
    },
  },
  {
    id: "view",
    type: "icon",
    linkType: "event",
    content: {
      event: "view",
      icon: getIcon("eye"),
    },
  },
];
const selected_session = ref(-1);
const addition = ref(false);
const presidium = ref(false);
const main_study_year = ref(false);
const selected_teaching = ref("");
const selected_growth_area = ref(0);
const tmp_set: Set<number> = new Set();
const selected_learning_context = ref("");
const selected_study_address = ref("");
const selected_study_year = ref(0);
const teachings_cards: OrderedCardsList<GeneralCardElements> = {
  order: [],
  cards: {
    "": [],
  },
};
const teachings: SimpleList<Teaching> = {
  available: [],
  selected: [],
};
const growth_areas_cards: OrderedCardsList<GeneralCardElements> = {
  order: [],
  cards: {
    "": [],
  },
};
const growth_areas: SimpleList<GrowthArea> = {
  available: [],
  selected: [],
};
const access_propositions_cards: OrderedCardsList<GeneralCardElements> = {
  order: [],
  cards: {},
};
const learning_contexts: {
  available: LearningContext[];
  selected: LearningContext[];
} = {
  available: [],
  selected: [],
};
const study_addresses: {
  available: {
    [key: string]: StudyAddress[];
  };
  selected: {
    [key: string]: StudyAddress[];
  };
} = {
  available: {},
  selected: {},
};
const study_years: {
  // Da sistemare: mettere elenco check e usare card per study_address con X per ogni classe
  available: {
    [key: string]: {
      [key: string]: { id: number }[];
    };
  };
  selected: {
    [key: string]: {
      [key: string]: { id: number }[];
    };
  };
} = {
  available: {},
  selected: {},
};
const selected_teacher = ref(0);
const teachers: {
  available: Teacher[];
  selected: Teacher[];
} = {
  available: [],
  selected: [],
};
const num_section: Ref<string> = ref("0"); // Da sistemare: bug di ion-input che da stringa anche con type="number"
const main_teacher = ref(false);
const teachers_cards: OrderedCardsList<GeneralCardElements> = {
  order: [],
  cards: {
    "": [],
  },
};
const action: Ref<Action> = ref(
  $route.query.view != undefined ? "view" : "propose"
);
/*const correspondences: {
  [key in keyof string as ListTypes]: {
    [key: string]: string
  }
} = {
  teachings: {
    list
  },
  access: {

  },
  teachers: {

  }
}*/

let course_proposition = reactive(new ModelProposition());
let models: CourseModel[] = [];
let learning_areas: LearningArea[] = [];
let learning_sessions: LearningSession[] = [];
let groups: { id: number }[] = [];
let sections: boolean[] = reactive([]);

/*switch (pages[current_page_index.value]) { // Da sistemare: caricare una volta i vari contenuti
  case "teaching_list":
    
    break;
  case "access_object":
  case "teacher_list":
    
    break;
  default:
    break;
}*/
models = await executeLink(
  "/v1/propositions?recent_models=10", // Da sistemare: fare rework recent_models (mettere filtro su tutti i corsi)
  (response) =>
    response.data.data.map((a: CourseModelProps) => new CourseModel(a)),
  () => []
);
learning_areas = await executeLink(
  "/v1/learning_areas?all_data=true",
  (response) => response.data.data,
  () => []
);
growth_areas.available = await executeLink(
  "/v1/growth_areas",
  (response) => response.data.data.map((a: GrowthAreaProps) => new GrowthArea(a)),
  () => []
);
learning_sessions = await executeLink(
  "/v1/learning_sessions?future_session=true", // Da sistemare: aggiungere course_id quando Pietro finisce
  (response) => {
    const tmp_learning_sessions: LearningSession[] = [];

    let tmp_session: LearningSession;

    for (const session of response.data.data) {
      tmp_session = new LearningSession(session);
      tmp_set.add(tmp_session.school_year);
      tmp_learning_sessions.push(tmp_session);
    }

    return tmp_learning_sessions;
  },
  () => []
);
teachings.available = await executeLink(
  "/v1/teachings?all_data=true",
  (response) => response.data.data.map((a: TeachingProps) => new Teaching(a)),
  () => []
);

learning_contexts.available = await executeLink(
  "/v1/learning_contexts",
  (response) => {
    const tmp_contexts: LearningContext[] = [];

    for (const learning_context of response.data.data) {
      if (
        store.state.excluded_learning_contexts_id.findIndex(
          (a: number) => a != learning_context.id
        ) != -1
      ) {
        tmp_contexts.push(learning_context);
      }
    }

    return tmp_contexts;
  },
  () => []
);
await executeLink(
  "/v1/study_addresses",
  (response) => {
    for (const context of learning_contexts.available) {
      study_addresses.available[context.id] = [];
      study_years.available[context.id] = {};
      for (const address of response.data.data) {
        study_addresses.available[context.id].push(address);
        study_years.available[context.id][address.id] = Array.from(
          { length: address.max_classes },
          (value, index) => {
            return {
              id: index + 1,
            };
          }
        );
      }
    }
  },
  () => []
);
teachers.available = await executeLink(
  "/v1/teachers",
  (response) => response.data.data.map((a: TeacherProps) => new Teacher(a)),
  () => []
);

watch(selected_session, (new_session) => {
  const tmp_learning_session = learning_sessions.find(a => a.id == new_session);

  course_proposition.specific_information.session_id = new_session;
  groups = Array.from({length: tmp_learning_session != undefined ? tmp_learning_session.num_groups : 0}, (_, i) => {
    return {
      id: i + 1
    }
  });
  trigger.value++;
});
watch(selected_learning_context, (new_learning_context) => {
  if (
    new_learning_context != undefined &&
    study_addresses.available[new_learning_context] != undefined &&
    study_addresses.available[new_learning_context].findIndex(
      (a) => a.id == selected_study_address.value
    ) == -1
  ) {
    selected_study_address.value = "";
  }
  trigger.value++;
});
watch(selected_study_address, (new_study_address) => {
  let tmp_study_address;

  if (
    new_study_address != "" &&
    (tmp_study_address = study_addresses.available[
      selected_learning_context.value
    ].find((a) => a.id == new_study_address)) != undefined &&
    selected_study_year.value > tmp_study_address.max_classes
  ) {
    selected_study_year.value = 0;
  }
  trigger.value++;
});
watch(num_section, (n) => {
  let actual_n: number;

  if (n != "") {
    actual_n = parseInt(n);
    course_proposition.specific_information.num_section = actual_n;
    if (sections.length > actual_n) {
      sections.splice(actual_n);
    } else if (sections.length < actual_n) {
      sections = reactive(
        sections.concat(new Array(actual_n - sections.length).fill(false))
      );
    }
  }
});
watch(selected_model, () => {
  if (selected_model.value != undefined) {
    edit_course_proposition(selected_model.value);
  }
  trigger.value++;
});
selected_model.value = $route.query[action.value] != undefined ? parseInt($route.query[action.value] as string) : undefined;
</script>

<style></style>