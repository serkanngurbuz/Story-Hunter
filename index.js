// =====================================================
// VIRAL STORY HUNTER — CLOUDFLARE WORKER
// =====================================================
// Google News + Reddit RSS
// Viral hikaye / Shorts ham maddesi bulucu
//
// ENDPOINTS:
// /
// /health
// /feed
// /scan
// =====================================================


// =====================================================
// SOURCES
// =====================================================

const SOURCES = [

  // ---------------------------------------------------
  // GOOGLE NEWS — GENEL VİRAL
  // ---------------------------------------------------

  {
    name: "Google News Viral",
    url:
      "https://news.google.com/rss/search?q=viral+OR+trending+OR+internet+viral&hl=en-US&gl=US&ceid=US:en"
  },

  {
    name: "Google News Weird",
    url:
      "https://news.google.com/rss/search?q=weird+OR+bizarre+OR+strange+OR+unusual&hl=en-US&gl=US&ceid=US:en"
  },

  {
    name: "Google News Unexpected",
    url:
      "https://news.google.com/rss/search?q=unexpected+OR+unbelievable+OR+incredible&hl=en-US&gl=US&ceid=US:en"
  },

  {
    name: "Google News Animals",
    url:
      "https://news.google.com/rss/search?q=viral+animal+OR+funny+dog+OR+funny+cat+OR+animal+rescued&hl=en-US&gl=US&ceid=US:en"
  },

  {
    name: "Google News Caught Camera",
    url:
      "https://news.google.com/rss/search?q=caught+on+camera+OR+caught+on+video+OR+camera+captures&hl=en-US&gl=US&ceid=US:en"
  },

  {
    name: "Google News Amazing",
    url:
      "https://news.google.com/rss/search?q=amazing+OR+shocking+OR+astonishing+OR+mind-blowing&hl=en-US&gl=US&ceid=US:en"
  },

  {
    name: "Google News Rescue",
    url:
      "https://news.google.com/rss/search?q=rescued+OR+saved+OR+survived+OR+heroic+rescue&hl=en-US&gl=US&ceid=US:en"
  },

  {
    name: "Google News Funny",
    url:
      "https://news.google.com/rss/search?q=funny+OR+hilarious+OR+prank+OR+awkward+viral&hl=en-US&gl=US&ceid=US:en"
  },


  // ---------------------------------------------------
  // REDDIT — HİKAYE HAM MADDESİ
  // ---------------------------------------------------

  {
    name: "Reddit InterestingAsFuck",
    url:
      "https://www.reddit.com/r/interestingasfuck/.rss"
  },

  {
    name: "Reddit NextFuckinglevel",
    url:
      "https://www.reddit.com/r/nextfuckinglevel/.rss"
  },

  {
    name: "Reddit Unexpected",
    url:
      "https://www.reddit.com/r/Unexpected/.rss"
  },

  {
    name: "Reddit MildlyInteresting",
    url:
      "https://www.reddit.com/r/mildlyinteresting/.rss"
  },

  {
    name: "Reddit AnimalsBeingDerps",
    url:
      "https://www.reddit.com/r/AnimalsBeingDerps/.rss"
  },

  {
    name: "Reddit HumansBeingBros",
    url:
      "https://www.reddit.com/r/HumansBeingBros/.rss"
  },

  {
    name: "Reddit MadeMeSmile",
    url:
      "https://www.reddit.com/r/MadeMeSmile/.rss"
  },

  {
    name: "Reddit WhatCouldGoWrong",
    url:
      "https://www.reddit.com/r/Whatcouldgowrong/.rss"
  }

];


// =====================================================
// VIRAL KEYWORDS
// =====================================================

const KEYWORDS = {

  // -----------------------------------------------
  // ÇOK GÜÇLÜ VİRAL SİNYALLER
  // -----------------------------------------------

  "viral": 20,
  "went viral": 30,
  "goes viral": 30,
  "viral video": 30,
  "viralvideo": 30,
  "trending": 15,
  "internet": 5,

  // -----------------------------------------------
  // MERAK / ŞAŞIRTICILIK
  // -----------------------------------------------

  "unexpected": 25,
  "unbelievable": 25,
  "incredible": 20,
  "amazing": 18,
  "shocking": 25,
  "shocked": 20,
  "astonishing": 22,
  "bizarre": 22,
  "strange": 18,
  "weird": 18,
  "crazy": 18,
  "insane": 18,
  "unusual": 18,
  "surprising": 18,
  "surprise": 15,
  "never seen": 25,
  "no one expected": 30,

  // -----------------------------------------------
  // VİDEO / KAMERA
  // -----------------------------------------------

  "caught on camera": 30,
  "caught on video": 30,
  "camera captures": 25,
  "captured on camera": 25,
  "footage": 10,
  "video": 8,
  "recorded": 8,

  // -----------------------------------------------
  // HAYVAN
  // -----------------------------------------------

  "dog": 12,
  "cat": 12,
  "animal": 12,
  "puppy": 15,
  "kitten": 15,
  "horse": 12,
  "bird": 10,
  "bear": 10,
  "wildlife": 10,

  // -----------------------------------------------
  // KURTARMA / HAYAT
  // -----------------------------------------------

  "rescued": 20,
  "rescue": 20,
  "saved": 20,
  "survived": 25,
  "survival": 25,
  "hero": 18,
  "heroic": 18,
  "saved a life": 30,
  "life-saving": 30,

  // -----------------------------------------------
  // OLAY / KAZA
  // -----------------------------------------------

  "accident": 15,
  "incident": 12,
  "dramatic": 15,
  "danger": 15,
  "dangerous": 15,
  "lucky": 18,
  "luckily": 18,
  "miracle": 25,
  "miraculous": 25,

  // -----------------------------------------------
  // İNSAN HİKAYELERİ
  // -----------------------------------------------

  "man": 3,
  "woman": 3,
  "boy": 6,
  "girl": 6,
  "child": 8,
  "kid": 8,
  "couple": 6,
  "family": 6,

  // -----------------------------------------------
  // İLGİNÇ DAVRANIŞ / YARATICILIK
  // -----------------------------------------------

  "invention": 15,
  "invented": 15,
  "created": 8,
  "talent": 15,
  "genius": 18,
  "clever": 12,
  "creative": 12,
  "prank": 12,
  "funny": 12,
  "hilarious": 15,
  "awkward": 15,
  "embarrassing": 12,

  // -----------------------------------------------
  // REAKSİYON
  // -----------------------------------------------

  "reaction": 15,
  "reacts": 15,
  "reaction video": 20,
  "people can't believe": 25,
  "people are shocked": 25,
  "everyone is shocked": 25

};


// =====================================================
// HELPERS
// =====================================================

function cleanText(value) {

  let text =
    String(value || "");

  // CDATA
  text =
    text.replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/gi,
      "$1"
    );

  // HTML
  text =
    text.replace(
      /<[^>]*>/g,
      " "
    );

  // Entities
  text =
    text
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&nbsp;/gi, " ");

  // Whitespace
  text =
    text
      .replace(/\s+/g, " ")
      .trim();

  return text;

}


// =====================================================
// XML TAG EXTRACTOR
// =====================================================

function getTag(block, tagName) {

  const escaped =
    tagName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const regex =
    new RegExp(
      "<" +
      escaped +
      "(?:\\s[^>]*)?>" +
      "([\\s\\S]*?)" +
      "<\\/" +
      escaped +
      "\\s*>",
      "i"
    );

  const match =
    block.match(regex);

  if (!match)
    return "";

  return cleanText(match[1]);

}


// =====================================================
// RSS ITEM EXTRACTION
// =====================================================

function extractItems(xml, sourceName) {

  const items = [];

  // RSS <item>
  let blocks =
    xml.match(
      /<item\b[\s\S]*?<\/item>/gi
    ) || [];

  // Atom <entry> fallback
  if (blocks.length === 0) {

    blocks =
      xml.match(
        /<entry\b[\s\S]*?<\/entry>/gi
      ) || [];

  }


  for (const block of blocks) {

    const title =
      getTag(block, "title");

    let link =
      getTag(block, "link");

    // Atom links can be href attributes
    if (!link) {

      const atomLink =
        block.match(
          /<link\b[^>]*href=["']([^"']+)["'][^>]*>/i
        );

      if (atomLink)
        link =
          cleanText(atomLink[1]);

    }


    const description =
      getTag(block, "description") ||
      getTag(block, "summary") ||
      getTag(block, "content");


    const published =
      getTag(block, "pubDate") ||
      getTag(block, "published") ||
      getTag(block, "updated");


    if (!title || !link)
      continue;


    const score =
      scoreStory(
        title,
        description
      );


    items.push({

      title:
        title.slice(0, 300),

      description:
        description.slice(0, 700),

      url:
        link,

      source:
        sourceName,

      published:
        published,

      viralScore:
        score.score,

      reasons:
        score.reasons

    });

  }


  return items;

}


// =====================================================
// NORMALIZE TEXT
// =====================================================

function normalizeText(text) {

  return String(text || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

}


// =====================================================
// STORY SCORING
// =====================================================

function scoreStory(title, description) {

  const original =
    `${title} ${description}`;

  const text =
    normalizeText(original);


  let score = 0;

  const reasons = [];


  for (
    const [keyword, points]
    of Object.entries(KEYWORDS)
  ) {

    const normalizedKeyword =
      normalizeText(keyword);

    if (!normalizedKeyword)
      continue;


    if (
      text.includes(
        normalizedKeyword
      )
    ) {

      score += points;

      reasons.push(
        keyword
      );

    }

  }


  // -----------------------------------------------
  // BAŞLIK MERAK PUANI
  // -----------------------------------------------

  if (title.length >= 40)
    score += 5;

  if (title.length >= 70)
    score += 5;


  // -----------------------------------------------
  // SORU / ŞAŞIRTICI YAPI
  // -----------------------------------------------

  if (
    /why|how|what|this|after|before|when/i
      .test(title)
  ) {

    score += 5;

    reasons.push(
      "curiosity"
    );

  }


  // -----------------------------------------------
  // VİDEO POTANSİYELİ
  // -----------------------------------------------

  if (
    /video|camera|footage|clip|watch/i
      .test(original)
  ) {

    score += 10;

    reasons.push(
      "video"
    );

  }


  // -----------------------------------------------
  // HİKAYE POTANSİYELİ
  // -----------------------------------------------

  if (
    /rescued|saved|survived|unexpected|caught|shocked|viral/i
      .test(original)
  ) {

    score += 10;

    reasons.push(
      "story"
    );

  }


  // -----------------------------------------------
  // ÇOK KISA / ZAYIF BAŞLIKLARI KIRP
  // -----------------------------------------------

  if (title.length < 20)
    score -= 5;


  return {

    score:
      Math.min(
        100,
        Math.max(
          0,
          score
        )
      ),

    reasons:
      [...new Set(reasons)]
        .slice(0, 10)

  };

}


// =====================================================
// FETCH SOURCE
// =====================================================

async function fetchSource(source) {

  try {

    const response =
      await fetch(
        source.url,
        {

          method:
            "GET",

          headers: {

            "User-Agent":
              "Mozilla/5.0 (compatible; ViralStoryHunter/3.0)",

            "Accept":
              "application/rss+xml, application/xml, text/xml, */*"

          }

        }
      );


    if (!response.ok) {

      return [];

    }


    const xml =
      await response.text();


    if (!xml)
      return [];


    return extractItems(
      xml,
      source.name
    );

  }
  catch (error) {

    return [];

  }

}


// =====================================================
// GET FEED
// =====================================================

async function getFeed() {

  const allResults = [];


  // Kaynakları paralel çek
  const fetched =
    await Promise.all(
      SOURCES.map(
        source =>
          fetchSource(source)
      )
    );


  for (
    const items
    of fetched
  ) {

    allResults.push(
      ...items
    );

  }


  // -----------------------------------------------
  // DUPLICATE TEMİZLEME
  // -----------------------------------------------

  const unique = [];

  const seenURLs =
    new Set();

  const seenTitles =
    new Set();


  for (
    const item
    of allResults
  ) {

    const url =
      String(
        item.url || ""
      ).trim();


    const titleKey =
      normalizeText(
        item.title
      );


    if (
      url &&
      seenURLs.has(url)
    ) {

      continue;

    }


    if (
      titleKey &&
      seenTitles.has(titleKey)
    ) {

      continue;

    }


    if (url)
      seenURLs.add(url);

    if (titleKey)
      seenTitles.add(titleKey);


    unique.push(item);

  }


  // -----------------------------------------------
  // SCORE + TARIH
  // -----------------------------------------------

  unique.sort(
    (a, b) => {

      if (
        b.viralScore !==
        a.viralScore
      ) {

        return (
          b.viralScore -
          a.viralScore
        );

      }


      return (
        new Date(
          b.published || 0
        ) -

        new Date(
          a.published || 0
        )
      );

    }
  );


  return unique.slice(
    0,
    100
  );

}


// =====================================================
// JSON RESPONSE
// =====================================================

function json(
  data,
  status = 200
) {

  return new Response(

    JSON.stringify(
      data,
      null,
      2
    ),

    {

      status,

      headers: {

        "Content-Type":
          "application/json; charset=UTF-8",

        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Methods":
          "GET, OPTIONS",

        "Access-Control-Allow-Headers":
          "*",

        "Cache-Control":
          "no-store"

      }

    }

  );

}


// =====================================================
// MAIN WORKER
// =====================================================

export default {

  async fetch(request) {

    const url =
      new URL(
        request.url
      );


    // -----------------------------------------------
    // CORS PREFLIGHT
    // -----------------------------------------------

    if (
      request.method ===
      "OPTIONS"
    ) {

      return new Response(
        null,
        {

          status: 204,

          headers: {

            "Access-Control-Allow-Origin":
              "*",

            "Access-Control-Allow-Methods":
              "GET, OPTIONS",

            "Access-Control-Allow-Headers":
              "*"

          }

        }
      );

    }


    // -----------------------------------------------
    // HOME / HEALTH
    // -----------------------------------------------

    if (
      url.pathname === "/" ||
      url.pathname === "/health"
    ) {

      return json({

        ok:
          true,

        engine:
          "VIRAL STORY HUNTER",

        version:
          "3.0",

        status:
          "online",

        sources:
          SOURCES.length

      });

    }


    // -----------------------------------------------
    // FEED / SCAN
    // -----------------------------------------------

    if (
      url.pathname === "/feed" ||
      url.pathname === "/scan"
    ) {

      try {

        const results =
          await getFeed();


        return json({

          ok:
            true,

          count:
            results.length,

          scanned:
            SOURCES.length,

          results

        });

      }
      catch (error) {

        return json(

          {

            ok:
              false,

            count:
              0,

            scanned:
              SOURCES.length,

            results:
              [],

            error:
              error?.message ||
              String(error)

          },

          500

        );

      }

    }


    // -----------------------------------------------
    // 404
    // -----------------------------------------------

    return json(

      {

        ok:
          false,

        error:
          "Endpoint not found",

        path:
          url.pathname

      },

      404

    );

  }

};
