import type { Metadata } from "next";
import { Shield, AlertTriangle, Ban, CheckCircle2, Info, UserX } from "lucide-react";
import { PageHeader, PageBadge } from "@/components/ui/page-header";
import Link from "next/link";

// Static page - never needs revalidation
export const revalidate = false;

export const metadata: Metadata = {
  title: "Content Guidelines - Yung Salita",
  description: "Community guidelines and content policies for yungsalita.com",
};

interface PolicySectionProps {
  icon: React.ReactNode;
  title: string;
  variant: "prohibited" | "allowed" | "warning";
  children: React.ReactNode;
}

function PolicySection({ icon, title, variant, children }: PolicySectionProps) {
  const variantStyles = {
    prohibited: "border-destructive/30 bg-destructive/5",
    allowed: "border-green-500/30 bg-green-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
  };

  const iconStyles = {
    prohibited: "text-destructive",
    allowed: "text-green-600",
    warning: "text-yellow-600",
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${variantStyles[variant]} mb-6`}>
      <div className="flex items-center gap-3 mb-4">
        <span className={iconStyles[variant]}>{icon}</span>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </div>
  );
}

export default function ContentGuidelinesPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 animate-page-enter">
      <PageHeader
        title="Content Guidelines"
        subtitle="Help us maintain a safe and valuable community"
        badge={
          <PageBadge>
            <Shield className="w-3 h-3 mr-1.5" />
            Community Policy
          </PageBadge>
        }
      />

      {/* Important Notice */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Important Notice</h3>
            <p className="text-muted-foreground">
              These guidelines ensure compliance with{" "}
              <a 
                href="https://support.google.com/adsense/answer/48182" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Google AdSense policies
              </a>{" "}
              and maintain a respectful environment. Violations may result in content removal and account suspension.
            </p>
          </div>
        </div>
      </div>

      {/* Prohibited Content */}
      <PolicySection
        icon={<Ban className="w-6 h-6" />}
        title="Strictly Prohibited Content"
        variant="prohibited"
      >
        <p className="mb-4">The following content is absolutely forbidden and will result in immediate removal:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Adult & Sexual Content:</strong> Pornography, sexual content, escort services, or sexually explicit material
          </li>
          <li>
            <strong>Violence & Gore:</strong> Graphic violence, threats, self-harm, or content that promotes dangerous activities
          </li>
          <li>
            <strong>Hate Speech:</strong> Content that promotes discrimination based on race, ethnicity, religion, disability, age, nationality, veteran status, sexual orientation, gender identity, or any other characteristic
          </li>
          <li>
            <strong>Illegal Content:</strong> Content promoting illegal drugs, weapons, hacking, piracy, or any illegal activities
          </li>
          <li>
            <strong>Personal Information (PII):</strong> Phone numbers, email addresses, home addresses, social security numbers, credit card information, or any private personal data
          </li>
          <li>
            <strong>Harassment & Bullying:</strong> Content targeting individuals with intent to harm, embarrass, or intimidate
          </li>
          <li>
            <strong>Copyright Infringement:</strong> Content that violates intellectual property rights
          </li>
          <li>
            <strong>Spam & Deceptive Practices:</strong> Misleading content, scams, or repetitive promotional material
          </li>
          <li>
            <strong>Malware & Phishing:</strong> Links or content designed to harm users or steal information
          </li>
        </ul>
      </PolicySection>

      {/* Warning Content */}
      <PolicySection
        icon={<AlertTriangle className="w-6 h-6" />}
        title="Content Requiring Review"
        variant="warning"
      >
        <p className="mb-4">The following content may be subject to additional review or restrictions:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Profanity:</strong> While some mild language may be acceptable in context, excessive profanity will be filtered
          </li>
          <li>
            <strong>Controversial Topics:</strong> Political content, religious discussions, or sensitive social issues must remain respectful
          </li>
          <li>
            <strong>Medical/Health Claims:</strong> Unverified health advice or medical claims
          </li>
          <li>
            <strong>Financial Advice:</strong> Investment tips or get-rich-quick schemes
          </li>
          <li>
            <strong>Alcohol & Tobacco:</strong> References must be educational, not promotional
          </li>
        </ul>
      </PolicySection>

      {/* Allowed Content */}
      <PolicySection
        icon={<CheckCircle2 className="w-6 h-6" />}
        title="Encouraged Content"
        variant="allowed"
      >
        <p className="mb-4">We welcome and encourage:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Educational Slang Definitions:</strong> Authentic explanations of regional expressions and cultural language
          </li>
          <li>
            <strong>Cultural Context:</strong> Historical background and cultural significance of phrases
          </li>
          <li>
            <strong>Language Learning:</strong> Content that helps people understand informal language appropriately
          </li>
          <li>
            <strong>Respectful Examples:</strong> Usage examples that demonstrate meaning without offensive content
          </li>
          <li>
            <strong>Creative Expression:</strong> Original, thoughtful contributions to language documentation
          </li>
          <li>
            <strong>Cross-Cultural Exchange:</strong> Content promoting understanding between different language communities
          </li>
        </ul>
      </PolicySection>

      {/* Enforcement */}
      <PolicySection
        icon={<UserX className="w-6 h-6" />}
        title="Enforcement & Consequences"
        variant="prohibited"
      >
        <p className="mb-4">Violations of these guidelines will result in:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>First Offense:</strong> Content removal and warning
          </li>
          <li>
            <strong>Second Offense:</strong> Temporary account suspension (7 days)
          </li>
          <li>
            <strong>Third Offense:</strong> Permanent account ban
          </li>
          <li>
            <strong>Severe Violations:</strong> Immediate permanent ban without warning (illegal content, PII exposure, hate speech)
          </li>
        </ul>
      </PolicySection>

      {/* Reporting Section */}
      <div className="rounded-xl border-2 border-primary/20 bg-card shadow-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />
        <div className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Report Violations</h2>
          <p className="text-muted-foreground mb-4">
            Help us maintain quality by reporting content that violates these guidelines. Use the "Report" button on any content, or contact us directly:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              Email:{" "}
              <a href="mailto:content@yungsalita.com" className="text-primary hover:underline font-medium">
                content@yungsalita.com
              </a>
            </li>
            <li>
              Include the URL or content ID when reporting
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          See also:{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          •{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}