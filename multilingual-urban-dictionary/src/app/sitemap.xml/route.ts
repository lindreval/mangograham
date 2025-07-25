import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://yungsalita.com";
  
  let phrases: Array<{ slug: string; updatedAt: Date; language: { isoCode: string } }> = [];
  let languages: Array<{ isoCode: string }> = [];
  
  try {
    // Get all approved phrases
    phrases = await prisma.phrase.findMany({
      where: { status: "approved" },
      include: { language: true },
      orderBy: { updatedAt: "desc" },
    });

    // Get all languages
    languages = await prisma.language.findMany();
  } catch (error) {
    // Handle database connection errors during build
    console.warn("Database not available for sitemap generation:", error);
  }

  const staticPages = [
    "",
    "/about",
    "/how-to-use", 
    "/languages",
    "/terms",
    "/privacy",
    "/feedback",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("")}
  ${languages
    .map(
      (lang) => `
  <url>
    <loc>${baseUrl}/${lang.isoCode}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("")}
  ${phrases
    .map(
      (phrase) => `
  <url>
    <loc>${baseUrl}/${phrase.language.isoCode}/${phrase.slug}</loc>
    <lastmod>${phrase.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}