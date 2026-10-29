export const THREAD_TOPICS = [
  { name: "Mindset", count: 124, tone: "mindset" },
  { name: "Career", count: 312, tone: "career" },
  { name: "Learning", count: 208, tone: "learning" },
  { name: "Life", count: 176, tone: "life" },
  { name: "Community", count: 98, tone: "community" },
] as const;

export type ThreadTopic = typeof THREAD_TOPICS[number]["name"];
export type DemoComment = { id: string; author: string; body: string; parentId: string | null };
export type CommunityPost = {
  id: string;
  topic: ThreadTopic;
  title: string;
  body: string;
  author: string;
  avatar: "patrick" | "arjun" | "nadia" | "daniel" | "you";
  age: string;
  order: number;
  commentCount: number;
  likes: number;
  liked: boolean;
  disliked: boolean;
  saved: boolean;
  comments: DemoComment[];
  attachment?: { url: string; type: "image" | "video"; name: string };
};

// UI fixtures only. Keep the presentation model independent of a future DB adapter.
export const DEMO_THREADS: CommunityPost[] = [
  {
    id: "career-change", topic: "Career", title: "Switching careers at 30+ — is it worth it?",
    body: "For those who made a career switch later in life, how did you handle the uncertainty? Would love to hear your experiences and advice.",
    author: "Patrick S.", avatar: "patrick", age: "2h ago", order: 4, commentCount: 24, likes: 58,
    liked: false, disliked: false, saved: false,
    comments: [
      { id: "career-1", author: "Nadia K.", body: "I made the switch at 34. Talking to people already in the field helped me take the first small step.", parentId: null },
      { id: "career-2", author: "Daniel R.", body: "Giving myself a few months to learn alongside my current work made it feel much more manageable.", parentId: null },
    ],
  },
  {
    id: "finding-consistency", topic: "Mindset", title: "How do you stay consistent when motivation fades?",
    body: "I’ve been struggling to keep up with my goals lately. What routines or mindset shifts have helped you stay consistent over time?",
    author: "Arjun M.", avatar: "arjun", age: "5h ago", order: 3, commentCount: 18, likes: 42,
    liked: false, disliked: false, saved: false,
    comments: [
      { id: "mindset-1", author: "Patrick S.", body: "I make the goal small enough to do on a difficult day. Five minutes still counts.", parentId: null },
      { id: "mindset-2", author: "Nadia K.", body: "A regular time helps me more than waiting to feel motivated. And I try to be kind to myself when I miss a day.", parentId: null },
    ],
  },
  {
    id: "learning-together", topic: "Learning", title: "Best resources to learn web development in 2026?",
    body: "Looking for up-to-date, beginner-friendly resources. Open to free and paid options. What actually worked for you?",
    author: "Nadia K.", avatar: "nadia", age: "1d ago", order: 2, commentCount: 46, likes: 71,
    liked: false, disliked: false, saved: false,
    comments: [
      { id: "learning-1", author: "Arjun M.", body: "Building a tiny project while I learn has helped things stick. It’s also nice to have someone to share questions with.", parentId: null },
    ],
  },
  {
    id: "a-little-self-kindness", topic: "Life", title: "How do you deal with self-doubt?",
    body: "Some days I feel like I’m not doing enough. Would love to hear how you manage self-doubt and stay kind to yourself.",
    author: "Daniel R.", avatar: "daniel", age: "2d ago", order: 1, commentCount: 28, likes: 64,
    liked: false, disliked: false, saved: false,
    comments: [
      { id: "life-1", author: "Nadia K.", body: "I keep a little note of things I’ve already made it through. Progress can be hard to see when you’re in the middle of it.", parentId: null },
    ],
  },
];

export const COMMUNITY_GUIDELINES = [
  { title: "Be kind. Share honestly.", text: "Meet each other with patience. No bullying, harassment, hate speech, or shaming." },
  { title: "Respect different perspectives.", text: "Listen with curiosity. You can disagree while still respecting the person behind the post." },
  { title: "Protect everyone’s privacy.", text: "Share your own experiences. Keep other people’s names, contact details, and private stories private." },
  { title: "Keep this a supportive space.", text: "No spam, scams, graphic content, or promotion of harmful behaviour. Share encouragement rather than medical advice." },
  { title: "Know when to seek more support.", text: "This community offers peer support. If you or someone else is in immediate danger, contact your local emergency services." },
];
