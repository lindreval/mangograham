import type { Metadata } from "next";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback & Feature Requests",
  description: "Share your feedback and request new features for Yung Salita",
};

export default function FeedbackPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 mt-8">
      <div className="rounded-lg border-4 bg-card text-foreground shadow-elevation-medium p-6">
        <h1 className="text-3xl font-bold mb-6">Feedback & Feature Requests</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">We Value Your Input</h2>
            <div className="max-w-none">
              <p className="text-card-foreground/80">
                Your feedback helps us improve Yung Salita and make it more useful for everyone. 
                Whether you&rsquo;ve found a bug, have an idea for a new feature, or want to suggest 
                improvements, we&rsquo;d love to hear from you.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Types of Feedback We&rsquo;re Looking For</h2>
            <div className="max-w-none">
              <ul className="space-y-2 text-card-foreground/80">
                <li><strong className="text-card-foreground">Bug Reports:</strong> Found something that&rsquo;s not working as expected?</li>
                <li><strong className="text-card-foreground">Feature Requests:</strong> Have an idea for new functionality?</li>
                <li><strong className="text-card-foreground">User Experience:</strong> Is something confusing or hard to use?</li>
                <li><strong className="text-card-foreground">Content Quality:</strong> Suggestions for improving definitions and examples</li>
                <li><strong className="text-card-foreground">Language Support:</strong> Want to see support for a new language?</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Upcoming Features</h2>
            <div className="max-w-none">
              <p className="text-card-foreground/80 mb-4">Here are some features we&rsquo;re considering based on community feedback:</p>
              <ul className="space-y-2 text-card-foreground/80">
                <li>Advanced search filters</li>
                <li>Mobile app</li>
                <li>Audio pronunciation guides</li>
                <li>Community forums</li>
                <li>Translation tools</li>
                <li>Gamification and achievements</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Submit Your Feedback</h2>
            <div className="max-w-none">
              <p className="text-card-foreground/80 mb-4">
                Use the form below to share your thoughts, report issues, or suggest new features.
              </p>
              <FeedbackForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}