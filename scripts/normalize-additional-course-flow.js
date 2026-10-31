const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const COURSE_CONFIGS = [
  {
    manifestPath: path.join(
      ROOT,
      "public/3 summarized books/From Addicts to Leaders/lesson-information/seed-manifest.json"
    ),
    audienceNoun: "recovery",
    actionFrame: "responsible change",
    moodFrame: "steady and responsible",
    videoFrame:
      "Explain the lesson in a calm mentor voice. Connect the teaching to daily recovery, character, trust, responsibility, and visible change.",
    trueFalseWrong: "Recovery is only about stopping destructive behavior.",
  },
  {
    manifestPath: path.join(
      ROOT,
      "public/3 summarized books/Protecting the Next Generation/lesson-information/seed-manifest.json"
    ),
    audienceNoun: "prevention",
    actionFrame: "protective care",
    moodFrame: "calm and prepared",
    videoFrame:
      "Explain the lesson in a practical mentor voice. Connect the teaching to awareness, communication, boundaries, relationship, and prevention before crisis.",
    trueFalseWrong: "Protection works best when adults ignore warning signs until a crisis happens.",
  },
];

function sentence(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function block(lesson, type) {
  return lesson.blocks.find((item) => item.type === type);
}

function textAt(lesson, type, field, fallback = "") {
  return sentence(block(lesson, type)?.content?.[field] || fallback);
}

function plainText(value) {
  return String(value || "")
    .replace(/\\"/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function quiz(question, correct, incorrectOptions) {
  return {
    type: "quiz",
    content: {
      question,
      options: [
        { text: correct, is_correct: true },
        ...incorrectOptions.map((text) => ({ text, is_correct: false })),
      ],
    },
  };
}

function buildReflectionQuote(config, lesson) {
  const note = textAt(lesson, "mentor_note", "note");
  if (note) return plainText(note);

  return `This lesson is not asking for perfection. It is asking for honest ${config.actionFrame} that can be practiced today.`;
}

function buildSecondQuote(config, lesson) {
  const complete = block(lesson, "complete")?.content || {};
  const encouragement = sentence(complete.encouragement || "");
  if (encouragement) return plainText(encouragement);

  return `Small faithful steps matter. When ${config.audienceNoun} becomes practical, it starts shaping choices after the lesson is finished.`;
}

function buildVideo(config, lesson) {
  const title = lesson.title;
  const readingTitle = block(lesson, "reading")?.content?.title || title;

  return {
    type: "video",
    content: {
      title,
      description: `${config.videoFrame} Use "${readingTitle}" as the main idea, then give one practical example the learner can recognize in ordinary life.`,
    },
  };
}

function buildMood(config, lesson) {
  return {
    type: "mood_checkin",
    content: {
      question: `How ${config.moodFrame} do you feel about practicing ${lesson.title.toLowerCase()} today?`,
    },
  };
}

function buildQuizzes(config, chapter, lesson) {
  const readingTitle = block(lesson, "reading")?.content?.title || lesson.title;
  const actionTitle = block(lesson, "daily_action")?.content?.title || "the action step";

  return [
    quiz(
      `What is the main focus of this lesson?`,
      lesson.title,
      [chapter.title, "Avoiding all reflection", "Finishing quickly"]
    ),
    quiz(
      `What should this lesson lead toward?`,
      config.actionFrame,
      ["More shame", "Less awareness", "Ignoring responsibility"]
    ),
    quiz(
      `True or False: ${config.trueFalseWrong}`,
      "False",
      ["True"]
    ),
  ].map((item, index) => {
    if (index === 0) {
      item.content.options[0].text = `${lesson.title} through ${readingTitle}`;
    }
    if (index === 1) {
      item.content.options[0].text = `${config.actionFrame} shown through ${actionTitle}`;
    }
    return item;
  });
}

function normalizeLesson(config, chapter, lesson) {
  const welcome = block(lesson, "welcome") || {
    type: "welcome",
    content: {
      heading: lesson.title,
      message: `This lesson begins ${lesson.title}.`,
    },
  };
  const reading = block(lesson, "reading") || {
    type: "reading",
    content: {
      title: lesson.title,
      body: chapter.description,
    },
  };
  const pauseReflect = block(lesson, "pause_reflect") || {
    type: "pause_reflect",
    content: {
      question: `Where does ${lesson.title.toLowerCase()} apply in your life right now?`,
      context: "Answer honestly and specifically.",
    },
  };
  const journal = block(lesson, "journal_prompt") || {
    type: "journal_prompt",
    content: {
      prompt: `Write about ${lesson.title.toLowerCase()} and one practical next step.`,
    },
  };
  const action = block(lesson, "daily_action") || {
    type: "daily_action",
    content: {
      title: "Today's Action Step",
      action: `Choose one practical way to apply ${lesson.title.toLowerCase()} today.`,
    },
  };
  const complete = block(lesson, "complete") || {
    type: "complete",
    content: {
      message: `You completed ${lesson.title}.`,
      encouragement: "Carry the lesson into one honest action today.",
    },
  };
  const [quizOne, quizTwo, quizThree] = buildQuizzes(config, chapter, lesson);

  lesson.estimatedMinutes = Math.max(Number(lesson.estimatedMinutes) || 0, 15);
  lesson.blocks = [
    welcome,
    reading,
    {
      type: "mentor_note",
      content: {
        note: buildReflectionQuote(config, lesson),
      },
    },
    buildVideo(config, lesson),
    pauseReflect,
    journal,
    buildMood(config, lesson),
    action,
    {
      type: "mentor_note",
      content: {
        note: buildSecondQuote(config, lesson),
      },
    },
    quizOne,
    quizTwo,
    quizThree,
    complete,
  ];
}

for (const config of COURSE_CONFIGS) {
  const manifest = JSON.parse(fs.readFileSync(config.manifestPath, "utf8"));

  for (const chapter of manifest.chapters) {
    for (const lesson of chapter.lessons) {
      normalizeLesson(config, chapter, lesson);
    }
  }

  fs.writeFileSync(config.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Normalized ${path.relative(ROOT, config.manifestPath)}`);
}
