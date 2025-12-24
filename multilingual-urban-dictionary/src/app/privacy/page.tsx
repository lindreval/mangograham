import type { Metadata } from "next";

// Static page - never needs revalidation
export const revalidate = false;

export const metadata: Metadata = {
  title: "Privacy Policy - Yung Salita",
  description: "Privacy Policy for yungsalita.com - How we handle your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="prose prose-gray max-w-none">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <p className="text-sm text-muted-foreground mb-8">
          <strong>Effective Date:</strong> July 2025
        </p>

        <p className="mb-6">
          This Privacy Policy describes how Valsote Productions, LLC (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects, uses, and protects 
          your information when you use <strong>yungsalita.com</strong> (&ldquo;Site&rdquo;).
        </p>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">We collect information you provide directly to us, such as when you:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Create an account and sign in via Google OAuth</li>
            <li>Submit definitions, phrases, or examples</li>
            <li>Vote on content</li>
            <li>Contact us for support</li>
          </ul>
          <p>
            This may include your name, email address, and any content you submit to the platform.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain the Site</li>
            <li>Process and display your content submissions</li>
            <li>Send you important updates about the service</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our services and user experience</li>
          </ul>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
            except as described in this Privacy Policy or as required by law.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of 
            transmission over the internet is 100% secure.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">If you have questions about this Privacy Policy, contact us at:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <a href="mailto:lourdrick@yungsalita.com" className="text-blue-600 hover:underline">
                lourdrick@yungsalita.com
              </a>
            </li>
            <li>
              <a href="mailto:lindell@yungsalita.com" className="text-blue-600 hover:underline">
                lindell@yungsalita.com
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}