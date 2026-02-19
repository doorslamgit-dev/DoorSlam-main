import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
