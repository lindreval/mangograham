"use client";

import { useSearchParams } from "next/navigation";
import { createSubmission } from "./actions";
import { useState } from "react";
import TagSelector from "@/components/TagSelector";
import { AchievementNotificationService } from "@/lib/achievementNotificationService";
import { triggerAchievementPolling } from "@/hooks/useAchievementPolling";

interface Language {
  id: number;
  name: string;
  isoCode: string;
  transliteration: boolean;
}

interface SubmitFormProps {
  languages: Language[];
}

interface Tag {
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

export default function SubmitForm({ languages }: SubmitFormProps) {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguageId, setSelectedLanguageId] = useState(searchParams.get("languageId") || "");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  
  // Get pre-filled values from URL params
  const preFilledPhrase = searchParams.get("phrase") || "";
  const preFilledLanguageId = searchParams.get("languageId") || "";
  const preFilledDefinition = searchParams.get("definition") || "";
  const preFilledDefinitionId = searchParams.get("definitionId") || "";
  
  // Check if this is for an existing phrase (both phrase and language are pre-filled)
  const isExistingPhrase = preFilledPhrase && preFilledLanguageId;
  // Check if this is for adding an example to an existing definition
  const isExistingDefinition = isExistingPhrase && preFilledDefinition && preFilledDefinitionId;
  
  // Find the selected language and check if it requires transliteration
  const selectedLanguage = languages.find(l => l.id.toString() === selectedLanguageId);
  const requiresTransliteration = selectedLanguage?.transliteration || false;

  async function handleSubmit(formData: FormData) {
    console.log("Setting isSubmitting to true");
    setIsSubmitting(true);
    
    try {
      // Add selected tag IDs to form data
      selectedTags.forEach((tag, index) => {
        formData.append(`tagIds[${index}]`, tag.id.toString());
      });
      
      console.log("Calling createSubmission");
      const result = await createSubmission(formData);
      console.log("createSubmission completed", result);
      
      // Handle achievements before redirect
      if (result?.achievements && result.achievements.length > 0) {
        // Store achievements for display after redirect
        AchievementNotificationService.storeForLaterNotification(result.achievements);
      }
      
      // Trigger achievement polling for background achievements
      triggerAchievementPolling();
      
      // Redirect back to the phrase page after successful submission
      if (result && result.slug) {
        console.log("Redirecting to phrase page");
        if ('language' in result && result.language && typeof result.language === 'object' && 'isoCode' in result.language) {
          window.location.href = `/${result.language.isoCode}/${result.slug}`;
        } else {
          // Fallback: use the selected language from form
          const selectedLanguage = languages.find(lang => lang.id === parseInt(formData.get("languageId") as string));
          if (selectedLanguage) {
            window.location.href = `/${selectedLanguage.isoCode}/${result.slug}`;
          } else {
            window.location.href = "/";
          }
        }
      } else {
        console.log("Redirecting to home page");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative rounded-lg border-4 bg-card text-card-foreground p-6 shadow-elevation-medium">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3 bg-white rounded-lg shadow-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-var(--primary) border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-800">Submitting your content...</p>
          </div>
        </div>
      )}
      
      <div className={isSubmitting ? "opacity-50 pointer-events-none" : ""}>
        <h1 className="text-2xl font-bold mb-6">
        {isExistingDefinition 
          ? `Add Example for "${preFilledPhrase}"` 
          : isExistingPhrase 
          ? `Add Definition for "${preFilledPhrase}"` 
          : "Add a Slang Phrase"}
      </h1>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        setIsSubmitting(true); // Set loading state immediately
        const formData = new FormData(e.currentTarget);
        handleSubmit(formData);
      }} className="space-y-4">
      {isExistingDefinition && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
          <h3 className="text-sm font-medium text-green-800 mb-1">
            Adding example to existing definition
          </h3>
          <p className="text-xs text-green-600">
            The language, phrase, and definition fields are pre-filled and cannot be changed.
          </p>
        </div>
      )}
      {isExistingPhrase && !isExistingDefinition && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Adding definition to existing phrase
          </h3>
          <p className="text-xs text-blue-600">
            The language and phrase fields are pre-filled and cannot be changed.
          </p>
        </div>
      )}
      
      <label className="block">
        <span className="block font-medium">Language</span>
        <select
          name={isExistingPhrase ? "languageIdDisplay" : "languageId"}
          className={`w-full rounded border p-2 ${
            isExistingPhrase 
              ? "bg-gray-100 text-gray-600 cursor-not-allowed" 
              : ""
          }`}
          value={selectedLanguageId}
          onChange={(e) => setSelectedLanguageId(e.target.value)}
          disabled={!!isExistingPhrase}
          required={!isExistingPhrase}
        >
          <option value="">Select a language</option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        {isExistingPhrase && (
          <input
            type="hidden"
            name="languageId"
            value={preFilledLanguageId}
          />
        )}
      </label>
      
      <label className="block">
        <span className="block font-medium">Phrase</span>
        <input
          name={isExistingPhrase ? "phraseDisplay" : "phrase"}
          className={`w-full rounded border p-2 ${
            isExistingPhrase 
              ? "bg-gray-100 text-gray-600 cursor-not-allowed" 
              : ""
          }`}
          placeholder="e.g. Qué chido"
          defaultValue={preFilledPhrase}
          disabled={!!isExistingPhrase}
          required={!isExistingPhrase}
        />
        {isExistingPhrase && (
          <input
            type="hidden"
            name="phrase"
            value={preFilledPhrase}
          />
        )}
      </label>
      
      {requiresTransliteration && !isExistingPhrase && (
        <label className="block">
          <span className="block font-medium">English Transliteration</span>
          <input
            name="transliteration"
            className="w-full rounded border p-2"
            placeholder="e.g. 'daebak' instead of 대박"
            required
          />
        </label>
      )}
      
      {!isExistingPhrase && (
        <div className="block">
          <span className="block font-medium mb-2">Tags</span>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            disabled={isSubmitting}
          />
        </div>
      )}
      
      {isExistingDefinition && (
        <label className="block">
          <span className="block font-medium">Existing Definition</span>
          <textarea
            name="existingDefinition"
            className="w-full rounded border p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            rows={3}
            defaultValue={preFilledDefinition}
            disabled={true}
            readOnly
          />
          <input type="hidden" name="definitionId" value={preFilledDefinitionId} />
        </label>
      )}
      
      <label className="block">
        <span className="block font-medium">
          {isExistingDefinition ? "New Example Sentence" : "Definition"}
        </span>
        <textarea
          name={isExistingDefinition ? "example" : "definition"}
          className="w-full rounded border p-2"
          rows={isExistingDefinition ? 2 : 4}
          placeholder={isExistingDefinition ? "e.g. ¡Qué chido está tu carro!" : ""}
          required={!isExistingDefinition}
        />
      </label>
      
      {!isExistingDefinition && (
        <>
          <label className="block">
            <span className="block font-medium">Example Sentence</span>
            <textarea
              name="example"
              className="w-full rounded border p-2"
              rows={2}
              placeholder="e.g. ¡Qué chido está tu carro!"
            />
          </label>
          
          <label className="block">
            <span className="block font-medium">Example Translation</span>
            <textarea
              name="exampleTranslation"
              className="w-full rounded border p-2"
              rows={2}
              placeholder="e.g. Your car is so cool!"
            />
          </label>
        </>
      )}
      
      {isExistingDefinition && (
        <label className="block">
          <span className="block font-medium">Example Translation</span>
          <textarea
            name="exampleTranslation"
            className="w-full rounded border p-2"
            rows={2}
            placeholder="e.g. Your car is so cool!"
          />
        </label>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        )}
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
      
      <div className="text-center text-xs text-muted-foreground border-t pt-4 mt-6">
        By submitting content, you agree to our{" "}
        <a 
          href="/terms" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Terms of Service
        </a>
        {" "}and confirm that you are at least 16 years old.
      </div>
      </form>
      </div>
    </div>
  );
}