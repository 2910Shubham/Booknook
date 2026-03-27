import type { Metadata } from 'next';
import { playfairDisplay, lora, sourceSerif4 } from '@/config/fonts';
import ThemeProvider from '@/components/layout/ThemeProvider';
import Toast from '@/components/ui/Toast';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_DESCRIPTION}`,
  description: `${APP_NAME} is a refined PDF reading experience with beautiful themes, keyboard shortcuts, and distraction-free focus mode.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${lora.variable} ${sourceSerif4.variable}`}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toast />
        </ThemeProvider>
      </body>
    </html>
  );
}
