const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const COURSE_CONFIGS = [
  {
    manifestPath: path.join(
      ROOT,
      "public/3 summarized books/From Addicts to Leaders/lesson-information/seed-manifest.json"
    ),
    audience:
      "someone rebuilding life after addiction and learning to live with responsibility, trust, and purpose",
    courseFrame:
      "This course is about moving beyond survival into steady leadership of self, family, and daily responsibility.",
    tone:
      "Speak with firmness and hope. Emphasize character, responsibility, trust, humility, service, and practical rebuilding.",
  },
  {
    manifestPath: path.join(
      ROOT,
      "public/3 summarized books/Protecting the Next Generation/lesson-information/seed-manifest.json"
    ),
    audience:
      "a parent, guardian, caregiver, or adult who wants to protect young people before crisis begins",
    courseFrame:
      "This course is about prevention, watchfulness, communication, boundaries, and building a safer home environment.",
    tone:
      "Speak calmly and practically. Emphasize awareness without panic, protection without control, and guidance through relationship.",
  },
];

function sentence(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function getBlock(lesson, type) {
  return lesson.blocks.find((block) => block.type === type);
}

function existing(block, field) {
  return sentence(block?.content?.[field] || "");
}

function expandWelcome(config, chapter, lesson, block) {
  const heading = block.content.heading || lesson.title;
  const message = existing(block, "message");
  block.content.message = [
    message,
    `This lesson sits inside ${chapter.title}, where the focus is ${chapter.description.toLowerCase()}`,
    `For ${config.audience}, this matters because growth is not created by information alone. It grows when truth becomes something you can recognize, practice, and return to in ordinary moments.`,
    `As you begin, do not rush to prove that you already understand the lesson. Let the topic name something honestly. Notice where it touches your story, your habits, your relationships, and the way you respond when life becomes difficult.`,
  ].join(" ");
  block.content.heading = heading;
}

function expandReading(config, chapter, lesson, block) {
  const title = block.content.title || lesson.title;
  const base = existing(block, "body");
  block.content.body = [
    base,
    `${config.courseFrame} The theme of this lesson is not meant to remain a slogan. It is meant to become a practical lens for daily life. When this truth is taken seriously, it changes the way a person interprets pressure, choices, relationships, and responsibility.`,
    `A shallow response would be to agree with the idea and move on. A deeper response asks, "Where does this need to become visible in me?" That question matters because lasting change is usually built in ordinary places: the conversation you handle differently, the boundary you keep, the apology you make, the temptation you interrupt, or the small responsibility you finally carry without excuse.`,
    `The chapter context is important here: ${chapter.description} This means the lesson is not standing alone. It is part of a larger movement from awareness into practice. You are learning to see patterns clearly, name what is unhealthy, and choose a response that supports a stronger future.`,
    `In practical terms, this lesson asks you to slow down enough to notice what has been shaping your choices. Some patterns are obvious, but many are quiet. They show up in tone, delay, avoidance, defensiveness, secrecy, fear, control, or the need to escape discomfort. Growth begins when those patterns are brought into the light without shame and without denial.`,
    `The goal is not perfection by the end of the lesson. The goal is honest movement. Take one clear idea from this teaching and connect it to one real situation in your life. If you can name where it applies, you can begin practicing it. If you can practice it repeatedly, it can become part of your character and not only part of your knowledge.`,
  ].join("\n\n");
  block.content.title = title;
}

function expandMentorNote(config, lesson, block) {
  const note = existing(block, "note");
  block.content.note = [
    note,
    `Do not underestimate the importance of one honest adjustment. Most people want change to arrive all at once, but deep change is usually formed through repeated choices that seem small at first.`,
    `Let this lesson become a mirror, not a weapon. A mirror helps you see clearly so you can respond wisely. It is not there to condemn you; it is there to help you stop living blindly.`,
  ].join(" ");
}

function expandPauseReflect(config, lesson, block) {
  const question = block.content.question || `How does ${lesson.title.toLowerCase()} apply to your life right now?`;
  const context = existing(block, "context");
  block.content.question = question;
  block.content.context = [
    context,
    `Take a few minutes before answering. Think about a real situation from the last week, not only a general idea. Where did this lesson show up in your choices, words, thoughts, or relationships?`,
    `Try to answer without defending yourself and without attacking yourself. The most useful reflection is specific, honest, and kind enough to lead to action. If you notice discomfort, pay attention to it. It may be pointing to an area where growth is ready to begin.`,
  ].join(" ");
}

function expandJournalPrompt(config, lesson, block) {
  const prompt = sentence(block.content.prompt || `Write about ${lesson.title.toLowerCase()}.`);
  block.content.prompt = [
    prompt,
    `Use concrete examples rather than broad statements. Describe what has been happening, how you usually respond, and what a healthier response could look like. Then write one sentence beginning with, "The next faithful step I can take is..."`,
  ].join(" ");
}

function expandDailyAction(config, lesson, block) {
  const title = block.content.title || "Practice the lesson";
  const action = existing(block, "action");
  block.content.title = title;
  block.content.action = [
    action,
    `Make the action small enough to complete today and clear enough that you will know whether you did it. Do not choose something vague like "be better." Choose a visible action: make the call, write the apology, set the boundary, ask the question, finish the task, remove the trigger, or create the routine.`,
    `At the end of the day, notice what happened. What was easy? What resisted you? What did you learn about yourself? That review is part of the action because it turns experience into wisdom.`,
  ].join(" ");
}

function expandComplete(config, lesson, block) {
  const message = existing(block, "message");
  const encouragement = existing(block, "encouragement");
  block.content.message = message || `You completed ${lesson.title}.`;
  block.content.encouragement = [
    encouragement,
    `Carry this lesson gently but seriously. You do not need to master everything today, but you do need to keep moving with honesty. One lesson becomes powerful when it is practiced after the screen is closed.`,
    `Let the next step be simple, visible, and true.`,
  ].join(" ");
}

function expandLesson(config, chapter, lesson) {
  lesson.estimatedMinutes = Math.max(Number(lesson.estimatedMinutes) || 0, 12);

  for (const block of lesson.blocks) {
    switch (block.type) {
      case "welcome":
        expandWelcome(config, chapter, lesson, block);
        break;
      case "reading":
        expandReading(config, chapter, lesson, block);
        break;
      case "mentor_note":
        expandMentorNote(config, lesson, block);
        break;
      case "pause_reflect":
        expandPauseReflect(config, lesson, block);
        break;
      case "journal_prompt":
        expandJournalPrompt(config, lesson, block);
        break;
      case "daily_action":
        expandDailyAction(config, lesson, block);
        break;
      case "complete":
        expandComplete(config, lesson, block);
        break;
      default:
        break;
    }
  }
}

for (const config of COURSE_CONFIGS) {
  const manifest = JSON.parse(fs.readFileSync(config.manifestPath, "utf8"));

  for (const chapter of manifest.chapters) {
    for (const lesson of chapter.lessons) {
      expandLesson(config, chapter, lesson);
    }
  }

  fs.writeFileSync(config.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Expanded ${path.relative(ROOT, config.manifestPath)}`);
}
