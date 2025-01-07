"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ValidationErrors, validateForm } from '../utils/validations';
import { sendContactEmail } from '../actions/contact';
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin, FaTwitter, FaPaperPlane, FaCircleNotch } from 'react-icons/fa';
import { SiOpenai } from 'react-icons/si';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when input changes
  useEffect(() => {
    setErrors({});
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Sending message...' });

    // Client-side validation
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({ type: 'error', message: 'Please fix the errors below.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      const result = await sendContactEmail(formDataObj);

      if (result.success) {
        setStatus({ type: 'success', message: 'Message sent successfully!' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setErrors(result.errors || {});
        setStatus({ 
          type: 'error', 
          message: result.errors?.submit || 'Failed to send message. Please try again.' 
        });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field: keyof ValidationErrors) => {
    return errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow">
        {/* Hero Section with Animated Background */}
        <div className="relative bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-900 pt-32 pb-20">
          {/* Animated Neural Network Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white/10"
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full">
              {[...Array(10)].map((_, i) => (
                <motion.path
                  key={i}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  fill="none"
                  d={`M${Math.random() * 100},${Math.random() * 100} Q${Math.random() * 100},${Math.random() * 100} ${Math.random() * 100},${Math.random() * 100}`}
                  animate={{
                    pathLength: [0, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                Let's Create Something
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  {" "}Extraordinary
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Have an innovative idea? Let's collaborate and bring your vision to life with cutting-edge AI technology.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Contact Section with Glass Morphism */}
        <div className="relative -mt-20 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
              >
                <div className="relative">
                  {/* AI Assistant Animation */}
                  <div className="absolute -top-16 right-0">
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                    >
                      <SiOpenai className="w-16 h-16 text-white" />
                    </motion.div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-8">Get in Touch</h2>
                  
                  {/* Contact Info with Animations */}
                  <div className="space-y-8">
                    {[
                      { icon: <FaEnvelope />, title: "Email", content: "sunny.kushwaha@example.com", sub: "Response within 24 hours" },
                      { icon: <FaPhone />, title: "Phone", content: "+91 (XXX) XXX-XXXX", sub: "Mon-Fri, 9am-6pm IST" },
                      { icon: <FaMapMarkerAlt />, title: "Location", content: "Bangalore, India", sub: "Available for remote work globally" }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                          <div className="text-blue-400">{item.icon}</div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                          <p className="text-gray-300">{item.content}</p>
                          <p className="text-sm text-gray-400">{item.sub}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Social Links with Hover Effects */}
                  <div className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6">Connect with me</h3>
                    <div className="flex space-x-6">
                      {[
                        { icon: <FaGithub />, link: "https://github.com", color: "hover:text-gray-100" },
                        { icon: <FaLinkedin />, link: "https://linkedin.com", color: "hover:text-blue-400" },
                        { icon: <FaTwitter />, link: "https://twitter.com", color: "hover:text-blue-400" }
                      ].map((social, i) => (
                        <motion.a
                          key={i}
                          href={social.link}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-gray-400 ${social.color} transition-colors text-2xl`}
                        >
                          {social.icon}
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
              >
                <h2 className="text-3xl font-bold text-white mb-8">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className={`block w-full px-4 py-3 rounded-xl bg-white/5 border ${
                            errors.name ? 'border-red-500' : 'border-white/10'
                          } text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all`}
                          placeholder="John Doe"
                        />
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: formData.name ? 1 : 0 }}
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ transformOrigin: 'left' }}
                        />
                      </div>
                      {renderError('name')}
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={`block w-full px-4 py-3 rounded-xl bg-white/5 border ${
                            errors.email ? 'border-red-500' : 'border-white/10'
                          } text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all`}
                          placeholder="john@example.com"
                        />
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: formData.email ? 1 : 0 }}
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ transformOrigin: 'left' }}
                        />
                      </div>
                      {renderError('email')}
                    </motion.div>
                  </div>

                  {/* Subject Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className={`block w-full px-4 py-3 rounded-xl bg-white/5 border ${
                          errors.subject ? 'border-red-500' : 'border-white/10'
                        } text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all`}
                        placeholder="What would you like to discuss?"
                      />
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: formData.subject ? 1 : 0 }}
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ transformOrigin: 'left' }}
                      />
                    </div>
                    {renderError('subject')}
                  </motion.div>

                  {/* Message Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <div className="relative">
                      <textarea
                        name="message"
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className={`block w-full px-4 py-3 rounded-xl bg-white/5 border ${
                          errors.message ? 'border-red-500' : 'border-white/10'
                        } text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all resize-none`}
                        placeholder="Tell me about your project..."
                      />
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: formData.message ? 1 : 0 }}
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ transformOrigin: 'left' }}
                      />
                    </div>
                    {renderError('message')}
                  </motion.div>

                  {/* Status Message */}
                  {status.message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl p-4 ${
                        status.type === 'success' ? 'bg-green-500/20 text-green-200' : 
                        status.type === 'error' ? 'bg-red-500/20 text-red-200' :
                        'bg-blue-500/20 text-blue-200'
                      } backdrop-blur-sm border border-white/10`}
                    >
                      {status.message}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl 
                      bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium
                      hover:from-blue-700 hover:to-purple-700 transition-all
                      disabled:opacity-75 disabled:cursor-not-allowed
                      relative overflow-hidden group`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isSubmitting ? (
                      <>
                        <FaCircleNotch className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 