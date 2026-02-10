// src/components/layout/Footer.tsx
// Application footer
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome, no hex)

import Link from 'next/link';
import AppIcon from "../ui/AppIcon";

export default function Footer() {
  return (
    <footer className="bg-neutral-700 text-neutral-300 py-12 mt-16">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <AppIcon
                  name="graduation-cap"
                  className="w-4 h-4 text-white"
                  aria-hidden
                />
              </div>
              <span className="text-xl font-bold text-white">
                Doorslam
              </span>
            </div>
            <p className="text-neutral-400 text-sm">
              Helping students achieve their best in GCSE and IGCSE exams.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help"
                  className="hover:text-white transition-colors"
                >
                  Help centre
                </Link>
              </li>
              <li>
                <Link href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/community"
                  className="hover:text-white transition-colors"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-600 mt-8 pt-8 text-center text-neutral-400 text-sm">
          <p>&copy; 2026 Doorslam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
