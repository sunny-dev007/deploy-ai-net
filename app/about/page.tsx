"use client";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaBrain, FaCode, FaServer, FaCloud, FaRobot, FaDatabase } from 'react-icons/fa';
import { SiTensorflow, SiPytorch, SiOpenai } from 'react-icons/si';
import { DiPython, DiJavascript, DiReact, DiMongodb } from 'react-icons/di';
import { BiNetworkChart } from 'react-icons/bi';
import { AiOutlineAntDesign } from 'react-icons/ai';
import { FaCheck, FaArrowRight } from 'react-icons/fa';

export default function About() {
  const skills = [
    { name: "AI & ML", icon: <FaBrain />, color: "from-purple-500 to-indigo-500" },
    { name: "LLMs & NLP", icon: <SiOpenai />, color: "from-green-500 to-emerald-500" },
    { name: "Full Stack", icon: <FaCode />, color: "from-blue-500 to-cyan-500" },
    { name: "Cloud Services", icon: <FaCloud />, color: "from-orange-500 to-red-500" },
  ];

  const projects = [
    {
      title: "AI-Powered Financial Forecasting System",
      domain: "Banking & Finance",
      description: "Developed an advanced ML model for predicting market trends and financial forecasting using LSTM networks and transformer architecture.",
      tech: ["Python", "TensorFlow", "AWS SageMaker", "React"],
      impact: "Improved prediction accuracy by 35%, helping clients make better investment decisions",
      gradient: "from-blue-600 to-cyan-600",
      icon: <BiNetworkChart className="w-8 h-8" />
    },
    {
      title: "Intelligent Learning Management System",
      domain: "EdTech",
      description: "Built a personalized learning platform using NLP and adaptive learning algorithms to customize education paths.",
      tech: ["Next.js", "OpenAI GPT", "Python", "MongoDB"],
      impact: "Increased student engagement by 45% and improved completion rates by 60%",
      gradient: "from-purple-600 to-pink-600",
      icon: <FaBrain className="w-8 h-8" />
    },
    {
      title: "Generative AI Research Platform",
      domain: "Research & Development",
      description: "Created a platform for experimenting with and fine-tuning various generative AI models, including text-to-image and text-to-code capabilities.",
      tech: ["PyTorch", "DALL-E", "Stable Diffusion", "FastAPI"],
      impact: "Enabled 100+ researchers to collaborate and experiment with state-of-the-art AI models",
      gradient: "from-emerald-600 to-teal-600",
      icon: <FaRobot className="w-8 h-8" />
    }
  ];

  const experience = [
    {
      period: "2021 - Present",
      role: "Lead AI Engineer & Full Stack Developer",
      company: "TechVision AI",
      description: "Leading AI research and development initiatives, architecting scalable solutions, and mentoring team members.",
      highlights: [
        "Spearheaded the development of enterprise-level AI solutions",
        "Implemented MLOps practices reducing deployment time by 60%",
        "Led a team of 12 engineers across multiple projects"
      ]
    },
    {
      period: "2018 - 2021",
      role: "Senior Full Stack AI Developer",
      company: "InnovateTech Solutions",
      description: "Developed and deployed AI-powered applications with focus on NLP and computer vision.",
      highlights: [
        "Built real-time video analytics platform using deep learning",
        "Optimized ML model performance reducing inference time by 40%",
        "Integrated AI capabilities into existing enterprise systems"
      ]
    },
    // Add more experience entries...
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow">
        {/* Hero Section with Neural Network Animation */}
        <div className="relative min-h-[80vh] bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-900 py-20 overflow-hidden">
          {/* Animated Neural Network Background */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Connecting Lines Animation */}
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

          {/* Profile Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white"
            >
              <div className="mb-8 relative">
                <div className="w-40 h-40 mx-auto relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-50" />
                  <img
                    src="/your-photo.jpg" // Add your photo
                    alt="Sunny Kushwaha"
                    className="relative rounded-full w-full h-full object-cover border-4 border-white/20"
                  />
                  {/* Orbiting Tech Icons */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * (10 / 6),
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        left: '50%',
                        top: '50%',
                        marginLeft: '-16px',
                        marginTop: '-16px',
                        transformOrigin: '50% 100px',
                      }}
                    >
                      <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                        {[<FaBrain />, <SiTensorflow />, <SiPytorch />, <FaCode />, <FaCloud />, <FaDatabase />][i]}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6">Sunny Kushwaha</h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                AI/ML Engineer & Full Stack Developer specializing in LLMs, NLP, and Generative AI.
                Building intelligent solutions with cutting-edge technologies.
              </p>
              <div className="flex justify-center space-x-6 mb-12">
                {[
                  { icon: <FaGithub />, link: "https://github.com" },
                  { icon: <FaLinkedin />, link: "https://linkedin.com" },
                  { icon: <FaTwitter />, link: "https://twitter.com" },
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.link}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Skills Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {skills.map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${skill.color} rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity`} />
                  <div className="relative bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <div className="text-3xl text-white mb-4">{skill.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{skill.name}</h3>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Core Projects Section */}
        <section className="py-24 bg-gray-800 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/neural-pattern.svg')] opacity-5" />
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 100 + 50}px`,
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  translateX: [`-${Math.random() * 50}px`, `${Math.random() * 50}px`],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Core Projects</h2>
              <p className="text-xl text-gray-300">Innovative solutions across multiple domains</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {projects.map((project, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${project.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <div className="relative bg-gray-900 rounded-2xl p-6 border border-gray-700 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${project.gradient}`}>
                        {project.icon}
                </div>
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
              </div>
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                        {project.domain}
                      </span>
                </div>
                    <p className="text-gray-300 mb-4">{project.description}</p>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, j) => (
                          <span
                            key={j}
                            className="px-2 py-1 rounded-md text-sm bg-gray-800 text-gray-300 border border-gray-700"
                          >
                            {tech}
                          </span>
                        ))}
              </div>
                      <p className="text-green-400 text-sm">{project.impact}</p>
                </div>
              </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Expertise Section */}
        <section className="py-20 bg-gray-900 relative overflow-hidden">
          {/* DNA Helix Animation Background */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0"
                style={{
                  top: `${i * 20}%`,
                }}
                animate={{
                  x: [-100, 100, -100],
                  y: [0, 50, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  delay: i * 2,
                }}
              >
                <svg className="w-full h-20 opacity-5" viewBox="0 0 200 20">
                  <path
                    d="M0 10 Q 50 0, 100 10 T 200 10"
                    stroke="currentColor"
                    fill="none"
                    className="text-blue-500"
                  />
                </svg>
              </motion.div>
            ))}
        </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Technical Expertise</h2>
              <p className="text-xl text-gray-300">Mastering cutting-edge technologies</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: <DiPython />, name: "Python", level: 95 },
                { icon: <DiJavascript />, name: "JavaScript", level: 90 },
                { icon: <DiReact />, name: "React/Next.js", level: 92 },
                { icon: <SiTensorflow />, name: "TensorFlow", level: 88 },
                { icon: <SiPytorch />, name: "PyTorch", level: 85 },
                { icon: <FaCloud />, name: "Cloud Services", level: 90 },
                { icon: <DiMongodb />, name: "Databases", level: 88 },
                { icon: <FaRobot />, name: "AI/ML", level: 92 },
              ].map((tech, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="text-center p-6">
                    <motion.div
                      className="text-5xl mb-4 text-gray-300 group-hover:text-blue-500 transition-colors"
                      whileHover={{ scale: 1.2 }}
                    >
                      {tech.icon}
                    </motion.div>
                    <h3 className="text-lg font-medium text-white mb-2">{tech.name}</h3>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tech.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                </div>
                </div>
                </motion.div>
              ))}
                </div>
              </div>
        </section>

        {/* Experience Timeline Section */}
        <section className="py-20 bg-gray-800 relative overflow-hidden">
          {/* Circuit Board Animation Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5" />
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Professional Journey</h2>
              <p className="text-xl text-gray-300">A decade of innovation and leadership</p>
            </motion.div>

            <div className="space-y-12">
              {experience.map((exp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative pl-8 border-l-2 border-blue-500"
                >
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500" />
                  <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                      <span className="text-blue-400">{exp.period}</span>
                    </div>
                    <p className="text-gray-300 mb-4">{exp.company}</p>
                    <p className="text-gray-400 mb-4">{exp.description}</p>
                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (i * 0.2) + (j * 0.1) }}
                          className="flex items-center gap-2 text-gray-300"
                        >
                          <FaCheck className="text-green-500 flex-shrink-0" />
                          <span>{highlight}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section with Animated Elements */}
        <section className="py-20 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0">
            {/* Add floating particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-blue-500/20"
                style={{
                  width: Math.random() * 6 + 2 + 'px',
                  height: Math.random() * 6 + 2 + 'px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 30 - 15, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
        </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Let's Build Something Amazing</h2>
              <p className="text-xl text-gray-300 mb-8">
                Looking to bring AI innovation to your project? Let's connect and explore the possibilities.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
            <a
              href="mailto:contact@example.com"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Get in Touch
                  <FaArrowRight />
            </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
} 