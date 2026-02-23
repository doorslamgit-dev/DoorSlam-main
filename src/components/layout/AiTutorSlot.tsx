// src/components/layout/AiTutorSlot.tsx
// AI Tutor chat panel — slides in from the right.

import { useState, useRef, useEffect, useCallback } from 'react';
import AppIcon from '../ui/AppIcon';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';
import { streamChat } from '../../services/aiAssistantService';
import MessageBubble from './ai-tutor/MessageBubble';
import ChatInput from './ai-tutor/ChatInput';

type PanelState = 'idle' | 'streaming' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

let messageCounter = 0;
function nextId(): string {
  return `msg-${++messageCounter}-${Date.now()}`;
}

export default function AiTutorSlot() {
  const { isAiPanelOpen, setAiPanelOpen } = useSidebar();
  const { isParent, isChild, activeChildId } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef('');

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setPanelState('idle');
    setErrorMessage(null);
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (panelState === 'streaming') return;

      // Add user message
      const userMsg: Message = { id: nextId(), role: 'user', content: text };
      const assistantMsgId = nextId();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantMsgId, role: 'assistant', content: '' },
      ]);
      setPanelState('streaming');
      setErrorMessage(null);
      streamingContentRef.current = '';

      await streamChat({
        message: text,
        conversationId,
        role: isChild ? 'child' : 'parent',
        childId: activeChildId ?? null,
        onToken: (content) => {
          streamingContentRef.current += content;
          const snapshot = streamingContentRef.current;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: snapshot } : m))
          );
        },
        onDone: (data) => {
          setConversationId(data.conversationId);
          setPanelState('idle');
        },
        onError: (error) => {
          setErrorMessage(error);
          setPanelState('error');
          // Remove the empty assistant bubble on error
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.id === assistantMsgId && !last.content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
        },
      });
    },
    [panelState, conversationId, isChild, activeChildId]
  );

  if (!isAiPanelOpen) return null;

  const userRole = isChild ? 'student' : 'parent';

  return (
    <aside className="fixed top-0 right-0 h-full w-80 z-[var(--z-sidebar)] bg-neutral-0 border-l border-neutral-200/60 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-200/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <AppIcon name="sparkles" className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-semibold text-neutral-700">AI Tutor</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNewConversation}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="New conversation"
            title="New conversation"
          >
            <AppIcon name="plus" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAiPanelOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Close AI Tutor"
          >
            <AppIcon name="close" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <AppIcon name="sparkles" className="w-8 h-8 text-neutral-200 mb-3" />
            <p className="text-sm font-medium text-neutral-500">
              Hi! I&apos;m your AI Tutor
            </p>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              {isParent
                ? 'Ask me anything about your child\u2019s GCSE subjects, revision strategies, or exam preparation.'
                : 'Ask me about any topic you\u2019re revising. I\u2019ll help you understand and remember it.'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={panelState === 'streaming' && msg === messages[messages.length - 1] && msg.role === 'assistant'}
          />
        ))}
      </div>

      {/* Error banner */}
      {panelState === 'error' && errorMessage && (
        <div className="px-3 py-2 bg-danger-bg border-t border-danger-border">
          <p className="text-xs text-danger">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setPanelState('idle')}
            className="text-xs text-primary-600 hover:underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={panelState === 'streaming'}
        placeholder={`Ask as a ${userRole}...`}
      />
    </aside>
  );
}
