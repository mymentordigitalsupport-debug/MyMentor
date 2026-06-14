import { Card } from "@/components/ui/Card";

export default function TodayLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 pb-6">
      <Card variant="default" padding="lg" className="h-[258px] animate-pulse" />
      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <Card variant="default" padding="lg" className="min-h-[280px] animate-pulse" />
        <Card variant="default" padding="lg" className="min-h-[280px] animate-pulse" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <Card variant="default" padding="lg" className="min-h-[320px] animate-pulse" />
        <Card variant="default" padding="lg" className="min-h-[320px] animate-pulse" />
      </div>
    </div>
  );
}
