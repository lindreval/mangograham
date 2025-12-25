import type { Metadata } from "next";
import { MessageSquare, Bug, Lightbulb, MousePointer, FileText, Globe, Rocket, Check } from "lucide-react";
import { PageHeader, PageBadge } from "@/components/ui/page-header";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback & Feature Requests",
  description: "Share your feedback and request new features for Yung Salita",
};

const feedbackTypes = [
  {
    icon: Bug,
    title: "Bug Reports",
    description: "Found something that's not working as expected?",
    delay: "0ms",
  },
  {
    icon: Lightbulb,
    title: "Feature Requests",
    description: "Have an idea for new functionality?",
    delay: "50ms",
  },
  {
    icon: MousePointer,
    title: "UX Feedback",
    description: "Is something confusing or hard to use?",
    delay: "100ms",
  },
  {
    icon: FileText,
    title: "Content Quality",
    description: "Suggestions for improving definitions and examples",
    delay: "150ms",
  },
  {
    icon: Globe,
    title: "Language Support",
    description: "Want to see support for a new language?",
    delay: "200ms",
  },
];

const upcomingFeatures = [
  "Advanced search filters",
  "Mobile app",
  "Audio pronunciation guides",
  "Community forums",
  "Translation tools",
  "Gamification and achievements",
];

export default function FeedbackPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12 animate-page-enter">
      {/* Page Header */}
      <PageHeader
        title="Feedback"
        subtitle="Your input shapes the future of Yung Salita. Share your thoughts, report issues, or suggest new features."
        badge={
          <PageBadge>
            <MessageSquare className="w-3 h-3 mr-1.5" />
            We Value Your Input
          </PageBadge>
        }
      />

      {/* Intro Section */}
      <section className="mb-10">
        <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden animate-scale-up">
          <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
          <div className="p-6 md:p-8">
            <p className="text-card-foreground/80 text-base md:text-lg leading-relaxed">
              Your feedback helps us improve Yung Salita and make it more useful for everyone.
              Whether you&rsquo;ve found a bug, have an idea for a new feature, or want to suggest
              improvements, we&rsquo;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Type Cards */}
      <section className="mb-10">
        <h2 className="font-maragsa text-2xl md:text-3xl text-foreground mb-6 text-center">
          Types of Feedback We&rsquo;re Looking For
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbackTypes.map((type) => (
            <div
              key={type.title}
              className="group rounded-xl border-2 border-primary/20 bg-card shadow-card p-5
                         hover:-translate-y-2 hover:shadow-card-hover transition-all duration-[var(--duration-hover)]
                         animate-scale-up"
              style={{ animationDelay: type.delay }}
            >
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit mb-4">
                <type.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{type.title}</h3>
              <p className="text-card-foreground/80 text-sm">{type.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Features Section */}
      <section className="mb-10">
        <div className="rounded-xl border-2 border-primary/20 bg-[var(--off-white)] shadow-card overflow-hidden animate-scale-up"
             style={{ animationDelay: "250ms" }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-maragsa text-xl md:text-2xl text-foreground">Upcoming Features</h2>
            </div>
            <p className="text-card-foreground/80 mb-6">
              Here are some features we&rsquo;re considering based on community feedback:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingFeatures.map((feature, index) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-primary/10
                             animate-scale-up"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-card-foreground/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className="animate-scale-up" style={{ animationDelay: "400ms" }}>
        <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-maragsa text-xl md:text-2xl text-foreground">Submit Your Feedback</h2>
            </div>
            <p className="text-card-foreground/80 mb-6">
              Use the form below to share your thoughts, report issues, or suggest new features.
            </p>
            <FeedbackForm />
          </div>
        </div>
      </section>
    </main>
  );
}
