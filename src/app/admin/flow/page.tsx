import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  getAdminChapters,
  getAdminCourses,
  getAdminLessons,
  getAdminQuizzes,
  getAdminReflections,
  getAdminResources,
} from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Flow",
  description: "Live content flow overview.",
};

export default async function AdminFlowPage() {
  const [courses, chapters, lessons, quizzes, reflections, resources] = await Promise.all([
    getAdminCourses(), getAdminChapters(), getAdminLessons(), getAdminQuizzes(), getAdminReflections(), getAdminResources(),
  ]);
  const stages = [
    { label: "Courses", count: courses.length, href: "/admin/courses" },
    { label: "Chapters", count: chapters.length, href: "/admin/chapters" },
    { label: "Lessons", count: lessons.length, href: "/admin/lessons" },
    { label: "Quizzes", count: quizzes.length, href: "/admin/quizzes" },
    { label: "Reflections", count: reflections.length, href: "/admin/reflections" },
    { label: "Resources", count: resources.length, href: "/admin/resources" },
  ];

  return <div className="space-y-6">
    <section><Badge variant="forest">Live data</Badge><h1 className="mt-3 text-2xl font-semibold text-text">Content Flow</h1><p className="mt-1 text-sm text-muted">Current Supabase record counts across the learning-content workflow.</p></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stages.map((stage, index) => <Link key={stage.label} href={stage.href} className="group"><Card variant="default" padding="lg" className="h-full transition group-hover:border-sage"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Step {index + 1}</p><div className="mt-3 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-text">{stage.label}</h2><ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-forest" /></div><p className="mt-3 text-3xl font-semibold text-forest">{stage.count}</p><p className="mt-1 text-sm text-muted">live records</p></Card></Link>)}</section>
  </div>;
}
