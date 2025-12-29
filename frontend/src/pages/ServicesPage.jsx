import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Zap, Settings, Check, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockServices } from '../data/mock';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const iconMap = {
  Crown: Crown,
  Zap: Zap,
  Settings: Settings,
};

const ServicesPage = () => {
  const { isAuthenticated, login } = useAuth();
  const [selectedService, setSelectedService] = useState(mockServices[0].id);

  const handlePurchase = (pkg, serviceName) => {
    if (!isAuthenticated) {
      toast.error('Please login with Discord to purchase');
      login();
      return;
    }
    // Store in localStorage for mock checkout
    localStorage.setItem('pendingOrder', JSON.stringify({
      service: serviceName,
      package: pkg,
      timestamp: new Date().toISOString()
    }));
    toast.success(`Added ${pkg.name} to checkout!`, {
      description: 'Redirecting to payment...',
    });
    // Navigate to mock checkout
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 1500);
  };

  const currentService = mockServices.find(s => s.id === selectedService);

  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-semibold text-white mb-6">
              Our <span className="text-[#00FFD1]">Services</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Choose from our premium selection of boosting and farming services
            </p>
          </div>
        </div>
      </section>

      {/* Service Selection */}
      <section className="py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {mockServices.map((service) => {
              const IconComponent = iconMap[service.icon];
              const isActive = selectedService === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`flex items-center gap-3 px-6 py-4 border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#00FFD1] text-black border-[#00FFD1]'
                      : 'bg-transparent text-white border-white/20 hover:border-[#00FFD1]/50'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#00FFD1]'}`} />
                  <span className="font-medium">{service.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Service Details */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentService && (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                  {currentService.name}
                </h2>
                <p className="text-lg text-white/60 max-w-3xl mx-auto">
                  {currentService.description}
                </p>
              </div>

              {/* Packages Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                {currentService.packages.map((pkg, index) => {
                  const isPopular = index === 1;
                  return (
                    <Card
                      key={pkg.id}
                      className={`bg-[#121212] border rounded-none relative overflow-hidden transition-all duration-500 hover:transform hover:scale-[1.02] ${
                        isPopular
                          ? 'border-[#00FFD1] shadow-[0_0_30px_rgba(0,255,209,0.2)]'
                          : 'border-white/10 hover:border-[#00FFD1]/50'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 right-0">
                          <Badge className="bg-[#00FFD1] text-black rounded-none px-4 py-1 text-sm font-medium">
                            MOST POPULAR
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-0">
                        <CardTitle className="text-white text-2xl">{pkg.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-5xl font-bold text-white">${pkg.price}</span>
                          <span className="text-white/40 ml-2">one-time</span>
                        </div>
                        <p className="text-[#00FFD1] text-sm mt-2">ETA: {pkg.eta}</p>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <ul className="space-y-4 mb-8">
                          {pkg.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                              <span className="text-white/80">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => handlePurchase(pkg, currentService.name)}
                          className={`w-full rounded-none py-6 text-lg font-medium transition-all duration-300 ${
                            isPopular
                              ? 'bg-[#00FFD1] text-black hover:bg-transparent hover:text-[#00FFD1] border-2 border-[#00FFD1]'
                              : 'bg-white/10 text-white hover:bg-white hover:text-black border-2 border-transparent'
                          }`}
                        >
                          Buy Now
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20 bg-[#121212]/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { title: '100% Safe', desc: 'VPN protection & security protocols on every order' },
              { title: 'Money-Back Guarantee', desc: 'Full refund if we cannot complete your order' },
              { title: 'Progress Updates', desc: 'Real-time status updates in your dashboard' },
            ].map((item, index) => (
              <div key={index} className="p-6">
                <h3 className="text-xl font-semibold text-[#00FFD1] mb-3">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
