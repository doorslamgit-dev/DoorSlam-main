// src/components/layout/ai-tutor/MessageBubble.tsx

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
          <p className="whitespace-pre-wrap break-words">
            {content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded-sm align-text-bottom" />
            )}
          </p>
        </div>
        {!isUser && sources && sources.length > 0 && <SourceChips sources={sources} />}
      </div>
    </div>
  );
}
