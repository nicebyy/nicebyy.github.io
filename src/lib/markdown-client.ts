/**
 * Client-safe markdown processing and frontmatter serialization/parsing
 */

export interface FrontmatterData {
  title: string;
  date: string;
  category: string;
  tags: string[];
  summary: string;
  featured?: boolean;
  draft?: boolean;
}

/**
 * Serializes Frontmatter + Markdown Body into standard GitHub Pages format
 */
export function serializePostMarkdown(data: FrontmatterData, body: string): string {
  const tagsFormatted = JSON.stringify(data.tags || []);
  const lines: string[] = [
    "---",
    `title: ${JSON.stringify(data.title.trim())}`,
    `date: ${JSON.stringify(data.date.trim())}`,
    `category: ${JSON.stringify(data.category.trim() || "Dev")}`,
    `tags: ${tagsFormatted}`,
    `summary: ${JSON.stringify(data.summary.trim())}`,
  ];

  if (data.featured) {
    lines.push("featured: true");
  }

  if (data.draft) {
    lines.push("draft: true");
  }

  lines.push("---");
  lines.push("");
  lines.push(body.trim());
  lines.push("");

  return lines.join("\n");
}

/**
 * Extracts YAML frontmatter and body from markdown text
 */
export function parsePostMarkdown(rawFile: string): {
  data: Partial<FrontmatterData>;
  content: string;
} {
  const trimmed = rawFile.trimStart();
  const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: rawFile };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const data: Partial<FrontmatterData> = {};

  const lines = yamlBlock.split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // Strip enclosing quotes if present
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    if (key === "title") data.title = val;
    else if (key === "date") data.date = val;
    else if (key === "category") data.category = val;
    else if (key === "summary") data.summary = val;
    else if (key === "featured") data.featured = val === "true";
    else if (key === "draft" || key === "hidden") data.draft = val === "true";
    else if (key === "tags") {
      try {
        if (val.startsWith("[") && val.endsWith("]")) {
          data.tags = JSON.parse(val);
        } else {
          data.tags = val
            .split(",")
            .map((t) => t.trim().replace(/^['"]|['"]$/g, ""))
            .filter(Boolean);
        }
      } catch {
        data.tags = [];
      }
    }
  }

  return { data, content };
}

/**
 * Generate URL slug from title
 */
export function generateSlug(title: string): string {
  if (!title) return "untitled-post";

  // If Korean characters or special letters, clean them nicely
  const slug = title
    .toLowerCase()
    .replace(/\[.*?\]/g, "") // remove brackets like [BOJ 1005]
    .replace(/[^\w\s\uAC00-\uD7A3-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "post-" + Date.now().toString(36);
}

/**
 * Render Markdown to HTML on client
 */
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  try {
    const { unified } = await import("unified");
    const remarkParse = (await import("remark-parse")).default;
    const remarkGfm = (await import("remark-gfm")).default;
    const remarkRehype = (await import("remark-rehype")).default;
    const rehypeSlug = (await import("rehype-slug")).default;
    const rehypeHighlight = (await import("rehype-highlight")).default;
    const rehypeStringify = (await import("rehype-stringify")).default;

    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeHighlight)
      .use(rehypeStringify)
      .process(markdown);

    return String(file);
  } catch (err) {
    console.error("Markdown rendering error:", err);
    // Fallback safe formatting
    return `<div class="p-4 border border-red-500/30 rounded text-red-400">Preview rendering error: ${
      err instanceof Error ? err.message : String(err)
    }</div><pre>${markdown}</pre>`;
  }
}
