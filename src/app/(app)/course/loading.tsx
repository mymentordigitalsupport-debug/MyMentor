import { Card } from "@/components/ui/Card";

export default function CourseLoading() {
  return (
    <div className="flex flex-col gap-5 py-5">
      <Card variant="default" padding="lg" className="h-[280px] animate-pulse" />
      <Card variant="default" padding="md" className="h-[180px] animate-pulse" />
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-24 rounded-full bg-mist animate-pulse" />
        <div className="h-10 w-24 rounded-full bg-mist animate-pulse" />
        <div className="h-10 w-24 rounded-full bg-mist animate-pulse" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card variant="default" padding="md" className="min-h-[320px] animate-pulse" />
        <Card variant="default" padding="md" className="min-h-[320px] animate-pulse" />
      </div>
    </div>
  );
}


