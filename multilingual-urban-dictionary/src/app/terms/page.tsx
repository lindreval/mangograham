import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  User,
  Edit,
  Flag,
  Copyright,
  Scale,
  Ban,
  Mail,
  Shield,
  AlertTriangle,
  Gavel,
  RefreshCw
} from "lucide-react";
import { PageHeader, PageBadge } from "@/components/ui/page-header";

// Static page - never needs revalidation
export const revalidate = false;

export const metadata: Metadata = {
  title: "Terms of Service - Yung Salita",
  description: "Terms of Service for yungsalita.com - A multilingual urban dictionary platform.",
};

function SectionDivider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-8" />
  );
}

interface LegalSectionProps {
  icon: React.ReactNode;
  title: string;
  sectionNumber: number;
  children: React.ReactNode;
}

function LegalSection({ icon, title, sectionNumber, children }: LegalSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg">
            {sectionNumber}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-primary">{icon}</span>
            <h2 className="text-xl font-semibold text-foreground">
              {title}
            </h2>
          </div>
          <div className="text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 animate-page-enter">
      <PageHeader
        title="Terms of Service"
        subtitle="Usage guidelines for Yung Salita"
        badge={
          <PageBadge>
            <FileText className="w-3 h-3 mr-1.5" />
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
            Welcome to <strong className="text-foreground">yungsalita.com</strong> (&ldquo;Site&rdquo;), a platform operated by Valsote Productions, LLC (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;).
            By accessing or using this website, you agree to the following Terms of Service (&ldquo;Terms&rdquo;). If you do not agree
            with any of these terms, please do not use the site.
          </p>

          <SectionDivider />

          <LegalSection icon={<User className="w-5 h-5" />} title="Eligibility" sectionNumber={1}>
            <p>
              You must be at least <strong className="text-foreground">16 years old</strong> to use yungsalita.com. By using the site, you represent
              that you meet this requirement.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<User className="w-5 h-5" />} title="User Accounts" sectionNumber={2}>
            <p>
              To contribute content (e.g., definitions, phrases, examples), you must create an account and sign in. You are
              responsible for all activity under your account and agree to notify us of any unauthorized use.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Edit className="w-5 h-5" />} title="User-Generated Content" sectionNumber={3}>
            <p className="mb-4">
              You retain ownership of any content you submit but grant us a <strong className="text-foreground">non-exclusive, worldwide, royalty-free,
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
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Flag className="w-5 h-5" />} title="Content Moderation" sectionNumber={4}>
            <p className="mb-4">
              We strive to maintain a respectful and educational environment. We may remove or flag content that we find
              inappropriate or in violation of these Terms. However, we are not obligated to do so.
            </p>
            <p>
              To report abuse or offensive material, email us at{" "}
              <a href="mailto:lourdrick@yungsalita.com" className="text-primary hover:underline font-medium">
                lourdrick@yungsalita.com
              </a>{" "}
              or{" "}
              <a href="mailto:lindell@yungsalita.com" className="text-primary hover:underline font-medium">
                lindell@yungsalita.com
              </a>.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Copyright className="w-5 h-5" />} title="Intellectual Property" sectionNumber={5}>
            <p>
              All content, trademarks, design elements, and code created by or for yungsalita.com are the property of
              Yung Salita, LLC. You may not use or copy any part of the Site without our permission.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<AlertTriangle className="w-5 h-5" />} title="No Warranties" sectionNumber={6}>
            <p>
              The Site is provided <strong className="text-foreground">&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong> with no warranties, express or implied.
              We do not guarantee that the Site will always be available or error-free.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Scale className="w-5 h-5" />} title="Limitation of Liability" sectionNumber={7}>
            <p>
              To the fullest extent permitted by law, Valsote Productions, LLC is not liable for any damages arising from your
              use of the Site, including but not limited to loss of data, profits, or reputation.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Ban className="w-5 h-5" />} title="Termination" sectionNumber={8}>
            <p>
              We reserve the right to suspend or terminate your access at any time, with or without cause or notice.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Shield className="w-5 h-5" />} title="Privacy Policy" sectionNumber={9}>
            <p>
              Use of the Site is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>, which outlines how we handle your data.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<RefreshCw className="w-5 h-5" />} title="Modifications to Terms" sectionNumber={10}>
            <p>
              We may revise these Terms from time to time. We&apos;ll notify users of any material changes via the website.
              Your continued use of the Site after updates constitutes acceptance.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Gavel className="w-5 h-5" />} title="Governing Law" sectionNumber={11}>
            <p>
              These Terms are governed by the laws of the <strong className="text-foreground">State of California</strong>, United States. All disputes
              shall be resolved in the courts of <strong className="text-foreground">San Mateo County, CA</strong>.
            </p>
          </LegalSection>

          <SectionDivider />

          <LegalSection icon={<Mail className="w-5 h-5" />} title="Contact Us" sectionNumber={12}>
            <p className="mb-4">For questions or feedback, contact us at:</p>
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

          <SectionDivider />

          {/* Closing Section */}
          <div className="relative mt-12 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
            <div className="relative">
              <span className="bg-card px-4">
                <FileText className="w-5 h-5 text-primary/40 inline-block" />
              </span>
            </div>
          </div>

          <div className="text-center py-8 mt-4">
            <p className="text-muted-foreground">
              Thank you for using <strong className="text-foreground">yungsalita.com</strong>—a space to share and celebrate multilingual expression.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
