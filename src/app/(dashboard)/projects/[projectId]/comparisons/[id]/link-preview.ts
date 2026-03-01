"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Transform URLs for better scraping
function getScrapableUrl(url: string): string {
  // item.taobao.com -> world.taobao.com
  const taobaoMatch = url.match(/item\.taobao\.com\/item\.htm\?.*id=(\d+)/);
  if (taobaoMatch) {
    return `https://world.taobao.com/item/${taobaoMatch[1]}.htm`;
  }
  return url;
}

// Shopee and some SPAs need a crawler user agent to get SSR HTML
function getUserAgent(url: string): string {
  if (url.includes("shopee.")) {
    return "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
  }
  return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
}

function extractMeta(html: string): { image: string | null; title: string | null } {
  let image: string | null = null;
  let title: string | null = null;

  // Try og:image
  const ogImgMatch =
    html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (ogImgMatch) {
    image = ogImgMatch[1];
  }

  // Fallback: twitter:image
  if (!image) {
    const twitterImgMatch =
      html.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (twitterImgMatch) {
      image = twitterImgMatch[1];
    }
  }

  // Fallback: JSON-LD structured data
  if (!image) {
    const jsonldBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonldBlocks) {
      for (const block of jsonldBlocks) {
        try {
          const content = block.replace(/<\/?script[^>]*>/gi, "");
          const parsed = JSON.parse(content);
          if (parsed.image) {
            image = Array.isArray(parsed.image) ? parsed.image[0] : parsed.image;
          }
          if (parsed.name && !title) {
            title = parsed.name;
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  // Fallback: first product image from known CDNs
  if (!image) {
    const cdnImgs = html.match(
      /https?:\/\/[^\s"'<>]+(?:alicdn|susercontent|lazada|lzd)[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi
    );
    if (cdnImgs && cdnImgs.length > 0) {
      // Filter out tiny icons
      const productImg = cdnImgs.find(
        (u) => !u.includes("icon") && !u.includes("logo") && !u.includes("favicon")
      );
      if (productImg) image = productImg;
    }
  }

  // Try og:title
  if (!title) {
    const ogTitleMatch =
      html.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1];
    }
  }

  // Fallback: <title>
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  return { image, title };
}

export async function fetchLinkPreview(
  projectId: string,
  comparisonId: string,
  itemId: string,
  url: string
): Promise<{ image: string | null; title: string | null }> {
  if (!url || url === "") return { image: null, title: null };

  try {
    const scrapableUrl = getScrapableUrl(url);
    const userAgent = getUserAgent(scrapableUrl);

    const response = await fetch(scrapableUrl, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return { image: null, title: null };

    const html = await response.text();
    const meta = extractMeta(html);

    // Cache in database
    if (meta.image || meta.title) {
      const supabase = await createClient();
      await supabase
        .from("comparison_items")
        .update({
          link_image: meta.image,
          link_title: meta.title,
        })
        .eq("id", itemId);

      revalidatePath(`/projects/${projectId}/comparisons/${comparisonId}`);
    }

    return meta;
  } catch {
    return { image: null, title: null };
  }
}
