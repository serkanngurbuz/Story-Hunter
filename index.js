// =====================================================
// STORY HUNTER — CLOUDFLARE WORKER
// =====================================================
// Google News + Reddit New RSS
// Hikâyeleştirilebilir ham video / bilgi / olay bulucu
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

  // ===================================================
  // GOOGLE NEWS
  // ===================================================

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
      "https://news.google.com/rss/search?q=animal+OR+dog+OR+cat+OR+wildlife+OR+rescued&hl=en-US&gl=US&ceid=US:en"
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
    name: "Google News Science",
    url:
      "https://news.google.com/rss/search?q=strange+science+OR+weird+science+OR+scientists+discovered+OR+scientists+found&hl=en-US&gl=US&ceid=US:en"
  },

  {
    name: "Google News Human Stories",
    url:
      "https://news.google.com/rss/search?q=man+OR+woman+OR+boy+OR+girl+OR+person+unexpected+story&hl=en-US&gl=US&ceid=US:en"
  },


  // ===================================================
  // REDDIT — YENİ HAM MADDE
  // ===================================================

  {
    name: "Reddit Interesting",
    url:
      "https://www.reddit.com/r/interesting/new/.rss"
  },

  {
    name: "Reddit DamnThatsInteresting",
    url:
      "https://www.reddit.com/r/Damnthatsinteresting/new/.rss"
  },

  {
    name: "Reddit InterestingAsFuck",
    url:
      "https://www.reddit.com/r/interestingasfuck/new/.rss"
  },

  {
    name: "Reddit Unexpected",
    url:
      "https://www.reddit.com/r/Unexpected/new/.rss"
  },

  {
    name: "Reddit NextFuckinglevel",
    url:
      "https://www.reddit.com/r/nextfuckinglevel/new/.rss"
  },

  {
    name: "Reddit UnusualVideos",
    url:
      "https://www.reddit.com/r/UnusualVideos/new/.rss"
  },

  {
    name: "Reddit MildlyInteresting",
    url:
      "https://www.reddit.com/r/mildlyinteresting/new/.rss"
  },

  {
    name: "Reddit NatureIsFuckingLit",
    url:
      "https://www.reddit.com/r/NatureIsFuckingLit/new/.rss"
  },

  {
    name: "Reddit AnimalsBeingDerps",
    url:
      "https://www.reddit.com/r/AnimalsBeingDerps/new/.rss"
  },

  {
    name: "Reddit HumansBeingBros",
    url:
      "https://www.reddit.com/r/HumansBeingBros/new/.rss"
  },

  {
    name: "Reddit OddlySatisfying",
    url:
      "https://www.reddit.com/r/oddlysatisfying/new/.rss"
  },

  {
    name: "Reddit Weird",
    url:
      "https://www.reddit.com/r/Weird/new/.rss"
  },

  {
    name: "Reddit DeepIntoYouTube",
    url:
      "https://www.reddit.com/r/DeepIntoYouTube/new/.rss"
  },

  {
    name: "Reddit ThatLookedInteresting",
    url:
      "https://www.reddit.com/r/ThatLookedInteresting/new/.rss"
  },

  {
    name: "Reddit WhatCouldGoWrong",
    url:
      "https://www.reddit.com/r/Whatcouldgowrong/new/.rss"
  }

];


// =====================================================
// STORY KEYWORDS
// =====================================================

const KEYWORDS = {

  // ---------------------------------------------------
  // VİRAL / TREND
  // ---------------------------------------------------

  "viral": 12,
  "went viral": 20,
  "goes viral": 20,
  "viral video": 20,
  "trending": 10,
  "internet": 3,

  // ---------------------------------------------------
  // ŞAŞIRTICI / MERAK
  // ---------------------------------------------------

  "unexpected": 22,
  "unbelievable": 22,
  "incredible": 18,
  "amazing": 16,
  "shocking": 22,
  "shocked": 18,
  "astonishing": 20,
  "bizarre": 22,
  "strange": 18,
  "weird": 18,
  "crazy": 16,
  "insane": 16,
  "unusual": 18,
  "surprising": 18,
  "surprise": 14,
  "never seen": 22,
  "no one expected": 25,
  "rare": 18,
  "unknown": 15,
  "little known": 20,

  // ---------------------------------------------------
  // VİDEO
  // ---------------------------------------------------

  "caught on camera": 28,
  "caught on video": 28,
  "camera captures": 24,
  "captured on camera": 24,
  "footage": 10,
  "video": 7,
  "recorded": 7,
  "filmed": 7,
  "clip": 6,
  "watch": 5,

  // ---------------------------------------------------
  // HAYVAN / DOĞA
  // ---------------------------------------------------

  "dog": 10,
  "cat": 10,
  "puppy": 13,
  "kitten": 13,
  "horse": 10,
  "bird": 10,
  "bear": 10,
  "animal": 10,
  "wildlife": 12,
  "nature": 8,
  "ocean": 8,
  "forest": 7,
  "tree": 7,

  // ---------------------------------------------------
  // KURTARMA / HAYAT
  // ---------------------------------------------------

  "rescued": 18,
  "rescue": 18,
  "saved": 18,
  "survived": 23,
  "survival": 23,
  "hero": 16,
  "heroic": 16,
  "saved a life": 25,
  "life-saving": 25,

  // ---------------------------------------------------
  // OLAY / TEHLİKE
  // ---------------------------------------------------

  "accident": 14,
  "incident": 10,
  "dramatic": 13,
  "danger": 13,
  "dangerous": 13,
  "lucky": 16,
  "luckily": 16,
  "miracle": 22,
  "miraculous": 22,

  // ---------------------------------------------------
  // İNSAN HİKAYELERİ
  // ---------------------------------------------------

  "man": 2,
  "woman": 2,
  "boy": 5,
  "girl": 5,
  "child": 7,
  "kid": 7,
  "couple": 5,
  "family": 5,
  "person": 2,

  // ---------------------------------------------------
  // YARATICILIK / BECERİ
  // ---------------------------------------------------

  "invention": 16,
  "invented": 16,
  "created": 7,
  "built": 10,
  "made": 5,
  "talent": 14,
  "genius": 17,
  "clever": 12,
  "creative": 12,
  "skill": 10,
  "technique": 12,
  "method": 10,

  // ---------------------------------------------------
  // KOMİK / GARİP DAVRANIŞ
  // ---------------------------------------------------

  "prank": 10,
  "funny": 10,
  "hilarious": 13,
  "awkward": 13,
  "embarrassing": 10,
  "strangest": 18,

  // ---------------------------------------------------
  // BİLGİ / KEŞİF
  // ---------------------------------------------------

  "scientists": 12,
  "scientist": 12,
  "discovered": 15,
  "discovery": 15,
  "researchers": 10,
  "research": 8,
  "study": 8,
  "explained": 8,
  "how": 8,
  "why": 8,
  "actually": 10,
  "apparently": 8,
  "turns out": 14,
  "for the first time": 18,
  "first ever": 18,
  "rare footage": 20,

  // ---------------------------------------------------
  // GÖRÜNÜŞ / FİZİKSEL OLAYLAR
  // ---------------------------------------------------

  "microscope": 15,
  "close-up": 12,
  "underwater": 12,
  "inside": 8,
  "under": 6,
  "behind": 6,
  "without": 8,
  "using": 7,
  "before": 5,
  "after": 5

};


// =====================================================
// TEXT CLEANER
// =====================================================

function cleanText(value) {

  let text =
    String(value || "");

  text =
    text.replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/gi,
      "$1"
    );

  text =
    text.replace(
      /<[^>]*>/g,
      " "
    );

  text =
    text
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&nbsp;/gi, " ");

  text =
    text
      .replace(/\s+/g, " ")
      .trim();

  return text;

}


// =====================================================
// XML TAG READER
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

  return cleanText(
    match[1]
  );

}


// =====================================================
// NORMALIZE
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

function scoreStory(
  title,
  description
) {

  const original =
    `${title} ${description}`;

  const text =
    normalizeText(original);

  let score = 0;

  const reasons = [];


  // -----------------------------------------------
  // KEYWORDS
  // -----------------------------------------------

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
  // BAŞLIK UZUNLUĞU
  // -----------------------------------------------

  if (title.length >= 40)
    score += 5;

  if (title.length >= 70)
    score += 5;


  // -----------------------------------------------
  // MERAK CÜMLESİ
  // -----------------------------------------------

  if (
    /why|how|what|when|where|this|after|before/i
      .test(title)
  ) {

    score += 7;

    reasons.push(
      "curiosity"
    );

  }


  // -----------------------------------------------
  // VİDEO POTANSİYELİ
  // -----------------------------------------------

  if (
    /video|camera|footage|clip|watch|filmed|recorded/i
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
    /rescued|saved|survived|unexpected|caught|shocked|discovered|invented|created|rare/i
      .test(original)
  ) {

    score += 12;

    reasons.push(
      "story"
    );

  }


  // -----------------------------------------------
  // BİLGİ POTANSİYELİ
  // -----------------------------------------------

  if (
    /scientist|scientists|research|study|discovered|how|why|actually|turns out/i
      .test(original)
  ) {

    score += 10;

    reasons.push(
      "information"
    );

  }


  // -----------------------------------------------
  // HAM VİDEO SİNYALİ
  // -----------------------------------------------

  if (
    /reddit\.com\/r\//i.test(original) === false &&
    /video|footage|camera|filmed|recorded/i.test(original)
  ) {

    score += 5;

  }


  // -----------------------------------------------
  // ZAYIF BAŞLIK
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
// RSS / ATOM ITEM EXTRACTION
// =====================================================

function extractItems(
  xml,
  sourceName
) {

  const items = [];


  // RSS
  let blocks =
    xml.match(
      /<item\b[\s\S]*?<\/item>/gi
    ) || [];


  // Atom fallback
  if (
    blocks.length === 0
  ) {

    blocks =
      xml.match(
        /<entry\b[\s\S]*?<\/entry>/gi
      ) || [];

  }


  for (
    const block
    of blocks
  ) {

    const title =
      getTag(
        block,
        "title"
      );


    let link =
      getTag(
        block,
        "link"
      );


    // Atom href
    if (!link) {

      const atomLink =
        block.match(
          /<link\b[^>]*href=["']([^"']+)["'][^>]*>/i
        );

      if (atomLink) {

        link =
          cleanText(
            atomLink[1]
          );

      }

    }


    const description =
      getTag(
        block,
        "description"
      ) ||
      getTag(
        block,
        "summary"
      ) ||
      getTag(
        block,
        "content"
      );


    const published =
      getTag(
        block,
        "pubDate"
      ) ||
      getTag(
        block,
        "published"
      ) ||
      getTag(
        block,
        "updated"
      );


    if (
      !title ||
      !link
    ) {

      continue;

    }


    const result =
      scoreStory(
        title,
        description
      );


    items.push({

      title:
        title.slice(
          0,
          300
        ),

      description:
        description.slice(
          0,
          800
        ),

      url:
        link,

      source:
        sourceName,

      published:
        published,

      viralScore:
        result.score,

      reasons:
        result.reasons

    });

  }


  return items;

}


// =====================================================
// FETCH SOURCE
// =====================================================

async function fetchSource(
  source
) {

  try {

    const response =
      await fetch(
        source.url,
        {

          method:
            "GET",

          headers: {

            "User-Agent":
              "Mozilla/5.0 (compatible; StoryHunter/4.0)",

            "Accept":
              "application/rss+xml, application/xml, text/xml, */*"

          }

        }
      );


    if (
      !response.ok
    ) {

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
  catch (
    error
  ) {

    return [];

  }

}


// =====================================================
// GET FEED
// =====================================================

async function getFeed() {

  const allResults = [];


  const fetched =
    await Promise.all(
      SOURCES.map(
        source =>
          fetchSource(
            source
          )
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


  // ===================================================
  // DUPLICATE TEMİZLEME
  // ===================================================

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
      seenURLs.has(
        url
      )
    ) {

      continue;

    }


    if (
      titleKey &&
      seenTitles.has(
        titleKey
      )
    ) {

      continue;

    }


    if (url)
      seenURLs.add(url);

    if (titleKey)
      seenTitles.add(titleKey);


    unique.push(
      item
    );

  }


  // ===================================================
  // SCORE + YENİLİK
  // ===================================================

  unique.sort(
    (a, b) => {

      // Önce hikâye skoru
      if (
        b.viralScore !==
        a.viralScore
      ) {

        return (
          b.viralScore -
          a.viralScore
        );

      }


      // Eşitse yeni olan öne
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

  async fetch(
    request
  ) {

    const url =
      new URL(
        request.url
      );


    // =================================================
    // CORS
    // =================================================

    if (
      request.method ===
      "OPTIONS"
    ) {

      return new Response(
        null,
        {

          status:
            204,

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


    // =================================================
    // HOME / HEALTH
    // =================================================

    if (
      url.pathname === "/" ||
      url.pathname === "/health"
    ) {

      return json({

        ok:
          true,

        engine:
          "STORY HUNTER",

        version:
          "4.0",

        status:
          "online",

        sources:
          SOURCES.length

      });

    }


    // =================================================
    // FEED / SCAN
    // =================================================

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
      catch (
        error
      ) {

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


    // =================================================
    // 404
    // =================================================

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
