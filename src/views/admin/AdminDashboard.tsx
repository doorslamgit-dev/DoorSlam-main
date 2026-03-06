// src/views/admin/AdminDashboard.tsx
// Admin landing page with links to admin tools.

import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import AppIcon from '@/components/ui/AppIcon';

const ADMIN_TOOLS = [
  {
    href: '/admin/curriculum',
    icon: 'clipboard-list' as const,
    title: 'RAG Content Pipeline',
    description:
      'Ingest source documents from Google Drive into Supabase Storage and the RAG vector store. Manages chunking, embedding, and metadata enrichment for the AI Tutor.',
  },
  {
    href: '/admin/content',
    icon: 'sparkles' as const,
    title: 'Revision Content Generation',
    description:
      'Generate revision content (flashcards, teaching slides, worked examples, practice questions) from source PDFs. Review, approve, and promote to production.',
  },
  {
    href: '/admin/design',
    icon: 'palette' as const,
    title: 'Design Guidelines',
    description:
      'Component library, design tokens, and visual reference for the Doorslam UI system.',
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Doorslam internal tools for managing content, curriculum data, and platform configuration.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ADMIN_TOOLS.map((tool) => (
          <Link key={tool.href} to={tool.href}>
            <Card interactive className="h-full">
              <div className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <AppIcon name={tool.icon} className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
