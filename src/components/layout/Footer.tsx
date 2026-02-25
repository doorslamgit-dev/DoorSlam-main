// src/components/layout/Footer.tsx
// Application footer
// FEAT-010: AppIcon (lucide-react) + theme-ready classes (no FontAwesome, no hex)

import { Link } from 'react-router-dom';
import BrandWordmark from '../ui/BrandWordmark';

export default function Footer() {
  return (
    <footer className="bg-foreground text-muted-foreground py-12 mt-16">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BrandWordmark size="md" className="text-background" />
            </div>
            <p className="text-muted-foreground text-sm">
              Helping students achieve their best in GCSE and IGCSE exams.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-background mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/how-it-works"
                  className="hover:text-background transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/pricing"
                  className="hover:text-background transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/features"
                  className="hover:text-background transition-colors"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-background mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help"
                  className="hover:text-background transition-colors"
                >
                  Help centre
                </Link>
              </li>
              <li>
                <Link to="/contact"
                  className="hover:text-background transition-colors"
                >
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/community"
                  className="hover:text-background transition-colors"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-background mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about"
                  className="hover:text-background transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy"
                  className="hover:text-background transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms"
                  className="hover:text-background transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 DoorSlam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
