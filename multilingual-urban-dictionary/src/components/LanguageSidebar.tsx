import Link from "next/link";
import type { Language } from "@prisma/client";

export default function LanguageSidebar({ languages }: { languages: Language[] }) {
  return (
    <aside className="hidden w-48 shrink-0 md:block">
      <h2 className="mb-2 font-semibold">Languages</h2>
      <ul className="space-y-1 text-sm">
        {languages.map((l) => (
          <li key={l.id}>
            <Link href={`/languages#${l.isoCode}`} className="hover:underline">
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
