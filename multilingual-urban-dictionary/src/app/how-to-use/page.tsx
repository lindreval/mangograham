import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Use",
  description: "Learn how to use Yung Salita to discover and contribute slang definitions",
};

export default function HowToUsePage() {
  return (
    <main className="mx-auto max-w-4xl p-6 mt-8 rounded-lg border-4 bg-card text-foreground shadow-elevation-medium">
      <h1 className="text-3xl font-bold mb-6">How to Use Yung Salita</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Getting Started</h2>
          <div className="max-w-none">
            <p className="text-card-foreground/80">
              Yung Salita is a multilingual urban dictionary where you can discover and explore the
              colorful world of informal slang and expressions from different languages and cultures.
              Whether you want to learn, contribute, or just get lost in global slang, Yung Salita is
              the place to be. Take a look below to see how you can make the most of your experience.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Searching for Phrases</h2>
          <div className="max-w-none">
            <ul className="space-y-2 text-card-foreground/80">
              <li>Looking for something specific? Use the search bar at the top to find specific words or phrases.</li>
              <li>Browse by language using the sidebar on the homepage. Perfect for diving deep into one community.</li>
              <li>Scroll through the latest submissions on the main page to see what people are sharing in real time.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Contributing</h2>
          <div className="max-w-none">
            <ol className="space-y-2 text-card-foreground/80 list-decimal list-inside">
              <li><strong className="text-card-foreground">Sign in</strong> with your Google account</li>
              <li><strong className="text-card-foreground">Submit a phrase</strong> using the &ldquo;Submit&rdquo; button in the navigation</li>
              <li><strong className="text-card-foreground">Add definitions</strong> to existing phrases</li>
              <li><strong className="text-card-foreground">Provide examples</strong> to help others understand usage</li>
              <li><strong className="text-card-foreground">Vote</strong> on definitions and examples to help the best content rise to the top</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Community Guidelines</h2>
          <div className="max-w-none">
            <ul className="space-y-2 text-card-foreground/80">
              <li>Keep definitions clear, accurate, and culturally sensitive</li>
              <li>Provide context and examples whenever possible to help users understand nuance</li>
              <li>Be respectful of all cultures and languages</li>
              <li>Flag content that's harmful, incorrect, or violates community standards to help maintain quality</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}