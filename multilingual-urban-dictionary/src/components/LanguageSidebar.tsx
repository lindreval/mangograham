import Link from "next/link";
import type { Language } from "@prisma/client";

interface Props {
  languages: Language[];
}

export default function LanguageSidebar({ languages }: Props) {
  return (
    <aside className="hidden w-48 shrink-0 md:block">
      <div className="sticky top-18 rounded-lg border-4 bg-card text-card-foreground p-4 shadow-elevation-medium">
        <h2 className="mb-2 font-semibold">
          <Link
                href={`/languages`}
                className="hover:underline"
              >
                Languages
          </Link>
        </h2>
        <ul className="space-y-1 text-sm">
          {languages.map((lang) => (
            <li key={lang.id}>
              <Link
                href={`/${lang.isoCode}`}
                className="hover:underline"
              >
                {lang.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}