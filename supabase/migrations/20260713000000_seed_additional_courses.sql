do $$
declare
  course_item jsonb;
  chapter_item jsonb;
  lesson_item jsonb;
  block_item jsonb;
  current_course_id uuid;
  current_version_id uuid;
  current_chapter_id uuid;
  current_lesson_id uuid;
  current_block_sort int;
begin
  for course_item in
    select value
    from jsonb_array_elements(
      '[
  {
    "title": "From Addicts to Leaders",
    "slug": "from-addicts-to-leaders",
    "description": "A recovery and leadership journey focused on character, responsibility, family restoration, and social renewal.",
    "sort_order": 2,
    "version": {
      "guidance_path": "religious",
      "title": "From Addicts to Leaders - Religious Guidance",
      "description": "A recovery and leadership journey focused on character, responsibility, family restoration, and social renewal.",
      "chapters": [
        {
          "sort_order": 1,
          "title": "Leadership and Recovery",
          "description": "Why lasting recovery must grow into leadership, service, maturity, and responsible influence.",
          "lessons": [
            {
              "lesson_number": 1,
              "title": "Why Recovery Needs Leadership",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Recovery is not only about what you stop. It is also about who you become.",
              "encouragement_message": "Small honest steps toward responsibility matter.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Recovery and direction",
                    "message": "Recovery is not only about what you stop. It is also about who you become."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Beyond survival",
                    "body": "This course begins with the idea that treatment alone is not enough. Lasting change needs direction, responsibility, purpose, and a healthier identity."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "A person who cannot lead self well will struggle to rebuild life well."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Where have you thought of recovery only as stopping behavior?",
                    "context": "Consider what still needs to be built after destructive habits are left behind."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Describe what a healthy, responsible life would look like for you six months from now."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Begin with intention",
                    "action": "Choose one area of life where you will start acting with more purpose this week."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You reframed recovery as a path toward growth and leadership.",
                    "encouragement": "Small honest steps toward responsibility matter."
                  }
                }
              ]
            },
            {
              "lesson_number": 2,
              "title": "Leadership as Character, Not Status",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Leadership is not mainly about title, attention, or position.",
              "encouragement_message": "The strongest kind of growth is the kind that becomes part of who you are.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Character first",
                    "message": "Leadership is not mainly about title, attention, or position."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "The kind of person you are",
                    "body": "This manuscript defines leadership through integrity, humility, service, and truthfulness. Leadership begins in character before it is seen in influence."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Title can be given quickly. Character is formed slowly."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Which character traits do you trust most in others?",
                    "context": "Think about the traits that make someone safe to follow or listen to."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "List three traits you want people to experience when they are around you."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Practice integrity",
                    "action": "Do one quiet, honest thing today that no one needs to praise."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You connected leadership with character rather than image.",
                    "encouragement": "The strongest kind of growth is the kind that becomes part of who you are."
                  }
                }
              ]
            },
            {
              "lesson_number": 3,
              "title": "Service, Responsibility, and Influence",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Real influence grows when people become dependable.",
              "encouragement_message": "Dependability is one of the clearest signs of change.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Dependable influence",
                    "message": "Real influence grows when people become dependable."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Responsibility that serves",
                    "body": "Leadership in this course is tied to service, practical care, and responsibility. Healthy influence helps people flourish rather than using them."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Influence without responsibility quickly becomes harm."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Who has influenced your life through steady care rather than loud words?",
                    "context": "Notice how consistency often carries more weight than image."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write about one responsibility you have avoided and why it matters."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Carry one thing well",
                    "action": "Finish one neglected task as an act of responsibility."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You linked leadership with trustworthy service.",
                    "encouragement": "Dependability is one of the clearest signs of change."
                  }
                }
              ]
            },
            {
              "lesson_number": 4,
              "title": "What a True Leader Is",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Good leadership has a recognizable shape.",
              "encouragement_message": "The kind of leader you become affects the kind of healing you can sustain.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Healthy leadership",
                    "message": "Good leadership has a recognizable shape."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Building people",
                    "body": "A true leader pursues fairness, maturity, wisdom, and growth in others. Strong leadership builds people instead of controlling them."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Strong people do not need to dominate in order to guide."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What kind of presence makes you feel safe to grow?",
                    "context": "Think about the qualities that make guidance feel trustworthy."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write a short definition of the kind of leader you want to become."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Encourage growth",
                    "action": "Offer one sincere encouragement to another person today."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You began shaping a healthier picture of leadership.",
                    "encouragement": "The kind of leader you become affects the kind of healing you can sustain."
                  }
                }
              ]
            },
            {
              "lesson_number": 5,
              "title": "What a True Leader Is Not",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Clarity grows when we identify the patterns that harm people.",
              "encouragement_message": "Real strength leaves people more whole, not more diminished.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "What to reject",
                    "message": "Clarity grows when we identify the patterns that harm people."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Pride, control, and manipulation",
                    "body": "The book rejects selfishness, deception, pride, and controlling behavior. These may look strong on the surface, but they damage trust and dignity."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Control can imitate strength while hiding insecurity."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Which harmful pattern most easily disguises itself as strength?",
                    "context": "Be honest about the behaviors that can hide behind confidence."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Name one manipulative or self-protective habit you want to leave behind."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Choose honesty",
                    "action": "Correct one small dishonest or controlling behavior if you notice it today."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You named the difference between leadership and domination.",
                    "encouragement": "Real strength leaves people more whole, not more diminished."
                  }
                }
              ]
            },
            {
              "lesson_number": 6,
              "title": "Stewardship and Trust",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Leadership includes caring well for people, time, and responsibility.",
              "encouragement_message": "Trust grows where care becomes consistent.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Caring for what is in your hands",
                    "message": "Leadership includes caring well for people, time, and responsibility."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Faithful oversight",
                    "body": "Stewardship in this manuscript means protection, encouragement, wise care, and dignified responsibility. It asks how we handle what has been entrusted to us."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Stewardship asks what has been placed in your hands and how you will honor it."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What in your life currently needs better stewardship?",
                    "context": "Think about relationships, habits, work, and commitments."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write about one relationship, one habit, and one responsibility you want to manage better."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Improve follow-through",
                    "action": "Put one practical system in place to help you follow through."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You connected leadership with faithful care.",
                    "encouragement": "Trust grows where care becomes consistent."
                  }
                }
              ]
            },
            {
              "lesson_number": 7,
              "title": "Growing Into Mature Leadership",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Leadership is formed, not rushed.",
              "encouragement_message": "Lasting maturity is built one faithful response at a time.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Growth over time",
                    "message": "Leadership is formed, not rushed."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Maturity through hardship",
                    "body": "The manuscript shows that maturity often grows through truth, discipline, hardship, and teachability. Growth is not instant, but it can be deep and durable."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Maturity is not the absence of struggle. It is the way you grow through it."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What challenge in your life could shape you for good?",
                    "context": "Consider how difficulty might become part of your growth story."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Describe one hardship that could become part of your leadership development."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Choose teachability",
                    "action": "Identify one mentor, practice, or habit that can help you mature."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You ended the chapter seeing growth as a disciplined journey.",
                    "encouragement": "Lasting maturity is built one faithful response at a time."
                  }
                }
              ]
            }
          ]
        },
        {
          "sort_order": 2,
          "title": "The Individual and Inner Change",
          "description": "Understanding the whole person, purpose, character, addictive behavior, and why freedom needs inner renewal.",
          "lessons": [
            {
              "lesson_number": 1,
              "title": "Seeing the Whole Person",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "A person is more than a problem to fix.",
              "encouragement_message": "A larger, truer story creates room for deeper healing.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "More than a label",
                    "message": "A person is more than a problem to fix."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "The whole human story",
                    "body": "This manuscript urges a whole-person view that includes abilities, inner life, relationships, and responsibility. Addiction harms many parts of life, so healing must reach many parts too."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Healing deepens when a person is treated as human, not reduced to one label."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Where have you felt reduced to one part of your story?",
                    "context": "Consider how a fuller picture of yourself changes the way you approach recovery."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write down the roles, strengths, and hopes that still belong to you."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Speak a fuller truth",
                    "action": "Say one truthful sentence about yourself that is larger than your struggle."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You widened the lens on who you are.",
                    "encouragement": "A larger, truer story creates room for deeper healing."
                  }
                }
              ]
            },
            {
              "lesson_number": 2,
              "title": "Character Traits for a Better Life",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Recovery needs more than relief. It needs character.",
              "encouragement_message": "Steady character often protects freedom more than emotion does.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Traits that sustain change",
                    "message": "Recovery needs more than relief. It needs character."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Inner strength",
                    "body": "Love, compassion, self-control, kindness, wisdom, and humility are presented as traits that support a more stable and humane life."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Character is what remains when emotion changes."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Which trait would most change your relationships if it grew stronger?",
                    "context": "Think about the qualities that could reshape daily life if practiced consistently."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Choose two character traits you want to practice this week and explain why."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Practice one trait",
                    "action": "Show one deliberate act of kindness, patience, or restraint today."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You identified the kind of inner strength recovery needs.",
                    "encouragement": "Steady character often protects freedom more than emotion does."
                  }
                }
              ]
            },
            {
              "lesson_number": 3,
              "title": "Discovering Purpose",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "People endure more when they can see meaning ahead.",
              "encouragement_message": "Purpose does not have to be grand to be powerful.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Direction matters",
                    "message": "People endure more when they can see meaning ahead."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Purpose and movement",
                    "body": "Purpose is described as direction, contribution, determination, and meaningful function. It becomes clearer through growth, responsibility, and lived experience."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "A person with purpose is less easily owned by chaos."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What gives your life a sense of direction?",
                    "context": "Notice the activities, values, and hopes that create movement rather than drift."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write a simple purpose statement for the season of life you are in now."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Take one aligned step",
                    "action": "Do one small thing today that aligns with the future you want."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You named direction instead of drifting.",
                    "encouragement": "Purpose does not have to be grand to be powerful."
                  }
                }
              ]
            },
            {
              "lesson_number": 4,
              "title": "Gifts, Growth, and Personal Development",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Recovery should uncover potential, not only repair damage.",
              "encouragement_message": "Healthy growth helps freedom become fruitful.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Recovering potential",
                    "message": "Recovery should uncover potential, not only repair damage."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Cultivating what is in you",
                    "body": "The manuscript points to gifts, abilities, and personal development as part of healing. Growth becomes meaningful when it benefits both the individual and others."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "What is developed in you can become a gift to others."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What strengths have been buried under struggle?",
                    "context": "Think about capacities that deserve recovery and attention."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "List three abilities or interests you want to recover or grow."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Invest in growth",
                    "action": "Spend focused time today on one healthy skill or interest."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You linked recovery with cultivation, not just repair.",
                    "encouragement": "Healthy growth helps freedom become fruitful."
                  }
                }
              ]
            },
            {
              "lesson_number": 5,
              "title": "Understanding Addictive Behavior",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Substance use is only part of addiction''s damage.",
              "encouragement_message": "Honest awareness creates the possibility of real change.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "More than substance use",
                    "message": "Substance use is only part of addiction''s damage."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Patterns that remain",
                    "body": "Manipulation, lying, chaos, impulsivity, broken trust, and reckless choices are described as common addictive patterns that can continue even after substance use stops."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "If behavior stays unchanged, relapse often stays close."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Which behavior pattern has caused the most harm in your life?",
                    "context": "Look beyond the surface habit and name the repeated pattern around it."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Describe one repeated behavior that needs change, not excuses."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Interrupt the cycle",
                    "action": "Stop one unhealthy pattern before it completes its usual cycle."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You faced the behavior side of addiction.",
                    "encouragement": "Honest awareness creates the possibility of real change."
                  }
                }
              ]
            },
            {
              "lesson_number": 6,
              "title": "Why Stopping Use Is Not Enough",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Freedom needs a new way of living, not only a stopped habit.",
              "encouragement_message": "A changed life is stronger than a stopped habit alone.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Freedom needs more",
                    "message": "Freedom needs a new way of living, not only a stopped habit."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Beyond abstinence",
                    "body": "The manuscript is clear that stopping use is major, but incomplete by itself. Lifestyle, responsibility, honesty, and trust also need rebuilding."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "What is removed from your life must be replaced with something better."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What would still need healing even if substance use stopped today?",
                    "context": "Think about thinking patterns, routines, relationships, and responsibility."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write about the kinds of change that must happen beyond abstinence."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Add one stabilizer",
                    "action": "Start one healthy routine that supports long-term stability."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You expanded your picture of what real freedom involves.",
                    "encouragement": "A changed life is stronger than a stopped habit alone."
                  }
                }
              ]
            },
            {
              "lesson_number": 7,
              "title": "Renewing Lifestyle, Habits, and Responsibility",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Change becomes believable when it becomes visible.",
              "encouragement_message": "Steady rhythms make healthy identity more believable.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Visible change",
                    "message": "Change becomes believable when it becomes visible."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Daily renewal",
                    "body": "This lesson turns toward routines, habits, and repeated responsibility. Trust grows where change becomes daily and observable."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Stability is built through repetition, not dramatic promises."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What daily habit would most strengthen your recovery?",
                    "context": "Think about rhythms that make clarity and responsibility more likely."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Design a simple daily rhythm that supports responsibility and clarity."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Practice a steady rhythm",
                    "action": "Follow one new healthy routine for the next three days."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You ended the chapter with a practical picture of renewal.",
                    "encouragement": "Steady rhythms make healthy identity more believable."
                  }
                }
              ]
            }
          ]
        },
        {
          "sort_order": 3,
          "title": "Family, Restoration, and Social Renewal",
          "description": "How addiction affects family systems, why care and responsibility matter in the home, and how recovery can become social good.",
          "lessons": [
            {
              "lesson_number": 1,
              "title": "Why Family Matters in Recovery",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Addiction rarely harms only one person.",
              "encouragement_message": "Repair often starts with humble, steady movement.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Recovery is relational",
                    "message": "Addiction rarely harms only one person."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Family as foundation",
                    "body": "The manuscript treats family as one of society''s most important foundations. Because addiction damages trust and belonging, recovery must also address relationships."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Healing grows stronger when it reaches the places where pain spread."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "How has your struggle affected people close to you?",
                    "context": "Reflect on the relational impact of destructive patterns."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write honestly about one family relationship touched by addiction."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Take one respectful step",
                    "action": "Do one small thing that supports rebuilding connection."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You began seeing recovery in relational terms.",
                    "encouragement": "Repair often starts with humble, steady movement."
                  }
                }
              ]
            },
            {
              "lesson_number": 2,
              "title": "Addiction and Family Breakdown",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Households weaken when destructive patterns go unchallenged.",
              "encouragement_message": "Naming the pattern is often the first step to breaking it.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Patterns that weaken the home",
                    "message": "Households weaken when destructive patterns go unchallenged."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Dysfunction and instability",
                    "body": "The book names addiction, neglect, conflict, irresponsibility, and instability as forces that damage family life and spread pain across generations."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Dysfunction grows in silence and confusion."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Which pattern has most weakened stability in your family story?",
                    "context": "Look honestly at the patterns that keep peace and trust from growing."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Describe the difference between blaming and taking responsibility in family life."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Refuse one repeated pattern",
                    "action": "Name one destructive pattern you no longer want to repeat."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You faced the wider impact of dysfunction.",
                    "encouragement": "Naming the pattern is often the first step to breaking it."
                  }
                }
              ]
            },
            {
              "lesson_number": 3,
              "title": "Responsibility in the Home",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Care becomes real through responsibility.",
              "encouragement_message": "Practical care often says more than promises.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Love in action",
                    "message": "Care becomes real through responsibility."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Support, wisdom, and contribution",
                    "body": "Families need protection, support, and wise care. Recovery becomes stronger when people contribute to order, stability, and shared wellbeing."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Responsibility is one of love''s clearest forms."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What kind of responsibility has been missing most?",
                    "context": "Think about the forms of care that would create more steadiness at home."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write one way you can contribute to more peace or order at home."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Carry something fully",
                    "action": "Take full responsibility for one household task or commitment this week."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You tied love to responsibility.",
                    "encouragement": "Practical care often says more than promises."
                  }
                }
              ]
            },
            {
              "lesson_number": 4,
              "title": "Parent Roles, Care, and Stability",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Children and families need dependable care and role modeling.",
              "encouragement_message": "Stability is often one of the most generous things a person can offer.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Steady guidance matters",
                    "message": "Children and families need dependable care and role modeling."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Protection and example",
                    "body": "The manuscript emphasizes parental care, household stability, and the importance of environments where children can grow with structure, dignity, and safety."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "The next generation learns as much from household patterns as from household words."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What kind of example did you receive, and what kind do you want to give?",
                    "context": "Think about how stability and care are modeled over time."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Describe the home atmosphere that best helps people flourish."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Increase steadiness",
                    "action": "Do one thing this week that makes your close environment feel more stable."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You linked recovery with the kind of home life that protects others.",
                    "encouragement": "Stability is often one of the most generous things a person can offer."
                  }
                }
              ]
            },
            {
              "lesson_number": 5,
              "title": "Rebuilding Trust and Relationships",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Trust can return, but it usually returns through consistency.",
              "encouragement_message": "Slow rebuilding is still real rebuilding.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Trust returns slowly",
                    "message": "Trust can return, but it usually returns through consistency."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Lived change",
                    "body": "The manuscript calls for patience, dignity, truth, and repeated trustworthy behavior. Trust is restored by lived change more than by promises alone."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "People often believe patterns before words."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What would trustworthy living look like in your context?",
                    "context": "Think about how someone close to you would recognize real change."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write down three ways someone could recognize real change in you."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Keep one commitment",
                    "action": "Follow through on one clear commitment today."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You grounded restoration in repeated action.",
                    "encouragement": "Slow rebuilding is still real rebuilding."
                  }
                }
              ]
            },
            {
              "lesson_number": 6,
              "title": "Leadership for Stronger Communities",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "Personal growth can become social good.",
              "encouragement_message": "Constructive influence grows when healing becomes service.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Growth beyond self",
                    "message": "Personal growth can become social good."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "From healed life to helpful life",
                    "body": "The manuscript imagines recovered people, stronger families, and principled leaders helping communities become more stable, wise, and humane."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "A healed life can become a shelter for others."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "How might your growth benefit more than just you?",
                    "context": "Consider the people, spaces, or communities that could be strengthened by your change."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write about one way your recovery could serve family, work, or community."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Offer one service",
                    "action": "Offer one practical act of service to another person this week."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You connected personal change to public good.",
                    "encouragement": "Constructive influence grows when healing becomes service."
                  }
                }
              ]
            },
            {
              "lesson_number": 7,
              "title": "From Recovery to Social Renewal",
              "subtitle": null,
              "estimated_minutes": 8,
              "opening_message": "The course ends where responsibility widens.",
              "encouragement_message": "Your growth can become part of something larger than recovery alone.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "A wider vision",
                    "message": "The course ends where responsibility widens."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Healing, dignity, and renewal",
                    "body": "This final lesson invites the learner to imagine recovery as part of a larger story of healing, dignity, trust, and constructive influence in the world."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Freedom becomes fuller when it begins to bless others."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What kind of legacy do you want your recovery to leave?",
                    "context": "Think about what you want your healing to make possible for others."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write a closing reflection on the kind of person you are becoming."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Choose a guiding value",
                    "action": "Choose one long-term value you want to lead by from this point on."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You completed the course with a vision that reaches beyond self.",
                    "encouragement": "Your growth can become part of something larger than recovery alone."
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    "title": "Protecting the Next Generation",
    "slug": "protecting-the-next-generation",
    "description": "A prevention-focused parenting course on awareness, risk, social influence, and building healthy protection at home.",
    "sort_order": 3,
    "version": {
      "guidance_path": "religious",
      "title": "Protecting the Next Generation - Religious Guidance",
      "description": "A prevention-focused parenting course on awareness, risk, social influence, and building healthy protection at home.",
      "chapters": [
        {
          "sort_order": 1,
          "title": "Understanding the Risk",
          "description": "Why prevention matters, why the teenage years are vulnerable, and how drug abuse harms body, mind, and future.",
          "lessons": [
            {
              "lesson_number": 1,
              "title": "Why Prevention Matters",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Prevention is one of the strongest forms of care.",
              "encouragement_message": "Prevention often starts with attention, honesty, and timely care.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Protect before crisis",
                    "message": "Prevention is one of the strongest forms of care."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "A proactive task",
                    "body": "This course frames prevention as practical protection for children, teenagers, and students before harmful patterns take root."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Wise prevention is love acting early."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "How much of your caregiving is reactive rather than proactive?",
                    "context": "Think about where earlier awareness could strengthen your guidance."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write why prevention matters in your family or caregiving context."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Start one conversation",
                    "action": "Identify one prevention conversation that needs to happen soon."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You began the course with a protective mindset.",
                    "encouragement": "Prevention often starts with attention, honesty, and timely care."
                  }
                }
              ]
            },
            {
              "lesson_number": 2,
              "title": "The Teenage Years and Growing Responsibility",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Teen years are full of growth, curiosity, and pressure.",
              "encouragement_message": "Timely guidance matters most when responsibility grows faster than judgment.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "A vulnerable stage",
                    "message": "Teen years are full of growth, curiosity, and pressure."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Exposure and development",
                    "body": "The manuscript describes adolescence as a stage where responsibility grows while maturity is still forming. This makes guidance especially important."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Freedom without guidance can become vulnerability."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What pressures do teenagers face now that may be easy to underestimate?",
                    "context": "Consider school, peers, image, online influence, and identity formation."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Describe the kind of support a teenager most needs during school years."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Listen before advising",
                    "action": "Use your next meaningful conversation to ask more than you tell."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You named adolescence as a key prevention window.",
                    "encouragement": "Timely guidance matters most when responsibility grows faster than judgment."
                  }
                }
              ]
            },
            {
              "lesson_number": 3,
              "title": "Physical Dangers of Drug Abuse",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Prevention becomes stronger when danger is understood clearly.",
              "encouragement_message": "Clear knowledge helps protection stay grounded rather than vague.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Understanding the harm",
                    "message": "Prevention becomes stronger when danger is understood clearly."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Effects on the body",
                    "body": "The manuscript highlights physical risks such as heart strain, weakened immunity, sleep disruption, appetite changes, withdrawal pain, and the greater vulnerability of younger bodies."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "A young person''s future can be altered by choices that first looked small."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Which physical consequences would be most important to explain clearly to a teenager?",
                    "context": "Think about what would make the risk feel real without becoming alarmist."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write a short explanation of drug risk in simple, honest language."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Learn one fact well",
                    "action": "Choose one health fact and learn it well enough to explain it calmly."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You strengthened the health-awareness side of prevention.",
                    "encouragement": "Clear knowledge helps protection stay grounded rather than vague."
                  }
                }
              ]
            },
            {
              "lesson_number": 4,
              "title": "Mental and Emotional Effects of Abuse",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "The dangers of drug use are not only visible in the body.",
              "encouragement_message": "Awareness of inner warning signs helps prevention happen earlier.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Not only physical",
                    "message": "The dangers of drug use are not only visible in the body."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Effects on thinking and feeling",
                    "body": "The text highlights hallucinations, distorted thinking, anxiety, depression, memory loss, impaired judgment, and the worsening of underlying mental struggles."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Anything that distorts thinking can also distort decision-making and identity."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What emotional or psychological signs would concern you most?",
                    "context": "Notice the kinds of changes that may signal something deeper than normal stress."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Note the difference between occasional moodiness and more serious warning signs."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Observe more carefully",
                    "action": "Pay closer attention to one behavior change you may have dismissed too quickly."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You deepened your understanding of non-visible harm.",
                    "encouragement": "Awareness of inner warning signs helps prevention happen earlier."
                  }
                }
              ]
            },
            {
              "lesson_number": 5,
              "title": "Why Early Awareness Protects the Future",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Awareness is one of prevention''s simplest and strongest tools.",
              "encouragement_message": "Prepared caregivers protect more effectively than surprised ones.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Readiness, not fear",
                    "message": "Awareness is one of prevention''s simplest and strongest tools."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Intentional attention",
                    "body": "The book encourages parents and guardians to become informed, attentive, and wise before warning signs turn into deeper problems."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Early awareness does not create fear. It creates readiness."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Where do you most need to become more aware right now?",
                    "context": "Consider friends, routines, health, online media, and emotional changes."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write three ways awareness can protect a young person without becoming controlling."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Create one awareness habit",
                    "action": "Start one weekly routine that helps you notice before problems deepen."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You finished the chapter with a practical call to pay attention early.",
                    "encouragement": "Prepared caregivers protect more effectively than surprised ones."
                  }
                }
              ]
            }
          ]
        },
        {
          "sort_order": 2,
          "title": "Social Influences and Exposure",
          "description": "How common substances, peer groups, media, and risky environments create pathways of exposure for young people.",
          "lessons": [
            {
              "lesson_number": 1,
              "title": "Common Drugs and Substances",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Awareness begins with naming the substances that young people may encounter.",
              "encouragement_message": "Clear naming helps caregivers respond more wisely.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Know what exists",
                    "message": "Awareness begins with naming the substances that young people may encounter."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Common points of exposure",
                    "body": "The manuscript names alcohol, cigarettes, cocaine, methamphetamine, heroin, cannabis, LSD, and other common substances as part of the prevention picture."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "It is hard to guard against what you refuse to name."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Which substances are most likely to appear in your context?",
                    "context": "Think realistically about what is most common around the young people in your care."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "List the substances you most need to understand better and why."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Learn one clearly",
                    "action": "Choose one common substance and learn its basic signs and risks."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You started building practical awareness.",
                    "encouragement": "Clear naming helps caregivers respond more wisely."
                  }
                }
              ]
            },
            {
              "lesson_number": 2,
              "title": "Peer Influence and Social Belonging",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Young people often follow people before they follow ideas.",
              "encouragement_message": "Belonging can either protect or expose, depending on where it leads.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Belonging shapes behavior",
                    "message": "Young people often follow people before they follow ideas."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "The pull of groups",
                    "body": "The book explains that teenagers are drawn toward groups, identity, and belonging. This makes peer patterns especially powerful in shaping decisions."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "The need to belong can quietly overpower the need to think clearly."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "How did belonging shape your own choices when you were younger?",
                    "context": "Use your own story to better understand why peer influence matters."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write what healthy belonging could look like for the young people in your care."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Ask about friendships",
                    "action": "Ask one open, non-accusing question about current friendships this week."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You connected prevention with relational awareness.",
                    "encouragement": "Belonging can either protect or expose, depending on where it leads."
                  }
                }
              ]
            },
            {
              "lesson_number": 3,
              "title": "Music, Media, and Lifestyle Messaging",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Media and lifestyle signals often shape values long before adults speak.",
              "encouragement_message": "What is normalized in culture often becomes easier to excuse in life.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Culture teaches too",
                    "message": "Media and lifestyle signals often shape values long before adults speak."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "What gets normalized",
                    "body": "The manuscript warns that music, films, online content, and lifestyle imagery can glamorize drug use and make harmful patterns feel attractive or normal."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Repeated images can slowly become accepted truths."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What messages about drugs, sex, or status are being repeated in the media young people consume?",
                    "context": "Notice what is constantly celebrated, excused, or stylized."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write about one cultural message you want to challenge more clearly."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Review one influence",
                    "action": "Look at one media influence with curiosity rather than panic."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You named culture as a major prevention factor.",
                    "encouragement": "What is normalized in culture often becomes easier to excuse in life."
                  }
                }
              ]
            },
            {
              "lesson_number": 4,
              "title": "Risky Environments and Youth Exposure",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Some spaces carry more danger than others.",
              "encouragement_message": "Some forms of protection begin with choosing where not to drift.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Place shapes possibility",
                    "message": "Some spaces carry more danger than others."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Settings that normalize abuse",
                    "body": "The booklet points to subcultures, parties, gang influence, and socially charged settings where substance use may be normalized or encouraged."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Environment does not decide everything, but it often shapes what feels normal."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Which settings around you create the greatest concern?",
                    "context": "Think about where risk gathers and how exposure becomes easier."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Describe what makes an environment feel protective or risky."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Set one clear boundary",
                    "action": "Revisit one boundary around risky settings or company."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You linked prevention with wise boundaries around place and company.",
                    "encouragement": "Some forms of protection begin with choosing where not to drift."
                  }
                }
              ]
            },
            {
              "lesson_number": 5,
              "title": "Becoming a More Aware Parent",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Awareness is not paranoia. It is attentive care.",
              "encouragement_message": "Grounded awareness creates protection without constant panic.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Grounded awareness",
                    "message": "Awareness is not paranoia. It is attentive care."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Watchful and informed",
                    "body": "The manuscript repeatedly calls parents and guardians to be watchful, informed, and engaged with the realities surrounding younger generations."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Present attention protects more than distant concern."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What kind of awareness do you need more of right now?",
                    "context": "Notice where you are currently guessing instead of understanding."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write three habits of a calm, observant caregiver."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Build one awareness routine",
                    "action": "Start one regular practice that helps you stay informed without becoming intrusive."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You finished the chapter with a steadier picture of watchfulness.",
                    "encouragement": "Grounded awareness creates protection without constant panic."
                  }
                }
              ]
            }
          ]
        },
        {
          "sort_order": 3,
          "title": "Prevention at Home",
          "description": "How principles, boundaries, communication, and daily household habits create a stronger protective environment.",
          "lessons": [
            {
              "lesson_number": 1,
              "title": "Awareness and Watchfulness",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Prevention begins at home with steady attention.",
              "encouragement_message": "Presence often protects more effectively than panic.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Attention at home",
                    "message": "Prevention begins at home with steady attention."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Notice before it deepens",
                    "body": "The manuscript describes awareness and watchfulness as foundational. Caregivers are called to notice patterns, shifts, and outcomes before problems deepen."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Attentive love notices early."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What changes in behavior would make you pay closer attention?",
                    "context": "Think about the kinds of subtle shifts that often get ignored until later."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write how watchfulness can stay calm instead of controlling."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Begin a noticing habit",
                    "action": "Start one weekly habit of observing more carefully before assuming."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You grounded prevention in steady presence.",
                    "encouragement": "Presence often protects more effectively than panic."
                  }
                }
              ]
            },
            {
              "lesson_number": 2,
              "title": "Building Strong Principles at Home",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Strong homes are built on repeated values and visible habits.",
              "encouragement_message": "Clarity in the home often becomes confidence in the child.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Households teach every day",
                    "message": "Strong homes are built on repeated values and visible habits."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Principles and practical rules",
                    "body": "The book emphasizes moral principles, practical rules, and a home culture that teaches respect, responsibility, and good judgment."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Households teach every day, even when no lesson is announced."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What principles are clear in your home, and which are only assumed?",
                    "context": "Think about the values that need to become more visible and consistent."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "List five household principles you want to be unmistakable."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Make one principle visible",
                    "action": "Name one household principle out loud and reinforce it through action."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You began shaping a clearer household foundation.",
                    "encouragement": "Clarity in the home often becomes confidence in the child."
                  }
                }
              ]
            },
            {
              "lesson_number": 3,
              "title": "Respect, Boundaries, and Discipline",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Protection needs both care and boundaries.",
              "encouragement_message": "Healthy limits create safer freedom.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Warmth with limits",
                    "message": "Protection needs both care and boundaries."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Balanced discipline",
                    "body": "The manuscript warns against homes that are too harsh or too slack. It recommends balanced discipline, mutual respect, and practical limits that fit the child and the family."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Boundaries are strongest when they are clear, fair, and consistent."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "Where does your household lean too hard or too loose?",
                    "context": "Reflect on where discipline needs more balance and clarity."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Describe what balanced discipline looks like in your setting."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Clarify one boundary",
                    "action": "Revisit one rule or boundary and explain the reason behind it."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You connected discipline with safety and stability.",
                    "encouragement": "Healthy limits create safer freedom."
                  }
                }
              ]
            },
            {
              "lesson_number": 4,
              "title": "Communication, Encouragement, and Trust",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Young people open more when homes feel safe to speak in.",
              "encouragement_message": "Trust grows more easily where people feel heard.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "Speak in ways that build",
                    "message": "Young people open more when homes feel safe to speak in."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "Trust through tone",
                    "body": "The booklet highlights positive encouragement, learning, and respect. It points toward communication that builds trust rather than fear."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "Correction goes further when it travels through relationship."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What tone usually fills important conversations at home?",
                    "context": "Think about whether your tone invites honesty or defensiveness."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write three ways you can communicate more clearly and encouragingly."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Aim for understanding",
                    "action": "Have one conversation where your main goal is understanding before correcting."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You linked prevention with the everyday tone of the home.",
                    "encouragement": "Trust grows more easily where people feel heard."
                  }
                }
              ]
            },
            {
              "lesson_number": 5,
              "title": "Creating a Healthy Protective Home",
              "subtitle": null,
              "estimated_minutes": 7,
              "opening_message": "Prevention becomes strongest when it is woven into ordinary daily life.",
              "encouragement_message": "Ordinary, consistent habits often become extraordinary protection over time.",
              "blocks": [
                {
                  "type": "welcome",
                  "content": {
                    "heading": "The whole picture",
                    "message": "Prevention becomes strongest when it is woven into ordinary daily life."
                  }
                },
                {
                  "type": "reading",
                  "content": {
                    "title": "A protective environment",
                    "body": "This final lesson gathers the manuscript''s themes: awareness, boundaries, respect, encouragement, learning, and strong principles working together in the home."
                  }
                },
                {
                  "type": "mentor_note",
                  "content": {
                    "note": "The healthiest homes are not perfect. They are present, principled, and steady."
                  }
                },
                {
                  "type": "pause_reflect",
                  "content": {
                    "question": "What would make your home more protective and more peaceful at the same time?",
                    "context": "Think about the small patterns that shape the whole environment."
                  }
                },
                {
                  "type": "journal_prompt",
                  "content": {
                    "prompt": "Write a short household prevention plan using the lessons from this chapter."
                  }
                },
                {
                  "type": "daily_action",
                  "content": {
                    "title": "Begin one home practice",
                    "action": "Choose one concrete home practice to begin this week."
                  }
                },
                {
                  "type": "complete",
                  "content": {
                    "message": "You completed the course with a practical prevention plan.",
                    "encouragement": "Ordinary, consistent habits often become extraordinary protection over time."
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  }
]'::jsonb
    ) as value
  loop
    select id
      into current_course_id
    from courses
    where slug = course_item->>'slug'
    limit 1;

    if current_course_id is null then
      insert into courses (
        title,
        slug,
        description,
        is_published,
        sort_order
      )
      values (
        course_item->>'title',
        course_item->>'slug',
        course_item->>'description',
        true,
        (course_item->>'sort_order')::int
      )
      returning id into current_course_id;
    else
      update courses
      set
        title = course_item->>'title',
        slug = course_item->>'slug',
        description = course_item->>'description',
        is_published = true,
        sort_order = (course_item->>'sort_order')::int,
        updated_at = now()
      where id = current_course_id;
    end if;

    select id
      into current_version_id
    from course_versions
    where course_id = current_course_id
      and guidance_path = course_item->'version'->>'guidance_path'
    limit 1;

    if current_version_id is null then
      insert into course_versions (
        course_id,
        title,
        description,
        status,
        guidance_path
      )
      values (
        current_course_id,
        course_item->'version'->>'title',
        course_item->'version'->>'description',
        'published',
        course_item->'version'->>'guidance_path'
      )
      returning id into current_version_id;
    else
      update course_versions
      set
        title = course_item->'version'->>'title',
        description = course_item->'version'->>'description',
        status = 'published',
        updated_at = now()
      where id = current_version_id;
    end if;

    for chapter_item in
      select value
      from jsonb_array_elements(course_item->'version'->'chapters')
    loop
      select id
        into current_chapter_id
      from chapters
      where course_version_id = current_version_id
        and sort_order = (chapter_item->>'sort_order')::int
      limit 1;

      if current_chapter_id is null then
        insert into chapters (
          course_version_id,
          title,
          description,
          sort_order,
          status,
          is_published
        )
        values (
          current_version_id,
          chapter_item->>'title',
          chapter_item->>'description',
          (chapter_item->>'sort_order')::int,
          'published',
          true
        )
        returning id into current_chapter_id;
      else
        update chapters
        set
          title = chapter_item->>'title',
          description = chapter_item->>'description',
          sort_order = (chapter_item->>'sort_order')::int,
          status = 'published',
          is_published = true,
          updated_at = now()
        where id = current_chapter_id;
      end if;

      for lesson_item in
        select value
        from jsonb_array_elements(chapter_item->'lessons')
      loop
        select id
          into current_lesson_id
        from lessons
        where chapter_id = current_chapter_id
          and lesson_number = (lesson_item->>'lesson_number')::int
        limit 1;

        if current_lesson_id is null then
          insert into lessons (
            chapter_id,
            title,
            subtitle,
            lesson_number,
            estimated_minutes,
            opening_message,
            encouragement_message,
            sort_order,
            status,
            is_published
          )
          values (
            current_chapter_id,
            lesson_item->>'title',
            null,
            (lesson_item->>'lesson_number')::int,
            (lesson_item->>'estimated_minutes')::int,
            lesson_item->>'opening_message',
            lesson_item->>'encouragement_message',
            (lesson_item->>'lesson_number')::int,
            'published',
            true
          )
          returning id into current_lesson_id;
        else
          update lessons
          set
            title = lesson_item->>'title',
            subtitle = null,
            lesson_number = (lesson_item->>'lesson_number')::int,
            estimated_minutes = (lesson_item->>'estimated_minutes')::int,
            opening_message = lesson_item->>'opening_message',
            encouragement_message = lesson_item->>'encouragement_message',
            sort_order = (lesson_item->>'lesson_number')::int,
            status = 'published',
            is_published = true,
            updated_at = now()
          where id = current_lesson_id;
        end if;

        delete from lesson_content_blocks
        where lesson_id = current_lesson_id;

        current_block_sort := 0;
        for block_item in
          select value
          from jsonb_array_elements(lesson_item->'blocks')
        loop
          current_block_sort := current_block_sort + 1;

          insert into lesson_content_blocks (
            lesson_id,
            block_type,
            content,
            sort_order
          )
          values (
            current_lesson_id,
            block_item->>'type',
            block_item->'content',
            current_block_sort
          );
        end loop;
      end loop;
    end loop;
  end loop;
end $$;
