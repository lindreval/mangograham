import type { Metadata } from "next";
import { BookOpen, Search, Plus, Users, Flag, ThumbsUp } from "lucide-react";
import { PageHeader, PageBadge } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "How to Use",
  description: "Learn how to use Yung Salita to discover and contribute slang definitions",
};

const steps = [
  {
    number: "01",
    title: "Getting Started",
    icon: BookOpen,
    delay: "0ms",
    content: (
      <p className="text-card-foreground/80 leading-relaxed">
        Yung Salita is a multilingual urban dictionary where you can discover and explore the
        colorful world of informal slang and expressions from different languages and cultures.
        Whether you want to learn, contribute, or just get lost in global slang, Yung Salita is
        the place to be. Take a look below to see how you can make the most of your experience.
      </p>
    ),
  },
  {
    number: "02",
    title: "Searching for Phrases",
    icon: Search,
    delay: "100ms",
    content: (
      <ul className="space-y-3 text-card-foreground/80">
        <li className="flex items-start gap-3">
          <Search className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <span>Looking for something specific? Use the search bar at the top to find specific words or phrases.</span>
        </li>
        <li className="flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <span>Browse by language using the sidebar on the homepage. Perfect for diving deep into one community.</span>
        </li>
        <li className="flex items-start gap-3">
          <Users className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <span>Scroll through the latest submissions on the main page to see what people are sharing in real time.</span>
        </li>
      </ul>
    ),
  },
  {
    number: "03",
    title: "Contributing",
    icon: Plus,
    delay: "200ms",
    content: (
      <ol className="space-y-3 text-card-foreground/80">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
          <span><strong className="text-foreground">Sign in</strong> with your Google account</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
          <span><strong className="text-foreground">Submit a phrase</strong> using the &ldquo;Submit&rdquo; button in the navigation</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
          <span><strong className="text-foreground">Add definitions</strong> to existing phrases</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">4</span>
          <span><strong className="text-foreground">Provide examples</strong> to help others understand usage</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">5</span>
          <span><strong className="text-foreground">Vote</strong> on definitions and examples to help the best content rise to the top</span>
        </li>
      </ol>
    ),
  },
  {
    number: "04",
    title: "Community Guidelines",
    icon: Users,
    delay: "300ms",
    content: (
      <ul className="space-y-3 text-card-foreground/80">
        <li className="flex items-start gap-3">
          <ThumbsUp className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <span>Keep definitions clear, accurate, and culturally sensitive</span>
        </li>
        <li className="flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <span>Provide context and examples whenever possible to help users understand nuance</span>
        </li>
        <li className="flex items-start gap-3">
          <Users className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <span>Be respectful of all cultures and languages</span>
        </li>
        <li className="flex items-start gap-3">
          <Flag className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <span>Flag content that&apos;s harmful, incorrect, or violates community standards to help maintain quality</span>
        </li>
      </ul>
    ),
  },
];

export default function HowToUsePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12 animate-page-enter">
      {/* Page Header */}
      <PageHeader
        title="How to Use"
        subtitle="Your guide to exploring, contributing, and making the most of Yung Salita's multilingual community."
        badge={
          <PageBadge>
            <BookOpen className="w-3 h-3 mr-1.5" />
            Getting Started
          </PageBadge>
        }
      />

      {/* Step Cards */}
      <div className="space-y-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="group rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden
                       hover:-translate-y-2 hover:shadow-card-hover transition-all duration-[var(--duration-hover)]
                       animate-scale-up"
            style={{ animationDelay: step.delay }}
          >
            <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Decorative Number */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <span className="font-maragsa text-6xl md:text-7xl text-primary/10 select-none">
                      {step.number}
                    </span>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="font-maragsa text-xl md:text-2xl text-foreground mb-4">
                    {step.title}
                  </h2>
                  {step.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
