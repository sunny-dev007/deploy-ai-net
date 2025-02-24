import { getServerSession } from "next-auth/next";
import Dashboard from "../components/Dashboard";
import VectorChatBot from "../components/VectorChatBot";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - AI Studio",
  description: "Manage your files and uploads",
};

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Dashboard />
      <VectorChatBot />
    </main>
  );
} 