"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Phrase, Language, Tag, PhraseTag } from "@prisma/client";

interface EditPhraseFormProps {
  phrase: Phrase & {
    language: Language;
    tags: (PhraseTag & { tag: Tag })[];
  };
  languages: Language[];
  tags: Tag[];
}

export default function EditPhraseForm({ phrase, languages, tags }: EditPhraseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    textOriginal: phrase.textOriginal,
    transliteration: phrase.transliteration || "",
    pronunciation: phrase.pronunciation || "",
    partOfSpeech: phrase.partOfSpeech || "",
    languageId: phrase.languageId,
    status: phrase.status,
    selectedTags: phrase.tags.map(pt => pt.tag.id),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/edit-phrase/${phrase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update phrase");
      }

      // Redirect back to the phrase page
      const updatedPhrase = await response.json();
      const language = languages.find(l => l.id === formData.languageId);
      router.push(`/${language?.isoCode}/${updatedPhrase.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="original" className="block text-sm font-medium mb-2">
              Original Text *
            </label>
            <input
              id="original"
              type="text"
              value={formData.textOriginal}
              onChange={(e) => setFormData(prev => ({ ...prev, textOriginal: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium mb-2">
              Language *
            </label>
            <select
              id="language"
              value={formData.languageId}
              onChange={(e) => setFormData(prev => ({ ...prev, languageId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="transliteration" className="block text-sm font-medium mb-2">
              Transliteration
            </label>
            <input
              id="transliteration"
              type="text"
              value={formData.transliteration}
              onChange={(e) => setFormData(prev => ({ ...prev, transliteration: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="pronunciation" className="block text-sm font-medium mb-2">
              Pronunciation
            </label>
            <input
              id="pronunciation"
              type="text"
              value={formData.pronunciation}
              onChange={(e) => setFormData(prev => ({ ...prev, pronunciation: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="partOfSpeech" className="block text-sm font-medium mb-2">
              Part of Speech
            </label>
            <input
              id="partOfSpeech"
              type="text"
              value={formData.partOfSpeech}
              onChange={(e) => setFormData(prev => ({ ...prev, partOfSpeech: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., noun, verb, adjective"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.selectedTags.includes(tag.id)
                    ? 'text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                style={{
                  backgroundColor: formData.selectedTags.includes(tag.id) 
                    ? (tag.color || '#3B82F6') 
                    : undefined
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-muted text-muted-foreground hover:bg-muted/80 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}