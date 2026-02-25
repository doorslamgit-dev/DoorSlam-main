// src/components/layout/AiTutorSlot.tsx
// AI Tutor chat panel — slides in from the right with collapsible history drawer.

import { useState, useRef, useEffect, useCallback } from 'react';
import AppIcon from '../ui/AppIcon';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  streamChat,
  fetchConversationMessages,
} from '../../services/aiAssistantService';
import type { SourceCitation } from '../../services/aiAssistantService';
import MessageBubble from './ai-tutor/MessageBubble';
import ChatInput from './ai-tutor/ChatInput';
import ConversationList from './ai-tutor/ConversationList';

type PanelState = 'idle' | 'streaming' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
}

let messageCounter = 0;
function nextId(): string {
  return `msg-${++messageCounter}-${Date.now()}`;
}

export default function AiTutorSlot() {
  const {
    isAiPanelOpen,
    setAiPanelOpen,
    aiTutorConversationId,
    setAiTutorConversationId,
  } = useSidebar();
  const { isParent, isChild, activeChildId } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef('');

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Reload messages when panel reopens with an existing conversation
  useEffect(() => {
    if (isAiPanelOpen && aiTutorConversationId && messages.length === 0) {
      loadConversation(aiTutorConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiPanelOpen]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setPanelState('idle');
      setErrorMessage(null);
      const detail = await fetchConversationMessages(conversationId);
      setMessages(
        detail.messages.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      );
      setAiTutorConversationId(conversationId);
      setConversationTitle(detail.title);
    } catch {
      setErrorMessage('Failed to load conversation');
      setPanelState('error');
    }
  }, [setAiTutorConversationId]);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setAiTutorConversationId(null);
    setConversationTitle(null);
    setPanelState('idle');
    setErrorMessage(null);
    setHistoryOpen(false);
  }, [setAiTutorConversationId]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      setHistoryOpen(false);
      loadConversation(id);
    },
    [loadConversation]
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (panelState === 'streaming') return;

      // Collapse history drawer when sending
      setHistoryOpen(false);

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
        conversationId: aiTutorConversationId,
        role: isChild ? 'child' : 'parent',
        childId: activeChildId ?? null,
        onToken: (content) => {
          streamingContentRef.current += content;
          const snapshot = streamingContentRef.current;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: snapshot } : m))
          );
        },
        onSources: (sources) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, sources } : m))
          );
        },
        onDone: (data) => {
          setAiTutorConversationId(data.conversationId);
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
    [panelState, aiTutorConversationId, isChild, activeChildId, setAiTutorConversationId]
  );

  if (!isAiPanelOpen) return null;

  const userRole = isChild ? 'student' : 'parent';

  return (
    <aside className="fixed top-0 right-0 h-full w-80 z-[var(--z-sidebar)] bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <AppIcon name="sparkles" className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Tutor</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setHistoryOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg transition-colors ${
              historyOpen
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            aria-label="Conversation history"
            title="Conversation history"
          >
            <AppIcon name="history" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNewConversation}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="New conversation"
            title="New conversation"
          >
            <AppIcon name="plus" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAiPanelOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close AI Tutor"
          >
            <AppIcon name="close" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible history drawer */}
      <div
        className={`overflow-hidden border-b border-border transition-all duration-200 ease-in-out ${
          historyOpen ? 'max-h-[200px] overflow-y-auto' : 'max-h-0 border-b-0'
        }`}
      >
        <ConversationList
          activeConversationId={aiTutorConversationId}
          onSelect={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Conversation title */}
      {conversationTitle && (
        <div className="px-4 py-1.5 border-b border-border flex-shrink-0">
          <p className="text-xs text-muted-foreground truncate">{conversationTitle}</p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <AppIcon name="sparkles" className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Hi! I&apos;m your AI Tutor
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {isParent
                ? 'Ask me anything about your child\u2019s GCSE subjects, revision strategies, or exam preparation.'
                : 'Ask me about any topic you\u2019re revising. I\u2019ll help you understand and remember it.'}
            </p>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="mt-4 text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              View past conversations
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={panelState === 'streaming' && msg === messages[messages.length - 1] && msg.role === 'assistant'}
            sources={msg.sources}
          />
        ))}
      </div>

      {/* Error banner */}
      {panelState === 'error' && errorMessage && (
        <div className="px-3 py-2 bg-destructive/5 border-t border-destructive/20">
          <p className="text-xs text-destructive">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setPanelState('idle')}
            className="text-xs text-primary hover:underline mt-1"
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
