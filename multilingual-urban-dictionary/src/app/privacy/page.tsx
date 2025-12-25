import type { Metadata } from "next";
import { Shield, Eye, Database, Lock, Mail } from "lucide-react";
import { PageHeader, PageBadge } from "@/components/ui/page-header";

// Static page - never needs revalidation
export const revalidate = false;

export const metadata: Metadata = {
  title: "Privacy Policy - Yung Salita",
  description: "Privacy Policy for yungsalita.com - How we handle your data.",
};

function SectionDivider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-8" />
  );
}

interface LegalSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  sectionNumber: number;
}

function LegalSection({ icon, title, children, sectionNumber }: LegalSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
              Section {sectionNumber}
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-foreground border-l-4 border-primary pl-4">
            {title}
          </h2>
          <div className="text-muted-foreground leading-relaxed pl-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 animate-page-enter">
      <PageHeader
        title="Privacy Policy"
        subtitle="How we handle your data"
        badge={
          <PageBadge>
            <Shield className="w-3 h-3 mr-1.5" />
            Legal
          </PageBadge>
        }
      />

      {/* Main Card Container */}
      <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden">
        {/* Gradient Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />

        <div className="p-6 md:p-8">
          {/* Effective Date Badge */}
          <div className="mb-8">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/5 text-primary border border-primary/20">
              Effective Date: July 2025
            </span>
          </div>

          {/* Introduction */}
          <p className="mb-8 text-muted-foreground leading-relaxed">
            This Privacy Policy describes how Valsote Productions, LLC (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects, uses, and protects
            your information when you use <strong className="text-foreground">yungsalita.com</strong> (&ldquo;Site&rdquo;).
          </p>

          <SectionDivider />

          <LegalSection icon={<Database className="w-5 h-5" />} title="Information We Collect" sectionNumber={1}>
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
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Eye className="w-5 h-5" />} title="How We Use Your Information" sectionNumber={2}>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the Site</li>
              <li>Process and display your content submissions</li>
              <li>Send you important updates about the service</li>
              <li>Respond to your comments and questions</li>
              <li>Improve our services and user experience</li>
            </ul>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Shield className="w-5 h-5" />} title="Information Sharing" sectionNumber={3}>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
              except as described in this Privacy Policy or as required by law.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Lock className="w-5 h-5" />} title="Data Security" sectionNumber={4}>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Mail className="w-5 h-5" />} title="Contact Us" sectionNumber={5}>
            <p className="mb-4">If you have questions about this Privacy Policy, contact us at:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a href="mailto:lourdrick@yungsalita.com" className="text-primary hover:underline font-medium">
                  lourdrick@yungsalita.com
                </a>
              </li>
              <li>
                <a href="mailto:lindell@yungsalita.com" className="text-primary hover:underline font-medium">
                  lindell@yungsalita.com
                </a>
              </li>
            </ul>
          </LegalSection>
        </div>
      </div>
    </main>
  );
}
