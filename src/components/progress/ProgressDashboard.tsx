import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Check, Clock3, Leaf, NotebookPen, Sparkles, Target, Trophy, type LucideIcon } from "lucide-react";
import { MemberBoardMotion } from "@/components/today/MemberBoardMotion";
import { BotanicalSprig, PaperPin, PaperSurface, PaperTape } from "@/components/threads/ThreadPaper";

type ProgressChapter = {
  id: string;
  title: string;
  sort_order: number;
  total: number;
  done: number;
};

type ProgressActivity = {
  type: string;
  at: string;
  icon: LucideIcon;
};

type ProgressDashboardProps = {
  courseTitle: string | null;
  activeVersion: boolean;
  overallPercent: number;
  completedLessons: number;
  totalLessons: number;
  completedChapters: number;
  totalChapters: number;
  nextChapterTitle: string | null;
  nextLessonTitle: string | null;
  nextLessonHref: string;
  completedThisWeek: number;
  learningTime: string;
  chapters: ProgressChapter[];
  journalCount: number;
  moodCount: number;
  insightCount: number;
  latestMood: string | null;
  latestMoodDate: string | null;
  quizTotal: number;
  quizCorrect: number;
  activity: ProgressActivity[];
};

function percent(done: number, total: number) {
  return total ? Math.min(100, Math.round((done / total) * 100)) : 0;
}

export function ProgressDashboard({
  courseTitle,
  activeVersion,
  overallPercent,
  completedLessons,
  totalLessons,
  completedChapters,
  totalChapters,
  nextChapterTitle,
  nextLessonTitle,
  nextLessonHref,
  completedThisWeek,
  learningTime,
  chapters,
  journalCount,
  moodCount,
  insightCount,
  latestMood,
  latestMoodDate,
  quizTotal,
  quizCorrect,
  activity,
}: ProgressDashboardProps) {
  const quizAccuracy = quizTotal ? percent(quizCorrect, quizTotal) : 0;
  const ringStyle = { "--progress": `${overallPercent}%` } as CSSProperties;

  return (
    <MemberBoardMotion>
      <div className="member-progress-page">
        <header className="member-page-header">
          <div>
            <p className="member-eyebrow"><span className="member-heading-dot" /> YOUR PERSONAL JOURNEY</p>
            <h1>Progress<span className="member-heading-dot" /></h1>
          </div>
          <div className="member-header-actions">
            <p className="member-date"><Leaf size={15} /> One step at a time</p>
            <Link href="/course" className="member-action member-action-outline">Open your course <ArrowRight size={16} /></Link>
          </div>
        </header>

        <section className="member-hero member-progress-hero">
          <div className="member-hero-copy">
            <p className="member-hero-greeting"><span /> A MOMENT TO SEE HOW FAR YOU HAVE COME</p>
            <h2>Small steps.<br /><span className="member-underlined">Real progress.</span></h2>
            <p className="member-hero-description">
              {activeVersion
                ? "Your growth is built one honest lesson at a time. Keep moving at a pace that feels right for you."
                : "Choose a course when you are ready. Your reflections, check-ins, and activity will gather here as you go."}
            </p>
            <div className="member-hero-handwriting">Your pace is the right pace <span aria-hidden="true">↗</span></div>
          </div>

          <div className="member-hero-note-wrap">
            <div className="member-hero-note member-progress-note">
              <PaperSurface seed={46} warm />
              <PaperPin className="member-hero-pin" />
              <div className="member-note-meta">
                <span><Sparkles size={13} /> YOUR MOMENTUM</span>
                <span>{overallPercent}%</span>
              </div>
              <div className="member-course-overview">
                <div className="member-progress-ring" style={ringStyle} role="progressbar" aria-label="Course completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overallPercent}>
                  <div><strong>{overallPercent}<span>%</span></strong><span>COMPLETE</span></div>
                </div>
                <div className="member-course-copy">
                  <span className="member-status member-status-saved">{courseTitle ?? "YOUR COURSE"}</span>
                  <h3>{activeVersion ? (overallPercent === 100 ? "Beautiful work." : nextChapterTitle ?? "Your next chapter") : "A fresh beginning"}</h3>
                  <p>{completedLessons} of {totalLessons} lessons completed</p>
                </div>
              </div>
              <div className="member-note-progress">
                <span>Course progress</span><strong>{overallPercent}%</strong>
                <div><span style={{ width: `${overallPercent}%` }} /></div>
              </div>
              <Link href={nextLessonTitle ? nextLessonHref : "/course"} className="member-action member-action-forest">
                {nextLessonTitle ? <>Continue with {nextLessonTitle}</> : activeVersion ? "Review your course" : "Explore the course"}<ArrowRight size={16} />
              </Link>
              <BotanicalSprig className="member-hero-sprig" />
            </div>
            <span className="member-note-annotation">every step counts</span>
          </div>

          <div className="member-hero-tear" aria-hidden="true">
            <svg viewBox="0 0 1200 70" preserveAspectRatio="none"><path d="M0 28 38 23 73 31 111 20 149 29 185 18 224 27 263 17 301 25 344 15 381 27 420 21 458 31 499 17 541 24 581 13 620 28 661 17 700 27 742 16 783 26 824 18 863 30 904 17 946 25 988 15 1029 28 1070 17 1110 28 1152 19 1200 29V70H0Z" fill="#f6f3ed" /></svg>
          </div>
        </section>

        <section className="member-stats member-progress-stats" aria-label="Progress highlights">
          <Stat icon={BookOpen} seed={10} tone="sage" label="Lessons completed" value={`${completedLessons}/${totalLessons}`} detail={activeVersion ? "Each one is a meaningful step" : "Start a course to track this"} decoration="pin" />
          <Stat icon={Target} seed={13} tone="gold" label="Chapters finished" value={`${completedChapters}/${totalChapters}`} detail={nextChapterTitle ? `Up next: ${nextChapterTitle}` : "Your chapter path awaits"} decoration="tape" warm />
          <Stat icon={Trophy} seed={16} tone="clay" label="Completed this week" value={`${completedThisWeek}`} detail="Lessons completed in 7 days" decoration="pin" />
          <Stat icon={Clock3} seed={19} tone="lilac" label="Learning time" value={learningTime} detail="Time spent in lesson steps" decoration="tape" warm />
        </section>

        <div className="member-section-divider">
          <div>
            <p className="member-eyebrow">YOUR PRACTICE, AT A GLANCE</p>
            <h2>Keep your <em>steady rhythm.</em></h2>
          </div>
          <div className="member-divider-handwriting">Small steps, strong roots <span aria-hidden="true">↗</span></div>
        </div>

        <div className="member-dashboard-grid member-progress-grid">
          <section className="member-panel member-progress-roadmap">
            <PaperSurface seed={21} warm />
            <PaperPin className="member-panel-pin" />
            <div className="member-panel-heading">
              <div><p className="member-eyebrow">COURSE ROADMAP</p><h2>Chapter by chapter</h2></div>
              <span className="member-status member-status-saved">{completedChapters} finished</span>
            </div>
            <p className="member-panel-description">A quiet record of the ground you have covered so far.</p>
            {chapters.length ? (
              <ol className="member-progress-chapter-list">
                {chapters.map((chapter) => {
                  const value = percent(chapter.done, chapter.total);
                  const isComplete = chapter.total > 0 && chapter.done === chapter.total;
                  return (
                    <li key={chapter.id} className="member-progress-chapter-row">
                      <div className="member-progress-chapter-top">
                        <span className={isComplete ? "member-progress-chapter-index is-complete" : "member-progress-chapter-index"}>
                          {isComplete ? <Check size={15} /> : String(chapter.sort_order).padStart(2, "0")}
                        </span>
                        <div className="member-progress-chapter-name">
                          <span>CHAPTER {chapter.sort_order}</span>
                          <h3>{chapter.title}</h3>
                        </div>
                        <span className="member-progress-chapter-count"><strong>{chapter.done}</strong>/{chapter.total}</span>
                      </div>
                      <div className="member-progress-chapter-track"><span style={{ width: `${value}%` }} /></div>
                      <div className="member-progress-chapter-foot"><span>{value}% complete</span><span>{isComplete ? "Chapter complete" : `${chapter.total - chapter.done} lessons remaining`}</span></div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <Empty text="Your chapter roadmap appears once a course is available." />
            )}
          </section>

          <section className="member-panel member-progress-reflections">
            <PaperSurface seed={24} />
            <PaperPin className="member-reflection-pin" />
            <div className="member-panel-heading">
              <div><p className="member-eyebrow">REFLECTION RHYTHM</p><h2>Your wellbeing notes</h2></div>
              <Brain className="member-progress-heading-icon" size={22} />
            </div>
            <p className="member-panel-description">Small check-ins and honest reflections are part of the journey, too.</p>
            <div className="member-progress-mini-grid">
              <MiniStat value={`${journalCount}`} label="Journal" icon={NotebookPen} />
              <MiniStat value={`${moodCount}`} label="Mood" icon={Brain} />
              <MiniStat value={`${insightCount}`} label="Insights" icon={Sparkles} />
            </div>
            <div className="member-progress-mood-card">
              <span className="member-progress-mood-icon"><Leaf size={18} /></span>
              <div><span>LATEST MOOD</span><strong>{latestMood ?? "No check-in yet"}</strong></div>
              <span className="member-progress-mood-date">{latestMoodDate ?? "—"}</span>
            </div>
            <div className="member-progress-quiz">
              <div><span>QUIZ ACCURACY</span><strong>{quizTotal ? `${quizAccuracy}%` : "—"}</strong></div>
              <div className="member-progress-quiz-track"><span style={{ width: `${quizAccuracy}%` }} /></div>
              <p>{quizTotal ? `${quizCorrect} correct from ${quizTotal} answers` : "Complete a quiz to track your learning."}</p>
            </div>
          </section>
        </div>

        <section className="member-panel member-progress-activity">
          <PaperSurface seed={27} warm />
          <PaperTape className="member-panel-tape" />
          <div className="member-panel-heading">
            <div><p className="member-eyebrow">THE LITTLE THINGS ADD UP</p><h2>Recent activity</h2></div>
            <span className="member-progress-activity-mark"><Sparkles size={17} /></span>
          </div>
          {activity.length ? (
            <ol className="member-progress-activity-grid">
              {activity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={`${item.type}-${item.at}-${index}`} className="member-progress-activity-item">
                    <span className="member-progress-activity-icon"><Icon size={16} /></span>
                    <div><p>{item.type}</p><time dateTime={item.at}>{shortDate(item.at)}</time></div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <Empty text="Your completed lessons, reflections, check-ins, and saved insights will appear here." />
          )}
        </section>
      </div>
    </MemberBoardMotion>
  );
}

function Stat({ icon: Icon, seed, tone, label, value, detail, decoration, warm = false }: { icon: LucideIcon; seed: number; tone: string; label: string; value: string; detail: string; decoration: "pin" | "tape"; warm?: boolean }) {
  return (
    <div className="member-stat member-progress-stat">
      <PaperSurface seed={seed} warm={warm} />
      {decoration === "pin" ? <PaperPin className="member-stat-pin" /> : <PaperTape className="member-stat-tape" />}
      <div className="member-stat-top"><span className={`member-stat-icon member-icon-${tone}`}><Icon size={18} /></span><span className="member-progress-stat-mark">MY MENTOR</span></div>
      <p className="member-progress-stat-label">{label}</p>
      <div className="member-stat-number">{value}</div>
      <div className="member-stat-detail">{detail}</div>
    </div>
  );
}

function MiniStat({ value, label, icon: Icon }: { value: string; label: string; icon: LucideIcon }) {
  return <div className="member-progress-mini-stat"><span className="member-progress-mini-icon"><Icon size={14} /></span><p>{value}</p><span>{label}</span></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="member-progress-empty">{text}</p>;
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
