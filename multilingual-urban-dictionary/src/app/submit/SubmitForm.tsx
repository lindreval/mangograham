"use client";

import { useSearchParams } from "next/navigation";
import { createSubmission } from "./actions";
import { useState, useMemo } from "react";
import { CheckCircle2, Loader2, Info } from "lucide-react";
import TagSelector from "@/components/TagSelector";
import { AchievementNotificationService } from "@/lib/achievementNotificationService";
import { triggerAchievementPolling } from "@/hooks/useAchievementPolling";
import safeConfetti from "@/lib/confetti";
import { CharacterCounter } from "@/components/ui/CharacterCounter";
import { filterContent } from "@/lib/content-filter";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

// Character limits for submission fields
const CHAR_LIMITS = {
  phrase: 100,
  transliteration: 100,
  region: 100,
  definition: 1000,
  example: 300,
  exampleTranslation: 300,
};

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
  const [selectedLanguageId, setSelectedLanguageId] = useState(
    searchParams.get("languageId") || ""
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);

  // Form field states for progress tracking
  const [phrase, setPhrase] = useState(searchParams.get("phrase") || "");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");

  const preFilledPhrase = searchParams.get("phrase") || "";
  const preFilledLanguageId = searchParams.get("languageId") || "";
  const preFilledDefinition = searchParams.get("definition") || "";
  const preFilledDefinitionId = searchParams.get("definitionId") || "";

  const isExistingPhrase = preFilledPhrase && preFilledLanguageId;
  const isExistingDefinition =
    isExistingPhrase && preFilledDefinition && preFilledDefinitionId;

  const selectedLanguage = languages.find(
    (l) => l.id.toString() === selectedLanguageId
  );
  const requiresTransliteration = selectedLanguage?.transliteration || false;

  // Content validation function
  const validateContent = () => {
    const warnings: string[] = [];
    
    // Check phrase
    if (phrase && !isExistingPhrase) {
      const phraseResult = filterContent(phrase);
      if (!phraseResult.isClean) {
        warnings.push(...phraseResult.issues.map(issue => `Phrase: ${issue}`));
      }
    }
    
    // Check definition
    if (definition && !isExistingDefinition) {
      const definitionResult = filterContent(definition);
      if (!definitionResult.isClean) {
        warnings.push(...definitionResult.issues.map(issue => `Definition: ${issue}`));
      }
    }
    
    // Check example
    if (example) {
      const exampleResult = filterContent(example);
      if (!exampleResult.isClean) {
        warnings.push(...exampleResult.issues.map(issue => `Example: ${issue}`));
      }
    }
    
    setContentWarnings(warnings);
    return warnings.length === 0;
  };

  // Calculate form progress
  const progress = useMemo(() => {
    if (isExistingDefinition) {
      // Just needs example
      return example.trim() ? 100 : 0;
    }
    if (isExistingPhrase) {
      // Needs definition
      return definition.trim() ? 100 : 0;
    }
    // New phrase: language + phrase + definition
    const fields = [
      selectedLanguageId !== "",
      phrase.trim() !== "",
      definition.trim() !== "",
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / 3) * 100);
  }, [
    selectedLanguageId,
    phrase,
    definition,
    example,
    isExistingPhrase,
    isExistingDefinition,
  ]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    try {
      selectedTags.forEach((tag, index) => {
        formData.append(`tagIds[${index}]`, tag.id.toString());
      });

      const result = await createSubmission(formData);

      // Celebrate successful submission with confetti
      safeConfetti.success();

      if (result?.achievements && result.achievements.length > 0) {
        AchievementNotificationService.storeForLaterNotification(
          result.achievements
        );
      }

      triggerAchievementPolling();

      // Small delay to let confetti animation start before navigation
      setTimeout(() => {
        if (result && result.slug) {
          if (
            "language" in result &&
            result.language &&
            typeof result.language === "object" &&
            "isoCode" in result.language
          ) {
            window.location.href = `/${result.language.isoCode}/${result.slug}`;
          } else {
            const selectedLang = languages.find(
              (lang) =>
                lang.id === parseInt(formData.get("languageId") as string)
            );
            if (selectedLang) {
              window.location.href = `/${selectedLang.isoCode}/${result.slug}`;
            } else {
              window.location.href = "/";
            }
          }
        } else {
          window.location.href = "/";
        }
      }, 500);

    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
    }
  }

  const getContextTitle = () => {
    if (isExistingDefinition) return `Add Example for "${preFilledPhrase}"`;
    if (isExistingPhrase) return `Add Definition for "${preFilledPhrase}"`;
    return "Add a Slang Phrase";
  };

  return (
    <div className="relative rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden">
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />

      {/* Progress indicator */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground font-medium">Progress</span>
          <span className="text-primary font-semibold">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-[var(--ease-smooth)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-card/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
          <div className="flex flex-col items-center gap-4 p-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                Submitting your content...
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This will only take a moment
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`p-6 ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}>
        <h1 className="font-maragsa text-2xl md:text-3xl text-foreground mb-6">
          {getContextTitle()}
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            
            // Validate content
            const isContentClean = validateContent();
            if (!isContentClean) {
              toast({
                title: "Content Policy Violation",
                description: "Your submission contains content that violates our guidelines. Please review and edit.",
                variant: "destructive",
              });
              return;
            }
            
            // Check guidelines acceptance
            if (!acceptedGuidelines) {
              toast({
                title: "Accept Guidelines Required",
                description: "Please accept our content guidelines before submitting.",
                variant: "destructive",
              });
              return;
            }
            
            setIsSubmitting(true);
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
          className="space-y-5"
        >
          {/* Context banners */}
          {isExistingDefinition && (
            <div className="flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/20 p-4">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Adding example to existing definition
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  The language, phrase, and definition fields are pre-filled.
                </p>
              </div>
            </div>
          )}

          {isExistingPhrase && !isExistingDefinition && (
            <div className="flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/20 p-4">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Adding definition to existing phrase
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  The language and phrase fields are pre-filled.
                </p>
              </div>
            </div>
          )}

          {/* Language field */}
          <label className="block">
            <span className="block font-medium text-foreground mb-2">
              Language
            </span>
            <select
              name={isExistingPhrase ? "languageIdDisplay" : "languageId"}
              className={`w-full rounded-lg border-2 border-primary/20 bg-[var(--off-white)] p-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                isExistingPhrase
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
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

          {/* Phrase field */}
          <label className="block">
            <span className="block font-medium text-foreground mb-2">
              Phrase
            </span>
            <input
              name={isExistingPhrase ? "phraseDisplay" : "phrase"}
              className={`w-full rounded-lg border-2 border-primary/20 bg-[var(--off-white)] p-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                isExistingPhrase
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : ""
              }`}
              placeholder="e.g. Qué chido"
              value={isExistingPhrase ? preFilledPhrase : phrase}
              onChange={(e) => {
                if (!isExistingPhrase) {
                  setPhrase(e.target.value);
                  // Debounced validation - validate after user stops typing
                  setTimeout(() => validateContent(), 500);
                }
              }}
              disabled={!!isExistingPhrase}
              required={!isExistingPhrase}
              maxLength={CHAR_LIMITS.phrase}
            />
            {!isExistingPhrase && (
              <CharacterCounter
                current={phrase.length}
                max={CHAR_LIMITS.phrase}
              />
            )}
            {isExistingPhrase && (
              <input type="hidden" name="phrase" value={preFilledPhrase} />
            )}
          </label>

          {/* Transliteration field */}
          {requiresTransliteration && !isExistingPhrase && (
            <label className="block">
              <span className="block font-medium text-foreground mb-2">
                English Transliteration
              </span>
              <input
                name="transliteration"
                className="w-full rounded-lg border-2 border-primary/20 bg-[var(--off-white)] p-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 'daebak' instead of 대박"
                maxLength={CHAR_LIMITS.transliteration}
                required
              />
            </label>
          )}

          {/* Region field */}
          {!isExistingPhrase && (
            <label className="block">
              <span className="block font-medium text-foreground mb-2">
                Where is it used?{" "}
                <span className="font-normal text-muted-foreground">
                  (Optional)
                </span>
              </span>
              <input
                name="region"
                className="w-full rounded-lg border-2 border-primary/20 bg-[var(--off-white)] p-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Mexico City, California, Manila"
                maxLength={CHAR_LIMITS.region}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Specify the geographic region where this phrase is commonly used
              </p>
            </label>
          )}

          {/* Tags */}
          {!isExistingPhrase && (
            <div className="block">
              <span className="block font-medium text-foreground mb-2">
                Tags
              </span>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Existing definition display */}
          {isExistingDefinition && (
            <label className="block">
              <span className="block font-medium text-foreground mb-2">
                Existing Definition
              </span>
              <textarea
                name="existingDefinition"
                className="w-full rounded-lg border-2 border-primary/10 bg-muted p-3 text-muted-foreground cursor-not-allowed resize-none"
                rows={3}
                defaultValue={preFilledDefinition}
                disabled={true}
                readOnly
              />
              <input
                type="hidden"
                name="definitionId"
                value={preFilledDefinitionId}
              />
            </label>
          )}

          {/* Definition or Example field */}
          <label className="block">
            <span className="block font-medium text-foreground mb-2">
              {isExistingDefinition ? "New Example Sentence" : "Definition"}
            </span>
            <textarea
              name={isExistingDefinition ? "example" : "definition"}
              className="w-full rounded-lg border-2 border-primary/20 bg-[var(--off-white)] p-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={isExistingDefinition ? 2 : 4}
              placeholder={
                isExistingDefinition ? "e.g. ¡Qué chido está tu carro!" : ""
              }
              value={isExistingDefinition ? example : definition}
              onChange={(e) => {
                if (isExistingDefinition) {
                  setExample(e.target.value);
                } else {
                  setDefinition(e.target.value);
                }
                // Debounced validation
                setTimeout(() => validateContent(), 500);
              }}
              maxLength={isExistingDefinition ? CHAR_LIMITS.example : CHAR_LIMITS.definition}
              required={!isExistingDefinition}
            />
            <CharacterCounter
              current={isExistingDefinition ? example.length : definition.length}
              max={isExistingDefinition ? CHAR_LIMITS.example : CHAR_LIMITS.definition}
            />
          </label>

          {/* Example fields for new phrase/definition */}
          {!isExistingDefinition && (
            <>
              <label className="block">
                <span className="block font-medium text-foreground mb-2">
                  Example Sentence{" "}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </span>
                <textarea
                  name="example"
                  className="w-full rounded-lg border-2 border-primary/20 bg-[var(--off-white)] p-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                  placeholder="e.g. ¡Qué chido está tu carro!"
                  maxLength={CHAR_LIMITS.example}
                />
              </label>

              <label className="block">
                <span className="block font-medium text-foreground mb-2">
                  Example Translation{" "}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </span>
                <textarea
                  name="exampleTranslation"
                  className="w-full rounded-lg border-2 border-primary/20 bg-[var(--off-white)] p-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                  placeholder="e.g. Your car is so cool!"
                  maxLength={CHAR_LIMITS.exampleTranslation}
                />
              </label>
            </>
          )}

          {isExistingDefinition && (
            <label className="block">
              <span className="block font-medium text-foreground mb-2">
                Example Translation{" "}
                <span className="font-normal text-muted-foreground">
                  (Optional)
                </span>
              </span>
              <textarea
                name="exampleTranslation"
                className="w-full rounded-lg border-2 border-primary/20 bg-[var(--off-white)] p-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
                placeholder="e.g. Your car is so cool!"
                maxLength={CHAR_LIMITS.exampleTranslation}
              />
            </label>
          )}

          {/* Content warnings display */}
          {contentWarnings.length > 0 && (
            <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium text-destructive mb-2">Content Policy Issues Detected:</p>
              <ul className="text-sm text-destructive/80 space-y-1">
                {contentWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Guidelines acceptance checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
            <Checkbox
              id="guidelines"
              checked={acceptedGuidelines}
              onCheckedChange={(checked) => setAcceptedGuidelines(checked as boolean)}
              className="mt-1"
              required
            />
            <label htmlFor="guidelines" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I have read and agree to follow the{" "}
              <Link 
                href="/content-guidelines" 
                target="_blank" 
                className="text-primary hover:underline font-medium"
              >
                Content Guidelines
              </Link>{" "}
              and understand that violations may result in content removal and account suspension. I confirm that my submission does not contain personal information, hate speech, or inappropriate content.
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !acceptedGuidelines || contentWarnings.length > 0}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold shadow-card hover:shadow-card-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Submit
              </>
            )}
          </button>

          {/* Terms notice */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-primary/10">
            By submitting content, you agree to our{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Terms of Service
            </a>{" "}
            and confirm that you are at least 18 years old.
          </div>
        </form>
      </div>
    </div>
  );
}
