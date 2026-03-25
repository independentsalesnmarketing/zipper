#!/usr/bin/env node
// ============================================================
// Internet 4 ALL — Sitemap Index Generator
// Handles 70K+ pages by splitting into multiple sitemap files (10K per file)
// Pages: 31K ZIP + 19K city + 19K neighborhood + 50 state + 220 dynamic + 35 static ≈ 69,500
// Run after `npm run build`: node scripts/generate-sitemap.mjs
// ============================================================

import { readdirSync, statSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';

const SITE = 'https://internet-4-all.com';
const DIST = 'dist';
const MAX_URLS_PER_SITEMAP = 10000;
const SITEMAP_VERSION = (process.env.SITEMAP_VERSION || '').trim();

// Minimum pages we expect from a complete build. Exits with error if not met,
// so CI/CD fails loudly instead of silently deploying an incomplete sitemap.
const MIN_EXPECTED_PAGES = 60000;

// Recursively find all index.html files
function findPages(dir, pages = []) {
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.html') && !entry.endsWith('/') && entry.includes('.')) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      findPages(full, pages);
    } else if (entry === 'index.html') {
      const rel = relative(DIST, dir).replace(/\\/g, '/');
      const url = buildPageUrl(rel);
      pages.push({
        url,
        lastmod: new Date().toISOString().split('T')[0],
        priority: getPriority(rel),
        changefreq: getChangefreq(rel),
      });
    }
  }
  return pages;
}

function getPriority(path) {
  if (!path) return '1.0'; // homepage
  if (path === 'providers' || path === 'compare') return '0.9';
  if (path.startsWith('internet-providers/') && !path.includes('/zip/')) {
    const seg = path.replace('internet-providers/', '');
    // State pages: single segment, no trailing -XX abbreviation
    if (!seg.includes('/') && !/\-[a-z]{2}$/.test(seg)) return '0.8'; // state
    // Neighborhood pages: 2-letter-state/slug (e.g., oh/forest-park)
    if (/^[a-z]{2}\//.test(seg)) return '0.6'; // neighborhood
    return '0.7'; // city
  }
  if (path.startsWith('internet-providers/zip/')) return '0.5';
  if (path.startsWith('provider/')) return '0.8';
  if (path.startsWith('blog/')) return '0.6';
  return '0.6';
}

function getChangefreq(path) {
  if (!path) return 'daily';
  if (path.startsWith('internet-providers/')) return 'weekly';
  if (path.startsWith('blog/')) return 'monthly';
  return 'weekly';
}

function xmlEncode(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function validateUrlForSitemap(url) {
  if (!url || typeof url !== 'string') return 'URL is empty or non-string';
  if (/\s/.test(url)) return 'URL contains whitespace';
  if (/[^\x20-\x7E]/.test(url)) return 'URL contains non-ASCII characters (must be percent-encoded)';

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return 'URL is not parseable';
  }

  if (parsed.protocol !== 'https:') return `URL must be https (got ${parsed.protocol})`;
  if (parsed.origin !== SITE) return `URL origin mismatch (got ${parsed.origin})`;

  // Sitemaps should not include fragments, and they are ignored by crawlers.
  if (parsed.hash) return 'URL must not include hash fragment';

  // Catch likely encoding mistakes that parse but often fail in strict crawlers.
  const rawPath = parsed.pathname;
  if (/%(?![0-9A-Fa-f]{2})/.test(rawPath)) return 'URL contains malformed percent-encoding';

  return null;
}

function assertSitemapUrlList(urls, label) {
  const bad = [];
  for (let i = 0; i < urls.length; i++) {
    const reason = validateUrlForSitemap(urls[i].url);
    if (reason) {
      bad.push({ index: i, url: urls[i].url, reason });
      if (bad.length >= 20) break;
    }
  }

  if (bad.length) {
    console.error(`❌ Invalid URLs detected in ${label}.`);
    for (const b of bad) {
      console.error(`   [${b.index}] ${b.reason}: ${b.url}`);
    }
    throw new Error(`Sitemap URL validation failed for ${label} (${bad.length}+ invalid URL(s))`);
  }
}

function buildPageUrl(relPath) {
  if (!relPath) return `${SITE}/`;

  // Encode each path segment to avoid malformed XML URLs from special chars
  const encodedPath = relPath
    .split('/')
    .filter(Boolean)
    .map((seg) => {
      try {
        return encodeURIComponent(decodeURIComponent(seg));
      } catch {
        return encodeURIComponent(seg);
      }
    })
    .join('/');

  return `${SITE}/${encodedPath}/`;
}

function generateSitemapXml(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const u of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${xmlEncode(u.url)}</loc>\n`;
    xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += '</urlset>\n';
  return xml;
}

function generateSitemapIndex(sitemapFiles) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const file of sitemapFiles) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${xmlEncode(`${SITE}/${file}`)}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }
  xml += '</sitemapindex>\n';
  return xml;
}

function cleanupOldChunkSitemaps() {
  const files = readdirSync(DIST);
  // Remove prior chunk files so deployments cannot keep stale bad chunks around
  // (e.g., old sitemap-5.xml/sitemap-6.xml still being served by static hosts/CDN).
  for (const file of files) {
    if (/^sitemap-\d+(?:-[A-Za-z0-9_-]+)?\.xml$/.test(file)) {
      try {
        unlinkSync(join(DIST, file));
      } catch {
        // ignore cleanup failures; subsequent writes/validation will still gate success
      }
    }
  }
}

// Main
console.log('🗺️  Generating sitemaps...');

if (!existsSync(DIST)) {
  console.error(`❌ dist/ directory not found. Run 'npm run build' first.`);
  process.exit(1);
}

const pages = findPages(DIST);

// Deduplicate by URL (defensive against any future duplicate routes)
const seen = new Set();
const uniquePages = pages.filter(p => {
  if (seen.has(p.url)) return false;
  seen.add(p.url);
  return true;
});
const dupeCount = pages.length - uniquePages.length;
if (dupeCount > 0) {
  console.warn(`  ⚠️  Removed ${dupeCount} duplicate URL(s)`);
}

uniquePages.sort((a, b) => {
  const pa = parseFloat(a.priority);
  const pb = parseFloat(b.priority);
  if (pb !== pa) return pb - pa;
  return a.url.localeCompare(b.url);
});

console.log(`  Found ${uniquePages.length.toLocaleString()} unique pages`);

// Hard check: fail loudly if build looks incomplete
if (uniquePages.length < MIN_EXPECTED_PAGES) {
  console.error(`❌ Only ${uniquePages.length.toLocaleString()} pages found — expected at least ${MIN_EXPECTED_PAGES.toLocaleString()}.`);
  console.error(`   This likely means the Astro build did not complete successfully.`);
  console.error(`   Aborting sitemap generation to avoid deploying an incomplete index.`);
  process.exit(1);
}

/** Parse and validate a written XML file to catch truncation or encoding issues */
function validateXmlFile(filepath) {
  const content = readFileSync(filepath, 'utf-8');
  if (!content.startsWith('<?xml')) {
    throw new Error(`File does not start with XML declaration: ${filepath}`);
  }
  if (!content.trim().endsWith('>')) {
    throw new Error(`File appears truncated (does not end with '>'): ${filepath}`);
  }
  // Verify opening and closing root tags are balanced
  const hasUrlset = content.includes('<urlset') && content.includes('</urlset>');
  const hasSitemapindex = content.includes('<sitemapindex') && content.includes('</sitemapindex>');
  if (!hasUrlset && !hasSitemapindex) {
    throw new Error(`File missing balanced root XML element: ${filepath}`);
  }

  // Catch bare ampersands that browsers may tolerate but XML crawlers reject
  if (/&(?!amp;|lt;|gt;|quot;|apos;)/.test(content)) {
    throw new Error(`File contains unescaped '&' characters: ${filepath}`);
  }

  // Validate each <loc> as a well-formed absolute URL
  const locMatches = [...content.matchAll(/<loc>(.*?)<\/loc>/g)];
  for (const match of locMatches) {
    const loc = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    try {
      const parsed = new URL(loc);
      if (parsed.protocol !== 'https:') {
        throw new Error('non-https URL');
      }
    } catch {
      throw new Error(`Invalid <loc> URL detected in ${filepath}: ${loc}`);
    }
  }
}

if (uniquePages.length <= MAX_URLS_PER_SITEMAP) {
  // Single sitemap
  assertSitemapUrlList(uniquePages, 'sitemap.xml');
  const outPath = join(DIST, 'sitemap.xml');
  writeFileSync(outPath, generateSitemapXml(uniquePages));
  validateXmlFile(outPath);
  console.log(`  ✅ Written sitemap.xml (${uniquePages.length} URLs)`);
} else {
  cleanupOldChunkSitemaps();

  // Split into chunks
  const chunks = [];
  for (let i = 0; i < uniquePages.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(uniquePages.slice(i, i + MAX_URLS_PER_SITEMAP));
  }

  const sitemapFiles = [];
  const chunkDiagnostics = [];
  for (let i = 0; i < chunks.length; i++) {
    assertSitemapUrlList(chunks[i], `sitemap-${i + 1}`);

    const filename = SITEMAP_VERSION
      ? `sitemap-${i + 1}-${SITEMAP_VERSION}.xml`
      : `sitemap-${i + 1}.xml`;
    const outPath = join(DIST, filename);
    const xml = generateSitemapXml(chunks[i]);
    writeFileSync(outPath, xml);
    validateXmlFile(outPath);
    sitemapFiles.push(filename);

    chunkDiagnostics.push({
      file: filename,
      urls: chunks[i].length,
      first: chunks[i][0]?.url ?? null,
      last: chunks[i][chunks[i].length - 1]?.url ?? null,
      sha256: createHash('sha256').update(xml).digest('hex'),
    });

    console.log(`  ✅ Written ${filename} (${chunks[i].length} URLs)`);
  }

  // Write sitemap index
  const indexPath = join(DIST, 'sitemap.xml');
  writeFileSync(indexPath, generateSitemapIndex(sitemapFiles));
  validateXmlFile(indexPath);
  console.log(`  ✅ Written sitemap.xml (index with ${sitemapFiles.length} sitemaps)`);

  // Diagnostic artifact: lets us compare deployed chunk integrity vs local build.
  writeFileSync(
    join(DIST, 'sitemap-debug.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        site: SITE,
        totalUrls: uniquePages.length,
        chunks: chunkDiagnostics,
      },
      null,
      2,
    ),
  );
  console.log('  ✅ Written sitemap-debug.json');
}

// Update robots.txt in dist
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
writeFileSync(join(DIST, 'robots.txt'), robotsTxt);
console.log('  ✅ Updated robots.txt');

console.log('\n✅ Sitemap generation complete!');
