import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, MessageCircle, Shield, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#00FFD1] flex items-center justify-center">
                <Crown className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-semibold text-white">Rival Syndicate</span>
            </Link>
            <p className="text-white/60 text-lg leading-relaxed max-w-md mb-6">
              Elite lord farming and boosting services. Fast delivery, verified boosters, and 24/7 Discord support.
            </p>
            <div className="flex gap-4">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 flex items-center justify-center hover:bg-[#00FFD1] hover:text-black text-white transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-white/60 hover:text-[#00FFD1] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-white/60 hover:text-[#00FFD1] transition-colors duration-300">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/60 hover:text-[#00FFD1] transition-colors duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Points */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Why Choose Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/60">
                <Zap className="w-5 h-5 text-[#00FFD1]" />
                Fast Delivery
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Shield className="w-5 h-5 text-[#00FFD1]" />
                Verified Boosters
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <MessageCircle className="w-5 h-5 text-[#00FFD1]" />
                24/7 Discord Support
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2025 Rival Syndicate. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/faq" className="text-white/40 hover:text-white transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-white/40 hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
