"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Phrase, Language, Definition, Example } from "@prisma/client";
import TagSelector from "./TagSelector";
import DefinitionEditor from "./DefinitionEditor";

// Define the interface that matches TagSelector's expected Tag type
interface TagSelectorTag {
  id: number;
  name: string;
  color: string;
  author: {
    name: string | null;
    username: string | null;
  };
  _count: {
    phrases: number;
  };
}

interface DefinitionWithExamples extends Definition {
  examples: Example[];
}

interface EditPhraseFormProps {
  phrase: Phrase & {
    language: Language;
    tags: Array<{
      tag: {
        id: number;
        name: string;
        color: string | null;
      };
    }>;
    definitions: DefinitionWithExamples[];
  };
  languages: Language[];
}

export default function EditPhraseForm({ phrase, languages }: EditPhraseFormProps) {
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
  });

  // Convert phrase tags to the format expected by TagSelector
  const [selectedTags, setSelectedTags] = useState<TagSelectorTag[]>(() => {
    return phrase.tags.map(pt => ({
      id: pt.tag.id,
      name: pt.tag.name,
      color: pt.tag.color || "#3B82F6",
      author: {
        name: null,
        username: null,
      },
      _count: {
        phrases: 0,
      },
    }));
  });

  // Convert phrase definitions to the format expected by DefinitionEditor
  const [definitions, setDefinitions] = useState<{
    id?: number;
    body: string;
    status: string;
    examples: {
      id?: number;
      text: string;
      translation?: string;
      status: string;
    }[];
  }[]>(() => {
    return phrase.definitions.map(def => ({
      id: def.id,
      body: def.body,
      status: def.status,
      examples: def.examples.map(ex => ({
        id: ex.id,
        text: ex.text,
        translation: ex.translation || "",
        status: ex.status,
      })),
    }));
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
        body: JSON.stringify({
          ...formData,
          selectedTags: selectedTags.map(tag => tag.id),
          definitions,
        }),
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

  const handleTagsChange = (tags: TagSelectorTag[]) => {
    setSelectedTags(tags);
  };

  const handleDefinitionsChange = (newDefinitions: typeof definitions) => {
    setDefinitions(newDefinitions);
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
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <DefinitionEditor
            definitions={definitions}
            onDefinitionsChange={handleDefinitionsChange}
            disabled={isSubmitting}
          />
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