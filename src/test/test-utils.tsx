// src/test/test-utils.tsx
// Shared test utilities — renderWithProviders, mock contexts, etc.

import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock context values
// ---------------------------------------------------------------------------

export interface MockAuthValues {
  user: { id: string; email: string } | null;
  session: unknown;
  loading: boolean;
  profile: { id: string; role: string } | null;
  activeChildId: string | null;
  parentChildCount: number | null;
  isParent: boolean;
  isChild: boolean;
  isUnresolved: boolean;
  signIn: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
}

export const defaultMockAuth: MockAuthValues = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  session: { access_token: 'fake-token' },
  loading: false,
  profile: { id: 'test-user-id', role: 'parent' },
  activeChildId: null,
  parentChildCount: 1,
  isParent: true,
  isChild: false,
  isUnresolved: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  refresh: vi.fn(),
};

export interface MockSidebarValues {
  sidebarState: 'expanded' | 'collapsed';
  isMobileOpen: boolean;
  isAiPanelOpen: boolean;
  aiTutorConversationId: string | null;
  toggleSidebar: ReturnType<typeof vi.fn>;
  setSidebarState: ReturnType<typeof vi.fn>;
  setMobileOpen: ReturnType<typeof vi.fn>;
  setAiPanelOpen: ReturnType<typeof vi.fn>;
  setAiTutorConversationId: ReturnType<typeof vi.fn>;
}

export const defaultMockSidebar: MockSidebarValues = {
  sidebarState: 'expanded',
  isMobileOpen: false,
  isAiPanelOpen: false,
  aiTutorConversationId: null,
  toggleSidebar: vi.fn(),
  setSidebarState: vi.fn(),
  setMobileOpen: vi.fn(),
  setAiPanelOpen: vi.fn(),
  setAiTutorConversationId: vi.fn(),
};

// ---------------------------------------------------------------------------
// Mock modules — vi.mock calls for common dependencies
// ---------------------------------------------------------------------------

// These must be called at the top of each test file that needs them:
//
//   vi.mock('@/contexts/AuthContext', () => ({
//     useAuth: () => mockAuth,
//   }));
//
//   vi.mock('@/contexts/SidebarContext', () => ({
//     useSidebar: () => mockSidebar,
//   }));

// ---------------------------------------------------------------------------
// renderWithProviders
// ---------------------------------------------------------------------------

interface WrapperOptions {
  route?: string;
}

function createWrapper({ route = '/' }: WrapperOptions = {}) {
  window.history.pushState({}, 'Test page', route);

  return function Wrapper({ children }: { children: ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options?: WrapperOptions & Omit<RenderOptions, 'wrapper'>
) {
  const { route, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper({ route }),
    ...renderOptions,
  });
}

// ---------------------------------------------------------------------------
// Common helpers
// ---------------------------------------------------------------------------

/**
 * Create a mock SSE response for testing streamChat().
 */
export function createMockSSEResponse(events: Array<{ event: string; data: string }>): Response {
  const body = events
    .map((e) => `event: ${e.event}\ndata: ${e.data}\n\n`)
    .join('');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

/**
 * Create a mock JSON response for testing fetch calls.
 */
export function createMockJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
