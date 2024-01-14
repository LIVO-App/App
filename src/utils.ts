import { Method } from "axios";
import {
  GeneralCardElements,
  CardElements,
  EnrollmentCardElements,
  Language,
  ElementsList,
  IconsList,
  LearningSessionStatus,
  LearningContext,
  LearningContextSummary,
  Gender,
  GenderKeys,
  LinkParameters,
  EventString,
  EventParameters,
  RequestParameters,
  ContentType,
  CustomElement,
  ElementType,
  Colors,
  IconAlternatives,
  Classes,
  SubElements,
  ColorObject,
  GeneralSubElements,
  User,
  Menu,
  UserType,
  DefaultLink,
  TmpList,
  LearningArea,
  UserSummary,
  CardsList,
  OrderedCardsList,
  EnrollmentTable,
  AlertInformation,
} from "./types";
import { $axios } from "./plugins/axios";
import { store } from "./store";
import router from "./router";

function getCompleteSchoolYear(year: number) {
  return year + " - " + (year + 1);
}

function getCurrentSchoolYear() {
  const today = new Date();
  return today.getMonth() < 8 ? today.getFullYear() - 1 : today.getFullYear();
}

function getRagneString(start: Date, end: Date) {
  return toDateString(new Date(start)) + "-" + toDateString(new Date(end));
}

function isCard(element: any): element is CardElements {
  return "group" in element;
}

function isGeneral(element: any): element is GeneralCardElements {
  return "side_element" in element || !("credits" in element); // TODO (8): vedere se creare un parametro per fare la condizione positiva
}

function isCourse(element: any): element is EnrollmentCardElements {
  return "credits" in element;
}

function isOrderedCardList(element: any): element is OrderedCardsList {
  return "order" in element;
}

function isCardLists(element: any): element is TmpList<CardsList> {
  const first_key = Object.keys(element)[0]; // TODO (6): non è detto che la prima lista abbia una carta. Successivamente sostituire a !isEnrollmentTableList
  const second_key =
    first_key != undefined ? Object.keys(element[first_key])[0] : undefined;

  return (
    first_key != undefined &&
    second_key != undefined &&
    isCard(element[first_key][second_key][0])
  );
}

function isEnrollmentTableList(
  element: any
): element is TmpList<TmpList<EnrollmentTable>> {
  const first_key = Object.keys(element)[0];
  const second_key =
    first_key != undefined ? Object.keys(element[first_key])[0] : undefined;

  return (
    first_key != undefined &&
    second_key != undefined &&
    "table_data" in element[first_key][second_key]
  );
}

async function executeLink(
  url?: string | undefined,
  success = (response: any) => response,
  fail: (err: any) => any = (err: string) => err,
  method?: Method,
  body?: { [key: string]: any }
) {
  const toExecute = url ?? store.state.request.url;
  const howExecute = method ?? store.state.request.method ?? "get";
  const options = {
    headers: {
      "x-access-token": sessionStorage.getItem("token") ?? "",
    },
  };

  let request;

  if ($axios != undefined && toExecute != undefined) {
    if (!isTokenExpired()) {
      switch (howExecute) {
        case "get":
          request = $axios.get(toExecute, options);
          break;
        case "post":
          request = $axios.post(toExecute, body, options);
          break;
        case "put":
          request = $axios.put(toExecute, body, options);
          break;
        case "delete":
          request = $axios.delete(toExecute, options);
          break;
        case "patch":
          request = $axios.patch(toExecute, options);
          break;
        default:
          return new Promise(() => "Method not defined");
      }
      store.state.request = {};
      return await request.then(success).catch(fail); // TODO (6): mettere finally che cancella store.state.request e store.state.event e gestire success e fail come promise
    } else {
      logout();
      router.push({ name: "auth" });
    }
  } else {
    store.state.request = {};
    return new Promise((resolve, reject) => {
      console.error("No axios instance or url defined");
      reject(fail("No axios instance or url defined"));
    });
  }
}

function getCurrentElement(key: string) {
  const language: Language = getCurrentLanguage();
  const elements: ElementsList = store.state.elements;

  return elements[language][key];
}

function getIcon(key: string) {
  const icons: IconsList = store.state.icons;

  return icons[key];
}

function hashCode(str: string) {
  let i, chr;
  let hash = 0;

  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function castStatus(status: string): LearningSessionStatus | null {
  let cast: LearningSessionStatus | null = null;

  switch (status) {
    case getCurrentElement("current"):
      cast = LearningSessionStatus.CURRENT;
      break;
    case getCurrentElement("upcoming"):
      cast = LearningSessionStatus.UPCOMING;
      break;
    case getCurrentElement("completed"):
      cast = LearningSessionStatus.COMPLETED;
      break;
    case getCurrentElement("future"):
      cast = LearningSessionStatus.FUTURE;
      break;
  }

  return cast;
}

function getActualLearningContext(
  learning_context: LearningContextSummary | undefined
): LearningContextSummary {
  return learning_context ?? store.state.main_learning_context;
}

function toSummary(
  learning_context: LearningContext | undefined
): LearningContextSummary | undefined {
  return learning_context != undefined
    ? {
        id: learning_context.id,
        credits: learning_context.credits,
      }
    : undefined;
}

function toDateString(date: Date) {
  return date.toLocaleDateString("en-GB");
}

function getGender(key: Gender) {
  return getCurrentElement(GenderKeys[key]);
}

function numberToSection(section: number) {
  return String.fromCharCode(65 + section);
}

function isEvent(link: any): link is EventParameters {
  return "event" in link;
}

function isRequest(link: any): link is RequestParameters {
  return "url" in link;
}

function isEventString(element: any): element is EventString {
  return isEvent(element) && "text" in element;
}

function getStatusString(status: LearningSessionStatus) {
  return status == LearningSessionStatus.CURRENT
    ? getCurrentElement("current")
    : status == LearningSessionStatus.UPCOMING
    ? getCurrentElement("upcomoing")
    : "";
}

function getStatusColor(status: LearningSessionStatus) {
  return status == LearningSessionStatus.CURRENT
    ? "success"
    : status == LearningSessionStatus.UPCOMING
    ? "medium"
    : "";
}

function getCurrentLanguage(): Language {
  return store.state.language;
}

function getAviableLanguages(): Language[] {
  return store.state.languages;
}

function getCustomMessage(
  id: string,
  content: ContentType,
  type: ElementType = "string",
  colors?: Colors<GeneralSubElements>,
  classes?: Classes<SubElements>
): CustomElement {
  return {
    id: id,
    type: type,
    content: content,
    colors: colors,
    classes: classes,
  };
}

function nullOperator(...args: any[]) {
  let count = 0;
  let color;

  while (count < args.length && (color = args[count++]) == undefined);

  return color;
}

function getCssVariable(variable: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

function getStudyAddressVisualization(study_address_id: string) {
  let visualization:
    | {
        icon: IconAlternatives;
        background: ColorObject;
      }
    | undefined;

  switch (study_address_id) {
    case "ATS":
      visualization = {
        icon: getIcon("medal"),
        background: {
          name: "ats",
          type: "var",
        },
      };
      break;
    case "BIO":
      visualization = {
        icon: getIcon("flask"),
        background: {
          name: "bio",
          type: "var",
        },
      };
      break;
    case "ODO":
      visualization = {
        icon: getIcon("medkit"),
        background: {
          name: "odo",
          type: "var",
        },
      };
      break;
    case "TUR4":
      visualization = {
        icon: getIcon("earth"),
        background: {
          name: "tur4",
          type: "var",
        },
      };
      break;
  }

  return visualization;
}

function getNumberSequence(length: number, start = 0) {
  return Array.from(
    {
      length: length,
    },
    (_, i) => {
      return i + start;
    }
  );
}

function getUserFromToken(token: string) {
  const token_obj = JSON.parse(atob(token.split(".")[1]));

  return new User({
    id: token_obj._id,
    token: token,
    username: token_obj.username,
    user: token_obj.role,
    expirationDate: token_obj.expirationDate,
  });
}

function getDefautlLink(user_role: UserType) {
  const menu: Menu = store.state.menu;
  const name = menu.default_item[user_role];
  const index = menu.order[user_role].findIndex((a) => a == name);

  return {
    name: name,
    index: index != -1 ? index : 0,
  };
}

async function setUser(user: User, default_link: DefaultLink) {
  for (const key of User.getProperties()) {
    // TODO (7): trovare alternativa che garantisca persistenza e reattività (es. sistemi a pagamenti visti)
    sessionStorage.setItem(key, user[key]); // Necessario per la persistenza
  }
  await store.dispatch("login", user); // Necessario per la reattività (in caso puntare su questo, ma persistente)
  store.state.menuIndex = default_link.index;
}

function getBaseUrl() {
  return $axios.defaults.baseURL;
}

function getLearningContexts(
  user: UserSummary,
  learning_session_id?: string
): Promise<LearningContext[]> {
  return executeLink(
    "/v1/learning_contexts?student_id=" +
      user.id +
      (learning_session_id != undefined
        ? "&session_id=" + learning_session_id
        : ""),
    (response) => {
      const tmp_contexts: LearningContext[] = [];

      let main_context: LearningContext | undefined;

      for (const learning_context of response.data.data as LearningContext[]) {
        if (
          store.state.excluded_learning_contexts_id.findIndex(
            (a: string) => a != learning_context.id
          ) != -1
        ) {
          if (learning_context.id == store.state.main_learning_context.id) {
            main_context = learning_context;
          } else {
            tmp_contexts.push(learning_context);
          }
        }
      }

      return main_context ? [main_context, ...tmp_contexts] : tmp_contexts;
    },
    () => []
  );
}

async function logout() {
  const menu: Menu = store.state.menu;

  for (const key of User.getProperties()) {
    sessionStorage.removeItem(key);
  }
  store.state.user = undefined;
  sessionStorage.removeItem("selected_item");
  menu.index = -1;

  await store.dispatch("signalLogin"); // Dummy change to trigger reactive behaviour
  await store.dispatch("logout");
  await store.dispatch("signalLogout");
}

function isTokenExpired(check_user = false) {
  const user: User | undefined = User.getLoggedUser();

  return (
    (check_user && user == undefined) ||
    (user != undefined && user.expiration_date <= new Date())
  );
}

function getLocale() {
  let locale: string;
  switch (getCurrentLanguage()) {
    case "italian":
      locale = "it-IT";
      break;
    case "english":
      locale = "en-GB";
      break;
  }

  return locale;
}

function getGradeNumber(grade: string) {
  const tmp_regexp = store.state.grades_scale.input_regex;
  const actual_grade = tmp_regexp.test(grade) ? parseFloat(grade) : NaN;
  tmp_regexp.test(grade); // Dummy test to reset regex (I don't know why I have to do this)

  if (isNaN(actual_grade)) {
    return NaN;
  } else {
    return actual_grade;
  }
}

function limitGrade(grade: string) {
  let actual_grade: number;

  if (
    isNaN((actual_grade = getGradeNumber(grade))) ||
    actual_grade < store.state.grades_scale.min ||
    actual_grade > store.state.grades_scale.max
  ) {
    return NaN;
  } else {
    return actual_grade;
  }
}

function checkGradesParameters(
  descriptions: {
    [key in keyof Language as `${Language}_description`]: string;
  },
  grade: string,
  date: Date | undefined
) {
  const languages = getAviableLanguages();

  const end_of_day = new Date();
  end_of_day.setHours(23, 59, 59, 999);

  let full = true;
  let count = 0;
  let actual_grade: number | undefined;

  while (
    count < languages.length &&
    (full = descriptions[`${languages[count++]}_description`] != "")
  );
  if (!full) {
    store.state.event = {
      event: "empty_descriptions",
      data: {},
    };
    actual_grade = undefined;
  } else if (date != undefined && date > end_of_day) {
    store.state.event = {
      event: "error",
      data: {
        message: getCurrentElement("no_future_date"),
      },
    };
    actual_grade = undefined;
  } else if (isNaN((actual_grade = limitGrade(grade)))) {
    store.state.event = {
      event: "error",
      data: {
        message: getCurrentElement("grade_value_error"),
      },
    };
    actual_grade = undefined;
  }

  return actual_grade;
}

function getSubscribedCredits(
  courses_data: {
    pending: boolean | Date;
    credits: number;
  }[]
) {
  return courses_data.reduce(
    (
      a: number,
      b: {
        pending: boolean | Date;
        credits: number;
      }
    ) => a + (b.pending === true ? b.credits : 0),
    0
  );
}

function isLinkedToAreas(learning_context: LearningContext) {
  return learning_context.credits == undefined;
}

async function getLearningAreasStructures(
  learning_contexts: LearningContext[],
  learning_session_id: string
) {
  const learning_areas_map: {
    [area_id: string]: LearningArea;
  } = {};
  const learning_areas_distribution: TmpList<{ id: string }[]> = {};

  let all_learning_areas: LearningArea[] = [];

  for (const context of learning_contexts) {
    await executeLink(
      "/v1/learning_areas?all_data=true&credits=true&session_id=" +
        learning_session_id +
        "&context_id=" +
        context.id,
      (response) => {
        learning_areas_distribution[context.id] = response.data.data.map(
          (a: LearningArea) => {
            return {
              id: a.id,
            };
          }
        );
        response.data.data.forEach((a: LearningArea) => {
          learning_areas_map[a.id] =
            learning_areas_map[a.id] == null
              ? a
              : Object.assign(learning_areas_map[a.id], a);
        });
      },
      () => []
    );
    all_learning_areas = Object.values(learning_areas_map);
  }

  return {
    distribution: learning_areas_distribution,
    list: all_learning_areas,
  };
}

function getContextAcronym(option: LearningContext) {
  const language = getCurrentLanguage();

  return option[`${language}_title`];
}

function getCssColor(text_color: ColorObject) {
  return text_color.type == "var"
    ? getCssVariable("--ion-color-" + text_color.name)
    : text_color.name;
}

function setupError(message?: string) {
  // TODO (5): Mettere un unico in App.vue e uniformare il sistema
  const alert_information: AlertInformation = store.state.alert_information;

  alert_information.title = getCurrentElement("error");
  alert_information.message = message ?? getCurrentElement("general_error");
  alert_information.buttons = [getCurrentElement("ok")];
}

function removeTableIndexedElement(
  table: CustomElement[][],
  id: string | number
) {
  let index = -1;

  for (let i = 0; i < table.length; i++) {
    if (index == -1 && table[i][0].id.split("_")[0] == id) {
      table.splice(i, 1);
      index = i--;
    } else if (index != -1) {
      table[i][0] = getCustomMessage(table[i][0].id + "_index", i + 1);
    }
  }

  return index;
}

function insertTableIndexedElement(
  table: CustomElement[][],
  element: CustomElement[],
  index: number
) {
  table.splice(index, 0, element);
  for (let i = index + 1; i < table.length; i++) {
    table[i][0] = getCustomMessage(table[i][0].id + "_index", i + 1);
  }
}

export {
  getCompleteSchoolYear,
  getCurrentSchoolYear,
  getRagneString,
  isCard,
  isGeneral,
  isCourse,
  isOrderedCardList,
  isCardLists,
  isEnrollmentTableList,
  executeLink,
  getCurrentElement,
  getIcon,
  hashCode,
  castStatus,
  getActualLearningContext,
  toSummary,
  toDateString,
  getGender,
  numberToSection,
  isEvent,
  isRequest,
  isEventString,
  getStatusString,
  getStatusColor,
  getCurrentLanguage,
  getAviableLanguages,
  getCustomMessage,
  nullOperator,
  getCssVariable,
  getStudyAddressVisualization,
  getNumberSequence,
  getUserFromToken,
  getDefautlLink,
  setUser,
  getBaseUrl,
  getLearningContexts,
  logout,
  isTokenExpired,
  getLocale,
  getGradeNumber,
  checkGradesParameters,
  getSubscribedCredits,
  isLinkedToAreas,
  getLearningAreasStructures,
  getContextAcronym,
  getCssColor,
  setupError,
  removeTableIndexedElement,
  insertTableIndexedElement,
};
