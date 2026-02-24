// src/components/layout/ai-tutor/MessageBubble.tsx

import Markdown from 'react-markdown';
import AppIcon from '../../ui/AppIcon';
import SourceChips from './SourceChips';
import type { SourceCitation } from '../../../services/aiAssistantService';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  sources?: SourceCitation[];
}

export default function MessageBubble({ role, content, isStreaming, sources }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-500'
        }`}
      >
        <AppIcon
          name={isUser ? 'user' : 'sparkles'}
          className="w-3.5 h-3.5"
        />
      </div>

      {/* Bubble + sources */}
      <div className="max-w-[85%]">
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="markdown-body break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_ul]:pl-4 [&_ol]:pl-4 [&_ul]:list-disc [&_ol]:list-decimal [&_strong]:font-semibold [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1">
              <Markdown>{content}</Markdown>
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded-sm align-text-bottom" />
              )}
            </div>
          )}
        </div>
        {!isUser && sources && sources.length > 0 && <SourceChips sources={sources} />}
      </div>
    </div>
  );
}
