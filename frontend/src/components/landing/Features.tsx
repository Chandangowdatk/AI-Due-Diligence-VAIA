'use client';

import { 
  FileSearch, 
  BarChart3, 
  Users, 
  Shield, 
  Clock, 
  Globe,
  TrendingUp,
  FileText,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'Comprehensive Analysis',
    description: '10 detailed sections covering every aspect of company due diligence.',
    color: 'bg-blue-500',
  },
  {
    icon: BarChart3,
    title: 'Interactive Visualizations',
    description: 'Charts and graphs for financials, ownership, and competitive landscape.',
    color: 'bg-emerald-500',
  },
  {
    icon: Users,
    title: 'Leadership Insights',
    description: 'Deep dive into management team, board composition, and governance.',
    color: 'bg-violet-500',
  },
  {
    icon: Shield,
    title: 'Verified Sources',
    description: 'SEC filings, official reports, and trusted databases prioritized.',
    color: 'bg-amber-500',
  },
  {
    icon: Clock,
    title: 'Real-Time Progress',
    description: 'Watch your report being generated section by section.',
    color: 'bg-rose-500',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Research companies from any market, public or private.',
    color: 'bg-cyan-500',
  },
];

const reportSections = [
  { icon: FileText, name: 'Executive Summary' },
  { icon: Globe, name: 'Company Overview' },
  { icon: Users, name: 'Leadership & Cap Table' },
  { icon: TrendingUp, name: 'Business Model' },
  { icon: BarChart3, name: 'Market Analysis' },
  { icon: Zap, name: 'Competitive Landscape' },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-navy-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="section-label flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            Our platform delivers institutional-grade research with the speed and 
            convenience of modern AI.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-navy-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Report Sections Preview */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
                Report Structure
              </span>
              <h3 className="text-3xl font-bold text-navy-900 mb-4">
                10 Comprehensive Sections
              </h3>
              <p className="text-navy-500 mb-6">
                Each report follows a standardized framework used by top investment 
                firms, ensuring you never miss critical information.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {reportSections.map((section) => (
                  <div
                    key={section.name}
                    className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg"
                  >
                    <section.icon className="text-primary-500" size={18} />
                    <span className="text-sm font-medium text-navy-700">{section.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              {/* Mock Report Preview */}
              <div className="bg-navy-900 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-navy-700 rounded w-3/4" />
                  <div className="h-3 bg-navy-800 rounded w-full" />
                  <div className="h-3 bg-navy-800 rounded w-5/6" />
                  <div className="h-20 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-lg mt-4 flex items-center justify-center">
                    <BarChart3 className="text-primary-400" size={32} />
                  </div>
                  <div className="h-3 bg-navy-800 rounded w-full" />
                  <div className="h-3 bg-navy-800 rounded w-4/5" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
