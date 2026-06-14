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
    title: "From Addicts to Leader",
    description: "Equip, protect, and empower the next generation to thrive.",
    image: "/assets/images/books/From Addicts to leader.png",
  },
  {
    title: "Protecting the Next Generation",
    description: "Stand for truth, speak with courage, and make your voice count.",
    image: "/assets/images/books/Protecting the next generation.png",
  },
];

export function normalizeCourseKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
