export const christianAudioChapters = [
  {
    number: 1,
    title: "The Stage of Creation",
    lessons: [
      "God's Original Design for Humanity",
      "Created in the Image of God",
      "The Purpose of Life",
      "The Garden of Eden",
      "Freedom, Choice, and Responsibility",
      "The First Temptation",
      "The Fall of Man",
      "The Consequences of Disobedience",
      "God's Creation and the Plant Kingdom",
      "Understanding the Origins of Drug Abuse",
    ],
  },
  {
    number: 2,
    title: "The Tree of Knowledge of Good and Evil",
    lessons: [
      "Understanding the Forbidden Tree",
      "The Entrance of Sin",
      "How Sin Changed Human Nature",
      "Spiritual Death Explained",
      "The Inheritance of a Fallen Nature",
      "Drug Abuse and the Human Condition",
      "Recognizing the Fruit of Destructive Choices",
      "God's Plan for Restoration",
    ],
  },
  {
    number: 3,
    title: "The Concept of Abuse",
    lessons: [
      "What Is Abuse?",
      "The Difference Between Use and Abuse",
      "The Abusive Nature of Sin",
      "Self-Destruction and Addiction",
      "Hidden Abuse of the Heart",
      "Thoughts That Lead to Bondage",
      "Identifying Personal Strongholds",
      "Taking Responsibility for Change",
    ],
  },
  {
    number: 4,
    title: "The Real Reason People Do Drugs",
    lessons: [
      "Looking Beyond the Substance",
      "The Search for Escape",
      "Pain, Trauma, and Brokenness",
      "Spiritual Emptiness",
      "The Desire to Belong",
      "False Comforts and False Solutions",
      "Satan's Deception Through Addiction",
      "Discovering the Real Need of the Heart",
    ],
  },
  {
    number: 5,
    title: "The Stages of Drug Abuse",
    lessons: [
      "Understanding the Drug Addiction Journey",
      "Curiosity and Experimentation",
      "Repeated Use and Habit Formation",
      "Dependency and Bondage",
      "The Progression to Addiction",
      "Losing Control",
      "The Cost of Sin and Addiction",
      "Recognizing Where You Are",
      "God's Way Out",
    ],
  },
  {
    number: 6,
    title: "Spiritual Eyes of the Evil Nature",
    lessons: [
      "Spiritual Awareness and Influence",
      "How Addiction Distorts Perception",
      "The Nature of Deception",
      "Shame, Fear and Guilt",
      "The Voice of Condemnation",
      "Recognizing Spiritual Blindness",
      "Seeing Through God's Truth",
    ],
  },
  {
    number: 7,
    title: "The Two Laws",
    lessons: [
      "The Law of Sin and Death",
      "The Law of the Spirit of Life",
      "The Inner Conflict",
      "Flesh Versus Spirit",
      "Daily Choices and Consequences",
      "Walking in Obedience",
      "Living Under God's Grace",
    ],
  },
  {
    number: 8,
    title: "The Spiritual War",
    lessons: [
      "Understanding Spiritual Warfare",
      "The Enemy's Strategies",
      "Temptation and Resistance",
      "Strongholds and Bondage",
      "The Armor of God",
      "Victory Through Christ",
      "Standing Firm in Recovery",
    ],
  },
  {
    number: 9,
    title: "The Mind Battlefield",
    lessons: [
      "Renewing the Mind",
      "Identifying Harmful Thought Patterns",
      "Taking Thoughts Captive",
      "Managing Cravings Through Truth",
      "Replacing Lies with Scripture",
      "Building Godly Thinking",
      "Developing Emotional Maturity",
      "Long-Term Freedom and Stability",
    ],
  },
  {
    number: 10,
    title: "The Tree of Life",
    lessons: [
      "Christ as the Source of Life",
      "Returning to God's Design",
      "The Gift of Salvation",
      "Receiving God's Grace",
      "Spiritual Growth and Healing",
      "Living a Fruitful Life",
      "Walking in Newness of Life",
    ],
  },
  {
    number: 11,
    title: "Love",
    lessons: [
      "Understanding God's Love",
      "Receiving Love and Acceptance",
      "Loving Yourself Through God's Eyes",
      "Forgiveness and Healing",
      "Loving Others Well",
      "Restoring Relationships",
      "Living a Life of Compassion",
      "Walking in Love Daily",
    ],
  },
] as const;

export function normalizeAudioTitle(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

export function audioSlug(value: string) {
  return normalizeAudioTitle(value).replace(/\s+/g, "-");
}
