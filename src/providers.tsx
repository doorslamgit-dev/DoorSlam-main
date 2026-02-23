import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { SelectedChildProvider } from '@/contexts/SelectedChildContext';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <SelectedChildProvider>
            <SidebarProvider>
              <ToastProvider>{children}</ToastProvider>
            </SidebarProvider>
          </SelectedChildProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
