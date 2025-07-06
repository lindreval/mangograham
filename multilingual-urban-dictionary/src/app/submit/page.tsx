import { prisma } from "@/lib/prisma";
import { createSubmission } from "./actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const langs = await prisma.language.findMany({ orderBy: { name: "asc" } });

  async function action(formData: FormData) {
    "use server";
    await createSubmission(formData);
    redirect("/"); // or show success message
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add a Slang Phrase</h1>

      <form action={action} className="space-y-4">
        <label className="block">
          <span className="block font-medium">Language</span>
          <select
            name="languageId"
            className="w-full rounded border p-2"
            required
          >
            {langs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block font-medium">Phrase</span>
          <input
            name="phrase"
            className="w-full rounded border p-2"
            placeholder="e.g. Qué chido"
            required
          />
        </label>

        <label className="block">
          <span className="block font-medium">Part of Speech</span>
          <input
            name="partOfSpeech"
            className="w-full rounded border p-2"
            placeholder="noun, adjective, etc."
          />
        </label>

        <label className="block">
          <span className="block font-medium">Definition</span>
          <textarea
            name="definition"
            className="w-full rounded border p-2"
            rows={4}
            required
          />
        </label>

        <label className="block">
          <span className="block font-medium">Example Sentence (optional)</span>
          <textarea
            name="example"
            className="w-full rounded border p-2"
            rows={2}
          />
        </label>

        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
