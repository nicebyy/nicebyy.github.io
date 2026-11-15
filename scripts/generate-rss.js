const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRss() {
  const postsDir = path.join(__dirname, '../content/posts');
  const siteUrl = 'https://nicebyy.github.io';
  const siteTitle = 'kimkkatta // DEV.LOG';
  const siteDescription = '터미널 감성과 인터랙티브 웹 기술을 기록하는 kimkkatta의 개발 로그 & 아카이브';

  if (!fs.existsSync(postsDir)) {
    console.warn('⚠️ No posts directory found at:', postsDir);
    return;
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const posts = [];

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, '');
    const fullPath = path.join(postsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(content);

    if (data.draft || data.hidden) continue;

    posts.push({
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date) : new Date(),
      category: data.category || 'Dev',
      tags: Array.isArray(data.tags) ? data.tags : [],
      summary: data.summary || '',
    });
  }

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  const rssItems = posts
    .map((post) => {
      const postUrl = `${siteUrl}/posts/${post.slug}/`;
      const cleanSummary = (post.summary || '')
        .replace(/!?\[?[^\]]*\]?\(\/images\/[^)]+\)/g, '')
        .trim();

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(cleanSummary)}</description>
    </item>`;
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

  const publicDir = path.join(__dirname, '../public');
  fs.writeFileSync(path.join(publicDir, 'feed.xml'), rssXml, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssXml, 'utf8');

  console.log(`✅ RSS feed generated successfully with ${posts.length} posts at public/feed.xml and public/rss.xml`);
}

generateRss();
