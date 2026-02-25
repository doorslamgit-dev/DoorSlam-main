// src/components/ErrorBoundary.tsx
// React Error Boundary component for graceful error handling
// Prevents entire app crashes from component errors

import React, { Component, ErrorInfo, ReactNode } from "react";
import AppIcon from "./ui/AppIcon";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Reset error state when children change (useful for route changes)
   */
  resetOnPropsChange?: boolean;
  /**
   * Custom error message title
   */
  errorTitle?: string;
  /**
   * Custom error message description
   */
  errorDescription?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component catches JavaScript errors in child components,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With error handler
 * ```tsx
 * <ErrorBoundary onError={(error, errorInfo) => logToService(error)}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Future: send to error tracking service (e.g. Sentry)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when children change (e.g., route navigation)
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      if (this.state.hasError) {
        this.handleReset();
      }
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
          <div className="max-w-md w-full bg-background rounded-2xl shadow-lg border border-border p-8">
            {/* Error Icon */}
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AppIcon
                name="alert-circle"
                className="w-8 h-8 text-destructive"
                aria-hidden
              />
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-bold text-foreground text-center mb-3">
              {this.props.errorTitle || "Something went wrong"}
            </h2>

            {/* Error Description */}
            <p className="text-muted-foreground text-center mb-6">
              {this.props.errorDescription ||
                "We encountered an unexpected error. Please try refreshing the page."}
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 p-4 bg-muted rounded-lg border border-border">
                <summary className="text-sm font-medium text-foreground cursor-pointer mb-2">
                  Error details (dev only)
                </summary>
                <div className="text-xs font-mono text-muted-foreground space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-words">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 px-6 py-3 bg-muted hover:bg-muted text-foreground font-semibold rounded-full transition-colors"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
