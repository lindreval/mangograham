"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, WifiOff, DatabaseZap } from "lucide-react";
import Link from "next/link";

// Error type detection and contextual messages
function getErrorContext(error: Error) {
  const message = error.message?.toLowerCase() || "";

  // Network/connection errors
  if (message.includes("fetch") || message.includes("network") || message.includes("connection")) {
    return {
      icon: WifiOff,
      title: "Connection Issue",
      description: "Unable to reach the server. Please check your internet connection and try again.",
      suggestions: [
        "Check your internet connection",
        "Try refreshing the page",
        "If the issue persists, our server might be temporarily down"
      ]
    };
  }

  // Database errors
  if (message.includes("database") || message.includes("prisma") || message.includes("query")) {
    return {
      icon: DatabaseZap,
      title: "Data Loading Error",
      description: "We're having trouble accessing the data. This is temporary.",
      suggestions: [
        "Try refreshing the page",
        "Go back to the home page",
        "If this keeps happening, please let us know via feedback"
      ]
    };
  }

  // 404-like errors
  if (message.includes("not found") || message.includes("404")) {
    return {
      icon: AlertCircle,
      title: "Page Not Found",
      description: "The content you're looking for doesn't exist or has been moved.",
      suggestions: [
        "Check the URL for typos",
        "Go back to the home page",
        "Use search to find what you're looking for"
      ]
    };
  }

  // Authentication errors
  if (message.includes("auth") || message.includes("unauthorized") || message.includes("permission")) {
    return {
      icon: AlertCircle,
      title: "Authentication Required",
      description: "You need to be signed in to access this content.",
      suggestions: [
        "Sign in to your account",
        "If you just signed in, try refreshing",
        "Check if you have the necessary permissions"
      ]
    };
  }

  // Default error
  return {
    icon: AlertCircle,
    title: "Something Went Wrong",
    description: "We encountered an unexpected error. Don't worry, we're on it!",
    suggestions: [
      "Try refreshing the page",
      "Go back to the previous page",
      "If this keeps happening, please report it via feedback"
    ]
  };
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const errorContext = useMemo(() => getErrorContext(error), [error]);
  const Icon = errorContext.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-page-enter">
      <div className="max-w-lg w-full space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-destructive" />
        </div>

        {/* Error Message */}
        <div className="space-y-3 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {errorContext.title}
          </h1>
          <p className="text-base text-muted-foreground">
            {errorContext.description}
          </p>

          {/* Contextual Suggestions */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-left">
            <p className="text-sm font-medium text-foreground mb-2">
              Try these steps:
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {errorContext.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error ID */}
          {error.digest && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-muted-foreground/60 cursor-pointer hover:text-muted-foreground transition-colors">
                Technical details
              </summary>
              <p className="mt-2 text-xs text-muted-foreground/60 font-mono bg-muted/30 p-3 rounded border border-border">
                Error ID: {error.digest}
                {error.message && (
                  <><br />Message: {error.message}</>
                )}
              </p>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="transition-all duration-[var(--duration-hover)] ease-[var(--ease-smooth)]"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Feedback Link */}
        <p className="text-center text-xs text-muted-foreground">
          Still having issues?{" "}
          <Link
            href="/feedback"
            className="text-primary hover:underline font-medium"
          >
            Send us feedback
          </Link>
        </p>
      </div>
    </div>
  );
}
