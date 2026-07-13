export type CourseLibraryItem = {
  title: string;
  description: string;
  image: string;
};

const SINGLE_VERSION_COURSE_TITLES = new Set([
  "From Addicts to Leaders",
  "Protecting the Next Generation",
]);

const GUIDANCE_SUFFIXES = [
  " - Religious Guidance",
  " - Christian Guidance",
  " - Christian Guided",
];

export const COURSE_LIBRARY: CourseLibraryItem[] = [
  {
    title: "Uprooting Drug Abuse",
    description: "Understand the roots of addiction and the path to lasting freedom.",
    image: "/assets/images/books/Uprooting drug abuse.png",
  },
  {
    title: "From Addicts to Leaders",
    description: "Move from destruction to responsibility, character, and service.",
    image: "/assets/images/books/From Addicts to leader.png",
  },
  {
    title: "Protecting the Next Generation",
    description: "Help families build safer homes and stronger futures for children.",
    image: "/assets/images/books/Protecting the next generation.png",
  },
];

export function normalizeCourseKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function getBaseCourseTitle(value: string) {
  for (const suffix of GUIDANCE_SUFFIXES) {
    if (value.endsWith(suffix)) {
      return value.slice(0, -suffix.length);
    }
  }

  return value;
}

export function isSingleVersionCourseTitle(value: string) {
  return SINGLE_VERSION_COURSE_TITLES.has(getBaseCourseTitle(value));
}

export function shouldHideGuidanceLabel(courseTitle: string) {
  return isSingleVersionCourseTitle(courseTitle);
}

export function getDisplayCourseVersionTitle(courseTitle: string, courseVersionTitle: string) {
  if (shouldHideGuidanceLabel(courseTitle)) {
    return getBaseCourseTitle(courseTitle);
  }

  return courseVersionTitle;
}

export function getDisplayCourseTitle(courseTitle: string) {
  if (shouldHideGuidanceLabel(courseTitle)) {
    return getBaseCourseTitle(courseTitle);
  }

  return courseTitle;
}
