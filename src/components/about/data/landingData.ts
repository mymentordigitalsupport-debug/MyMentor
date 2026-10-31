export interface CoursePathway {
  id: string;
  courseNumber: string;
  title: string;
  subtitle: string;
  description: string;
  chaptersCount: number;
  lessonsCount: number;
  format: string;
  tag: string;
  chapters: {
    number: number;
    title: string;
    summary: string;
    actionItem: string;
  }[];
}

export interface Pillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

export const MY_MENTOR_DATA = {
  brand: {
    name: "My Mentor",
    tagline: "Walk with purpose. Build with clarity.",
    subtagline: "Guidance, structure, and daily action that keep people moving forward.",
    missionStatement:
      "Because transformation should never be walked alone. My Mentor exists for people who need a guide, not a lecture. It brings together books, course structure, chapter flow, and daily action so growth becomes practical instead of theoretical.",
  },
  hero: {
    headlineLine1: "WE TRANSFORM",
    headlineLine2: "TOGETHER",
    subtext:
      "Because transformation should never be walked alone. Guidance, structure, and daily action that keep people moving from survival into purpose.",
  },
  pillars: [
    {
      id: "pillar-truth",
      title: "Truth",
      subtitle: "HONEST & DIRECT",
      description: "The kind that confronts without shaming and clarifies without noise.",
    },
    {
      id: "pillar-structure",
      title: "Structure",
      subtitle: "DAILY MOMENTUM",
      description: "A steady sequence of chapters, lessons, and actions that keeps people moving.",
    },
    {
      id: "pillar-care",
      title: "Care",
      subtitle: "HUMANE & SAFE",
      description: "A platform that feels humane, honest, and safe enough to keep using.",
    },
  ] as Pillar[],
  founder: {
    name: "Craig",
    title: "Owner and builder of My Mentor",
    quote: "“I wrote these courses to help people walk out of survival and into purpose.”",
    bio: "Craig built My Mentor on the belief that people heal when truth is clear, structure is steady, and support is honest. The platform is the expression of that conviction.",
    pillars: [
      { label: "Trust", desc: "Clear direction and dependable design." },
      { label: "Care", desc: "A tone that respects the person." },
      { label: "Service", desc: "Built to help others move forward." },
    ],
    tags: [
      { text: "Truth & Structure", position: "top-left" },
      { text: "Daily Action", position: "bottom-left" },
      { text: "Humane Care", position: "top-right" },
      { text: "Built in Service", position: "bottom-right" },
    ],
  },
  courses: [
    {
      id: "uprooting-drug-abuse",
      courseNumber: "01",
      title: "Uprooting Drug Abuse",
      subtitle: "A biblical and practical framework for understanding addiction, breaking bondage, and restoring people.",
      description:
        "Addiction isolates by convincing you that your struggle is permanent. This course provides a ruthless diagnosis paired with deep compassion—breaking down the physical, emotional, and spiritual root systems of chemical dependency and replacing them with daily, unshakeable action.",
      chaptersCount: 11,
      lessonsCount: 87,
      format: "Deep, full-length course",
      tag: "Selected Course",
      chapters: [
        {
          number: 1,
          title: "The Illusion of Control & The Anatomy of Bondage",
          summary: "Unmasking the internal narrative of denial and pinpointing where genuine surrender begins.",
          actionItem: "The Honest Inventory: Documenting the exact triggers and physical cost of isolation.",
        },
        {
          number: 2,
          title: "Dismantling the False Refuge",
          summary: "Examining why substances became the coping mechanism and confronting the pain beneath.",
          actionItem: "The Root Identification Worksheet: Separating the symptom from the emotional wound.",
        },
        {
          number: 3,
          title: "The Neurobiology of Urges & Spiritual Anchor",
          summary: "Understanding how dopamine hijack happens in the brain and how spiritual truth stabilizes the storm.",
          actionItem: "The 10-Minute Urge-Surfing Protocol with guided breath and grounding scriptures.",
        },
        {
          number: 4,
          title: "Severing the Access Chains",
          summary: "Building an unbreachable physical environment: contacts, cash, routes, and toxic associations.",
          actionItem: "The Safety Perimeter Audit: Removing 100% of compromised access channels today.",
        },
        {
          number: 5,
          title: "Breaking the Secrecy Contract",
          summary: "Why recovery dies in darkness and how to choose trusted mentors who won't enable self-destruction.",
          actionItem: "The Vulnerability Call: Initiating one honest confession without defensive caveats.",
        },
        {
          number: 6,
          title: "Rebuilding the Shattered Daily Routine",
          summary: "Replacing chaotic idle hours with structured morning, midday, and evening anchors.",
          actionItem: "The 24-Hour Rhythm Template: Establishing non-negotiable sleep, physical work, and reflection.",
        },
        {
          number: 7,
          title: "Guilt, Shame, and True Restitution",
          summary: "Distinguishing between toxic self-pity and holy sorrow that produces lasting amends.",
          actionItem: "The Restitution Hierarchy: Mapping who was harmed and the right timing for repair.",
        },
        {
          number: 8,
          title: "Handling the Inevitable High-Pressure Storm",
          summary: "What to do when grief, betrayal, or acute stress tempts you back toward the cliff.",
          actionItem: "The Emergency Action Card: A physical pocket sequence to execute before making any decision.",
        },
        {
          number: 9,
          title: "Renewing the Thought Architecture",
          summary: "Rewiring automatic negative thought loops through repetitive biblical and rational truth.",
          actionItem: "Cognitive Replacement Drills: Converting 3 recurring lie patterns into grounded reality.",
        },
        {
          number: 10,
          title: "From Relapse Fear to Solidified Conviction",
          summary: "Transitioning out of white-knuckle anxiety into a deep, peaceful identity of freedom.",
          actionItem: "The Personal Constitution: Writing your non-negotiable boundaries and core life creed.",
        },
        {
          number: 11,
          title: "The Call to Serve: Turning Scars into Bread",
          summary: "Entering the final stage where your past brokenness becomes the very tool that rescues others.",
          actionItem: "Mentorship Readiness Assessment: Preparing to walk alongside someone in early recovery.",
        },
      ],
    },
    {
      id: "protecting-the-next-generation",
      courseNumber: "02",
      title: "Protecting the Next Generation",
      subtitle: "A family-centered journey that helps adults build safer homes and stronger futures for children.",
      description:
        "Children absorb what adults tolerate. This course equips parents, guardians, and mentors with the protective clarity and spiritual discernment needed to guard young hearts against cultural chaos, digital exposure, and generational trauma.",
      chaptersCount: 3,
      lessonsCount: 15,
      format: "Short, practical course",
      tag: "Family Restoration",
      chapters: [
        {
          number: 1,
          title: "The Sanctuary of the Home: Physical & Digital Borders",
          summary: "Auditing the influences, devices, and conversations shaping children in private.",
          actionItem: "The Home Environment Blueprint: Setting intentional boundaries with warmth and firm consistency.",
        },
        {
          number: 2,
          title: "Discerning the Invisible Battles",
          summary: "Recognizing early behavioral withdrawal, anxiety cues, and deceptive cultural pressures.",
          actionItem: "The One-on-One Attunement Walk: A structured question guide to open closed hearts.",
        },
        {
          number: 3,
          title: "Transmitting Unshakable Identity",
          summary: "Imparting resilience, self-worth, and character so children do not seek validation from predators.",
          actionItem: "The Family Creed & Blessing: Writing and speaking generational blessings over your children.",
        },
      ],
    },
    {
      id: "from-addicts-to-leaders",
      courseNumber: "03",
      title: "From Addicts to Leaders",
      subtitle: "A leadership pathway for moving from destruction to responsibility, character, and service.",
      description:
        "Sobriety is only the halfway mark; leadership is the destination. Those who have been rescued from the deepest pits carry an unmatched capacity to lead with humility, courage, and discernment. This course bridges the gap from recovery to community stewardship.",
      chaptersCount: 3,
      lessonsCount: 21,
      format: "Medium-depth transformation course",
      tag: "Character & Service",
      chapters: [
        {
          number: 1,
          title: "Leading Yourself: The Crucible of Character",
          summary: "Why no one can lead a team or community until they have mastered their own private disciplines.",
          actionItem: "The Integrity Audit: Aligning private habits with public declarations.",
        },
        {
          number: 2,
          title: "The Language of Moral Authority",
          summary: "How to communicate with gravity, vulnerability, and conviction that commands respect without dominance.",
          actionItem: "The Vision Articulation Exercise: Structuring your personal mission statement for your team.",
        },
        {
          number: 3,
          title: "Building Resilient Communities & Multiplying Mentors",
          summary: "Creating enduring structures that develop new leaders, support the fallen, and multiply impact.",
          actionItem: "The Apprentice Action Plan: Identifying and actively mentoring two emerging leaders.",
        },
      ],
    },
  ] as CoursePathway[],
  startHere: {
    title: "Start Here",
    subtitle: "Begin with the course that speaks to your next step.",
    description:
      "Whether the need is healing, family restoration, or leadership, the platform offers a path that helps people move forward with clarity and conviction.",
  },
  finalInvitation: {
    quote: "Start with one course, one chapter, and one action. That is enough to begin.",
    platformNote:
      "Built to feel calm, grounded, and useful. The goal is simple: one clear path, one honest step at a time.",
  },
};
