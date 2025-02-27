"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaGithub, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Separate component for handling email verification
function EmailVerificationHandler() {
  const searchParams = useSearchParams();
  const [verificationHandled, setVerificationHandled] = useState(false);
  
  useEffect(() => {
    const handleEmailVerification = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (type === 'email_verification' && token && !verificationHandled) {
        setVerificationHandled(true);
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            throw error;
          }

          toast.success(
            '✅ Email verified successfully! Please sign in to continue.',
            {
              position: 'top-center',
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );

          // Switch to sign in mode
          window.localStorage.setItem('emailVerified', 'true');
        } catch (error: any) {
          toast.error(
            error.message || 'Failed to verify email. Please try again.',
            {
              position: 'top-center',
              autoClose: 4000,
            }
          );
        }
      }
    };

    handleEmailVerification();
  }, [searchParams, verificationHandled]);

  return null; // This component doesn't render anything
}

export default function Auth() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  // Add validation states
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check for verified email
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verified = localStorage.getItem('emailVerified');
      if (verified === 'true') {
        setIsSignUp(false);
        localStorage.removeItem('emailVerified');
      }
    }
  }, []);

  // Handle mode switching from email verification
  const handleVerificationComplete = () => {
    setIsSignUp(false);
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    return errors;
  };

  // Handle input validation on change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation errors when user starts typing
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    // Validate email
    if (name === 'email' && value) {
      if (!isValidEmail(value)) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }));
      }
    }

    // Validate password
    if (name === 'password' && value) {
      const passwordErrors = validatePassword(value);
      if (passwordErrors.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          password: passwordErrors.join('. ')
        }));
      }
    }

    // Validate confirm password
    if (name === 'confirmPassword' && value) {
      if (value !== formData.password) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newValidationErrors = {
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Validate email
    if (!formData.email) {
      newValidationErrors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newValidationErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newValidationErrors.password = 'Password is required';
      isValid = false;
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newValidationErrors.password = passwordErrors.join('. ');
        isValid = false;
      }
    }

    // Additional sign-up validations
    if (isSignUp) {
      if (!formData.name) {
        toast.error('Please enter your name');
        isValid = false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        newValidationErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setValidationErrors(newValidationErrors);

    if (!isValid) {
      // Show toast for each validation error
      Object.values(newValidationErrors).forEach(error => {
        if (error) {
          toast.error(error);
        }
      });
    }

    return isValid;
  };

  // Add session check on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          // If session exists, redirect to dashboard
          router.push('/user-dash');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isSignUp) {
        // First, sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name
            },
            emailRedirectTo: `${window.location.origin}/auth?type=email_verification`,
          }
        });

        if (signUpError) {
          // Handle specific error cases
          if (signUpError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please try signing in instead.');
          }
          throw signUpError;
        }

        if (signUpData?.user) {
          // Show only one success message with better formatting
          toast.success(
            <div className="flex flex-col gap-1">
              <p className="font-semibold">🎉 Registration successful!</p>
              <p className="text-sm">Please check your email to verify your account.</p>
              <p className="text-xs mt-1">
                We've sent a verification link to:
                <span className="font-medium block mt-1">{formData.email}</span>
              </p>
            </div>,
            {
              position: 'top-center',
              autoClose: 8000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
          
          // Clear form data
          setFormData({
            email: '',
            password: '',
            name: '',
            confirmPassword: ''
          });
          
          // Switch to sign in mode after a delay
          setTimeout(() => {
            setIsSignUp(false);
          }, 2000);
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (signInError) {
          // Handle specific sign-in errors
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.');
          } else if (signInError.message.includes('Email not confirmed')) {
            throw new Error(
              'Please verify your email address before signing in. Check your inbox for the verification link.'
            );
          }
          throw signInError;
        }

        if (signInData.user) {
          toast.success(
            '🎉 Welcome back! Redirecting to dashboard...',
            {
              position: 'top-center',
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
            }
          );
          
          // Add a small delay before redirect for better UX
          setTimeout(() => {
            router.push('/user-dash');
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(
        error.message || 'An error occurred during authentication',
        {
          position: 'top-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center p-4">
      <ToastContainer theme="dark" />
      
      {/* Email verification handler wrapped in Suspense */}
      <Suspense fallback={null}>
        <EmailVerificationHandler />
      </Suspense>
      
      {/* Auth Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Auth Card */}
        <div className="bg-[#1E1E1E] rounded-2xl shadow-xl shadow-purple-500/10 overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </motion.h2>
            <p className="text-gray-400 text-sm">
              {isSignUp
                ? 'Sign up to get started with AI Studio'
                : 'Sign in to continue your AI journey'}
            </p>
          </div>

          {/* Social Buttons */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 
                  rounded-lg transition-colors duration-200"
              >
                <FaGoogle className="text-red-500" />
                <span className="text-white text-sm">Google</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 
                  rounded-lg transition-colors duration-200"
              >
                <FaGithub className="text-white" />
                <span className="text-white text-sm">GitHub</span>
              </motion.button>
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 
                        text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500
                        transition-colors duration-200"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-white/5 border ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg py-2.5 pl-10 pr-4 
                    text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500
                    transition-colors duration-200`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
                )}
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full bg-white/5 border ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-700'
                  } rounded-lg py-2.5 pl-10 pr-12 
                    text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500
                    transition-colors duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full bg-white/5 border ${
                          validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg py-2.5 pl-10 pr-4 
                          text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500
                          transition-colors duration-200`}
                      />
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isSignUp && (
              <div className="mt-4 text-right">
                <button
                  type="button"
                  className="text-sm text-violet-500 hover:text-violet-400 transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white py-2.5 px-4 
                rounded-lg font-medium hover:opacity-95 transition-all duration-200 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="p-6 bg-white/5 text-center">
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-violet-500 hover:text-violet-400 transition-colors duration-200"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 