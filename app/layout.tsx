import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Studio - Intelligent Document Processing",
  description: "AI-powered document analysis and processing platform",
  metadataBase: new URL('https://workwithcopilot.com'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: '<meta name="google-site-verification" content="472WXoae6vgNMFVTmbO_LKtkZoj4ALcYF-psiXviVjY" />', // Replace with your actual verification code from Google Search Console
  },
  openGraph: {
    title: 'AI Studio - Intelligent Document Processing',
    description: 'AI-powered document analysis and processing platform',
    url: 'https://workwithcopilot.com',
    siteName: 'AI Studio',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
