import React, { Suspense, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Zap, Shield, MessageCircle, Users, Star, Clock, Quote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { mockStats, discordServer } from '../data/mock';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Lazy load Spline for performance
const Spline = React.lazy(() => import('@splinetool/react-spline'));

const HomePage = () => {
  const [vouches, setVouches] = useState([]);
  const [loadingVouches, setLoadingVouches] = useState(true);

  useEffect(() => {
    const fetchVouches = async () => {
      try {
        const response = await axios.get(`${API}/vouches?limit=6`);
        setVouches(response.data);
      } catch (error) {
        console.error('Failed to fetch vouches:', error);
      } finally {
        setLoadingVouches(false);
      }
    };
    fetchVouches();
  }, []);

  const trustPoints = [
    { icon: Zap, title: 'Fast Delivery', description: 'Most orders completed within 24-48 hours' },
    { icon: Shield, title: 'Verified Boosters', description: '100% vetted professionals with proven track records' },
    { icon: MessageCircle, title: '24/7 Support', description: 'Round-the-clock Discord support for all customers' },
  ];

  const stats = [
    { value: mockStats.ordersCompleted.toLocaleString() + '+', label: 'Orders Completed' },
    { value: mockStats.happyCustomers.toLocaleString() + '+', label: 'Happy Customers' },
    { value: mockStats.activeBoosters + '+', label: 'Active Boosters' },
    { value: mockStats.averageRating.toString(), label: 'Average Rating' },
  ];

  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10">
                <Crown className="w-4 h-4 text-[#00FFD1]" />
                <span className="text-white/80 text-sm">Elite Gaming Services</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight">
                The Rival
                <span className="block text-[#00FFD1]">Syndicate</span>
              </h1>
              
              <p className="text-xl text-white/70 leading-relaxed max-w-lg">
                Elite Lord Farming & Boosting services for Marvel Rivals. Dominate the game with our professional team of verified boosters.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/services">
                  <Button className="bg-[#00FFD1] text-black hover:bg-transparent hover:text-[#00FFD1] border-2 border-[#00FFD1] rounded-none px-8 py-6 text-lg font-medium transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center">
                    View Services
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="bg-white/10 text-white hover:bg-white hover:text-black rounded-none px-8 py-6 text-lg font-medium transition-all duration-300 w-full sm:w-auto"
                  onClick={() => window.open(discordServer.inviteUrl, '_blank')}
                >
                  Join Discord
                </Button>
              </div>
            </div>

            {/* Right - Spline 3D */}
            <div className="hidden lg:block relative">
              <div className="w-[700px] h-[700px] overflow-visible relative -mr-32">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-[#00FFD1] border-t-transparent rounded-full animate-spin" />
                  </div>
                }>
                  <Spline scene="https://prod.spline.design/NbVmy6DPLhY-5Lvg/scene.splinecode" />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-semibold text-[#00FFD1] mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Points Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">Why Choose Us</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Trusted by thousands of gamers worldwide for premium boosting services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {trustPoints.map((point, index) => (
              <div
                key={index}
                className="group p-8 bg-[#121212] border border-white/10 hover:border-[#00FFD1]/50 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-[#00FFD1]/10 flex items-center justify-center mb-6 group-hover:bg-[#00FFD1] transition-all duration-500">
                  <point.icon className="w-8 h-8 text-[#00FFD1] group-hover:text-black transition-all duration-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{point.title}</h3>
                <p className="text-white/60 text-lg leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vouches Section */}
      {vouches.length > 0 && (
        <section className="py-24 bg-[#121212]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FFD1]/10 border border-[#00FFD1]/30 mb-6">
                <Star className="w-4 h-4 text-[#00FFD1]" />
                <span className="text-[#00FFD1] text-sm">Customer Reviews</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">What Our Customers Say</h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Real feedback from our Discord community
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vouches.map((vouch, index) => (
                <Card key={vouch.id || index} className="bg-[#121212] border-white/10 rounded-none hover:border-[#00FFD1]/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-[#00FFD1]/30 mb-4" />
                    <p className="text-white/80 mb-6 line-clamp-4">{vouch.content}</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 rounded-none">
                        <AvatarImage src={vouch.author?.avatar} />
                        <AvatarFallback className="bg-[#00FFD1]/20 text-[#00FFD1] rounded-none">
                          {vouch.author?.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{vouch.author?.username || 'Anonymous'}</p>
                        <p className="text-white/40 text-sm">
                          {vouch.timestamp ? new Date(vouch.timestamp).toLocaleDateString() : 'Discord Member'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                variant="ghost"
                className="border border-white/20 text-white hover:bg-white hover:text-black rounded-none px-8 py-4"
                onClick={() => window.open(discordServer.inviteUrl, '_blank')}
              >
                View More on Discord
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">How It Works</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Get started in minutes with our simple process
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: Users, title: 'Login', desc: 'Sign in with your Discord account' },
              { step: '02', icon: Crown, title: 'Select', desc: 'Choose your service and character' },
              { step: '03', icon: Clock, title: 'Pay', desc: 'Complete secure checkout' },
              { step: '04', icon: Star, title: 'Relax', desc: 'Track progress in your dashboard' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-white/5 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative z-10 pt-8">
                  <div className="w-14 h-14 bg-[#00FFD1] flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-16 right-0 w-full h-px bg-gradient-to-r from-[#00FFD1]/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FFD1]/10 to-transparent" />
            <div className="relative border border-[#00FFD1]/30 p-12 md:p-20">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
                  Ready to Dominate?
                </h2>
                <p className="text-xl text-white/70 mb-8">
                  Join thousands of satisfied customers and take your gaming to the next level.
                </p>
                <Link to="/services">
                  <Button className="bg-[#00FFD1] text-black hover:bg-transparent hover:text-[#00FFD1] border-2 border-[#00FFD1] rounded-none px-10 py-6 text-lg font-medium transition-all duration-300 flex items-center gap-3">
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
