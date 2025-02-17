import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - AI Studio',
  description: 'Privacy Policy and data handling practices for AI Studio',
  openGraph: {
    title: 'Privacy Policy - AI Studio',
    description: 'Privacy Policy and data handling practices for AI Studio',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 