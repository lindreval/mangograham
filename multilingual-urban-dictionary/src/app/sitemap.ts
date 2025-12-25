import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://yungsalita.com";

  // Static pages
  const staticPages = [
    "",
    "/about",
    "/languages",
    "/how-to-use",
    "/privacy",
    "/terms",
    "/feedback",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic language pages
  const languages = await prisma.language.findMany({
    select: { isoCode: true },
  });

  const languagePages = languages.map((lang) => ({
    url: `${baseUrl}/${lang.isoCode}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // Dynamic phrase pages (approved only)
  const phrases = await prisma.phrase.findMany({
    where: { status: "approved" },
    select: {
      slug: true,
      updatedAt: true,
      language: { select: { isoCode: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5000, // Limit for performance
  });

  const phrasePages = phrases.map((phrase) => ({
    url: `${baseUrl}/${phrase.language.isoCode}/${phrase.slug}`,
    lastModified: phrase.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...languagePages, ...phrasePages];
}
