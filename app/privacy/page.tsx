'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="prose prose-indigo max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-600">
                Welcome to AI Studio ("we," "our," or "us"). We respect your privacy and are committed 
                to protecting your personal data. This privacy policy will inform you about how we handle 
                your personal data when you visit our website (workwithcopilot.com) and tell you about 
                your privacy rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Data We Collect</h2>
              <p className="text-gray-600 mb-4">We collect and process the following types of personal data:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Identity Data (name, username)</li>
                <li>Contact Data (email address)</li>
                <li>Technical Data (IP address, browser type, device information)</li>
                <li>Usage Data (how you use our website and services)</li>
                <li>Document and File Data (content you upload for processing)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Data</h2>
              <p className="text-gray-600 mb-4">We use your personal data for:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Providing and improving our AI-powered services</li>
                <li>Processing your document uploads and generating insights</li>
                <li>Communicating with you about our services</li>
                <li>Ensuring the security of our platform</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Storage and Security</h2>
              <p className="text-gray-600">
                We use industry-standard security measures to protect your data. Your data is stored 
                securely using encryption, and we utilize Pinecone for vector storage and Supabase 
                for database management. All data processing is performed in compliance with applicable 
                data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-600">We use the following third-party services:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Google OAuth for authentication</li>
                <li>Azure OpenAI for AI processing</li>
                <li>Pinecone for vector database storage</li>
                <li>Supabase for database management</li>
                <li>Google Drive for file storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cookies</h2>
              <p className="text-gray-600">
                We use cookies and similar tracking technologies to improve your experience on our website. 
                You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-600">
                Our services are not intended for children under 13. We do not knowingly collect data 
                from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this privacy policy or our data practices, please 
                contact us at: <a href="mailto:privacy@workwithcopilot.com" className="text-indigo-600 hover:text-indigo-800">
                privacy@workwithcopilot.com</a>
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy; 