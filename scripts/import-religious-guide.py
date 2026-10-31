"""Validate the supplied Religious Guided DOCX set and generate its SQL migration."""

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "supabase/migrations/20261023000000_update_religious_guided_content.sql"
spec = importlib.util.spec_from_file_location("christian_importer", ROOT / "scripts/import-christian-guide.py")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)


def field(lines, label):
    if not lines or not lines[0].startswith(label):
        raise ValueError(f"Expected {label}: {lines[:2]}")
    first = lines[0][len(label):].strip()
    if first:
        return first, lines[1:]
    if len(lines) < 2:
        raise ValueError(f"Missing {label} value")
    return lines[1], lines[2:]


def quiz(lines):
    question, options = field(lines, "Question:")
    choices = []
    for option in options:
        answer = option.removeprefix("- ").strip()
        correct = answer.lower().endswith("(correct)")
        choices.append({"text": re.sub(r"\s*\(correct\)$", "", answer, flags=re.I), "is_correct": correct})
    if len(choices) < 2 or sum(choice["is_correct"] for choice in choices) != 1:
        raise ValueError(f"Invalid quiz: {question}")
    return {"question": question, "options": choices}


def lesson(file, number, chapter_title):
    lines = base.paragraphs(file)
    header = re.fullmatch(r"LESSON (\d+): (.+)", lines[2])
    if not header or int(header.group(1)) != number:
        raise ValueError(f"Lesson heading mismatch: {file}: {lines[2]}")
    if not lines[1].endswith(f": {chapter_title}"):
        raise ValueError(f"Chapter heading mismatch: {file}: {lines[1]}")
    steps = base.split_steps(lines)
    expected = ["WELCOME", "TEACHING", "REFLECTION QUOTE", "VIDEO", "PAUSE & REFLECT", "JOURNAL",
                "MOOD CHECK-IN", "ACTION", "REFLECTION QUOTE", "REFLECTION CHECK", "REFLECTION CHECK",
                "REFLECTION CHECK", "COMPLETE"]
    if [steps[i]["label"] for i in range(1, 14)] != expected:
        raise ValueError(f"Unexpected step order: {file}")
    welcome, welcome_body = field(steps[1]["lines"], "Title:")
    reading, reading_body = field(steps[2]["lines"], "Title:")
    video, video_body = field(steps[4]["lines"], "Title:")
    reflect, reflect_body = field(steps[5]["lines"], "Question:")
    mood, mood_body = field(steps[7]["lines"], "Question:")
    action, action_body = field(steps[8]["lines"], "Title:")
    if mood_body:
        mood = "\n\n".join([mood, *mood_body])
    blocks = [
        {"type": "welcome", "content": {"heading": welcome, "message": "\n\n".join(welcome_body)}},
        {"type": "reading", "content": {"title": reading, "body": "\n\n".join(reading_body)}},
        {"type": "mentor_note", "content": {"note": "\n\n".join(steps[3]["lines"])}},
        {"type": "video", "content": {"title": video, "description": "\n\n".join(video_body)}},
        {"type": "pause_reflect", "content": {"question": reflect, "context": "\n\n".join(reflect_body)}},
        {"type": "journal_prompt", "content": {"prompt": "\n\n".join(steps[6]["lines"])}},
        {"type": "mood_checkin", "content": {"question": mood}},
        {"type": "daily_action", "content": {"title": action, "action": "\n\n".join(action_body)}},
        {"type": "mentor_note", "content": {"note": "\n\n".join(steps[9]["lines"])}},
        *({"type": "quiz", "content": quiz(steps[i]["lines"])} for i in (10, 11, 12)),
        {"type": "complete", "content": {"message": steps[13]["lines"][0],
                                         "encouragement": "\n\n".join(steps[13]["lines"][1:])}},
    ]
    return {"number": number, "title": header.group(2), "minutes": 15, "blocks": blocks}


def main():
    source = Path(sys.argv[1]).resolve()
    if not source.is_dir():
        raise ValueError(f"Missing source folder: {source}")
    chapters = []
    for number in range(1, 12):
        folder = source / f"chapter{number}"
        lines = base.paragraphs(folder / f"Chapter {number}.docx")
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
    if len(chapters) != 11 or sum(len(chapter["lessons"]) for chapter in chapters) != 87:
        raise ValueError("Expected 11 chapters and 87 lessons")
    payload = json.dumps(chapters, ensure_ascii=False).replace("'", "''")
    sql = base.SQL.replace("Christian Guided", "Religious Guided").replace("'christian'", "'religious'")
    mapping = "case (chapter_item->>'number')::integer when 8 then 9 when 9 then 10 when 10 then 8 else (chapter_item->>'number')::integer end"
    start = sql.index("    select id into chapter_record from chapters")
    end = sql.index("    if chapter_record is null then\n      raise exception 'Missing chapter", start)
    sql = sql[:start] + (
        "    select id into chapter_record from chapters\n"
        "    where course_version_id = course_version and title = chapter_item->>'title'\n"
        "    order by created_at limit 1;\n"
        "    if chapter_record is null then\n"
        "      select id into chapter_record from chapters\n"
        f"      where course_version_id = course_version and sort_order = {mapping}\n"
        "      order by created_at limit 1;\n"
        "    end if;\n"
    ) + sql[end:]
    OUTPUT.write_text(sql.replace("__PAYLOAD__", payload), encoding="utf-8")
    print(f"Validated 11 chapters, 87 lessons, 1131 blocks; generated {OUTPUT}")


if __name__ == "__main__":
    main()
