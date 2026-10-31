do $$
declare
  base_course_id uuid;
  christian_version_id uuid;
  christian_chapter_id uuid;
  lesson_record record;
  current_lesson_id uuid;
begin
  select id
    into base_course_id
  from courses
  where title = 'Uprooting Drug Abuse'
  limit 1;

  if base_course_id is null then
    raise exception 'Course not found: Uprooting Drug Abuse';
  end if;

  select id
    into christian_version_id
  from course_versions
  where course_id = base_course_id
    and guidance_path = 'christian'
  order by created_at
  limit 1;

  if christian_version_id is null then
    raise exception 'Christian course version not found';
  end if;

  select id
    into christian_chapter_id
  from chapters
  where course_version_id = christian_version_id
    and sort_order = 1
  order by created_at
  limit 1;

  if christian_chapter_id is null then
    raise exception 'Christian chapter 1 not found';
  end if;

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
    lesson_seed.title,
    null,
    lesson_seed.lesson_number,
    15,
    lesson_seed.opening_message,
    lesson_seed.encouragement_message,
    lesson_seed.lesson_number,
    'published',
    true
  from (
    values
      (4, 'The Garden of Eden', 'God prepared a good place for people to live with Him.', 'Your story started with God''s goodness, not your brokenness.'),
      (5, 'Freedom, Choice, and Responsibility', 'Freedom was always meant to work together with wise choices.', 'Choice matters, and God invites you to choose life.'),
      (6, 'The First Temptation', 'Temptation begins by questioning what God has said.', 'God helps you recognize lies before they become habits.'),
      (7, 'The Fall of Man', 'Disobedience changed the human story and opened the door to shame.', 'Even after the fall, God kept pursuing people with mercy.'),
      (8, 'The Consequences of Disobedience', 'Sin always produces fruit, and addiction is one of its loudest echoes.', 'God can still heal what disobedience has damaged.'),
      (9, 'God''s Creation and the Plant Kingdom', 'God created the plant kingdom good, but humans must use creation with wisdom.', 'Creation is a gift, not a master.'),
      (10, 'Understanding the Origins of Drug Abuse', 'Addiction is never just about a substance; it is tied to the heart, choices, pain, and deception.', 'When you understand the roots, you can begin to walk toward freedom.')
  ) as lesson_seed(lesson_number, title, opening_message, encouragement_message)
  where not exists (
    select 1
    from lessons
    where chapter_id = christian_chapter_id
      and lesson_number = lesson_seed.lesson_number
  );

  for lesson_record in
    select *
    from (
      values
        (4, 'The Garden of Eden', 'God prepared a good place for people to live with Him.', 'Your story started with God''s goodness, not your brokenness.', 'Eden was a place of order, relationship, and trust.', 'Before brokenness entered the world, humanity lived in a place where God''s presence was near and His boundaries were good. The garden shows us that God never designed life to be chaotic, empty, or ruled by craving. He designed people for fellowship, stewardship, and peace.', 'You were created for fellowship, not isolation.', 'How has addiction pulled you away from healthy relationship with God, others, or yourself?', 'What healthy boundaries or rhythms could help you return to God''s design?', 'Write down one area where you want God''s order restored this week.', 'Return to God''s design', 'Pray today about one place where you need God''s peace and order.', 'The garden reminds us that God''s heart is restoration, not ruin.', 'The next lesson will show that freedom includes choice, and choice always carries responsibility.'),
        (5, 'Freedom, Choice, and Responsibility', 'God gave people real freedom, and freedom always carries responsibility.', 'Wise choices protect the life God wants to build in you.', 'Freedom is not doing anything we want; it is the ability to choose what is right.', 'The Bible shows that God gave human beings real choice from the beginning. That choice made love, obedience, and trust meaningful. It also means people are responsible for the direction they take. Recovery grows when we stop blaming everything else and begin choosing life on purpose.', 'Responsibility is not shame; it is the doorway to change.', 'What choices have shaped your life the most, for good or for harm?', 'Where do you need to take responsibility without carrying shame?', 'Write down one choice you can make today that supports healing.', 'Choose life today', 'Ask God to help you make one wise choice before the day ends.', 'Freedom becomes powerful when it is guided by truth.', 'The next lesson will show how temptation begins by attacking truth.'),
        (6, 'The First Temptation', 'Temptation often starts with a lie that sounds reasonable.', 'God gives you strength to notice deception early.', 'The enemy first attacked God''s word before he ever attacked human behavior.', 'The first temptation in Scripture was not only about fruit; it was about trust. The serpent questioned God''s goodness and twisted His words. Addiction often works the same way by making a false promise feel urgent, comforting, or harmless. The fight begins when we learn to recognize the lie.', 'A lie loses power when it is brought into the light.', 'What lies have tried to sound true in your own life?', 'What truth from God''s Word can answer those lies today?', 'Write one lie and one scripture truth beside it.', 'Replace the lie with truth', 'Speak one truth from Scripture out loud when temptation rises.', 'Temptation is real, but truth is stronger.', 'The next lesson will show what happened when temptation was accepted.'),
        (7, 'The Fall of Man', 'When disobedience entered, shame and hiding followed.', 'God still seeks people even after failure.', 'The fall changed human experience and introduced separation, shame, and fear.', 'Genesis shows that one act of disobedience had lasting consequences. People began hiding from God and from one another. Addiction often repeats that pattern by pushing people into secrecy and distance. The fall teaches us that broken choices create broken outcomes, but it also reminds us that God comes looking for the lost.', 'Shame hides, but grace calls you forward.', 'Where do you tend to hide when you feel exposed or afraid?', 'What would honesty look like in the presence of God today?', 'Write about one area where you need to stop hiding.', 'Come into the light', 'Tell God one honest truth you have been avoiding.', 'God did not stop loving people after the fall.', 'The next lesson will show how disobedience continues to produce consequences.'),
        (8, 'The Consequences of Disobedience', 'Disobedience always leaves a mark, but it does not have the final word.', 'God can heal damage and rebuild what was broken.', 'Sin produces consequences in the heart, the home, and the future.', 'The Bible never hides the cost of disobedience. Pain enters relationships, work becomes harder, fear grows stronger, and the human heart becomes more fractured. Addiction reflects that reality in modern life. It takes what seems private and turns it into consequences that spread outward. Still, God is not shocked by brokenness, and He is able to restore what sin has damaged.', 'Consequences can teach us, but grace can transform us.', 'What consequences of destructive choices have you seen in your life?', 'How can honesty help you respond instead of repeat?', 'Write one consequence you are ready to face with God''s help.', 'Face reality with God', 'Take one step today that shows you are no longer avoiding truth.', 'Consequences are painful, but they can also become turning points.', 'The next lesson will show why God created the plant kingdom and how wisdom matters.'),
        (9, 'God''s Creation and the Plant Kingdom', 'God made creation good, including the plant kingdom.', 'The gift of creation is meant to be handled with wisdom and purpose.', 'God created plants to serve life, not destruction.', 'From the beginning, creation was good and useful. Scripture shows that plants were part of God''s provision, but human beings were never meant to worship, abuse, or misuse creation. This lesson helps us see that the problem is not only what exists in creation, but how the human heart chooses to use it. Wisdom protects us from turning a gift into a trap.', 'A gift becomes harmful when it is used outside God''s wisdom.', 'How have you seen good things become harmful when they are misused?', 'What does wise stewardship look like in your everyday choices?', 'Write one way you want to use God''s gifts more wisely.', 'Honor creation with wisdom', 'Thank God for one good gift and ask Him to help you use it well.', 'God''s gifts are best received with reverence and restraint.', 'The final lesson of this chapter will connect these truths to the origins of drug abuse.'),
        (10, 'Understanding the Origins of Drug Abuse', 'Addiction grows from a mixture of pain, deception, choices, and spiritual brokenness.', 'When you understand the roots, you can begin to walk toward freedom.', 'Drug abuse is never just about a substance; it is about what the heart is seeking.', 'This lesson brings the chapter together. The origins of drug abuse can be seen in temptation, disobedience, pain, shame, and the desire to escape. People often reach for substances because they want relief, comfort, control, or silence. But the root problem goes deeper than chemistry. Healing begins when a person is willing to face the heart honestly and let God begin His work of restoration.', 'Your pain is real, and God is able to meet it with truth and healing.', 'What do you think your heart has been searching for through destructive choices?', 'How can honesty with God become the start of real change?', 'Write one root issue you want God to help you face directly.', 'Name the real need', 'Pray and ask God to show you the deeper need behind your struggle.', 'Understanding the root is the first step toward lasting freedom.')
    ) as lesson_seed(lesson_number, title, opening_message, encouragement_message, welcome_heading, welcome_message, reading_title, reading_body, mentor_note, reflect_question, reflect_context, journal_prompt, action_title, action_text, complete_message, complete_encouragement)
  loop
    select id
      into current_lesson_id
    from lessons
    where chapter_id = christian_chapter_id
      and lesson_number = lesson_record.lesson_number
    limit 1;

    if current_lesson_id is null then
      continue;
    end if;

    update lessons
    set
      title = lesson_record.title,
      subtitle = null,
      lesson_number = lesson_record.lesson_number,
      estimated_minutes = 15,
      opening_message = lesson_record.opening_message,
      encouragement_message = lesson_record.encouragement_message,
      sort_order = lesson_record.lesson_number,
      status = 'published',
      is_published = true,
      updated_at = now()
    where id = current_lesson_id;

    delete from lesson_content_blocks
    where lesson_id = current_lesson_id;

    insert into lesson_content_blocks (lesson_id, block_type, content, sort_order)
    values
      (
        current_lesson_id,
        'welcome',
        jsonb_build_object(
          'heading', lesson_record.welcome_heading,
          'message', lesson_record.welcome_message
        ),
        1
      ),
      (
        current_lesson_id,
        'reading',
        jsonb_build_object(
          'title', lesson_record.reading_title,
          'body', lesson_record.reading_body
        ),
        2
      ),
      (
        current_lesson_id,
        'mentor_note',
        jsonb_build_object(
          'note', lesson_record.mentor_note
        ),
        3
      ),
      (
        current_lesson_id,
        'pause_reflect',
        jsonb_build_object(
          'question', lesson_record.reflect_question,
          'context', lesson_record.reflect_context
        ),
        4
      ),
      (
        current_lesson_id,
        'journal_prompt',
        jsonb_build_object(
          'prompt', lesson_record.journal_prompt
        ),
        5
      ),
      (
        current_lesson_id,
        'daily_action',
        jsonb_build_object(
          'title', lesson_record.action_title,
          'action', lesson_record.action_text
        ),
        6
      ),
      (
        current_lesson_id,
        'complete',
        jsonb_build_object(
          'message', lesson_record.complete_message,
          'encouragement', lesson_record.complete_encouragement
        ),
        7
      );
  end loop;
end $$;
