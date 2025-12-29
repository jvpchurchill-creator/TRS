import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { mockFAQs } from '../data/mock';

const FAQPage = () => {
  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00FFD1]/10 mb-8">
              <HelpCircle className="w-10 h-10 text-[#00FFD1]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-semibold text-white mb-6">
              Frequently Asked <span className="text-[#00FFD1]">Questions</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Everything you need to know about our services
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="space-y-4">
            {mockFAQs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#121212] border border-white/10 px-6 data-[state=open]:border-[#00FFD1]/50 transition-all duration-300"
              >
                <AccordionTrigger className="text-white text-lg text-left hover:text-[#00FFD1] py-6 [&[data-state=open]]:text-[#00FFD1]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-white/60 mb-8">
              Join our Discord server for instant support from our team
            </p>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#00FFD1] text-black px-8 py-4 font-medium hover:bg-transparent hover:text-[#00FFD1] border-2 border-[#00FFD1] transition-all duration-300"
            >
              Join Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
