'use client';

import { Search, Brain, FileText, Download } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Enter Company Name',
    description: 'Simply type the name of any company you want to research.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Researches',
    description: 'Our AI searches multiple sources and extracts relevant data.',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Report Generated',
    description: 'A comprehensive 10-section report is created in minutes.',
  },
  {
    number: '04',
    icon: Download,
    title: 'Export & Share',
    description: 'Download as PDF or JSON for your investment committee.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="section-label flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Four Simple Steps
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            From company name to comprehensive report in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-primary-100" />
              )}
              
              <div className="text-center">
                {/* Number badge */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 mb-6 relative">
                  <step.icon className="text-primary-600" size={32} />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-navy-900 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-navy-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-navy-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
