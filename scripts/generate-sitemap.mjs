#!/usr/bin/env node
// ============================================================
// Internet 4 ALL — Sitemap Index Generator
// Handles 70K+ pages by splitting into multiple sitemap files (10K per file)
// Pages: 31K ZIP + 19K city + 19K neighborhood + 50 state + 220 dynamic + 35 static ≈ 69,500
// Run after `npm run build`: node scripts/generate-sitemap.mjs
// ============================================================

import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const SITE = 'https://internet4all.com';
const DIST = 'dist';
const MAX_URLS_PER_SITEMAP = 10000;

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
      const url = rel ? `${SITE}/${rel}/` : `${SITE}/`;
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

function generateSitemapXml(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const u of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${u.url}</loc>\n`;
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
    xml += `    <loc>${SITE}/${file}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }
  xml += '</sitemapindex>\n';
  return xml;
}

// Main
console.log('🗺️  Generating sitemaps...');

const pages = findPages(DIST);
pages.sort((a, b) => {
  const pa = parseFloat(a.priority);
  const pb = parseFloat(b.priority);
  if (pb !== pa) return pb - pa;
  return a.url.localeCompare(b.url);
});

console.log(`  Found ${pages.length.toLocaleString()} pages`);

if (pages.length <= MAX_URLS_PER_SITEMAP) {
  // Single sitemap
  writeFileSync(join(DIST, 'sitemap.xml'), generateSitemapXml(pages));
  console.log(`  ✅ Written sitemap.xml (${pages.length} URLs)`);
} else {
  // Split into chunks
  const chunks = [];
  for (let i = 0; i < pages.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(pages.slice(i, i + MAX_URLS_PER_SITEMAP));
  }

  const sitemapFiles = [];
  for (let i = 0; i < chunks.length; i++) {
    const filename = `sitemap-${i + 1}.xml`;
    writeFileSync(join(DIST, filename), generateSitemapXml(chunks[i]));
    sitemapFiles.push(filename);
    console.log(`  ✅ Written ${filename} (${chunks[i].length} URLs)`);
  }

  // Write sitemap index
  writeFileSync(join(DIST, 'sitemap.xml'), generateSitemapIndex(sitemapFiles));
  console.log(`  ✅ Written sitemap.xml (index with ${sitemapFiles.length} sitemaps)`);
}

// Update robots.txt in dist
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
writeFileSync(join(DIST, 'robots.txt'), robotsTxt);
console.log('  ✅ Updated robots.txt');

console.log('\n✅ Sitemap generation complete!');
