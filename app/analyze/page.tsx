import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import CodeAnalyzer from "../components/CodeAnalyzer";

export const metadata: Metadata = {
  title: "Code Analyzer - AI Studio",
  description: "Analyze your codebase with AI-powered tools",
};

export default async function AnalyzePage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <CodeAnalyzer />
    </main>
  );
} 