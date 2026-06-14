import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function JourneyChapterRedirect({ params }: Props) {
  const { courseId, moduleId } = await params;
  redirect(`/course/${courseId}/${moduleId}`);
}

