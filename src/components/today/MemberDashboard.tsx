import Link from "next/link";
import type { ComponentProps, CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, Compass, Feather, Flame, Leaf, MessagesSquare, Quote } from "lucide-react";
import { BotanicalSprig, PaperPin, PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";
import { AnimatedMetric, MemberBoardMotion } from "./MemberBoardMotion";
import { TodayBanner } from "./TodayBanner";
import { MoodCheckIn } from "./MoodCheckIn";
import { formatShortDate, truncate } from "@/lib/utils";

export interface MemberDashboardProps {
  greeting: string;
  userName: string;
  displayDate: string;
  course: ComponentProps<typeof TodayBanner>["course"];
  mood: ComponentProps<typeof MoodCheckIn>;
  weekly: {
    lessons: number;
    reflectionDays: number;
    days: Array<{ date: string; label: string; active: boolean; isToday: boolean }>;
  };
  reflections: Array<{ id: string; text: string; created_at: string; source: "journal" | "insight" }>;
}

export function MemberDashboard({ greeting, userName, displayDate, course, mood, weekly, reflections }: MemberDashboardProps) {
  const activeDays = weekly.days.filter((day) => day.active).length;
  const progress = Math.min(100, Math.max(0, course.progressPercent));

  return (
    <MemberBoardMotion>
      <header className="member-page-header">
        <div><p className="member-eyebrow">MYMENTOR / YOUR EVERYDAY</p><h1>Your daily space<span className="member-heading-dot" /></h1></div>
        <div className="member-header-actions"><span className="member-date"><CalendarDays size={15} /> {displayDate}</span><Link className="member-action member-action-outline" href="/journal/new"><Feather size={15} /> Write a reflection</Link></div>
      </header>

      <TodayBanner greeting={greeting} userName={userName} latestMood={mood.latestMood} course={course} />

      <div className="member-section-divider"><div><p className="member-eyebrow">A LITTLE ROOM TO GROW</p><h2>Make today <em>your own.</em></h2></div><span className="member-divider-handwriting" aria-hidden="true">no perfect days required<svg viewBox="0 0 85 30"><path d="M4 3q25 27 70 12m-8-6 12 5-10 10" /></svg></span></div>

      <div className="member-dashboard-grid">
        <MoodCheckIn {...mood} />

        <section className="member-panel member-week-panel" aria-labelledby="week-title">
          <PaperSurface seed={21} warm /><PaperPin className="member-panel-pin" />
          <div className="member-panel-heading"><div><p className="member-eyebrow"><Flame size={13} /> YOUR MOMENTUM</p><h2 id="week-title">Showing up matters.</h2></div><Link href="/progress" className="member-circle-link" aria-label="View your progress"><ArrowUpRight size={19} /></Link></div>
          <p className="member-panel-description">Every lesson, reflection, and check-in counts.</p>
          <div className="member-week-summary"><strong><AnimatedMetric value={activeDays} /><span>/ 7</span></strong><div>days of intention<span>over the past week</span></div><span className="member-week-leaf"><Leaf size={30} strokeWidth={1.3} /></span></div>
          <div className="member-week-days" aria-label="Activity over the past seven days">
            {weekly.days.map((day) => <div key={day.date} className={`member-week-day ${day.active ? "member-day-active" : ""} ${day.isToday ? "member-day-today" : ""}`}><span>{day.label}</span><span className="member-day-marker" aria-label={`${day.date}${day.isToday ? ", today" : ""}: ${day.active ? "activity recorded" : "no activity recorded"}`}>{day.active ? <Check size={16} /> : <span />}</span><i /></div>)}
          </div>
          <div className="member-week-totals"><div><BookOpen size={16} /><strong><AnimatedMetric value={weekly.lessons} /></strong><span>lessons completed</span></div><div><Feather size={16} /><strong><AnimatedMetric value={weekly.reflectionDays} /></strong><span>reflection days</span></div></div>
          <p className="member-week-encouragement"><span />Progress over perfection. Always.</p>
        </section>

        <section className="member-panel member-course-panel" aria-labelledby="course-title">
          <PaperSurface seed={24} /><PaperTape className="member-panel-tape" /><BotanicalSprig className="member-course-sprig" />
          <div className="member-panel-heading"><div><p className="member-eyebrow"><Compass size={13} /> YOUR GUIDED PATH</p><h2 id="course-title">The next chapter of you.</h2></div><Link href="/course" className="member-text-link">View course <ArrowUpRight size={14} /></Link></div>
          <div className="member-course-overview">
            <div className="member-progress-ring" style={{ "--progress": `${progress}%` } as CSSProperties} role="meter" aria-label="Course completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div><strong><AnimatedMetric value={progress} /><span>%</span></strong><span>COMPLETE</span></div></div>
            <div className="member-course-copy"><span className="member-status">YOUR CURRENT COURSE</span><h3>{course.courseTitle}</h3><p>{course.lessonsCompleted} of {course.totalLessons} lessons complete</p></div>
          </div>
          <Link href={course.currentLessonHref} className="member-next-lesson"><span className="member-lesson-icon"><BookOpen size={19} /></span><span><span>{course.currentChapter}</span><strong>{course.currentLessonTitle}</strong><span>{course.currentLessonMinutes ? `${course.currentLessonMinutes} min · ` : ""}{course.hasStarted ? "Pick up where you left off" : "Your journey starts here"}</span></span><span className="member-lesson-arrow"><ArrowRight size={18} /></span></Link>
        </section>

        <section className="member-panel member-reflections-panel" aria-labelledby="reflections-title">
          <PaperSurface seed={27} /><PaperPin className="member-reflection-pin" />
          <div className="member-panel-heading"><div><p className="member-eyebrow"><Feather size={13} /> WORDS WORTH KEEPING</p><h2 id="reflections-title">Your reflections.</h2></div><Link href="/journal" className="member-text-link">View all <ArrowUpRight size={14} /></Link></div>
          {reflections.length ? <div className="member-reflections">{reflections.map((reflection) => <Link key={reflection.id} href={reflection.source === "journal" ? `/journal/${reflection.id.replace(/^journal-/, "")}` : "/journal"} className="member-reflection"><Quote size={17} aria-hidden="true" /><div><p>{truncate(reflection.text, 130)}</p><span>{reflection.source === "journal" ? "Journal" : "Saved insight"}<i />{formatShortDate(reflection.created_at)}</span></div><ArrowUpRight size={15} /></Link>)}</div> : <div className="member-reflections-empty"><span><Feather size={26} strokeWidth={1.3} /></span><h3>Your story deserves a space.</h3><p>A thought, a feeling, a small win.<br />Start with whatever’s on your mind.</p><Link href="/journal/new" className="member-text-link">Write your first reflection <ArrowRight size={15} /></Link></div>}
        </section>
      </div>

      <div className="member-discover-grid">
        <Link href="/threads" className="member-community-invitation"><span className="member-eyebrow"><MessagesSquare size={15} /> A LITTLE BETTER, TOGETHER</span><strong>You don’t have to<br />figure it out alone.</strong><span>Real people. Honest conversations. A little perspective.</span><span className="member-community-cta">Find your people on Threads <ArrowUpRight size={17} /></span><BotanicalSprig className="member-community-sprig" /></Link>
        <Link href="/resources" className="member-resource-banner"><PaperSurface seed={34} warm /><span className="member-resource-icon"><Leaf size={24} strokeWidth={1.4} /></span><strong>A little support.<br />A fresh perspective.</strong><span>Practical tools and encouragement for wherever you are.</span><span className="member-resource-action">Explore your resources <ArrowUpRight size={17} /></span></Link>
      </div>
    </MemberBoardMotion>
  );
}
