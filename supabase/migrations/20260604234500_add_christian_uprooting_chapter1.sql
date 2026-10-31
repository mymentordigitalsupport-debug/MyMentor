do $$
declare
  base_course_id uuid;
  christian_version_id uuid;
  christian_chapter_id uuid;
  lesson1_id uuid;
  lesson2_id uuid;
  lesson3_id uuid;
begin
  select id
    into base_course_id
  from courses
  where title = 'Uprooting Drug Abuse'
  limit 1;

  if base_course_id is null then
    raise exception 'Course not found: Uprooting Drug Abuse';
  end if;

  insert into course_versions (course_id, title, description, status, guidance_path)
  select
    base_course_id,
    'Uprooting Drug Abuse - Christian Guidance',
    'A Bible-centered recovery journey through creation, identity, and purpose.',
    'published',
    'christian'
  where not exists (
    select 1
    from course_versions
    where course_id = base_course_id
      and guidance_path = 'christian'
  );

  select id
    into christian_version_id
  from course_versions
  where course_id = base_course_id
    and guidance_path = 'christian'
  order by created_at
  limit 1;

  update course_versions
  set
    title = 'Uprooting Drug Abuse - Christian Guidance',
    description = 'A Bible-centered recovery journey through creation, identity, and purpose.',
    status = 'published',
    guidance_path = 'christian',
    updated_at = now()
  where id = christian_version_id;

  insert into chapters (course_version_id, title, description, sort_order, status, is_published)
  select
    christian_version_id,
    'The Stage of Creation',
    'Creation, identity, and purpose through a Biblical lens.',
    1,
    'published',
    true
  where not exists (
    select 1
    from chapters
    where course_version_id = christian_version_id
      and sort_order = 1
  );

  select id
    into christian_chapter_id
  from chapters
  where course_version_id = christian_version_id
    and sort_order = 1
  order by created_at
  limit 1;

  update chapters
  set
    title = 'The Stage of Creation',
    description = 'Creation, identity, and purpose through a Biblical lens.',
    sort_order = 1,
    status = 'published',
    is_published = true,
    updated_at = now()
  where id = christian_chapter_id;

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
  select
    christian_chapter_id,
    title,
    null,
    lesson_number,
    15,
    opening_message,
    encouragement_message,
    lesson_number,
    'published',
    true
  from (
    values
      (
        1,
        'God''s Original Design for Humanity',
        'God created you with value, purpose, and dignity.',
        'You are more than your addiction.'
      ),
      (
        2,
        'Created in the Image of God',
        'You were created in the image of God.',
        'Your value was established by God long before your struggles began.'
      ),
      (
        3,
        'The Purpose of Life',
        'God created your life with purpose.',
        'Your future does not have to look like your past.'
      )
  ) as lesson_seed(lesson_number, title, opening_message, encouragement_message)
  where not exists (
    select 1
    from lessons
    where chapter_id = christian_chapter_id
      and lesson_number = lesson_seed.lesson_number
  );

  select id into lesson1_id from lessons where chapter_id = christian_chapter_id and lesson_number = 1 limit 1;
  select id into lesson2_id from lessons where chapter_id = christian_chapter_id and lesson_number = 2 limit 1;
  select id into lesson3_id from lessons where chapter_id = christian_chapter_id and lesson_number = 3 limit 1;

  update lessons
  set
    title = 'God''s Original Design for Humanity',
    subtitle = null,
    lesson_number = 1,
    estimated_minutes = 15,
    opening_message = 'God created you with value, purpose, and dignity.',
    encouragement_message = 'You are more than your addiction.',
    sort_order = 1,
    status = 'published',
    is_published = true,
    updated_at = now()
  where id = lesson1_id;

  update lessons
  set
    title = 'Created in the Image of God',
    subtitle = null,
    lesson_number = 2,
    estimated_minutes = 15,
    opening_message = 'You were created in the image of God.',
    encouragement_message = 'Your value was established by God long before your struggles began.',
    sort_order = 2,
    status = 'published',
    is_published = true,
    updated_at = now()
  where id = lesson2_id;

  update lessons
  set
    title = 'The Purpose of Life',
    subtitle = null,
    lesson_number = 3,
    estimated_minutes = 15,
    opening_message = 'God created your life with purpose.',
    encouragement_message = 'Your future does not have to look like your past.',
    sort_order = 3,
    status = 'published',
    is_published = true,
    updated_at = now()
  where id = lesson3_id;

  delete from lesson_content_blocks
  where lesson_id in (lesson1_id, lesson2_id, lesson3_id);

  insert into lesson_content_blocks (lesson_id, block_type, content, sort_order)
  values
    (
      lesson1_id,
      'welcome',
      jsonb_build_object(
        'heading', 'Welcome to Your Journey',
        'message', 'Before we can understand addiction, we must first understand who God created us to be. Many people see themselves through the lens of their mistakes, addictions, failures, or past experiences. However, God''s view of humanity begins much earlier than our struggles. It begins at creation. In this lesson, we will explore God''s original design for humanity and discover that every person was created with value, purpose, and dignity. No matter where your journey has taken you, God''s original intention for your life was never destruction, bondage, or hopelessness. Today we begin by looking at how God created mankind and what that means for your recovery journey.'
      ),
      1
    ),
    (
      lesson1_id,
      'reading',
      jsonb_build_object(
        'title', 'Created With Purpose',
        'body', 'The Bible teaches that God intentionally created the heavens, the earth, all living creatures, and mankind.' || E'\n\n' ||
                'According to Genesis 1, God created the plant kingdom, animals, and finally mankind. Unlike the rest of creation, humanity was created in God''s image and likeness.' || E'\n\n' ||
                'This means that human life has value beyond appearance, achievements, possessions, or social status.' || E'\n\n' ||
                'God''s original design included:' || E'\n\n' ||
                'Relationship with God' || E'\n\n' ||
                'Purpose and meaning' || E'\n\n' ||
                'Responsibility and stewardship' || E'\n\n' ||
                'Freedom to choose' || E'\n\n' ||
                'A life free from shame' || E'\n\n' ||
                'A life guided by God''s wisdom' || E'\n\n' ||
                'The author explains that God declared His creation to be good. Humanity was not created broken, addicted, or trapped in destructive cycles. Humanity was created to live in harmony with God and creation.' || E'\n\n' ||
                'When addiction enters a person''s life, it often convinces them that they are worthless, damaged, or beyond recovery. God''s truth says otherwise.' || E'\n\n' ||
                'Recovery begins when we start seeing ourselves through God''s eyes rather than through our failures.' || E'\n\n' ||
                'Your addiction is something you have experienced. It is not your identity. God created you for more than survival. He created you with purpose.' || E'\n\n' ||
                'Key Scripture: Genesis 1:26-27. "Then God said, Let Us make man in Our image, according to Our likeness..."'
      ),
      2
    ),
    (
      lesson1_id,
      'mentor_note',
      jsonb_build_object(
        'note', 'One of the first steps toward healing is recognizing that your worth does not come from your past. Your worth comes from being created by God.'
      ),
      3
    ),
    (
      lesson1_id,
      'video',
      jsonb_build_object(
        'title', 'God''s Original Design for Humanity',
        'description', 'Explain how God created humanity in His image and how addiction can distort a person''s understanding of their true identity. Encourage viewers to begin seeing themselves through God''s purpose rather than their past mistakes.'
      ),
      4
    ),
    (
      lesson1_id,
      'pause_reflect',
      jsonb_build_object(
        'question', 'When you think about yourself, what words usually come to mind?',
        'context', 'Keep reflecting as you answer: How has addiction affected the way you view yourself? What does it mean to you that God created you with purpose? Do you believe God still has a purpose for your life today? Why or why not?'
      ),
      5
    ),
    (
      lesson1_id,
      'journal_prompt',
      jsonb_build_object(
        'prompt', 'Take ten minutes today and write down three negative labels you have placed on yourself, three truths you believe God says about you, and one area of your life where you want to begin believing God''s truth instead of your past experiences.'
      ),
      6
    ),
    (
      lesson1_id,
      'mood_checkin',
      jsonb_build_object(
        'question', 'How connected do you feel to the truth that God created you with value and purpose today?'
      ),
      7
    ),
    (
      lesson1_id,
      'daily_action',
      jsonb_build_object(
        'title', 'Today''s Action Step',
        'action', 'Pray and ask God to help you see yourself through His eyes as you replace false labels with His truth.'
      ),
      8
    ),
    (
      lesson1_id,
      'mentor_note',
      jsonb_build_object(
        'note', 'You are more than your addiction. You are more than your failures. You are more than your worst day. God created you intentionally and lovingly. The same God who created the heavens and the earth knows your name, sees your struggles, and understands your journey. No matter how far you feel you have fallen, your story is not finished. Today is the beginning of remembering who God created you to be. Memory Verse: Genesis 1:27 - "So God created man in His own image; in the image of God He created him; male and female He created them."'
      ),
      9
    ),
    (
      lesson1_id,
      'quiz',
      jsonb_build_object(
        'question', 'Who created humanity?',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'God', 'is_correct', true),
          jsonb_build_object('text', 'Nature', 'is_correct', false),
          jsonb_build_object('text', 'Chance', 'is_correct', false),
          jsonb_build_object('text', 'Society', 'is_correct', false)
        )
      ),
      10
    ),
    (
      lesson1_id,
      'quiz',
      jsonb_build_object(
        'question', 'According to Genesis, humanity was created in whose image?',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'Angels', 'is_correct', false),
          jsonb_build_object('text', 'Nature', 'is_correct', false),
          jsonb_build_object('text', 'God''s Image', 'is_correct', true),
          jsonb_build_object('text', 'The Earth', 'is_correct', false)
        )
      ),
      11
    ),
    (
      lesson1_id,
      'quiz',
      jsonb_build_object(
        'question', 'True or False: Addiction is your identity.',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'True', 'is_correct', false),
          jsonb_build_object('text', 'False', 'is_correct', true)
        )
      ),
      12
    ),
    (
      lesson1_id,
      'complete',
      jsonb_build_object(
        'message', 'Congratulations on completing Lesson 1.',
        'encouragement', 'Today you discovered that your identity is not rooted in addiction, shame, or failure. Your identity begins with God''s original design for your life. In the next lesson, we will explore what it truly means to be created in the image of God.'
      ),
      13
    ),
    (
      lesson2_id,
      'welcome',
      jsonb_build_object(
        'heading', 'More Than What You Have Done',
        'message', 'Many people struggling with addiction eventually begin defining themselves by their mistakes. Some see themselves as addicts. Others see themselves as failures. Some believe they are too damaged for God to use. But before any addiction existed, before any failure occurred, God created humanity in His image and likeness. This truth changes everything. Today we will explore what it means to be created in God''s image and why that truth is essential for lasting recovery.'
      ),
      1
    ),
    (
      lesson2_id,
      'reading',
      jsonb_build_object(
        'title', 'God''s Image Within Us',
        'body', 'Genesis teaches that God created mankind differently from every other part of creation.' || E'\n\n' ||
                'Animals were created. Plants were created. The stars were created. But humanity was created in the image and likeness of God.' || E'\n\n' ||
                'The author explains that mankind was given unique value, purpose, responsibility, and authority by God. Humanity was designed to reflect God''s character and to live in relationship with Him.' || E'\n\n' ||
                'Being created in God''s image does not mean we physically look like God. It means we were created with qualities that reflect Him:' || E'\n\n' ||
                'The ability to love' || E'\n\n' ||
                'The ability to choose' || E'\n\n' ||
                'The ability to create' || E'\n\n' ||
                'The ability to reason' || E'\n\n' ||
                'The ability to build relationships' || E'\n\n' ||
                'The ability to know God' || E'\n\n' ||
                'Addiction often attacks these very areas. Instead of freedom, addiction brings bondage. Instead of clear thinking, addiction brings confusion. Instead of healthy relationships, addiction often creates isolation. Instead of purpose, addiction can create hopelessness.' || E'\n\n' ||
                'Yet addiction cannot erase the image of God. It may distort it. It may cover it with pain and brokenness. But it cannot remove it. God''s image remains part of who you are.' || E'\n\n' ||
                'Recovery is not about becoming someone completely different. Recovery is about rediscovering who God originally created you to be.' || E'\n\n' ||
                'Key Scripture: Genesis 1:27. "So God created man in His own image; in the image of God He created him; male and female He created them."'
      ),
      2
    ),
    (
      lesson2_id,
      'mentor_note',
      jsonb_build_object(
        'note', 'When we understand our value comes from God, we stop seeking value through substances, approval, pleasure, or escape.'
      ),
      3
    ),
    (
      lesson2_id,
      'video',
      jsonb_build_object(
        'title', 'Understanding Your God-Given Identity',
        'description', 'Explain what it means to be created in God''s image and how addiction can distort a person''s view of themselves. Encourage viewers to see themselves as valuable, loved, and created with purpose.'
      ),
      4
    ),
    (
      lesson2_id,
      'pause_reflect',
      jsonb_build_object(
        'question', 'How would you describe yourself today?',
        'context', 'Reflect further as you answer: Do you believe you have value apart from your achievements or failures? How has addiction affected your sense of identity? What would change in your life if you truly believed you were created in God''s image? Which quality of God''s image do you most want restored in your life right now?'
      ),
      5
    ),
    (
      lesson2_id,
      'journal_prompt',
      jsonb_build_object(
        'prompt', 'Find a quiet place and write down three ways addiction has negatively shaped how you see yourself, three qualities God placed within humanity that reflect His image, and one practical step you can take this week to honor the value God has placed within you.'
      ),
      6
    ),
    (
      lesson2_id,
      'mood_checkin',
      jsonb_build_object(
        'question', 'How strongly do you feel your God-given worth today?'
      ),
      7
    ),
    (
      lesson2_id,
      'daily_action',
      jsonb_build_object(
        'title', 'Today''s Action Step',
        'action', 'Spend a few moments praying and thanking God for creating you with purpose and dignity.'
      ),
      8
    ),
    (
      lesson2_id,
      'mentor_note',
      jsonb_build_object(
        'note', 'You may have made mistakes. You may have hurt yourself and others. You may feel broken. But none of those things determine your worth. Your value was established by God long before your struggles began. The same God who created you has not abandoned you. His image is still within you. His purpose for your life still exists. His grace is greater than your past. Today, choose to see yourself through God''s eyes rather than through the lens of addiction. Memory Verse: Psalm 139:14 - "I will praise You, for I am fearfully and wonderfully made; marvelous are Your works, and that my soul knows very well."'
      ),
      9
    ),
    (
      lesson2_id,
      'quiz',
      jsonb_build_object(
        'question', 'According to Genesis, humanity was created in whose image?',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'Society''s image', 'is_correct', false),
          jsonb_build_object('text', 'Nature''s image', 'is_correct', false),
          jsonb_build_object('text', 'God''s image', 'is_correct', true),
          jsonb_build_object('text', 'The world''s image', 'is_correct', false)
        )
      ),
      10
    ),
    (
      lesson2_id,
      'quiz',
      jsonb_build_object(
        'question', 'True or False: Addiction can completely remove the image of God from a person.',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'True', 'is_correct', false),
          jsonb_build_object('text', 'False', 'is_correct', true)
        )
      ),
      11
    ),
    (
      lesson2_id,
      'quiz',
      jsonb_build_object(
        'question', 'Which of the following reflects God''s design for humanity?',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'Hopelessness', 'is_correct', false),
          jsonb_build_object('text', 'Bondage', 'is_correct', false),
          jsonb_build_object('text', 'Purpose', 'is_correct', true),
          jsonb_build_object('text', 'Isolation', 'is_correct', false)
        )
      ),
      12
    ),
    (
      lesson2_id,
      'quiz',
      jsonb_build_object(
        'question', 'What is one goal of recovery?',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'Becoming a different person entirely', 'is_correct', false),
          jsonb_build_object('text', 'Rediscovering who God created you to be', 'is_correct', true),
          jsonb_build_object('text', 'Earning God''s love', 'is_correct', false),
          jsonb_build_object('text', 'Forgetting your past', 'is_correct', false)
        )
      ),
      13
    ),
    (
      lesson2_id,
      'complete',
      jsonb_build_object(
        'message', 'Congratulations on completing Lesson 2.',
        'encouragement', 'Today you learned that your value is not determined by your addiction, your past, or the opinions of others. You were created in God''s image and carry a God-given purpose that no mistake can erase. In the next lesson, we will explore God''s purpose for life and how understanding that purpose helps us find direction, meaning, and hope in recovery.'
      ),
      14
    ),
    (
      lesson3_id,
      'welcome',
      jsonb_build_object(
        'heading', 'Why Am I Here?',
        'message', 'One of the most common questions people ask is: "Why am I here?" Many people struggling with addiction feel lost, confused, and disconnected from any sense of purpose. Life can begin to feel like an endless cycle of surviving one day at a time. But God did not create humanity without direction. The Bible teaches that every person was created intentionally and for a purpose. Today we will explore God''s purpose for human life and how discovering that purpose can become a powerful part of recovery.'
      ),
      1
    ),
    (
      lesson3_id,
      'reading',
      jsonb_build_object(
        'title', 'Created for More Than Survival',
        'body', 'When God created Adam and Eve, He did not simply place them on the earth without responsibility or meaning.' || E'\n\n' ||
                'Genesis shows us that God gave humanity purpose from the very beginning.' || E'\n\n' ||
                'God instructed mankind to:' || E'\n\n' ||
                'Be fruitful' || E'\n\n' ||
                'Multiply' || E'\n\n' ||
                'Fill the earth' || E'\n\n' ||
                'Care for creation' || E'\n\n' ||
                'Exercise stewardship and responsibility' || E'\n\n' ||
                'Live in relationship with Him' || E'\n\n' ||
                'The author explains that mankind was created in God''s image and entrusted with responsibility over creation. Humanity was not created to wander aimlessly, but to participate in God''s design and purpose for the world.' || E'\n\n' ||
                'Purpose gives direction. Direction gives meaning. Meaning gives hope.' || E'\n\n' ||
                'One of the devastating effects of addiction is that it gradually replaces purpose with survival. Instead of asking, "What was I created for?" a person begins asking, "How do I get through today?" Instead of building a future, they become trapped managing consequences. Instead of pursuing purpose, they pursue relief.' || E'\n\n' ||
                'But God''s design for your life is greater than simply surviving. God desires that you know Him, grow spiritually, develop healthy relationships, serve others, use your gifts and abilities, and live a life that reflects His goodness.' || E'\n\n' ||
                'Recovery becomes stronger when it is connected to purpose. When a person discovers something worth living for, they become more willing to fight for their freedom. Purpose becomes fuel for recovery.' || E'\n\n' ||
                'Key Scripture: Jeremiah 29:11. "For I know the plans I have for you, says the Lord, plans for peace and not for evil, to give you a future and a hope."'
      ),
      2
    ),
    (
      lesson3_id,
      'mentor_note',
      jsonb_build_object(
        'note', 'Addiction often narrows life down to immediate needs and temporary relief. Recovery expands life by reconnecting us to God''s greater purpose.'
      ),
      3
    ),
    (
      lesson3_id,
      'video',
      jsonb_build_object(
        'title', 'Discovering God''s Purpose for Your Life',
        'description', 'Discuss how addiction can distract people from God''s purpose and how recovery involves rediscovering the gifts, calling, and opportunities God has placed before them. Encourage viewers to see recovery as part of a bigger journey rather than merely quitting a harmful habit.'
      ),
      4
    ),
    (
      lesson3_id,
      'pause_reflect',
      jsonb_build_object(
        'question', 'When was the last time you felt your life had purpose?',
        'context', 'Keep reflecting as you answer: How has addiction affected your goals, dreams, or ambitions? What gifts, talents, or strengths do you believe God has given you? What kind of person would you like to become in the future? If addiction was no longer controlling your life, what would you pursue?'
      ),
      5
    ),
    (
      lesson3_id,
      'journal_prompt',
      jsonb_build_object(
        'prompt', 'Take a notebook and write down three dreams or goals you once had before addiction became a major part of your life, three strengths or positive qualities you believe God has placed within you, and one small step you can take this week toward a healthier future.'
      ),
      6
    ),
    (
      lesson3_id,
      'mood_checkin',
      jsonb_build_object(
        'question', 'How connected do you feel to God''s purpose for your life today?'
      ),
      7
    ),
    (
      lesson3_id,
      'daily_action',
      jsonb_build_object(
        'title', 'Today''s Action Step',
        'action', 'Finish by praying and asking God to reveal more of His purpose for your life as you take one small step toward a healthier future.'
      ),
      8
    ),
    (
      lesson3_id,
      'mentor_note',
      jsonb_build_object(
        'note', 'Your life is not an accident. You are not here by chance. God created you intentionally and lovingly. Even if addiction has stolen years of your life, it cannot steal the purpose God has placed within you. Many people in Scripture experienced failure, brokenness, and hardship before stepping into God''s calling. Your story is still being written. Your future does not have to look like your past. God''s purpose for your life remains alive, and each step of recovery brings you closer to it. Memory Verse: Jeremiah 29:11 - "For I know the plans I have for you, says the Lord, plans for peace and not for evil, to give you a future and a hope."'
      ),
      9
    ),
    (
      lesson3_id,
      'quiz',
      jsonb_build_object(
        'question', 'Did God create humanity with purpose?',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'Yes', 'is_correct', true),
          jsonb_build_object('text', 'No', 'is_correct', false)
        )
      ),
      10
    ),
    (
      lesson3_id,
      'quiz',
      jsonb_build_object(
        'question', 'Which of the following is one of God''s original instructions to humanity?',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'Live in fear', 'is_correct', false),
          jsonb_build_object('text', 'Hide from responsibility', 'is_correct', false),
          jsonb_build_object('text', 'Be fruitful', 'is_correct', true),
          jsonb_build_object('text', 'Remain isolated', 'is_correct', false)
        )
      ),
      11
    ),
    (
      lesson3_id,
      'quiz',
      jsonb_build_object(
        'question', 'True or False: Addiction often causes people to focus only on survival rather than purpose.',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'True', 'is_correct', true),
          jsonb_build_object('text', 'False', 'is_correct', false)
        )
      ),
      12
    ),
    (
      lesson3_id,
      'quiz',
      jsonb_build_object(
        'question', 'What can purpose provide during recovery?',
        'options', jsonb_build_array(
          jsonb_build_object('text', 'Confusion', 'is_correct', false),
          jsonb_build_object('text', 'Direction', 'is_correct', true),
          jsonb_build_object('text', 'Isolation', 'is_correct', false),
          jsonb_build_object('text', 'Shame', 'is_correct', false)
        )
      ),
      13
    ),
    (
      lesson3_id,
      'complete',
      jsonb_build_object(
        'message', 'Congratulations on completing Lesson 3.',
        'encouragement', 'Today you discovered that God created you with purpose, direction, and hope. Recovery is not only about leaving something behind. It is also about moving toward the life God intended for you. In the next lesson, we will enter the Garden of Eden and begin exploring the environment God created for humanity before the fall.'
      ),
      14
    );
end $$;
