export type CourseLibraryItem = {
  title: string;
  description: string;
  image: string;
};

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
