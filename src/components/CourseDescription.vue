<template>
  <ion-header>
    <ion-toolbar>
      <ion-grid>
        <ion-row class="ion-text-center ion-align-items-center">
          <ion-col>
            <ionic-element :element="elements.title" />
          </ion-col>
          <ion-col size="auto">
            <ionic-element
              :element="elements.close"
              @signal_event="$emit('close')"
            />
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-segment
        v-if="course != undefined && learning_session_id != undefined"
        value="course"
        @ion-change="changeMode"
      >
        <ion-segment-button value="course">
          <ionic-element
            :element="getCustomMessage('course', getCurrentElement('course'))"
          />
        </ion-segment-button>
        <ion-segment-button value="project_class">
          <ionic-element
            :element="getCustomMessage('class', getCurrentElement('class'))"
          />
        </ion-segment-button>
      </ion-segment>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <div class="ion-padding">
      <template v-if="course != undefined">
        <template v-if="mode == 'course'">
          <swiper
            v-if="course.images.length > 1"
            :modules="modules"
            :slides-per-view="1"
            navigation
            :autoplay="{
              delay: 4000,
              disableOnInteraction: false,
            }"
          >
            <swiper-slide v-for="(image, index) in course.images" :key="index">
              <ion-img
                :src="require('@/assets/' + image.url)"
                :alt="image.caption"
                style="height: 150px"
              />
            </swiper-slide>
          </swiper>
          <ion-img
            v-if="course.images.length == 1"
            :src="require('@/assets/' + course.images[0].url)"
            :alt="course.images[0].caption"
            style="height: 150px"
          />
          <ionic-element
            v-for="element in course_card.content"
            :key="element.id"
            :element="element"
          />
          <b
            ><ionic-element
              :element="
                getCustomMessage('open_to', getCurrentElement('open_to') + ':')
              "
          /></b>
          <list-card
            :emptiness_message="
              getCustomMessage(
                'emptiness_message',
                getCurrentElement('course_for_noone')
              )
            "
            :cards_list="access_cards"
            :columns="3"
            :colors="{
              background: {
                name: 'white',
                type: 'var',
              },
              dividers: {
                name: 'white',
                type: 'var',
              },
            }"
            :classes="{
              card: {
                no_card_border: true,
                'ion-no-margin': true,
              },
              content: {
                'ion-no-padding': true,
              },
              item: {
                'ion-no-padding': true,
              },
              row: {
                'ion-wrap': true,
              },
            }"
          />
          <b
            ><ionic-element
              :element="
                getCustomMessage(
                  'teachings',
                  getCurrentElement('teachings') + ':'
                )
              "
          /></b>
          <list-card
            :emptiness_message="
              getCustomMessage(
                'emptiness_message',
                getCurrentElement('no_teachings')
              )
            "
            :cards_list="teachings_cards"
            :columns="2"
            :colors="{
              background: {
                name: 'white',
                type: 'var',
              },
              dividers: {
                name: 'white',
                type: 'var',
              },
            }"
            :classes="{
              card: {
                no_card_border: true,
                'ion-no-margin': true,
              },
              content: {
                'ion-no-padding': true,
              },
              item: {
                'ion-no-padding': true,
              },
              row: {
                'ion-wrap': true,
              },
            }"
          />
          <b
            ><ionic-element
              :element="
                getCustomMessage(
                  'growth_areas',
                  getCurrentElement('growth_areas') + ':'
                )
              "
          /></b>
          <list-card
            :emptiness_message="
              getCustomMessage(
                'emptiness_message',
                getCurrentElement('no_growth_areas')
              )
            "
            :cards_list="growth_cards"
            :columns="2"
            :colors="{
              background: {
                name: 'white',
                type: 'var',
              },
              dividers: {
                name: 'white',
                type: 'var',
              },
            }"
            :classes="{
              card: {
                no_card_border: true,
                'ion-no-margin': true,
              },
              content: {
                'ion-no-padding': true,
              },
              item: {
                'ion-no-padding': true,
              },
              row: {
                'ion-wrap': true,
              },
            }"
          />
        </template>
        <template v-else>
          <template v-if="project_class_card != undefined">
            <ionic-element
              v-for="element in project_class_card.content"
              :key="element.id"
              :element="element"
            />
          </template>
          <b
            ><ionic-element
              :element="
                getCustomMessage(
                  'teachers_title',
                  getCurrentElement('teachers') + ': '
                )
              "
          /></b>
          <list-card
            :emptiness_message="
              getCustomMessage(
                'emptiness_message',
                getCurrentElement('no_teachers')
              )
            "
            :cards_list="teachers_list"
            :columns="2"
            :colors="{
              background: {
                name: 'white',
                type: 'var',
              },
              dividers: {
                name: 'white',
                type: 'var',
              },
            }"
            :classes="{
              card: {
                no_card_border: true,
                'ion-no-margin': true,
              },
              content: {
                'ion-no-padding': true,
              },
              item: {
                'ion-no-padding': true,
              },
              row: {
                'ion-wrap': true,
              },
            }"
          />
        </template>
      </template>
      <template v-else>
        <ionic-element :element="elements.course_information_not_found" />
      </template>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import {
  AdminProjectClass,
  Course,
  CustomElement,
  GeneralCardElements,
  OrderedCardsList,
  TeacherProposition,
  TeacherSummary,
  User,
} from "@/types";
import {
  executeLink,
  getCurrentElement,
  getCustomMessage,
  getIcon,
} from "@/utils";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { Navigation, Autoplay } from "swiper/modules";
import { ref } from "vue";

const changeMode = (event: CustomEvent) => {
  mode.value = event.detail.value;
};

const modules = [Navigation, Autoplay];
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  course_id: {
    type: Number,
    required: true,
  },
  learning_block_id: Number,
  learning_session_id: String,
  section: String,
});
defineEmits(["close"]);
const user = User.getLoggedUser() as User;

const elements: {
  [key: string]: CustomElement;
} = {
  close: {
    id: "close",
    type: "icon",
    linkType: "event",
    content: {
      event: "close",
      icon: getIcon("close"),
    },
  },
  title: {
    id: "title",
    type: "title",
    content: props.title,
  },
  course_information_not_found: {
    id: "course_information_not_found",
    type: "string",
    content: getCurrentElement("course_information_not_found"),
  },
};

const course = await Course.newCourse(
  await executeLink(
    "/v1/courses/" + props.course_id,
    (response) => response.data.data,
    () => null
  )
);
course.images.push(
  {
    url: "Logo_LIVO_Campus_POS_RGB.png",
    caption: "Old logo",
  }
);
const access_cards = course.getAccessCardsList();
const growth_cards = course.getGrowthCardsList();
const teachings_cards = course.getTeachingCardsList();
const mode = ref("course");
const teachers_list: OrderedCardsList = {
  order: [],
  cards: {},
};

let course_card: GeneralCardElements;
let project_class_card: GeneralCardElements | undefined;

if (course != null) {
  course_card = course.toCard();
}
if (props.learning_session_id != undefined) {
  project_class_card = await executeLink(
    "/v1/project_classes/" + course.id + "/" + props.learning_session_id,
    async (response) => {
      const tmp_project_class = new AdminProjectClass(response.data.data);
      await tmp_project_class.loadParms();

      let actual_section: string | undefined;

      if (user.user == "student") {
        actual_section =
          props.section ??
          (await executeLink(
            "/v1/students/" +
              user.id +
              "/project_classes?session_id=" +
              props.learning_session_id,
            (response) => {
              let count = 0;
              let tmp_section: string;

              while (
                (tmp_section =
                  response.data.data[count].id == course.id
                    ? response.data.data[count].section
                    : undefined) == undefined &&
                ++count < response.data.data.length
              );

              return tmp_section;
            },
            () => undefined
          ));
      }

      return tmp_project_class.toCard(
        undefined,
        user,
        actual_section,
        true
      );
    },
    () => undefined
  );
  teachers_list.cards[""] = await executeLink(
    "/v1/project_classes/" +
      course.id +
      "/" +
      props.learning_session_id +
      "/teachers",
    (response) => {
      const summmary_teachers: {
        [id: string]: {
          teacher: TeacherSummary;
          main: boolean;
        };
      } = {};
      const sections: {
        [id: string]: string[];
      } = {};
      const teachers: GeneralCardElements[] = [];

      let tmp_id: number, tmp_card: GeneralCardElements;

      for (const teacher_section of response.data.data) {
        tmp_id = teacher_section.teacher_ref.data.id;

        summmary_teachers[tmp_id] = {
          teacher: new TeacherSummary({
            id: tmp_id,
            name: teacher_section.teacher_name,
            surname: teacher_section.teacher_surname,
          }),
          main: teacher_section.main_teacher === 1,
        };

        if (sections[tmp_id] == undefined) {
          sections[tmp_id] = [];
        }
        sections[tmp_id].push(teacher_section.section);
      }

      for (const teacher_id of Object.keys(summmary_teachers)) {
        tmp_card = new TeacherProposition(
          summmary_teachers[teacher_id].teacher,
          summmary_teachers[teacher_id].main,
          sections[teacher_id]
        ).toCard(true);
        for (const element of tmp_card.content as CustomElement[]) {
          element.colors = {
            text: {
              name: "white",
              type: "var",
            },
            background: {
              name: "tur4",
              type: "var",
            },
          };
        }
        (tmp_card.content as CustomElement[])[0].classes = {
          label: {
            "ion-text-wrap": true,
            "ion-padding-start": true,
            "ion-padding-top": true,
            top_radius: true,
          },
        };
        (tmp_card.content as CustomElement[])[1].classes = {
          label: {
            "ion-padding-start": true,
            "ion-padding-bottom": true,
            bottom_radius: true,
          },
        };
        tmp_card.classes = {
          content: {
            "ion-no-padding": true,
          },
        };
        teachers.push(tmp_card);
      }

      return teachers;
    },
    () => undefined
  );
}
</script>

<style scoped>
.block {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>