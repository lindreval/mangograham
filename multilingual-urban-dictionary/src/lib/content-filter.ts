import Filter from "bad-words";

// Initialize profanity filter
const filter = new Filter();

// Additional custom words specific to AdSense policy violations
const customProhibitedWords = [
  // Drug-related terms (expanded for urban slang)
  "cocaine", "heroin", "meth", "crack", "acid", "lsd", "mdma", "ecstasy",
  "weed", "marijuana", "cannabis", "420", "blunt", "joint", "bong", "dope", "pot", "hash", "molly", 
  "shrooms", "lean", "xanax", "adderall", "pills", "dealer", "plug", "trap",
  // Violence-related (expanded)
  "kill", "murder", "rape", "assault", "bomb", "terrorist", "suicide", "shoot", "stab", "beat", "fight",
  "gang", "blood", "crip", "hood", "thug", "weapon", "gun", "knife", "blade",
  // Adult content indicators (expanded for slang)
  "porn", "xxx", "nsfw", "onlyfans", "camgirl", "escort", "hookup", "smash", "dtf", "netflix and chill",
  "booty call", "thot", "simp", "daddy", "mommy", "sexy", "horny", "wet",
  // Hate speech indicators (expanded)
  "nazi", "kkk", "supremacist", "racist", "bigot", "slur", "hate", "discrimination",
  // Gambling/illegal activities
  "bet", "gamble", "casino", "poker", "blackjack", "slots", "lottery", "scam", "fraud", "steal",
  // Self-harm indicators common in slang
  "cutting", "selfharm", "kms", "kys", "die", "overdose", "od"
];

// Add custom words to filter
customProhibitedWords.forEach(word => filter.addWords(word));

// PII Detection Patterns (Enhanced)
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phone: /(\+?\d{1,4}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s.-]?\d{4}[\s.-]?\d{4}[\s.-]?\d{4}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  // Detect attempts to share personal addresses
  address: /\b\d+\s+[A-Za-z\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
  // Social media handles and usernames
  socialHandle: /[@#]\w+/g,
  // Specific location data that could be PII
  specificLocation: /\b\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Apartment|Apt|Unit|Suite)\s*\#?\s*\d*\b/gi,
  // School names, workplace specifics
  personalLocation: /\b(my\s+school|my\s+work|my\s+job|where\s+I\s+live|my\s+address|my\s+house)\b/gi,
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

  // Check for prohibited content indicators (enhanced for urban slang)
  const lowerText = text.toLowerCase();
  const prohibitedIndicators = [
    // Drug-related patterns
    { pattern: /\b(buy|sell|purchase|cop|score)\s+(drugs?|narcotics?|pills?|weed|dope|molly)\b/i, issue: "drug sales" },
    { pattern: /\b(dealer|plug|trap|serving|pushing)\b/i, issue: "drug dealing references" },
    { pattern: /\b(getting\s+high|smoke\s+up|roll\s+up|blaze)\b/i, issue: "drug use promotion" },
    
    // Adult content patterns
    { pattern: /\b(escort|prostitut|sex\s+work|sugar\s+baby|onlyfans)\b/i, issue: "adult services" },
    { pattern: /\b(send\s+nudes|dick\s+pic|booty\s+pic|sexting)\b/i, issue: "sexual content" },
    { pattern: /\b(netflix\s+and\s+chill|dtf|fwb|booty\s+call)\b/i, issue: "sexual solicitation" },
    
    // Violence patterns
    { pattern: /\b(shoot\s+up|beat\s+down|jump|fight\s+me)\b/i, issue: "violence promotion" },
    { pattern: /\b(gang\s+up|crew|set|hood\s+life)\b/i, issue: "gang activity" },
    { pattern: /\b(death\s+threat|kill\s+you|hurt\s+you|end\s+you)\b/i, issue: "threats of violence" },
    
    // Illegal activities
    { pattern: /\b(hack|crack|pirat|torrent|keygen|stolen)\b/i, issue: "illegal software/activities" },
    { pattern: /\b(scam|fraud|steal|rob|finesse)\b/i, issue: "illegal financial activity" },
    { pattern: /\b(fake\s+id|underage\s+drinking|buy\s+alcohol)\b/i, issue: "underage illegal activity" },
    
    // Gambling
    { pattern: /\b(casino|gambling|betting|poker)\s+(online|site|app)\b/i, issue: "gambling promotion" },
    { pattern: /\b(sports\s+betting|crypto\s+gambling|slot\s+machine)\b/i, issue: "gambling content" },
    
    // Self-harm
    { pattern: /\b(kill\s+myself|end\s+it\s+all|suicide|self\s+harm)\b/i, issue: "self-harm content" },
    { pattern: /\b(cutting|overdose|kms|kys)\b/i, issue: "self-harm references" },
    
    // Hate speech patterns
    { pattern: /\b(racist|bigot|hate\s+speech|discrimination)\b/i, issue: "hate speech" },
    { pattern: /\b(white\s+power|black\s+power|supremacist)\b/i, issue: "supremacist content" }
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
  cleaned = cleaned.replace(PII_PATTERNS.socialHandle, "[social handle removed]");
  cleaned = cleaned.replace(PII_PATTERNS.specificLocation, "[specific location removed]");
  cleaned = cleaned.replace(PII_PATTERNS.personalLocation, "[personal location removed]");
  
  return cleaned;
}

/**
 * Special function for cleaning region/location data specifically
 */
export function stripLocationPII(location: string): string {
  let cleaned = location;
  
  // Remove specific addresses but keep general city/region names
  cleaned = cleaned.replace(PII_PATTERNS.address, "");
  cleaned = cleaned.replace(PII_PATTERNS.specificLocation, "");
  cleaned = cleaned.replace(PII_PATTERNS.personalLocation, "");
  
  // Remove anything with house numbers
  cleaned = cleaned.replace(/\b\d+\s+[A-Za-z\s]+/gi, "");
  
  // Clean up any resulting double spaces or commas
  cleaned = cleaned.replace(/\s+/g, " ").replace(/,\s*,/g, ",").trim();
  
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