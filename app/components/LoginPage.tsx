"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import LoadingDots from './LoadingDots';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState<{ google: boolean, github: boolean }>({ google: false, github: false });
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const handleSignIn = async (provider: 'google' | 'github') => {
    setLoading(prevLoading => ({ ...prevLoading, [provider]: true }));
    try {
      const result = await signIn(provider, {
        callbackUrl: '/',
        redirect: false,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error("Error signing in with provider:", error);
    } finally {
      setLoading(prevLoading => ({ ...prevLoading, [provider]: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Welcome Back
        </h2>
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSignIn("google")}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
            disabled={loading.google}
          >
            {loading.google ? <LoadingDots color="white" /> : <FaGoogle />}
            Continue with Google
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSignIn('github')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition-colors font-medium"
            disabled={loading.github}
          >
            {loading.github ? <LoadingDots color="white" /> : <FaGithub />}
            Continue with GitHub
          </motion.button>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-blue-500 hover:underline">
              Go to Login Page
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage; 