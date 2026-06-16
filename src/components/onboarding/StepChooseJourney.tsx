"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type GuidancePath } from "@/types";
import { Button } from "@/components/ui/Button";
import { COURSE_LIBRARY, normalizeCourseKey } from "@/lib/course-library";

interface JourneyOption {
  courseId: string;
  courseVersionId: string;
  title: string;
  description: string | null;
  guidancePath: GuidancePath;
  image: string;
  available: boolean;
  matchesGuidancePath: boolean;
}

interface StepChooseJourneyProps {
  guidancePath: GuidancePath;
  courseId?: string | null;
  onSelect: (courseVersionId: string, guidancePath: GuidancePath) => void;
}

export function StepChooseJourney({ guidancePath, courseId, onSelect }: StepChooseJourneyProps) {
  const [options, setOptions] = useState<JourneyOption[]>([]);
  const [selected, setSelected] = useState<string | null>(courseId ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const [{ data: courses }, { data: versions }] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, description")
          .eq("is_published", true)
          .order("sort_order"),
        supabase
        .from("course_versions")
          .select("id, course_id, guidance_path, title, description")
          .in("guidance_path", ["religious", "christian"]),
      ]);

      const courseMap = new Map(
        (courses ?? []).map((course) => [
          normalizeCourseKey(course.title),
          {
            id: course.id,
            title: course.title,
            description: course.description ?? "",
          },
        ])
      );
      const versionMap = new Map<string, Array<{
        id: string;
        title: string;
        description: string | null;
        guidancePath: GuidancePath;
      }>>();

      for (const version of versions ?? []) {
        const existing = versionMap.get(version.course_id) ?? [];
        existing.push({
          id: version.id,
          title: version.title,
          description: version.description ?? null,
          guidancePath: version.guidance_path as GuidancePath,
        });
        versionMap.set(version.course_id, existing);
      }

      const mappedOptions = COURSE_LIBRARY.map((entry) => {
        const course = courseMap.get(normalizeCourseKey(entry.title)) ?? null;
        const versionsForCourse = course ? versionMap.get(course.id) ?? [] : [];
        const preferredVersion =
          versionsForCourse.find((version) => version.guidancePath === guidancePath) ??
          versionsForCourse[0] ??
          null;

        return {
          courseId: course?.id ?? "",
          courseVersionId: preferredVersion?.id ?? "",
          title: entry.title,
          description: preferredVersion?.description ?? course?.description ?? entry.description,
          guidancePath: preferredVersion?.guidancePath ?? guidancePath,
          image: entry.image,
          available: Boolean(course),
          matchesGuidancePath: Boolean(
            preferredVersion && preferredVersion.guidancePath === guidancePath
          ),
        };
      });

      setOptions(mappedOptions);

      if (courseId) {
        setSelected(courseId);
      } else {
        const firstAvailable = mappedOptions.find((option) => option.available);
        setSelected(firstAvailable?.courseId ?? null);
      }
      setLoading(false);
    }
    void load();
  }, [guidancePath, courseId]);

  async function handleContinue() {
    const opt = options.find((o) => o.courseId === selected && o.available);
    if (!opt) return;

    if (opt.courseVersionId) {
      onSelect(opt.courseVersionId, opt.guidancePath);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: versions } = await supabase
      .from("course_versions")
      .select("id, guidance_path")
      .eq("course_id", opt.courseId);

    const resolvedVersion =
      (versions ?? []).find((version) => version.guidance_path === guidancePath) ??
      (versions ?? [])[0] ??
      null;

    if (resolvedVersion) {
      onSelect(resolvedVersion.id, resolvedVersion.guidance_path as GuidancePath);
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-10">
      <h2 className="font-serif text-2xl text-forest font-semibold mb-8">
        Your current course is.
      </h2>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {options.map((opt) => (
            <button
              key={opt.title}
              type="button"
              onClick={() => {
                if (!opt.available) return;
                setSelected(opt.courseId);
              }}
              disabled={!opt.available}
              aria-pressed={selected === opt.courseId}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                selected === opt.courseId
                  ? "border-sage bg-sage/10 shadow-[0_16px_30px_-26px_rgba(84,112,73,0.45)]"
                  : opt.available
                    ? "border-mist bg-cream hover:border-sage/35 hover:-translate-y-0.5"
                    : "border-mist/70 bg-cream/60 opacity-60"
              }`}
            >
              <div className="relative flex h-[150px] items-center justify-center">
                <div className="relative h-[108px] w-[80px]">
                  <Image
                    src={opt.image}
                    alt={opt.title}
                    fill
                    className="object-contain"
                    sizes="(min-width: 768px) 140px, 33vw"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-text">{opt.title}</p>
                {selected === opt.courseId ? (
                  <span className="rounded-full border border-sage/20 bg-sage/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-forest">
                    Selected
                  </span>
                ) : null}
              </div>
              {!opt.available ? (
                <p className="mt-2 text-xs text-muted">
                  Not available yet
                </p>
              ) : !opt.courseVersionId ? (
                <p className="mt-2 text-xs text-muted">
                  Course found. Resolving your study path...
                </p>
              ) : !opt.matchesGuidancePath ? (
                <p className="mt-2 text-xs text-muted">
                  Available under {opt.guidancePath === "christian" ? "Christian Guided" : "Religious Guidance"}
                </p>
              ) : null}
            </button>
          ))}
        </div>
        {options.every((option) => !option.available) ? (
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted">
              No course is available yet for the current guidance path.
            </p>
            <Button onClick={() => onSelect("", guidancePath)} variant="secondary">
              Continue anyway
            </Button>
          </div>
        ) : null}
        </>
      )}

      <div className="mt-auto">
        <Button
          onClick={handleContinue}
          fullWidth
          size="lg"
          disabled={!options.find((option) => option.courseId === selected && option.available)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

