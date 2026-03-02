import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { SelectedChildProvider } from '@/contexts/SelectedChildContext';
import { SubjectColorProvider } from '@/contexts/SubjectColorContext';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <SelectedChildProvider>
            <SubjectColorProvider>
              <SidebarProvider>
                <ToastProvider>{children}</ToastProvider>
              </SidebarProvider>
            </SubjectColorProvider>
          </SelectedChildProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
