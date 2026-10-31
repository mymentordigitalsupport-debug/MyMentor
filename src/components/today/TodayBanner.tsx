import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Feather, Layers3, SunMedium } from "lucide-react";
import { BotanicalSprig, PaperPin, PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";
import { AnimatedMetric } from "./MemberBoardMotion";
import { truncate } from "@/lib/utils";
import type { MoodValue } from "@/types";

interface TodayBannerProps {
  greeting: string;
  userName: string;
  latestMood: MoodValue | null;
  course: {
    courseTitle: string;
    progressPercent: number;
    chaptersCompleted: number;
    totalChapters: number;
    lessonsCompleted: number;
    totalLessons: number;
    currentChapter: string;
    currentLessonTitle: string;
    currentLessonSubtitle: string | null;
    currentLessonMinutes: number | null;
    currentLessonHref: string;
    hasStarted: boolean;
  };
}


export function TodayBanner({ greeting, userName, latestMood, course }: TodayBannerProps) {
  const progress = Math.min(100, Math.max(0, course.progressPercent));

  return (
    <section className="member-introduction" aria-label="Your daily overview">
      <div className="member-hero">
        <div className="member-hero-copy">
          <p className="member-hero-greeting"><span /><SunMedium size={17} aria-hidden="true" /> {greeting}, {userName}</p>
          <h2>A little intention.<br />A lot of <span className="member-underlined">becoming.<svg viewBox="0 0 300 17" preserveAspectRatio="none" aria-hidden="true"><path d="M4 11Q139-5 294 7M18 16Q154 3 280 12" /></svg></span></h2>
          <p className="member-hero-description">Your story is still unfolding. Make a little room for growth, a moment of reflection, and whatever comes next.</p>
          <div className="member-hero-links"><a href="#daily-check-in"><SunMedium size={16} /> Check in with yourself <ArrowDownRight size={15} /></a><Link href="/journal/new"><Feather size={16} /> Put it into words <ArrowUpRight size={15} /></Link></div>
          <span className="member-hero-handwriting" aria-hidden="true">a little more you, every day<svg viewBox="0 0 90 34"><path d="M3 4q35 36 78 12m-10-5 13 4-8 12" /></svg></span>
        </div>
        <div className="member-hero-note-wrap">
          <article className="member-hero-note">
            <PaperSurface seed={31} warm />
            <PaperPin className="member-hero-pin" />
            <div className="member-note-meta"><span><BookOpen size={14} /> YOUR NEXT CHAPTER</span><span>{course.currentLessonMinutes ? `${course.currentLessonMinutes} min` : "At your pace"}</span></div>
            <p className="member-note-course">{course.courseTitle}</p>
            <h3>{course.currentLessonTitle}</h3>
            <p className="member-note-description">{truncate(course.currentLessonSubtitle ?? "A little learning. A fresh perspective. A step closer to the person you’re becoming.", 135)}</p>
            <div className="member-note-progress"><span>Your journey so far</span><strong>{progress}%</strong><div><span style={{ width: `${progress}%` }} /></div></div>
            <Link href={course.currentLessonHref} className="member-action member-action-forest">{course.hasStarted ? "Pick up where I left off" : "Take my first step"}<ArrowRight size={17} /></Link>
          </article>
          <BotanicalSprig className="member-hero-sprig" />
          <span className="member-note-annotation" aria-hidden="true">good things start here.</span>
        </div>
        <svg className="member-hero-loose-thread" viewBox="0 0 200 100" aria-hidden="true"><path d="M2 62c50-83 65 67 110 10S181 8 198 32" /></svg>
        <div className="member-hero-tear" aria-hidden="true"><svg viewBox="0 0 1200 70" preserveAspectRatio="none"><path d="m0 35 34-4 39 8 27-7 43-8 38 5 28-8 45-1 31-8 44 7 46 9 24-5 53 10 35-8 49 4 33-5 51 10 43-6 26 6 42-14 41-5 31 8 27-3 47 12 39-6 36 9 48-9 35 7 48-15 47 5 49-7 36 7 30-6 60 10v48H0Z" fill="#fffdf5" /><path d="m0 45 48-4 33 10 48-9 30 4 38-10 50 1 42-8 35 8 39 6 33-3 45 10 38-7 46 3 39-4 51 9 44-4 30 7 38-13 37-6 38 10 24-5 48 11 38-4 39 7 43-6 40 4 45-13 46 5 48-7 34 7 32-6 63 10v35H0Z" fill="#f6f3ed" /></svg></div>
      </div>
      <div className="member-stats">
        <Link href="/progress" className="member-stat"><PaperSurface seed={10} /><PaperPin className="member-stat-pin" /><div className="member-stat-top"><span className="member-stat-icon"><BookOpen size={19} /></span><ArrowUpRight size={16} /></div><div className="member-stat-number"><AnimatedMetric value={course.lessonsCompleted} /><span>/ {course.totalLessons}</span></div><p>Lessons completed</p><div className="member-mini-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div></Link>
        <Link href="/course" className="member-stat"><PaperSurface seed={13} /><div className="member-stat-top"><span className="member-stat-icon member-icon-gold"><Layers3 size={19} /></span><ArrowUpRight size={16} /></div><div className="member-stat-number"><AnimatedMetric value={course.chaptersCompleted} /><span>/ {course.totalChapters}</span></div><p>Chapters explored</p><div className="member-stat-detail"><Check size={12} /> One chapter at a time</div></Link>
        <Link href={course.currentLessonHref} className="member-stat"><PaperSurface seed={16} /><PaperTape className="member-stat-tape" /><div className="member-stat-top"><span className="member-stat-icon member-icon-clay"><Clock3 size={19} /></span><ArrowUpRight size={16} /></div><div className="member-stat-number">{course.currentLessonMinutes ?? "—"}<span>min</span></div><p>A little time for growth</p><div className="member-stat-detail member-clamp-one">{course.currentLessonTitle}</div></Link>
        <a href="#daily-check-in" className="member-stat"><PaperSurface seed={19} warm /><div className="member-stat-top"><span className="member-stat-icon member-icon-lilac"><SunMedium size={19} /></span><ArrowDownRight size={16} /></div><div className="member-stat-number member-stat-mood">{latestMood ?? "Check in"}</div><p>{latestMood ? "Today’s state of mind" : "How’s your heart today?"}</p><div className="member-stat-detail">{latestMood ? "All feelings welcome here" : "There’s space for all of it"}</div></a>
      </div>
    </section>
  );
}
