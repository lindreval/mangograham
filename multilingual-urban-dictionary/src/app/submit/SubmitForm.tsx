"use client";

import { useSearchParams } from "next/navigation";
import { createSubmission } from "./actions";
import { useState } from "react";

interface Language {
  id: number;
  name: string;
}

interface SubmitFormProps {
  languages: Language[];
}

export default function SubmitForm({ languages }: SubmitFormProps) {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get pre-filled values from URL params
  const preFilledPhrase = searchParams.get("phrase") || "";
  const preFilledLanguageId = searchParams.get("languageId") || "";
  const preFilledDefinition = searchParams.get("definition") || "";
  const preFilledDefinitionId = searchParams.get("definitionId") || "";
  
  // Check if this is for an existing phrase (both phrase and language are pre-filled)
  const isExistingPhrase = preFilledPhrase && preFilledLanguageId;
  // Check if this is for adding an example to an existing definition
  const isExistingDefinition = isExistingPhrase && preFilledDefinition && preFilledDefinitionId;

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createSubmission(formData);
      // Redirect on successful submission
      window.location.href = "/";
    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">
        {isExistingDefinition 
          ? `Add Example for "${preFilledPhrase}"` 
          : isExistingPhrase 
          ? `Add Definition for "${preFilledPhrase}"` 
          : "Add a Slang Phrase"}
      </h1>
      
      <form action={handleSubmit} className="space-y-4">
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
          name="languageId"
          className={`w-full rounded border p-2 ${
            isExistingPhrase 
              ? "bg-gray-100 text-gray-600 cursor-not-allowed" 
              : ""
          }`}
          defaultValue={preFilledLanguageId}
          disabled={!!isExistingPhrase}
          required
        >
          <option value="">Select a language</option>
          {languages.map((l) => (
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
          className={`w-full rounded border p-2 ${
            isExistingPhrase 
              ? "bg-gray-100 text-gray-600 cursor-not-allowed" 
              : ""
          }`}
          placeholder="e.g. Qué chido"
          defaultValue={preFilledPhrase}
          disabled={!!isExistingPhrase}
          required
        />
      </label>
      
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
        className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
      
      <div className="text-center text-xs text-muted-foreground border-t pt-4 mt-6">
        By submitting content, you agree to our{" "}
        <a 
          href="/terms" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Terms of Service
        </a>
        {" "}and confirm that you are at least 16 years old.
      </div>
    </form>
    </>
  );
}