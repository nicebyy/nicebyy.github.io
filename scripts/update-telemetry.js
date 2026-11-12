const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔍 Fetching GitHub telemetry for @nicebyy (public + private)...');

  let token = process.env.TELEMETRY_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    try {
      const creds = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n\n', stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      token = creds.match(/password=(.+)/)?.[1]?.trim();
    } catch {
      console.log('⚠️ Could not extract token from git-credential; proceeding without authentication.');
    }
  }

  const headers = {
    'User-Agent': 'nicebyy-telemetry-sync',
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = 'token ' + token;
  }

  // 1. Fetch repos
  let page = 1;
  let allRepos = [];
  while (true) {
    const url = token
      ? `https://api.github.com/user/repos?per_page=100&page=${page}&affiliation=owner`
      : `https://api.github.com/users/nicebyy/repos?per_page=100&page=${page}&type=owner`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`Failed to fetch repos: ${res.status} ${res.statusText}`);
      break;
    }
    const repos = await res.json();
    if (!repos || repos.length === 0) break;
    allRepos = allRepos.concat(repos);
    page++;
  }

  const publicCount = allRepos.filter(r => !r.private).length;
  const privateCount = allRepos.filter(r => r.private).length;
  console.log(`📦 Found ${allRepos.length} owned repositories (${publicCount} public, ${privateCount} private).`);

  if (allRepos.length === 0) {
    console.warn('⚠️ No repositories retrieved from GitHub API. Preserving existing telemetry in src/config/site.ts.');
    return;
  }

  // 2. Fetch language breakdown
  const langTotals = {};
  for (const repo of allRepos) {
    if (repo.fork) continue;
    try {
      const langRes = await fetch(repo.languages_url, { headers });
      if (langRes.ok) {
        const langs = await langRes.json();
        for (const [lang, bytes] of Object.entries(langs)) {
          langTotals[lang] = (langTotals[lang] || 0) + bytes;
        }
      }
    } catch (e) {
      console.warn(`Could not fetch languages for ${repo.name}:`, e.message);
    }
  }

  const totalAllBytes = Object.values(langTotals).reduce((sum, b) => sum + b, 0);

  // Group styles
  const cssBytes = (langTotals['CSS'] || 0) + (langTotals['SCSS'] || 0) + (langTotals['Less'] || 0);
  const jsBytes = langTotals['JavaScript'] || 0;
  const tsBytes = langTotals['TypeScript'] || 0;
  const javaBytes = langTotals['Java'] || 0;
  const kotlinBytes = langTotals['Kotlin'] || 0;

  const coreLangs = [
    { name: 'TypeScript', bytesVal: tsBytes, color: 'cyan' },
    { name: 'Java', bytesVal: javaBytes, color: 'purple' },
    { name: 'JavaScript', bytesVal: jsBytes, color: 'amber' },
    { name: 'CSS / Style', bytesVal: cssBytes, color: 'green' },
    { name: 'Kotlin', bytesVal: kotlinBytes, color: 'pink' },
  ];

  const coreTotalBytes = coreLangs.reduce((sum, item) => sum + item.bytesVal, 0);

  const formatSize = (b) => {
    if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
    return `${(b / 1024).toFixed(0)} KB`;
  };

  const techStack = coreLangs.map((item) => {
    const level = Math.round((item.bytesVal / coreTotalBytes) * 100);
    return {
      name: item.name,
      level,
      bytes: formatSize(item.bytesVal),
      color: item.color,
    };
  });

  console.log('\n📊 Measured Core Tech Stack:');
  techStack.forEach(t => console.log(` - ${t.name.padEnd(14)}: ${String(t.level).padStart(3)}% (${t.bytes})`));
  console.log(`\nTotal Core Code: ${formatSize(coreTotalBytes)} | Overall Volume: ${formatSize(totalAllBytes)}`);

  // 3. Update src/config/site.ts
  const siteConfigPath = path.resolve(__dirname, '../src/config/site.ts');
  let content = fs.readFileSync(siteConfigPath, 'utf-8');

  const techStackStr = `techStack: [\n` +
    techStack.map(t => `    { name: "${t.name}", level: ${t.level}, bytes: "${t.bytes}", color: "${t.color}" },`).join('\n') +
    `\n  ],`;

  content = content.replace(/techStack:\s*\[[\s\S]*?\],/, techStackStr);
  fs.writeFileSync(siteConfigPath, content, 'utf-8');
  console.log('✅ Updated src/config/site.ts successfully!');
}

main().catch(console.error);
