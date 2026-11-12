import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  summary: string;
  featured?: boolean;
  readingTime: string;
}

export interface PostDetail extends PostMeta {
  contentHtml: string;
  rawContent: string;
  toc: TocItem[];
}

function calculateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\uAC00-\uD7A3-]/g, "")
    .replace(/\s+/g, "-");
}

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const toc: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].replace(/[`*_~[\]]/g, "").trim();
      const id = slugifyHeading(rawText);
      toc.push({ id, text: rawText, level });
    }
  }

  return toc;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.(md|mdx)$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "2026-11-12",
      category: data.category ?? "Dev",
      tags: Array.isArray(data.tags) ? data.tags : [],
      summary: data.summary ?? "",
      featured: Boolean(data.featured),
      readingTime: calculateReadingTime(content),
    };
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const mdPath = path.join(postsDirectory, `${slug}.md`);
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  const fullPath = fs.existsSync(mdPath)
    ? mdPath
    : fs.existsSync(mdxPath)
    ? mdxPath
    : null;

  if (!fullPath) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  const contentHtml = processedContent.toString();
  const toc = extractToc(content);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "2026-11-12",
    category: data.category ?? "Dev",
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary ?? "",
    featured: Boolean(data.featured),
    readingTime: calculateReadingTime(content),
    contentHtml,
    rawContent: content,
    toc,
  };
}
