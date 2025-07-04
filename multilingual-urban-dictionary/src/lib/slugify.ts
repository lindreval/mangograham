// src/lib/slugify.ts
export default function slugify(text: string) {
  return text
    .normalize("NFKD")              // split accents from letters
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "") // drop accent code-points
    .replace(/[^a-z0-9]+/g, "-")     // swap groups of non-latins with "-"
    .replace(/(^-|-$)+/g, "");       // trim leading / trailing hyphens
}
