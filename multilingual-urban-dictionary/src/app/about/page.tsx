import type { Metadata } from "next";
import { Globe, Users, Heart, Shield, MessageSquare, Sparkles } from "lucide-react";
import { PageHeader, PageBadge } from "@/components/ui/page-header";

// Static page - never needs revalidation
export const revalidate = false;

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Yung Salita and our mission to preserve and share slang across languages",
};

const features = [
  {
    icon: Globe,
    title: "Multilingual Focus",
    description: "We support multiple languages and encourage cross-cultural understanding",
    delay: "0ms",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Our content is created and curated by speakers of each language",
    delay: "100ms",
  },
  {
    icon: Heart,
    title: "Cultural Context",
    description: "We emphasize understanding the cultural background of expressions",
    delay: "200ms",
  },
  {
    icon: Shield,
    title: "Quality Control",
    description: "Community voting and moderation help maintain accurate definitions",
    delay: "300ms",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12 animate-page-enter">
      {/* Page Header */}
      <PageHeader
        title="About"
        subtitle="Discover our mission to preserve and celebrate the vibrant world of informal language from cultures around the globe."
        badge={
          <PageBadge>
            <Globe className="w-3 h-3 mr-1.5" />
            Our Story
          </PageBadge>
        }
      />

      {/* Hero Mission Card */}
      <section className="mb-12">
        <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden animate-scale-up">
          <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-maragsa text-2xl md:text-3xl text-foreground">Our Mission</h2>
            </div>
            <p className="text-card-foreground/80 text-base md:text-lg leading-relaxed">
              Yung Salita is a global, multilingual urban dictionary dedicated to celebrating and preserving the slang,
              expressions, and informal language from cultures around the world. From regional idioms to everyday phrases,
              Yung Salita is a domain for communities to connect and learn. We believe that language is living, evolving,
              and deeply connected to culture and identity. Our goal is to document the real words people use in real life,
              in every language.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="mb-12">
        <h2 className="font-maragsa text-2xl md:text-3xl text-foreground mb-6 text-center">
          What Makes Us Different
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border-2 border-primary/20 bg-card shadow-card p-6
                         hover:-translate-y-2 hover:shadow-card-hover transition-all duration-[var(--duration-hover)]
                         animate-scale-up"
              style={{ animationDelay: feature.delay }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-card-foreground/80 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Yung Salita Section */}
      <section className="mb-12">
        <div className="rounded-xl border-2 border-primary/20 bg-[var(--off-white)] shadow-card overflow-hidden animate-scale-up"
             style={{ animationDelay: "400ms" }}>
          <div className="p-6 md:p-8 lg:p-10 relative">
            {/* Decorative Quote Marks */}
            <div className="absolute top-4 left-4 text-primary/10 font-maragsa text-[80px] md:text-[120px] leading-none select-none pointer-events-none">
              &ldquo;
            </div>
            <div className="absolute bottom-4 right-4 text-primary/10 font-maragsa text-[80px] md:text-[120px] leading-none select-none pointer-events-none rotate-180">
              &ldquo;
            </div>

            <div className="relative z-10">
              <h2 className="font-maragsa text-2xl md:text-3xl text-foreground mb-6 text-center">
                Why &ldquo;Yung Salita&rdquo;?
              </h2>
              <p className="text-card-foreground/80 text-base md:text-lg leading-relaxed text-center max-w-3xl mx-auto">
                &ldquo;Yung Salita&rdquo; comes from Tagalog, meaning &ldquo;those words&rdquo; or &ldquo;the words.&rdquo;
                It captures what we&apos;re trying to accomplish: preserving and shining a spotlight on the words that matter to
                communities, language that connects and tells stories. These are the words that don&apos;t make it into textbooks,
                but live in group chats, music, jokes, and everyday conversation. All around the world the informal, creative,
                and expressive language brings people together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA Section */}
      <section className="animate-scale-up" style={{ animationDelay: "500ms" }}>
        <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
          <div className="p-6 md:p-8 lg:p-10 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-maragsa text-2xl md:text-3xl text-foreground mb-4">
              Join Our Community
            </h2>
            <p className="text-card-foreground/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Whether you&rsquo;re a native speaker wanting to share your language&rsquo;s unique expressions,
              a language learner curious about informal speech, or someone interested in cultural
              exchange, we welcome you to contribute and learn with us.
              Yung Salita is your space.
              We invite you to submit, define, translate and connect to help us build the most authentic, diverse,
              and culturally rich informal dictionary on the internet.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
