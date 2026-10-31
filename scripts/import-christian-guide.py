"""Validate the supplied Christian Guided DOCX set and generate its SQL migration.

Run with: python scripts/import-christian-guide.py "C:/path/to/Christian Guided Program"
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "supabase/migrations/20261022000000_update_christian_guided_content.sql"
W = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def paragraphs(file):
    with zipfile.ZipFile(file) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
    return [text for node in document.findall(".//w:body/w:p", W)
            if (text := "".join(part.text or "" for part in node.findall(".//w:t", W)).strip())]


def split_steps(lines):
    steps = {}
    for line in lines:
        match = re.fullmatch(r"STEP (\d+): (.+)", line)
        if match:
            number = int(match.group(1))
            if number in steps:
                raise ValueError(f"Duplicate step {number}")
            steps[number] = {"label": match.group(2), "lines": []}
        elif steps:
            steps[number]["lines"].append(line)
    if list(steps) != list(range(1, 14)):
        raise ValueError(f"Expected steps 1–13, got {list(steps)}")
    return steps


def labeled(lines, label):
    if not lines or not lines[0].startswith(label):
        raise ValueError(f"Expected {label}: {lines[:2]}")
    return lines[0][len(label):].strip(), lines[1:]


def quiz(lines):
    question, options = labeled(lines, "Question:")
    choices = []
    for option in options:
        if not option.startswith("- "):
            raise ValueError(f"Unexpected quiz line: {option}")
        answer = option[2:].strip()
        correct = answer.lower().endswith("(correct)")
        choices.append({"text": re.sub(r"\s*\(correct\)$", "", answer, flags=re.I), "is_correct": correct})
    if len(choices) < 2 or sum(choice["is_correct"] for choice in choices) != 1:
        raise ValueError(f"Invalid quiz: {question}")
    return {"question": question, "options": choices}


def lesson(file, number, chapter_title):
    lines = paragraphs(file)
    header = re.fullmatch(r"LESSON (\d+): (.+)", lines[2])
    if not header or int(header.group(1)) != number:
        raise ValueError(f"Lesson heading mismatch: {file}: {lines[2]}")
    if not lines[1].endswith(f": {chapter_title}"):
        raise ValueError(f"Chapter heading mismatch: {file}: {lines[1]}")
    steps = split_steps(lines)
    expected = ["WELCOME", "TEACHING", "REFLECTION QUOTE", "VIDEO", "PAUSE & REFLECT", "JOURNAL",
                "MOOD CHECK-IN", "ACTION", "REFLECTION QUOTE", "REFLECTION CHECK", "REFLECTION CHECK",
                "REFLECTION CHECK", "COMPLETE"]
    if [steps[i]["label"] for i in range(1, 14)] != expected:
        raise ValueError(f"Unexpected step order: {file}")
    welcome_title, welcome_body = labeled(steps[1]["lines"], "Title:")
    reading_title, reading_body = labeled(steps[2]["lines"], "Title:")
    video_title, video_body = labeled(steps[4]["lines"], "Title:")
    reflect_question, reflect_body = labeled(steps[5]["lines"], "Question:")
    mood_question, mood_body = labeled(steps[7]["lines"], "Question:")
    action_title, action_body = labeled(steps[8]["lines"], "Title:")
    if mood_body:
        raise ValueError(f"Unexpected mood content: {file}")
    blocks = [
        {"type": "welcome", "content": {"heading": welcome_title, "message": "\n\n".join(welcome_body)}},
        {"type": "reading", "content": {"title": reading_title, "body": "\n\n".join(reading_body)}},
        {"type": "mentor_note", "content": {"note": "\n\n".join(steps[3]["lines"])}},
        {"type": "video", "content": {"title": video_title, "description": "\n\n".join(video_body)}},
        {"type": "pause_reflect", "content": {"question": reflect_question, "context": "\n\n".join(reflect_body)}},
        {"type": "journal_prompt", "content": {"prompt": "\n\n".join(steps[6]["lines"])}},
        {"type": "mood_checkin", "content": {"question": mood_question}},
        {"type": "daily_action", "content": {"title": action_title, "action": "\n\n".join(action_body)}},
        {"type": "mentor_note", "content": {"note": "\n\n".join(steps[9]["lines"])}},
        *({"type": "quiz", "content": quiz(steps[i]["lines"])} for i in (10, 11, 12)),
        {"type": "complete", "content": {"message": steps[13]["lines"][0],
                                         "encouragement": "\n\n".join(steps[13]["lines"][1:])}},
    ]
    if any(not block["content"] for block in blocks):
        raise ValueError(f"Empty block: {file}")
    return {"number": number, "title": header.group(2), "minutes": 15, "blocks": blocks}


def main():
    source = Path(sys.argv[1]).resolve()
    if not source.is_dir():
        raise ValueError(f"Missing source folder: {source}")
    chapters = []
    for number in range(1, 12):
        folder = source / f"chapter{number}"
        lines = paragraphs(folder / f"Chapter {number}.docx")
        header = re.fullmatch(r"CHAPTER (\d+): (.+)", lines[1])
        if not header or int(header.group(1)) != number:
            raise ValueError(f"Chapter heading mismatch: {folder}")
        title = header.group(2)
        overview = lines.index("Chapter Overview")
        lesson_list = lines.index("Chapter Lessons")
        description = "\n\n".join(lines[overview + 1:lesson_list])
        lesson_files = sorted(folder.glob("Lesson *.docx"), key=lambda p: int(re.search(r"\d+", p.stem).group()))
        lessons = [lesson(folder / f"Lesson {n}.docx", n, title) for n in range(1, len(lesson_files) + 1)]
        if len(lessons) != len(lesson_files):
            raise ValueError(f"Non-contiguous lessons: {folder}")
        chapters.append({"number": number, "title": title, "description": description, "lessons": lessons})
    if sum(len(chapter["lessons"]) for chapter in chapters) != 87:
        raise ValueError("Expected 87 lessons")
    payload = json.dumps(chapters, ensure_ascii=False).replace("'", "''")
    OUTPUT.write_text(SQL.replace("__PAYLOAD__", payload), encoding="utf-8")
    print(f"Validated {len(chapters)} chapters, 87 lessons, 1131 blocks; generated {OUTPUT}")


SQL = """-- Update Christian Guided content from the supplied DOCX manuscripts.
-- Match chapters by title so the chapter 8–10 reorder preserves IDs and learner progress.
do $$
declare
  chapter_item jsonb;
  lesson_item jsonb;
  block_item jsonb;
  course_version uuid;
  chapter_record uuid;
  lesson_record uuid;
  block_record uuid;
  block_position integer;
begin
  select cv.id into strict course_version
  from course_versions cv join courses c on c.id = cv.course_id
  where c.slug = 'uprooting-drug-abuse' and cv.guidance_path = 'christian';

  for chapter_item in select value from jsonb_array_elements('__PAYLOAD__'::jsonb) loop
    select id into chapter_record from chapters
    where course_version_id = course_version and title = chapter_item->>'title'
    order by created_at limit 1;
    if chapter_record is null and (chapter_item->>'number')::integer = 5 then
      select id into chapter_record from chapters
      where course_version_id = course_version and title = 'The Three Stages of Drug Abuse'
      order by created_at limit 1;
    end if;
    if chapter_record is null then
      raise exception 'Missing chapter: %', chapter_item->>'title';
    end if;
    update chapters set title = chapter_item->>'title', description = chapter_item->>'description',
      sort_order = (chapter_item->>'number')::integer, updated_at = now()
    where id = chapter_record;

    for lesson_item in select value from jsonb_array_elements(chapter_item->'lessons') loop
      select id into lesson_record from lessons
      where chapter_id = chapter_record and lesson_number = (lesson_item->>'number')::integer
      order by created_at limit 1;
      if lesson_record is null then
        raise exception 'Missing lesson % in chapter %', lesson_item->>'number', chapter_item->>'title';
      end if;
      update lessons set title = lesson_item->>'title', estimated_minutes = (lesson_item->>'minutes')::integer,
        opening_message = lesson_item->'blocks'->0->'content'->>'message',
        encouragement_message = lesson_item->'blocks'->12->'content'->>'encouragement',
        sort_order = (lesson_item->>'number')::integer, updated_at = now()
      where id = lesson_record;

      block_position := 0;
      for block_item in select value from jsonb_array_elements(lesson_item->'blocks') loop
        block_position := block_position + 1;
        select id into block_record from lesson_content_blocks
        where lesson_id = lesson_record and sort_order = block_position
        order by created_at limit 1;
        if block_record is null then
          insert into lesson_content_blocks (lesson_id, block_type, content, sort_order)
          values (lesson_record, block_item->>'type', block_item->'content', block_position);
        else
          update lesson_content_blocks set block_type = block_item->>'type', content = block_item->'content',
            updated_at = now() where id = block_record;
        end if;
      end loop;
      delete from lesson_content_blocks where lesson_id = lesson_record and sort_order > block_position;
    end loop;
  end loop;
end $$;
"""


if __name__ == "__main__":
    main()
