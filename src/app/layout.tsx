import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { playfairDisplay, lora, sourceSerif4 } from '@/config/fonts';
import ThemeProvider from '@/components/layout/ThemeProvider';
import Toast from '@/components/ui/Toast';
import UploadStatus from '@/components/ui/UploadStatus';
import SyncManager from '@/components/ui/SyncManager';
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
                <ClerkProvider
                    appearance={{
                        variables: {
                            colorPrimary: '#c8965a',
                            colorBackground: '#1a1410',
                            colorInputBackground: '#2e2720',
                            colorText: '#e8ddd0',
                            colorTextSecondary: '#a09080',
                            borderRadius: '6px',
                            fontFamily: 'Lora, serif',
                        },
                    }}
                >
                    <ThemeProvider>
                        {children}
                        <Toast />
                        <UploadStatus />
                        <SyncManager />
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
