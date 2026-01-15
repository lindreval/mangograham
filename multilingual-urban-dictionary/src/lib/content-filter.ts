import Filter from "bad-words";

// Initialize profanity filter
const filter = new Filter();

// Additional custom words specific to AdSense policy violations
const customProhibitedWords = [
  // Drug-related terms
  "cocaine", "heroin", "meth", "crack", "acid", "lsd", "mdma", "ecstasy",
  "weed", "marijuana", "cannabis", "420", "blunt", "joint", "bong",
  // Violence-related
  "kill", "murder", "rape", "assault", "bomb", "terrorist", "suicide",
  // Adult content indicators
  "porn", "xxx", "nsfw", "onlyfans", "camgirl", "escort",
  // Hate speech indicators
  "nazi", "kkk", "supremacist",
];

// Add custom words to filter
customProhibitedWords.forEach(word => filter.addWords(word));

// PII Detection Patterns
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phone: /(\+?\d{1,4}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s.-]?\d{4}[\s.-]?\d{4}[\s.-]?\d{4}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  // Detect attempts to share personal addresses
  address: /\b\d+\s+[A-Za-z\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
};

export interface ContentFilterResult {
  isClean: boolean;
  issues: string[];
  hasProfanity: boolean;
  hasPII: boolean;
  hasProhibitedContent: boolean;
  filteredText?: string;
}

/**
 * Comprehensive content filter for AdSense compliance
 */
export function filterContent(text: string): ContentFilterResult {
  const issues: string[] = [];
  let hasProfanity = false;
  let hasPII = false;
  let hasProhibitedContent = false;

  // Check for profanity
  try {
    if (filter.isProfane(text)) {
      hasProfanity = true;
      issues.push("Content contains inappropriate language");
    }
  } catch (error) {
    console.error("Profanity filter error:", error);
  }

  // Check for PII
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(text)) {
      hasPII = true;
      issues.push(`Content may contain personal information (${type})`);
    }
  }

  // Check for prohibited content indicators
  const lowerText = text.toLowerCase();
  const prohibitedIndicators = [
    { pattern: /\b(buy|sell|purchase)\s+(drugs?|narcotics?|pills?)\b/i, issue: "drug sales" },
    { pattern: /\b(escort|prostitut|sex\s+work)/i, issue: "adult services" },
    { pattern: /\b(hack|crack|pirat|torrent|keygen)\b/i, issue: "illegal software" },
    { pattern: /\b(casino|gambling|betting|poker)\s+(online|site|app)/i, issue: "gambling promotion" },
    { pattern: /\b(death\s+threat|kill\s+you|hurt\s+you)/i, issue: "threats of violence" },
  ];

  for (const { pattern, issue } of prohibitedIndicators) {
    if (pattern.test(lowerText)) {
      hasProhibitedContent = true;
      issues.push(`Content contains prohibited content: ${issue}`);
    }
  }

  // Clean the text (optional - for display purposes)
  const filteredText = filter.clean(text);

  return {
    isClean: !hasProfanity && !hasPII && !hasProhibitedContent,
    issues,
    hasProfanity,
    hasPII,
    hasProhibitedContent,
    filteredText: filteredText !== text ? filteredText : undefined,
  };
}

/**
 * Strip PII from text (for public display)
 */
export function stripPII(text: string): string {
  let cleaned = text;
  
  // Replace PII with generic placeholders
  cleaned = cleaned.replace(PII_PATTERNS.email, "[email removed]");
  cleaned = cleaned.replace(PII_PATTERNS.phone, "[phone removed]");
  cleaned = cleaned.replace(PII_PATTERNS.ssn, "[SSN removed]");
  cleaned = cleaned.replace(PII_PATTERNS.creditCard, "[card removed]");
  cleaned = cleaned.replace(PII_PATTERNS.ipAddress, "[IP removed]");
  cleaned = cleaned.replace(PII_PATTERNS.address, "[address removed]");
  
  return cleaned;
}

/**
 * Validate if content is appropriate for public display
 */
export function isContentAppropriate(text: string): boolean {
  const result = filterContent(text);
  return result.isClean;
}

/**
 * Get severity level of content issues
 */
export function getContentSeverity(result: ContentFilterResult): "low" | "medium" | "high" | "critical" {
  if (result.hasPII) return "critical";
  if (result.hasProhibitedContent) return "high";
  if (result.hasProfanity) return "medium";
  return "low";
}