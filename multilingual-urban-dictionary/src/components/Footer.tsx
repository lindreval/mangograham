"use client";

import Link from "next/link";
import { Globe, MessageSquare, BookOpen, FileText, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t-2 border-primary/20 mt-auto">
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/60" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand/Logo Section */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              Yung Salita
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              A multilingual urban dictionary - crowdsourced slang across languages.
              Discover, learn, and contribute to the world of words.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <BookOpen className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <FileText className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/languages"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <Globe className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  Languages
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to-use"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <BookOpen className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  How to Use
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <MessageSquare className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <Shield className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <FileText className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join our growing community of language enthusiasts. Share your knowledge,
              learn new slang, and help preserve linguistic diversity.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-primary/10">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Yung Salita. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
