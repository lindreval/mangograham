import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Yung Salita and our mission to preserve and share slang across languages",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 mt-8 rounded-lg border-4 bg-card text-foreground shadow-elevation-medium">
      <h1 className="text-3xl font-bold mb-6">About Yung Salita</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Mission</h2>
          <div className="max-w-none">
            <p className="text-card-foreground/80">
              Yung Salita is a global, multilingual urban dictionary dedicated to celebrating and preserving the slang, 
              expressions, and informal language from cultures around the world. From regional idioms to everyday phrases,
              Yung Salita is a domain for communities to connect and learn. We believe that language is living, evolving, 
              and deeply connected to culture and identity. Our goal is to document the real words people use in real life,
              in every language.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">What Makes Us Different</h2>
          <div className="max-w-none">
            <ul className="space-y-2 text-card-foreground/80">
              <li><strong className="text-card-foreground">Multilingual Focus:</strong> We support multiple languages and encourage cross-cultural understanding</li>
              <li><strong className="text-card-foreground">Community-Driven:</strong> Our content is created and curated by speakers of each language</li>
              <li><strong className="text-card-foreground">Cultural Context:</strong> We emphasize understanding the cultural background of expressions</li>
              <li><strong className="text-card-foreground">Quality Control:</strong> Community voting and moderation help maintain accurate definitions</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Why &ldquo;Yung Salita&rdquo;?</h2>
          <div className="max-w-none">
            <p className="text-card-foreground/80">
              &ldquo;Yung Salita&rdquo; comes from Tagalog, meaning &ldquo;those words&rdquo; or &ldquo;the words.&rdquo; 
              It captures what we're trying to accomplish: preserving and shining a spotlight on the words that matter to 
              communities, language that connects and tells stories. These are the words that don't make it into textbooks,
              but live in group chats, music, jokes, and everyday conversation. All around the world the informal, creative, 
              and expressive language brings people together.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Join Our Community</h2>
          <div className="max-w-none">
            <p className="text-card-foreground/80">
              Whether you&rsquo;re a native speaker wanting to share your language&rsquo;s unique expressions, 
              a language learner curious about informal speech, or someone interested in cultural 
              exchange, we welcome you to contribute and learn with us.
              Yung Salita is your space.
              We invite you to submit, define, translate and connect to help us build the most authentic, diverse,
              and culturally rich informal dictionary on the internet.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}