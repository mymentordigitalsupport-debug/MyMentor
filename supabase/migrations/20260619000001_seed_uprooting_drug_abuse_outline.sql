do $$
declare
  base_course_id uuid;
  version_item jsonb;
  chapter_item jsonb;
  lesson_item jsonb;
  current_version_id uuid;
  current_chapter_id uuid;
  current_lesson_id uuid;
  chapter_sort_order int;
  current_lesson_number int;
  lesson_title text;
begin
  select id into base_course_id
  from courses
  where title = 'Uprooting Drug Abuse'
  limit 1;

  if base_course_id is null then
    raise exception 'Course not found: Uprooting Drug Abuse';
  end if;

  for version_item in
    select value
    from jsonb_array_elements(
      '[
        {
          "guidance_path":"christian",
          "title":"Uprooting Drug Abuse - Christian Guidance",
          "description":"A Christ-centered recovery course that helps individuals understand addiction through Biblical truth, uncover the spiritual roots of destructive behavior, renew their minds through God''s Word, and discover freedom, healing, purpose, and restoration through Jesus Christ.",
          "chapters":[
            {
              "sort_order":1,
              "title":"The Stage of Creation",
              "description":"Creation, identity, and purpose through a Biblical lens.",
              "lessons":[
                "God''s Original Design for Humanity",
                "Created in the Image of God",
                "The Purpose of Life",
                "The Garden of Eden",
                "Freedom, Choice, and Responsibility",
                "The First Temptation",
                "The Fall of Man",
                "The Consequences of Disobedience",
                "God''s Creation and the Plant Kingdom",
                "Understanding the Origins of Drug Abuse"
              ]
            },
            {
              "sort_order":2,
              "title":"The Tree of Knowledge of Good and Evil",
              "description":"Understanding how brokenness enters and shapes human behavior.",
              "lessons":[
                "Understanding the Forbidden Tree",
                "The Entrance of Sin",
                "How Sin Changed Human Nature",
                "Spiritual Death Explained",
                "The Inheritance of a Fallen Nature",
                "Addiction and the Human Condition",
                "Recognizing the Fruit of Destructive Choices",
                "God''s Plan for Restoration"
              ]
            },
            {
              "sort_order":3,
              "title":"The Concept of Abuse",
              "description":"Seeing abuse through the lens of self-destruction and responsibility.",
              "lessons":[
                "What Is Abuse?",
                "The Difference Between Use and Abuse",
                "The Abusive Nature of Sin",
                "Self-Destruction and Addiction",
                "Hidden Abuse of the Heart",
                "Thoughts That Lead to Bondage",
                "Identifying Personal Strongholds",
                "Taking Responsibility for Change"
              ]
            },
            {
              "sort_order":4,
              "title":"The Real Reason People Do Drugs",
              "description":"Why people turn to drugs and what the heart is searching for.",
              "lessons":[
                "Looking Beyond the Substance",
                "The Search for Escape",
                "Pain, Trauma, and Brokenness",
                "Spiritual Emptiness",
                "The Desire to Belong",
                "False Comforts and False Solutions",
                "Satan''s Deception Through Addiction",
                "Discovering the Real Need of the Heart"
              ]
            },
            {
              "sort_order":5,
              "title":"The Three Stages of Drug Abuse",
              "description":"How addiction progresses from curiosity to bondage.",
              "lessons":[
                "Understanding the Addiction Journey",
                "Curiosity and Experimentation",
                "Repeated Use and Habit Formation",
                "Dependency and Bondage",
                "The Progression of Addiction",
                "Losing Control",
                "The Cost of Sin and Addiction",
                "Recognizing Where You Are",
                "God''s Way Out"
              ]
            },
            {
              "sort_order":6,
              "title":"Spiritual Eyes of the Evil Nature",
              "description":"How deception, shame, and fear distort perception.",
              "lessons":[
                "Spiritual Awareness and Influence",
                "How Addiction Distorts Perception",
                "The Nature of Deception",
                "Shame, Fear, and Guilt",
                "The Voice of Condemnation",
                "Recognizing Spiritual Blindness",
                "Seeing Through God''s Truth"
              ]
            },
            {
              "sort_order":7,
              "title":"The Two Laws",
              "description":"The conflict between harmful impulses and life-giving choices.",
              "lessons":[
                "The Law of Sin and Death",
                "The Law of the Spirit of Life",
                "The Inner Conflict",
                "Flesh Versus Spirit",
                "Daily Choices and Consequences",
                "Walking in Obedience",
                "Living Under God''s Grace"
              ]
            },
            {
              "sort_order":8,
              "title":"The Tree of Life",
              "description":"Returning to life, hope, healing, and purpose.",
              "lessons":[
                "Jesus Christ as the Source of Life",
                "Returning to God''s Design",
                "The Gift of Salvation",
                "Receiving God''s Grace",
                "Spiritual Growth and Healing",
                "Living a Fruitful Life",
                "Walking in Newness of Life"
              ]
            },
            {
              "sort_order":9,
              "title":"The Spiritual War",
              "description":"Recognizing spiritual battle and staying grounded in recovery.",
              "lessons":[
                "Understanding Spiritual Warfare",
                "The Enemy''s Strategies",
                "Temptation and Resistance",
                "Strongholds and Bondage",
                "The Armor of God",
                "Victory Through Christ",
                "Standing Firm in Recovery"
              ]
            },
            {
              "sort_order":10,
              "title":"The Mind Battlefield",
              "description":"Renewing thought patterns and building long-term stability.",
              "lessons":[
                "Renewing the Mind",
                "Identifying Harmful Thought Patterns",
                "Taking Thoughts Captive",
                "Managing Cravings Through Truth",
                "Replacing Lies with Scripture",
                "Building Godly Thinking",
                "Developing Emotional Maturity",
                "Long-Term Freedom and Stability"
              ]
            },
            {
              "sort_order":11,
              "title":"Love",
              "description":"Learning love, forgiveness, and restored relationships.",
              "lessons":[
                "Understanding God''s Love",
                "Receiving Love and Acceptance",
                "Loving Yourself Through God''s Eyes",
                "Forgiveness and Healing",
                "Loving Others Well",
                "Restoring Relationships",
                "Living a Life of Compassion",
                "Walking in Love Daily"
              ]
            }
          ]
        },
        {
          "guidance_path":"religious",
          "title":"Uprooting Drug Abuse - Religious Guidance",
          "description":"A recovery course designed to help participants understand addiction, uncover the roots of destructive behavior, develop self-awareness, rebuild purpose, and pursue lasting transformation through spiritual growth, personal responsibility, and healthy living.",
          "chapters":[
            {
              "sort_order":1,
              "title":"The Stage of Creation",
              "description":"Creation, identity, and purpose.",
              "lessons":[
                "Understanding Creation and Purpose",
                "Humanity''s Original Design",
                "The Garden of Eden",
                "Freedom, Choice, and Responsibility",
                "Temptation and Deception",
                "The First Fall",
                "Consequences of Broken Choices",
                "Plants, Drugs, and Human History",
                "From Ancient Practices to Modern Addiction",
                "Understanding the Roots of Drug Abuse"
              ]
            },
            {
              "sort_order":2,
              "title":"The Tree of Knowledge of Good and Evil",
              "description":"How brokenness shapes humanity and behavior.",
              "lessons":[
                "Understanding the Symbol",
                "The Birth of Brokenness",
                "The Nature of Sin",
                "How Harmful Patterns Spread",
                "The Inheritance of Broken Thinking",
                "Understanding Addiction Through the Fall",
                "The Difference Between Life-Giving and Destructive Choices",
                "Recognizing the Consequences of Addiction"
              ]
            },
            {
              "sort_order":3,
              "title":"The Concept of Abuse",
              "description":"The nature of abuse and destructive patterns.",
              "lessons":[
                "What Is Abuse?",
                "Abuse Beyond Drugs",
                "Self-Destructive Behaviors",
                "The Inner Roots of Harmful Actions",
                "Thoughts, Emotions, and Choices",
                "Understanding Personal Responsibility",
                "Identifying Patterns of Abuse",
                "Breaking Cycles of Destruction"
              ]
            },
            {
              "sort_order":4,
              "title":"The Real Reason People Do Drugs",
              "description":"What drives drug use and the search for escape.",
              "lessons":[
                "Looking Beyond the Substance",
                "Pain and Escape",
                "Emotional Triggers",
                "Identity and Belonging",
                "The Search for Relief",
                "False Solutions to Real Problems",
                "Understanding Root Causes",
                "Facing the Truth About Addiction"
              ]
            },
            {
              "sort_order":5,
              "title":"The Three Stages of Drug Abuse",
              "description":"The stages addiction moves through.",
              "lessons":[
                "Introduction to the Three Stages",
                "Experimentation",
                "Habit Formation",
                "Dependency",
                "Escalation",
                "Loss of Control",
                "The Cost of Addiction",
                "Recognizing Your Current Stage",
                "The Path Back"
              ]
            },
            {
              "sort_order":6,
              "title":"Spiritual Eyes of the Evil Nature",
              "description":"How perception becomes distorted by harm.",
              "lessons":[
                "Perception and Reality",
                "How Addiction Changes Thinking",
                "Distorted Beliefs",
                "Shame, Fear, and Isolation",
                "The Battle for Perspective",
                "Recognizing Self-Deception",
                "Learning to See Clearly Again"
              ]
            },
            {
              "sort_order":7,
              "title":"The Two Laws",
              "description":"The conflict between healthy and harmful choices.",
              "lessons":[
                "Understanding Opposing Forces",
                "Healthy Choices vs Harmful Choices",
                "Internal Conflict",
                "The Pull of Old Habits",
                "Building New Patterns",
                "Daily Decision Making",
                "Living with Intention"
              ]
            },
            {
              "sort_order":8,
              "title":"The Tree of Life",
              "description":"Hope, healing, and a new direction.",
              "lessons":[
                "Rediscovering Hope",
                "Life-Giving Choices",
                "Growth and Healing",
                "Finding Purpose",
                "Building Healthy Habits",
                "Restoration",
                "A New Direction"
              ]
            },
            {
              "sort_order":9,
              "title":"The Spiritual War",
              "description":"Navigating challenges and resisting destructive patterns.",
              "lessons":[
                "Understanding the Battle",
                "Internal and External Influences",
                "Triggers and Temptations",
                "Resisting Destructive Patterns",
                "Developing Resilience",
                "Building a Recovery Mindset",
                "Staying Strong During Challenges"
              ]
            },
            {
              "sort_order":10,
              "title":"The Mind Battlefield",
              "description":"Renewing the mind and building stability.",
              "lessons":[
                "The Power of Thought",
                "Negative Thinking Patterns",
                "Renewing the Mind",
                "Managing Cravings",
                "Emotional Regulation",
                "Healthy Self-Talk",
                "Replacing Harmful Beliefs",
                "Long-Term Mental Recovery"
              ]
            },
            {
              "sort_order":11,
              "title":"Love",
              "description":"Love, acceptance, forgiveness, and service.",
              "lessons":[
                "Understanding Love",
                "Self-Worth and Acceptance",
                "Healing Relationships",
                "Forgiveness",
                "Compassion for Self and Others",
                "Community and Support",
                "Living from Love Rather Than Fear",
                "A Life of Purpose and Service"
              ]
            }
          ]
        }
      ]'::jsonb
    ) as value
  loop
    select id
      into current_version_id
    from course_versions
    where course_id = base_course_id
      and guidance_path = version_item->>'guidance_path'
    limit 1;

    if current_version_id is null then
      insert into course_versions (course_id, title, description, status, guidance_path)
      values (
        base_course_id,
        version_item->>'title',
        version_item->>'description',
        'published',
        version_item->>'guidance_path'
      )
      returning id into current_version_id;
    else
      update course_versions
      set
        title = version_item->>'title',
        description = version_item->>'description',
        status = 'published',
        updated_at = now()
      where id = current_version_id;
    end if;

    for chapter_item in
      select value
      from jsonb_array_elements(version_item->'chapters')
    loop
      chapter_sort_order := (chapter_item->>'sort_order')::int;

      select id
        into current_chapter_id
      from chapters
      where chapters.course_version_id = current_version_id
        and chapters.sort_order = chapter_sort_order
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
          chapter_sort_order,
          'published',
          true
        )
        returning id into current_chapter_id;
      else
        update chapters
        set
          title = chapter_item->>'title',
          description = chapter_item->>'description',
          sort_order = chapter_sort_order,
          status = 'published',
          is_published = true,
          updated_at = now()
        where id = current_chapter_id;
      end if;

      current_lesson_number := 0;
      for lesson_item in
        select value
        from jsonb_array_elements(chapter_item->'lessons')
      loop
        current_lesson_number := current_lesson_number + 1;
        lesson_title := lesson_item #>> '{}';

        select id
          into current_lesson_id
        from lessons
        where lessons.chapter_id = current_chapter_id
          and lessons.lesson_number = current_lesson_number
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
            lesson_title,
            null,
            current_lesson_number,
            15,
            null,
            null,
            current_lesson_number,
            'published',
            true
          )
          returning id into current_lesson_id;
        else
          update lessons
          set
            title = lesson_title,
            subtitle = null,
            lesson_number = current_lesson_number,
            estimated_minutes = 15,
            opening_message = null,
            encouragement_message = null,
            sort_order = current_lesson_number,
            status = 'published',
            is_published = true,
            updated_at = now()
          where id = current_lesson_id;
        end if;
      end loop;
    end loop;
  end loop;
end $$;
