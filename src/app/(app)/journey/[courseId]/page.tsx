import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function JourneyCourseRedirect({ params }: Props) {
  const { courseId } = await params;
  redirect(`/course/${courseId}`);
}

