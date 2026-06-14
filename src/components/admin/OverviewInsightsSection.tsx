import { ChevronDown, ArrowRight, Info } from "lucide-react";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type CourseRow = {
  title: string;
  subtitle: string;
  avgProgress: number;
  completionRate: number;
  barColor: string;
  trendColor: string;
  trendPoints: string;
  thumbnail: string;
};

const courses: CourseRow[] = [
  {
    title: "Uprooting Drug Abuse",
    subtitle: "Christian Guided",
    avgProgress: 78,
    completionRate: 72,
    barColor: "#6D8E63",
    trendColor: "#7A9A67",
    trendPoints: "4,28 18,22 32,24 46,10 60,20 74,8 88,16 102,12",
    thumbnail: "bg-[linear-gradient(180deg,#d7d2ba_0%,#a0a077_100%)]",
  },
  {
    title: "From Addicts to Leaders",
    subtitle: "Religious Guidance",
    avgProgress: 64,
    completionRate: 58,
    barColor: "#D69A3E",
    trendColor: "#D69A3E",
    trendPoints: "4,26 18,22 32,24 46,10 60,20 74,22 88,14 102,10",
    thumbnail: "bg-[linear-gradient(180deg,#d9dfc8_0%,#8f845d_100%)]",
  },
  {
    title: "Protecting the Next Generation",
    subtitle: "Christian Guided",
    avgProgress: 48,
    completionRate: 41,
    barColor: "#D56E67",
    trendColor: "#EA8572",
    trendPoints: "4,26 18,22 32,24 46,10 60,20 74,22 88,14 102,10",
    thumbnail: "bg-[linear-gradient(180deg,#cfc7bd_0%,#5e5243_100%)]",
  },
];

const emotionalSeries = [
  { label: "Hopeful", color: "#8AA590", values: [18, 20, 19, 21, 23, 28, 24] },
  { label: "Steady", color: "#BAC39B", values: [18, 18, 20, 17, 16, 14, 18] },
  { label: "Confused", color: "#F1C66D", values: [20, 16, 17, 19, 18, 17, 19] },
  { label: "Overwhelmed", color: "#F7AF95", values: [18, 18, 17, 15, 18, 14, 16] },
  { label: "Struggling", color: "#DC8979", values: [18, 20, 18, 18, 17, 14, 19] },
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CourseTrend({ points, color }: { points: string; color: string }) {
  return (
    <svg viewBox="0 0 108 34" className="h-9 w-[86px]" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.split(" ").map((point) => {
        const [cx, cy] = point.split(",");

        return <circle key={point} cx={cx} cy={cy} r="2.1" fill={color} />;
      })}
    </svg>
  );
}

function buildStackedAreas() {
  const width = 560;
  const height = 220;
  const bottom = 188;
  const stepX = 82;

  const cumulative = Array.from({ length: emotionalSeries[0].values.length }, () => 0);

  return emotionalSeries
    .slice()
    .reverse()
    .map((series) => {
      const topPoints = series.values.map((value, index) => {
        cumulative[index] += value;
        const x = 16 + index * stepX;
        const y = bottom - (cumulative[index] / 100) * height;
        return `${x},${y}`;
      });

      const bottomPoints = [...topPoints]
        .reverse()
        .map((_, reverseIndex) => {
          const index = topPoints.length - 1 - reverseIndex;
          const below = cumulative[index] - series.values[index];
          const x = 16 + index * stepX;
          const y = bottom - (below / 100) * height;
          return `${x},${y}`;
        });

      return {
        label: series.label,
        color: series.color,
        points: [...topPoints, ...bottomPoints].join(" "),
      };
    });
}

const areaPaths = buildStackedAreas();

export function OverviewInsightsSection() {
  return (
    <section className={`${openSans.className} grid gap-5 xl:grid-cols-[1fr_1.15fr]`}>
      <article className="rounded-[28px] border border-[#EDE7DE] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(16,24,40,0.04)]">
        <div className="flex items-center gap-3">
          <h2 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#2A2A2A]">Course Health</h2>
          <Info className="h-4 w-4 text-[#B4B0A6]" />
        </div>

        <div className="mt-8 grid grid-cols-[1.5fr_0.95fr_0.8fr_0.5fr] gap-4 border-b border-[#EEE8E0] pb-3 text-[12px] font-semibold text-[#5F5F5F]">
          <p>Course</p>
          <p>Avg Progress</p>
          <p>Completion Rate</p>
          <p>Trend</p>
        </div>

        <div>
          {courses.map((course, index) => (
            <div
              key={course.title}
              className={`grid grid-cols-[1.5fr_0.95fr_0.8fr_0.5fr] gap-4 py-4 ${index < courses.length - 1 ? "border-b border-[#F2ECE4]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 shrink-0 rounded-xl ${course.thumbnail}`} />
                <div>
                  <p className="text-[12px] font-semibold text-[#2F2F2F]">{course.title}</p>
                  <p className="mt-1 text-[11px] text-[#6A6A6A]">{course.subtitle}</p>
                </div>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[#2F2F2F]">{course.avgProgress}%</p>
                <div className="mt-3 h-[5px] w-[120px] rounded-full bg-[#ECE7E0]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${course.avgProgress}%`, backgroundColor: course.barColor }}
                  />
                </div>
              </div>

              <p className="pt-0.5 text-[12px] font-semibold text-[#2F2F2F]">{course.completionRate}%</p>

              <div className="pt-0.5">
                <CourseTrend points={course.trendPoints} color={course.trendColor} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button type="button" className="inline-flex items-center gap-2 text-[12px] font-medium text-[#5A5A5A]">
            <span>View all courses</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </article>

      <article className="rounded-[28px] border border-[#EDE7DE] bg-white px-6 py-5 shadow-[0_10px_24px_rgba(16,24,40,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#2A2A2A]">Emotional Pulse</h2>
            <Info className="h-4 w-4 text-[#B4B0A6]" />
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-3 rounded-xl border border-[#E6E0D7] bg-white px-4 py-3 text-[12px] font-semibold text-[#3C3C3C]"
          >
            <span>Last 7 days</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-6">
          {emotionalSeries.map((series) => (
            <div key={series.label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: series.color }} />
              <span className="text-[12px] text-[#5F5F5F]">{series.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-[52px_1fr] gap-3">
          <div className="flex flex-col justify-between pb-8 pt-1 text-[12px] font-semibold text-[#6A6A6A]">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          <div>
            <svg viewBox="0 0 590 240" className="h-[240px] w-full" aria-hidden="true">
              <line x1="16" y1="8" x2="16" y2="188" stroke="#E9E3DA" strokeWidth="1.5" />
              <line x1="16" y1="188" x2="576" y2="188" stroke="#E9E3DA" strokeWidth="1.5" />
              {areaPaths.map((path) => (
                <polygon key={path.label} points={path.points} fill={path.color} opacity="0.8" />
              ))}
            </svg>

            <div className="mt-2 grid grid-cols-7 text-[12px] font-semibold text-[#6A6A6A]">
              {dayLabels.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

