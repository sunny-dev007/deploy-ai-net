"use client";

import { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: isAnnual ? 9.99 : 14.99,
      description: "Perfect for individuals and small projects",
      features: [
        "100 AI image generations per month",
        "Basic editing tools",
        "Standard resolution outputs",
        "Email support",
        "2 art styles",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Pro",
      price: isAnnual ? 19.99 : 24.99,
      description: "Ideal for professionals and growing businesses",
      features: [
        "500 AI image generations per month",
        "Advanced editing tools",
        "High resolution outputs",
        "Priority email support",
        "5 art styles",
        "Batch processing",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: isAnnual ? 29.99 : 34.99,
      description: "For teams and large-scale projects",
      features: [
        "Unlimited AI image generations",
        "Premium editing suite",
        "Ultra-high resolution outputs",
        "24/7 priority support",
        "All art styles",
        "API access",
        "Custom model training",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Choose the perfect plan for your creative needs
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center space-x-4 mb-16">
            <span className={`text-lg ${!isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 bg-gray-200"
              onClick={() => setIsAnnual(!isAnnual)}
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
            <span className={`text-lg ${isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Annual
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Save 20%
              </span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 shadow-lg ring-1 ring-gray-200 ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white ring-blue-600'
                    : 'bg-white'
                }`}
              >
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className={`mt-4 text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-500'}>
                    /month
                  </span>
                </div>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className={`h-5 w-5 ${
                          plan.highlighted ? 'text-blue-200' : 'text-blue-600'
                        }`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-8 w-full rounded-lg px-4 py-2 text-sm font-semibold ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors duration-200`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 