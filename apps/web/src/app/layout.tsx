import './globals.css';
import Providers from './providers';
import { AuthBoot } from '../components/auth/auth-boot';

export const metadata = {
  title: 'Task Manager',
  description: 'Full-stack task management system'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-ink">
        <Providers>
          <AuthBoot>{children}</AuthBoot>
        </Providers>
      </body>
    </html>
  );
}
