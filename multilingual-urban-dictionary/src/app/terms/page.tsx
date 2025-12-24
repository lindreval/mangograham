import type { Metadata } from "next";
import Link from "next/link";

// Static page - never needs revalidation
export const revalidate = false;

export const metadata: Metadata = {
  title: "Terms of Service - Yung Salita",
  description: "Terms of Service for yungsalita.com - A multilingual urban dictionary platform.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="prose prose-gray max-w-none">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <p className="text-sm text-muted-foreground mb-8">
          <strong>Effective Date:</strong> July 2025
        </p>

        <p className="mb-6">
          Welcome to <strong>yungsalita.com</strong> (&ldquo;Site&rdquo;), a platform operated by Valsote Productions, LLC (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). 
          By accessing or using this website, you agree to the following Terms of Service (&ldquo;Terms&rdquo;). If you do not agree 
          with any of these terms, please do not use the site.
        </p>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Eligibility</h2>
          <p>
            You must be at least <strong>16 years old</strong> to use yungsalita.com. By using the site, you represent 
            that you meet this requirement.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
          <p>
            To contribute content (e.g., definitions, phrases, examples), you must create an account and sign in. You are 
            responsible for all activity under your account and agree to notify us of any unauthorized use.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User-Generated Content</h2>
          <p className="mb-4">
            You retain ownership of any content you submit but grant us a <strong>non-exclusive, worldwide, royalty-free, 
            perpetual license</strong> to use, display, distribute, modify, and sublicense your content.
          </p>
          
          <p className="mb-4">You agree not to post content that:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Is offensive, defamatory, or unlawful</li>
            <li>Infringes on copyrights or intellectual property rights</li>
            <li>Violates privacy or contains personal data of others</li>
            <li>Uses automated systems (bots) to post content</li>
          </ul>
          
          <p>
            We reserve the right to remove or refuse any content at our sole discretion.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Content Moderation</h2>
          <p className="mb-4">
            We strive to maintain a respectful and educational environment. We may remove or flag content that we find 
            inappropriate or in violation of these Terms. However, we are not obligated to do so.
          </p>
          <p>
            To report abuse or offensive material, email us at{" "}
            <a href="mailto:lourdrick@yungsalita.com" className="text-blue-600 hover:underline">
              lourdrick@yungsalita.com
            </a>{" "}
            or{" "}
            <a href="mailto:lindell@yungsalita.com" className="text-blue-600 hover:underline">
              lindell@yungsalita.com
            </a>.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <p>
            All content, trademarks, design elements, and code created by or for yungsalita.com are the property of 
            Yung Salita, LLC. You may not use or copy any part of the Site without our permission.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. No Warranties</h2>
          <p>
            The Site is provided <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong> with no warranties, express or implied. 
            We do not guarantee that the Site will always be available or error-free.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Valsote Productions, LLC is not liable for any damages arising from your 
            use of the Site, including but not limited to loss of data, profits, or reputation.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access at any time, with or without cause or notice.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Privacy Policy</h2>
          <p>
            Use of the Site is also governed by our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>, which outlines how we handle your data.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Modifications to Terms</h2>
          <p>
            We may revise these Terms from time to time. We&apos;ll notify users of any material changes via the website. 
            Your continued use of the Site after updates constitutes acceptance.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the <strong>State of California</strong>, United States. All disputes 
            shall be resolved in the courts of <strong>San Mateo County, CA</strong>.
          </p>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p className="mb-4">For questions or feedback, contact us at:</p>
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

        <hr className="my-8" />

        <div className="text-center py-6">
          <p className="text-muted-foreground">
            Thank you for using <strong>yungsalita.com</strong>—a space to share and celebrate multilingual expression.
          </p>
        </div>
      </div>
    </main>
  );
}