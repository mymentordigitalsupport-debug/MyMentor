const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

const COURSES = [
  {
    name: "From Addicts to Leaders",
    manifest: path.join(
      ROOT,
      "public/3 summarized books/From Addicts to Leaders/lesson-information/seed-manifest.json"
    ),
    outputDir: path.join(
      ROOT,
      "public/3 summarized books/From Addicts to Leaders/lesson-information/general"
    ),
  },
  {
    name: "Protecting the Next Generation",
    manifest: path.join(
      ROOT,
      "public/3 summarized books/Protecting the Next Generation/lesson-information/seed-manifest.json"
    ),
    outputDir: path.join(
      ROOT,
      "public/3 summarized books/Protecting the Next Generation/lesson-information/general"
    ),
  },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraphsFromText(text) {
  return String(text)
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => `<p>${escapeHtml(chunk).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

function blockLabel(type, index) {
  const stepLabels = [
    "Welcome",
    "Teaching",
    "Reflection Quote",
    "Video",
    "Pause & Reflect",
    "Journal",
    "Mood Check-In",
    "Action",
    "Reflection Quote",
    "Reflection Check",
    "Reflection Check",
    "Reflection Check",
    "Complete",
  ];

  return `STEP ${index + 1}: ${stepLabels[index] ?? type}`.toUpperCase();
}

function blockBody(block) {
  const content = block.content || {};

  switch (block.type) {
    case "welcome":
      return `
        <p><strong>Title:</strong> ${escapeHtml(content.heading || "Welcome")}</p>
        ${paragraphsFromText(content.message || "")}
      `;
    case "reading":
      return `
        <p><strong>Title:</strong> ${escapeHtml(content.title || "Teaching")}</p>
        ${paragraphsFromText(content.body || "")}
      `;
    case "mentor_note":
      return paragraphsFromText(content.note || "");
    case "video":
      return `
        <p><strong>Title:</strong> ${escapeHtml(content.title || "Mentor Video")}</p>
        ${paragraphsFromText(content.description || "Video coming soon.")}
      `;
    case "pause_reflect":
      return `
        <p><strong>Question:</strong> ${escapeHtml(content.question || "")}</p>
        ${content.context ? paragraphsFromText(content.context) : ""}
      `;
    case "journal_prompt":
      return `
        <p><strong>Prompt:</strong> ${escapeHtml(content.prompt || "")}</p>
      `;
    case "mood_checkin":
      return `
        <p><strong>Question:</strong> ${escapeHtml(content.question || "")}</p>
      `;
    case "quiz":
      return `
        <p><strong>Question:</strong> ${escapeHtml(content.question || "")}</p>
        ${paragraphsFromText(
          Array.isArray(content.options)
            ? content.options
                .map((option) => {
                  const suffix = option?.is_correct ? " (correct)" : "";
                  return `- ${option?.text || ""}${suffix}`;
                })
                .join("\n")
            : ""
        )}
      `;
    case "daily_action":
      return `
        <p><strong>Title:</strong> ${escapeHtml(content.title || "Action")}</p>
        ${paragraphsFromText(content.action || "")}
      `;
    case "complete":
      return `
        <p><strong>Message:</strong> ${escapeHtml(content.message || "")}</p>
        ${content.encouragement ? paragraphsFromText(content.encouragement) : ""}
      `;
    default:
      return paragraphsFromText(JSON.stringify(content, null, 2));
  }
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripTags(html) {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pushTextParagraph(lines, text, style = "BodyText") {
  const clean = String(text || "").trim();
  if (!clean) return;

  for (const chunk of clean.split(/\n{2,}/)) {
    const piece = chunk.trim();
    if (!piece) continue;
    const runs = piece.split("\n").map((line) => {
      const escaped = xmlEscape(line);
      return `<w:r><w:t xml:space="preserve">${escaped}</w:t></w:r>`;
    });
    const joinedRuns = runs.join(
      `<w:r><w:br/></w:r>`
    );
    const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}" /></w:pPr>` : "";
    lines.push(`<w:p>${styleXml}${joinedRuns}</w:p>`);
  }
}

function pushBlock(lines, label, htmlBody) {
  pushTextParagraph(lines, label, "Heading1");

  const body = stripTags(htmlBody);
  for (const paragraph of body.split(/\n{2,}/)) {
    const clean = paragraph.trim();
    if (!clean) continue;
    const style = /^(Title|Question|Prompt|Message):/.test(clean)
      ? "FirstParagraph"
      : "BodyText";
    pushTextParagraph(lines, clean, style);
  }
}

function lessonDocumentXml(course, chapter, lesson) {
  const lines = [];
  pushTextParagraph(lines, `COURSE: ${course.courseTitle}`, "Heading1");
  pushTextParagraph(lines, `CHAPTER ${chapter.sortOrder}: ${chapter.title}`, "Heading2");
  pushTextParagraph(lines, `LESSON ${lesson.lessonNumber}: ${lesson.title}`, "Heading3");
  pushTextParagraph(lines, `estimated_minutes: ${lesson.estimatedMinutes}`, "FirstParagraph");
  pushTextParagraph(lines, `sort_order: ${lesson.lessonNumber}`, "FirstParagraph");
  pushTextParagraph(lines, "is_published: true", "FirstParagraph");

  for (const [index, block] of lesson.blocks.entries()) {
    pushBlock(lines, blockLabel(block.type, index), blockBody(block));
  }

  return buildDocumentXml(lines.join(""));
}

function chapterDocumentXml(course, chapter) {
  const lines = [];
  pushTextParagraph(lines, `COURSE: ${course.courseTitle}`, "Heading1");
  pushTextParagraph(lines, `CHAPTER ${chapter.sortOrder}: ${chapter.title}`, "Heading2");
  pushTextParagraph(lines, "CHAPTER OVERVIEW", "Heading1");
  pushTextParagraph(lines, chapter.description || "", "BodyText");
  pushTextParagraph(lines, "CHAPTER LESSONS", "Heading1");

  for (const lesson of chapter.lessons) {
    pushTextParagraph(lines, `LESSON ${lesson.lessonNumber}: ${lesson.title}`, "BodyText");
  }

  return buildDocumentXml(lines.join(""));
}

function buildDocumentXml(bodyXml) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:asciiTheme="minorHAnsi" w:cstheme="minorBidi" w:eastAsiaTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" />
        <w:sz w:val="24" />
        <w:szCs w:val="24" />
        <w:lang w:bidi="ar-SA" w:eastAsia="en-US" w:val="en-US" />
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="200" />
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:latentStyles w:count="276" w:defLockedState="0" w:defQFormat="0" w:defSemiHidden="0" w:defUIPriority="0" w:defUnhideWhenUsed="0" />
  <w:style w:default="1" w:styleId="Normal" w:type="paragraph">
    <w:name w:val="Normal" />
    <w:qFormat />
  </w:style>
  <w:style w:styleId="BodyText" w:type="paragraph">
    <w:name w:val="Body Text" />
    <w:basedOn w:val="Normal" />
    <w:qFormat />
    <w:pPr>
      <w:spacing w:after="180" w:before="180" />
    </w:pPr>
  </w:style>
  <w:style w:customStyle="1" w:styleId="FirstParagraph" w:type="paragraph">
    <w:name w:val="First Paragraph" />
    <w:basedOn w:val="BodyText" />
    <w:next w:val="BodyText" />
    <w:qFormat />
  </w:style>
  <w:style w:customStyle="1" w:styleId="Compact" w:type="paragraph">
    <w:name w:val="Compact" />
    <w:basedOn w:val="BodyText" />
    <w:qFormat />
    <w:pPr>
      <w:spacing w:after="36" w:before="36" />
    </w:pPr>
  </w:style>
  <w:style w:styleId="Heading1" w:type="paragraph">
    <w:name w:val="heading 1" />
    <w:basedOn w:val="Normal" />
    <w:next w:val="BodyText" />
    <w:qFormat />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:after="80" w:before="360" />
      <w:outlineLvl w:val="0" />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:asciiTheme="majorHAnsi" w:cstheme="majorBidi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" />
      <w:color w:themeColor="accent1" w:themeShade="BF" w:val="0F4761" />
      <w:sz w:val="40" />
      <w:szCs w:val="40" />
    </w:rPr>
  </w:style>
  <w:style w:styleId="Heading2" w:type="paragraph">
    <w:name w:val="heading 2" />
    <w:basedOn w:val="Normal" />
    <w:next w:val="BodyText" />
    <w:qFormat />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:after="80" w:before="160" />
      <w:outlineLvl w:val="1" />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:asciiTheme="majorHAnsi" w:cstheme="majorBidi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" />
      <w:color w:themeColor="accent1" w:themeShade="BF" w:val="0F4761" />
      <w:sz w:val="32" />
      <w:szCs w:val="32" />
    </w:rPr>
  </w:style>
  <w:style w:styleId="Heading3" w:type="paragraph">
    <w:name w:val="heading 3" />
    <w:basedOn w:val="Normal" />
    <w:next w:val="BodyText" />
    <w:qFormat />
    <w:pPr>
      <w:keepNext />
      <w:keepLines />
      <w:spacing w:after="80" w:before="160" />
      <w:outlineLvl w:val="2" />
    </w:pPr>
    <w:rPr>
      <w:rFonts w:cstheme="majorBidi" w:eastAsiaTheme="majorEastAsia" />
      <w:color w:themeColor="accent1" w:themeShade="BF" w:val="0F4761" />
      <w:sz w:val="28" />
      <w:szCs w:val="28" />
    </w:rPr>
  </w:style>
</w:styles>`;
}

function contentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;
}

function packageRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function documentRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

function createDocx(docxPath, documentXml) {
  const tempDir = fs.mkdtempSync(path.join(ROOT, "tmp-docx-"));
  const wordDir = path.join(tempDir, "word");
  const wordRelsDir = path.join(wordDir, "_rels");
  const rootRelsDir = path.join(tempDir, "_rels");
  fs.mkdirSync(wordRelsDir, { recursive: true });
  fs.mkdirSync(rootRelsDir, { recursive: true });

  writeFile(path.join(tempDir, "[Content_Types].xml"), contentTypesXml());
  writeFile(path.join(rootRelsDir, ".rels"), packageRelsXml());
  writeFile(path.join(wordDir, "document.xml"), documentXml);
  writeFile(path.join(wordDir, "styles.xml"), stylesXml());
  writeFile(path.join(wordRelsDir, "document.xml.rels"), documentRelsXml());

  const fileName = path.basename(docxPath);
  execFileSync("zip", ["-qr", fileName, "."], {
    cwd: tempDir,
    stdio: "inherit",
  });

  fs.mkdirSync(path.dirname(docxPath), { recursive: true });
  fs.copyFileSync(path.join(tempDir, fileName), docxPath);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

for (const courseConfig of COURSES) {
  const course = JSON.parse(fs.readFileSync(courseConfig.manifest, "utf8"));

  for (const chapter of course.chapters) {
    const chapterDir = path.join(
      courseConfig.outputDir,
      `chapter${chapter.sortOrder}`
    );

    const chapterDocxPath = path.join(chapterDir, `Chapter ${chapter.sortOrder}.docx`);
    createDocx(chapterDocxPath, chapterDocumentXml(course, chapter));

    for (const lesson of chapter.lessons) {
      const lessonDocxPath = path.join(chapterDir, `Lesson ${lesson.lessonNumber}.docx`);
      createDocx(lessonDocxPath, lessonDocumentXml(course, chapter, lesson));
    }
  }
}
