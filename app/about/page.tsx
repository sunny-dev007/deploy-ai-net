import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Avatar from "../components/Avatar";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 py-20 sm:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                  Hi, I'm Sunny Kushwaha 👋
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  A passionate Full Stack Developer with a decade of experience in crafting innovative digital solutions.
                </p>
                <div className="flex space-x-4 justify-center md:justify-start">
                  <a href="https://github.com" className="text-gray-600 hover:text-gray-900">
                    <FaGithub className="w-6 h-6" />
                  </a>
                  <a href="https://linkedin.com" className="text-gray-600 hover:text-gray-900">
                    <FaLinkedin className="w-6 h-6" />
                  </a>
                  <a href="https://twitter.com" className="text-gray-600 hover:text-gray-900">
                    <FaTwitter className="w-6 h-6" />
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <Avatar name="Sunny Kushwaha" />
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              A Decade of Excellence in Technology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Full Stack Development</h3>
                <p className="text-gray-600">
                  Expertise in both frontend and backend technologies, creating seamless web applications with modern frameworks and tools.
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Cloud Architecture</h3>
                <p className="text-gray-600">
                  Deep expertise in cloud technologies, designing and implementing scalable solutions on major cloud platforms.
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Security & Best Practices</h3>
                <p className="text-gray-600">
                  Strong focus on security and industry best practices, ensuring robust and maintainable solutions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              My Professional Journey
            </h2>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3">
                  <h3 className="text-xl font-semibold text-gray-900">Technical Expertise</h3>
                  <p className="mt-2 text-gray-600">
                    Proficient in modern web technologies including React, Node.js, Python, and various cloud platforms. 
                    Experienced in building scalable applications and implementing complex system architectures.
                  </p>
                </div>
                <div className="w-full md:w-1/3">
                  <h3 className="text-xl font-semibold text-gray-900">Leadership</h3>
                  <p className="mt-2 text-gray-600">
                    Led multiple successful projects and teams, fostering innovation and maintaining high standards of code quality. 
                    Mentored junior developers and contributed to team growth.
                  </p>
                </div>
                <div className="w-full md:w-1/3">
                  <h3 className="text-xl font-semibold text-gray-900">Innovation</h3>
                  <p className="mt-2 text-gray-600">
                    Constantly exploring new technologies and methodologies to deliver cutting-edge solutions. 
                    Passionate about AI and machine learning integration in web applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Let's Work Together
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              I'm always interested in hearing about new projects and opportunities.
            </p>
            <a
              href="mailto:contact@example.com"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 