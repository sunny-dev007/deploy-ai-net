import { getServerSession } from "next-auth/next";
import LoginPage from "../components/LoginPage";
import UserDashboard from "../components/UserDashboard";

export default async function Login() {
  const session = await getServerSession();

  if (session) {
    return <UserDashboard />;
  }

  return <LoginPage />;
} 