import { type BlockType } from "@/types";
import { WelcomeBlock } from "./blocks/WelcomeBlock";
import { ReadingBlock } from "./blocks/ReadingBlock";
import { MentorNoteBlock } from "./blocks/MentorNoteBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { AudioBlock } from "./blocks/AudioBlock";
import { PauseReflectBlock } from "./blocks/PauseReflectBlock";
import { JournalPromptBlock } from "./blocks/JournalPromptBlock";
import { MoodCheckInBlock } from "./blocks/MoodCheckInBlock";
import { QuizBlock } from "./blocks/QuizBlock";
import { DailyActionBlock } from "./blocks/DailyActionBlock";

interface LessonBlockProps {
  blockId: string;
  blockType: BlockType;
  content: Record<string, unknown>;
  lessonId: string;
  attemptId: string;
  userId: string;
}

export function LessonBlock({ blockId, blockType, content, lessonId, attemptId, userId }: LessonBlockProps) {
  switch (blockType) {
    case "welcome":
      return <WelcomeBlock content={content as Parameters<typeof WelcomeBlock>[0]["content"]} />;
    case "reading":
      return <ReadingBlock content={content as Parameters<typeof ReadingBlock>[0]["content"]} />;
    case "mentor_note":
      return <MentorNoteBlock content={content as Parameters<typeof MentorNoteBlock>[0]["content"]} />;
    case "video":
      return <VideoBlock content={content as Parameters<typeof VideoBlock>[0]["content"]} />;
    case "audio":
      return <AudioBlock content={content as Parameters<typeof AudioBlock>[0]["content"]} />;
    case "pause_reflect":
      return (
        <PauseReflectBlock
          content={content as Parameters<typeof PauseReflectBlock>[0]["content"]}
          lessonId={lessonId}
          userId={userId}
        />
      );
    case "journal_prompt":
      return (
        <JournalPromptBlock
          content={content as Parameters<typeof JournalPromptBlock>[0]["content"]}
          lessonId={lessonId}
          userId={userId}
        />
      );
    case "mood_checkin":
      return (
        <MoodCheckInBlock
          content={content as Parameters<typeof MoodCheckInBlock>[0]["content"]}
          lessonId={lessonId}
          userId={userId}
        />
      );
    case "quiz":
      return (
        <QuizBlock
          blockId={blockId}
          content={content as Parameters<typeof QuizBlock>[0]["content"]}
          lessonId={lessonId}
          attemptId={attemptId}
          userId={userId}
        />
      );
    case "daily_action":
      return <DailyActionBlock content={content as Parameters<typeof DailyActionBlock>[0]["content"]} />;
    default:
      return null;
  }
}
