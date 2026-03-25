#!/usr/bin/env node
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

const SITE = process.argv[2] || 'https://internet-4-all.com';
const DEBUG_PATH = process.argv[3] || 'dist/sitemap-debug.json';

function hash(str) {
  return createHash('sha256').update(str).digest('hex');
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (sitemap-verifier)',
      accept: 'application/xml,text/xml,*/*',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  });
  const text = await res.text();
  return { status: res.status, contentType: res.headers.get('content-type') || '', text };
}

function parseLocs(xml) {
  const locs = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'"));
  }
  return locs;
}

function isLikelyXml(text) {
  return text.startsWith('<?xml') && (text.includes('<urlset') || text.includes('<sitemapindex'));
}

function hasBareAmpersand(text) {
  return /&(?!amp;|lt;|gt;|quot;|apos;)/.test(text);
}

async function main() {
  const debug = JSON.parse(readFileSync(DEBUG_PATH, 'utf-8'));
  const failures = [];

  console.log(`Site: ${SITE}`);
  console.log(`Debug file: ${DEBUG_PATH}`);
  console.log(`Chunks expected: ${debug.chunks.length}`);

  for (const chunk of debug.chunks) {
    const url = `${SITE}/${chunk.file}`;
    const r = await fetchText(url);

    const row = {
      file: chunk.file,
      status: r.status,
      contentType: r.contentType,
      bytes: r.text.length,
      xml: isLikelyXml(r.text),
      bareAmp: hasBareAmpersand(r.text),
      hashMatch: hash(r.text) === chunk.sha256,
      locCount: parseLocs(r.text).length,
      expectedLocCount: chunk.urls,
      firstLoc: parseLocs(r.text)[0] || '',
      expectedFirstLoc: chunk.first || '',
      lastLoc: parseLocs(r.text).at(-1) || '',
      expectedLastLoc: chunk.last || '',
    };

    const bad = (
      row.status !== 200
      || !row.xml
      || row.bareAmp
      || !row.hashMatch
      || row.locCount !== row.expectedLocCount
      || row.firstLoc !== row.expectedFirstLoc
      || row.lastLoc !== row.expectedLastLoc
    );

    if (bad) failures.push(row);

    console.log(`${row.file}: status=${row.status} xml=${row.xml} hashMatch=${row.hashMatch} loc=${row.locCount}/${row.expectedLocCount}`);
  }

  if (failures.length) {
    console.log('\nFAILURES DETECTED:');
    for (const f of failures) {
      console.log(JSON.stringify(f, null, 2));
    }
    process.exit(1);
  }

  console.log('\nAll sitemap chunks match deployed output exactly.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
