const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(
  ROOT,
  "supabase/migrations/20260713000000_seed_additional_courses.sql"
);

const COURSE_CONFIGS = [
  {
    manifestPath: path.join(
      ROOT,
      "public/3 summarized books/From Addicts to Leaders/lesson-information/seed-manifest.json"
    ),
    slug: "from-addicts-to-leaders",
    sortOrder: 2,
  },
  {
    manifestPath: path.join(
      ROOT,
      "public/3 summarized books/Protecting the Next Generation/lesson-information/seed-manifest.json"
    ),
    slug: "protecting-the-next-generation",
    sortOrder: 3,
  },
];

function getBlockContent(blocks, type, field) {
  const block = blocks.find((item) => item.type === type);
  return typeof block?.content?.[field] === "string" ? block.content[field] : null;
}

function buildCoursePayload() {
  return COURSE_CONFIGS.map((config) => {
    const manifest = JSON.parse(fs.readFileSync(config.manifestPath, "utf8"));

    const chapters = manifest.chapters.map((chapter) => ({
      sort_order: chapter.sortOrder,
      title: chapter.title,
      description: chapter.description,
      lessons: chapter.lessons.map((lesson) => ({
        lesson_number: lesson.lessonNumber,
        title: lesson.title,
        subtitle: null,
        estimated_minutes: lesson.estimatedMinutes,
        opening_message:
          getBlockContent(lesson.blocks, "welcome", "message") ??
          getBlockContent(lesson.blocks, "reading", "title") ??
          null,
        encouragement_message:
          getBlockContent(lesson.blocks, "complete", "encouragement") ??
          getBlockContent(lesson.blocks, "complete", "message") ??
          null,
        blocks: lesson.blocks.map((block) => ({
          type: block.type,
          content: block.content,
        })),
      })),
    }));

    return {
      title: manifest.courseTitle,
      slug: config.slug,
      description: manifest.description,
      sort_order: config.sortOrder,
      version: {
        guidance_path: "religious",
        title: `${manifest.courseTitle} - Religious Guidance`,
        description: manifest.description,
        chapters,
      },
    };
  });
}

function buildSql(payload) {
  const json = JSON.stringify(payload, null, 2).replace(/'/g, "''");
  return `do $$
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
      '${json}'::jsonb
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
`;
}

const payload = buildCoursePayload();
fs.writeFileSync(OUTPUT, buildSql(payload), "utf8");
console.log(`Wrote ${path.relative(ROOT, OUTPUT)}`);
