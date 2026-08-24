const SOURCES = [
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=viral+OR+weird+OR+unbelievable&hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "Google News Animals",
    url: "https://news.google.com/rss/search?q=viral+animal+OR+crazy+dog+OR+crazy+cat&hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "Google News Amazing",
    url: "https://news.google.com/rss/search?q=amazing+OR+unexpected+OR+incredible&hl=en-US&gl=US&ceid=US:en"
  }
];

const KEYWORDS = {
  viral: 20,
  viralvideo: 25,
  unbelievable: 20,
  unbelievable: 20,
  incredible: 15,
  amazing: 15,
  shocking: 20,
  shocked: 15,
  unexpected: 20,
  bizarre: 20,
  strange: 15,
  weird: 15,
  crazy: 15,
  insane: 15,
  caughtoncamera: 25,
  caught: 10,
  camera: 10,
  dog: 15,
  cat: 15,
  animal: 15,
  rescued: 15,
  rescue: 15,
  saved: 15,
  survived: 20,
  survival: 20,
  lucky: 15,
  accident: 15,
  invention: 15,
  talent: 15,
  prank: 10,
  funny: 10,
  hilarious: 10
};

function cleanText(text) {
  return String(text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreStory(title, description) {
  const text = `${title} ${description}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  let score = 0;
  const reasons = [];

  for (const [keyword, points] of Object.entries(KEYWORDS)) {
    if (text.includes(keyword)) {
      score += points;
      reasons.push(keyword);
    }
  }

  if (title.length > 35) score += 5;
  if (title.length > 70) score += 5;

  score = Math.min(score, 100);

  return {
    score,
    reasons: reasons.slice(0, 8)
  };
}

function extractItems(xml, sourceName) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const block of blocks) {
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const descMatch = block.match(
      /<description[^>]*>([\s\S]*?)<\/description>/i
    );
    const dateMatch = block.match(
      /<(pubDate|published|updated)[^>]*>([\s\S]*?)<\/(pubDate|published|updated)>/i
    );

    const title = cleanText(titleMatch?.[1]);
    const link = cleanText(linkMatch?.[1]);
    const description = cleanText(descMatch?.[1]);
    const published = cleanText(dateMatch?.[2]);

    if (!title || !link) continue;

    const result = scoreStory(title, description);

    items.push({
      title,
      description: description.slice(0, 500),
      url: link,
      source: sourceName,
      published,
      viralScore: result.score,
      reasons: result.reasons
    });
  }

  return items;
}

async function fetchSource(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "ViralStoryScout/1.0"
      }
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();

    return extractItems(xml, source.name);
  } catch {
    return [];
  }
}

async function getFeed() {
  const results = [];

  for (const source of SOURCES) {
    const items = await fetchSource(source);
    results.push(...items);
  }

  const unique = [];
  const seen = new Set();

  for (const item of results) {
    const key = item.url || item.title;

    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(item);
  }

  unique.sort((a, b) => b.viralScore - a.viralScore);

  return unique.slice(0, 50);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS"
        }
      });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return json({
        ok: true,
        engine: "VIRAL STORY SCOUT",
        version: "1.0",
        status: "online"
      });
    }

    if (url.pathname === "/feed") {
      const results = await getFeed();

      return json({
        ok: true,
        count: results.length,
        results
      });
    }

    if (url.pathname === "/scan") {
      const results = await getFeed();

      return json({
        ok: true,
        scanned: SOURCES.length,
        count: results.length,
        results
      });
    }

    return json(
      {
        ok: false,
        error: "Endpoint not found"
      },
      404
    );
  }
};
