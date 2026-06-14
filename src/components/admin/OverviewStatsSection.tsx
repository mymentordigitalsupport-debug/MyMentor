import {
  BookOpenText,
  CheckCheck,
  Heart,
  Lightbulb,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
  lineColor: string;
  fillColor: string;
  points: string;
};

const cards: StatCard[] = [
  {
    title: "Active Users",
    value: "124",
    change: "12% vs last 7 days",
    icon: Users,
    iconColor: "text-[#6C8A5C]",
    iconBackground: "bg-[#EFF4E8]",
    lineColor: "#7A9A67",
    fillColor: "rgba(122, 154, 103, 0.22)",
    points: "8,56 38,48 68,34 98,12 128,38 148,22 172,36 194,18 222,42 242,14",
  },
  {
    title: "Courses in progress",
    value: "86",
    change: "8% vs last 7 days",
    icon: BookOpenText,
    iconColor: "text-[#CB8D2E]",
    iconBackground: "bg-[#FBF1E2]",
    lineColor: "#D29B46",
    fillColor: "rgba(210, 155, 70, 0.22)",
    points: "8,54 32,50 58,54 82,30 110,44 136,58 160,40 182,46 210,24 242,38",
  },
  {
    title: "Lessons completed",
    value: "532",
    change: "14% vs last 7 days",
    icon: CheckCheck,
    iconColor: "text-[#5E8A5A]",
    iconBackground: "bg-[#EEF4E8]",
    lineColor: "#739A6D",
    fillColor: "rgba(115, 154, 109, 0.22)",
    points: "8,58 34,52 58,50 84,26 112,46 138,32 166,44 192,38 218,42 242,20",
  },
  {
    title: "Reflections created",
    value: "432",
    change: "18% vs last 7 days",
    icon: Heart,
    iconColor: "text-[#DE7E66]",
    iconBackground: "bg-[#FBEDEA]",
    lineColor: "#E58671",
    fillColor: "rgba(229, 134, 113, 0.22)",
    points: "8,54 34,50 58,32 86,52 112,58 138,40 164,50 188,24 214,46 242,16",
  },
  {
    title: "Insightes saved",
    value: "289",
    change: "16% vs last 7 days",
    icon: Lightbulb,
    iconColor: "text-[#D79B2C]",
    iconBackground: "bg-[#FCF2DE]",
    lineColor: "#E0A73E",
    fillColor: "rgba(224, 167, 62, 0.22)",
    points: "8,56 32,40 58,48 84,22 112,44 138,52 166,30 192,44 218,18 242,30",
  },
];

function Sparkline({ points, lineColor, fillColor }: Pick<StatCard, "points" | "lineColor" | "fillColor">) {
  const gradientId = `fade-${lineColor.replace(/[^a-zA-Z0-9]/g, "")}`;
  const pointList = points.split(" ");
  const firstPoint = pointList[0];
  const lastPoint = pointList[pointList.length - 1];
  const [firstX] = firstPoint.split(",");
  const [lastX] = lastPoint.split(",");

  return (
    <svg viewBox="0 0 250 72" className="h-[72px] w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fillColor} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <polygon
        points={`${firstX},66 ${points} ${lastX},66`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pointList.map((point) => {
        const [cx, cy] = point.split(",");

        return <circle key={point} cx={cx} cy={cy} r="3.2" fill={lineColor} />;
      })}
    </svg>
  );
}

export function OverviewStatsSection() {
  return (
    <section className={`${openSans.className} grid gap-4 md:grid-cols-2 xl:grid-cols-5`}>
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="relative h-[232px] overflow-hidden rounded-[26px] border border-[#EDE7DE] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(16,24,40,0.04)]"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.iconBackground}`}
              >
                <Icon className={`h-5 w-5 ${card.iconColor}`} strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#262626]">{card.title}</p>
                <p className="mt-2 text-[2.5rem] leading-none tracking-[-0.04em] text-black">{card.value}</p>
                <p className="mt-2 text-[14px] font-semibold text-[#6F8B61]">
                  <span aria-hidden="true">↑ </span>
                  {card.change}
                </p>
              </div>
            </div>

            <div className="absolute bottom-3 left-4 right-4">
              <Sparkline
                points={card.points}
                lineColor={card.lineColor}
                fillColor={card.fillColor}
              />
            </div>
          </article>
        );
      })}
    </section>
  );
}
