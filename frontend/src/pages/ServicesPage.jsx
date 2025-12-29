import React, { useState, useEffect } from 'react';
import { Sword, Shield, Brain, CreditCard, DollarSign, Wallet, Crown, Zap, Check, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { characters, characterClasses, serviceTypes, paymentMethods, discordServer } from '../data/mock';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const classIcons = {
  duelist: Sword,
  vanguard: Shield,
  strategist: Brain
};

const paymentIcons = {
  CreditCard: CreditCard,
  DollarSign: DollarSign,
  Wallet: Wallet
};

// Currency data
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

const ServicesPage = () => {
  const { isAuthenticated, login, token, loading } = useAuth();
  const [selectedClass, setSelectedClass] = useState('duelist');
  const [selectedServiceType, setSelectedServiceType] = useState('priority-farm');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'USD';
  });
  const [exchangeRates, setExchangeRates] = useState({ USD: 1 });

  useEffect(() => {
    // Fetch exchange rates
    const fetchRates = async () => {
      try {
        const response = await axios.get(`${API}/currency/rates`);
        setExchangeRates(response.data.rates || { USD: 1 });
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };
    fetchRates();

    // Listen for currency changes from other pages
    const handleCurrencyChange = (event) => {
      setCurrency(event.detail);
    };
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: newCurrency }));
  };

  const convertPrice = (usdPrice) => {
    const rate = exchangeRates[currency] || 1;
    const converted = usdPrice * rate;
    // Round based on currency
    if (['JPY', 'KRW', 'INR', 'PHP'].includes(currency)) {
      return Math.round(converted);
    }
    return Math.round(converted * 100) / 100;
  };

  const formatPrice = (price) => {
    const currencyData = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    const converted = convertPrice(price);
    
    if (['JPY', 'KRW'].includes(currency)) {
      return `${currencyData.symbol}${converted.toLocaleString()}`;
    }
    return `${currencyData.symbol}${converted.toFixed(2)}`;
  };

  const currentCurrencyData = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const serviceType = serviceTypes.find(s => s.id === selectedServiceType);
  const currentCharacters = characters[selectedClass] || [];

  const getPrice = (basePrice) => {
    return basePrice + (serviceType?.priceModifier || 0);
  };

  const handleSelectCharacter = (character) => {
    console.log('Select character - isAuthenticated:', isAuthenticated, 'loading:', loading);
    if (loading) {
      toast.info('Please wait, checking authentication...');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please login with Discord to purchase');
      login();
      return;
    }
    setSelectedCharacter(character);
    setCheckoutOpen(true);
  };

  const handlePayment = async (paymentMethod) => {
    setCreating(true);
    
    try {
      // Create order in backend (always in USD)
      const orderData = {
        service_type: selectedServiceType,
        character_id: selectedCharacter.id,
        character_name: selectedCharacter.name,
        character_class: selectedClass,
        character_icon: selectedCharacter.icon,
        price: getPrice(selectedCharacter.basePrice), // USD price
        payment_method: paymentMethod.id
      };
      
      await axios.post(`${API}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Order created! Complete payment to proceed.', {
        description: `Opening ${paymentMethod.name}`
      });
      
      // Open payment link
      window.open(paymentMethod.url, '_blank');
      setCheckoutOpen(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-semibold text-white mb-6">
              Our <span className="text-[#00FFD1]">Services</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Choose your service type and character to get started
            </p>
          </div>
        </div>
      </section>

      {/* Service Type Selection */}
      <section className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Select Service Type</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {serviceTypes.map((service) => {
              const isActive = selectedServiceType === service.id;
              const Icon = service.id === 'priority-farm' ? Crown : Zap;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedServiceType(service.id)}
                  className={`flex-1 max-w-md p-6 border transition-all duration-300 text-left ${
                    isActive
                      ? 'bg-[#00FFD1]/10 border-[#00FFD1] shadow-[0_0_20px_rgba(0,255,209,0.2)]'
                      : 'bg-[#121212] border-white/10 hover:border-[#00FFD1]/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center ${isActive ? 'bg-[#00FFD1]' : 'bg-white/10'}`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-black' : 'text-[#00FFD1]'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{service.name}</h3>
                      <p className="text-white/60 text-sm mb-2">{service.description}</p>
                      {service.priceModifier > 0 && (
                        <Badge className="bg-[#00FFD1]/20 text-[#00FFD1] rounded-none">
                          +{formatPrice(service.priceModifier)} on base price
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Character Class Selection */}
      <section className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedClass} onValueChange={setSelectedClass}>
            <TabsList className="bg-[#121212] border border-white/10 p-1 rounded-none w-full max-w-2xl mx-auto grid grid-cols-3">
              {characterClasses.map((charClass) => {
                const Icon = classIcons[charClass.id];
                return (
                  <TabsTrigger
                    key={charClass.id}
                    value={charClass.id}
                    className="rounded-none data-[state=active]:bg-[#00FFD1] data-[state=active]:text-black flex items-center gap-2 py-3"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{charClass.name}</span>
                    <span className="sm:hidden">{charClass.name.slice(0, 3)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Characters Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {characterClasses.find(c => c.id === selectedClass)?.name} Characters
            </h2>
            <p className="text-white/60">
              {selectedServiceType === 'priority-farm' 
                ? 'Base prices shown - You do the farm'
                : `Prices include +${formatPrice(10)} boosting fee - We do the farm for you`
              }
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {currentCharacters.map((character) => {
              const finalPrice = getPrice(character.basePrice);
              return (
                <Card
                  key={character.id}
                  className="bg-[#121212] border-white/10 rounded-none hover:border-[#00FFD1]/50 transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => handleSelectCharacter(character)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="w-full aspect-square mb-3 bg-black/50 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      {character.icon ? (
                        <img 
                          src={character.icon} 
                          alt={character.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full items-center justify-center ${character.icon ? 'hidden' : 'flex'}`}
                        style={{ display: character.icon ? 'none' : 'flex' }}
                      >
                        <span className="text-4xl font-bold text-[#00FFD1]">
                          {character.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">
                      {character.name}
                    </h3>
                    <div className="text-[#00FFD1] font-bold text-lg">
                      {formatPrice(finalPrice)}
                    </div>
                    {selectedServiceType === 'lord-boosting' && (
                      <div className="text-white/40 text-xs mt-1">
                        (base {formatPrice(character.basePrice)} + {formatPrice(10)})
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Methods Info */}
      <section className="py-12 bg-[#121212]/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Payment Methods</h2>
            <p className="text-white/60">We accept the following payment options (prices in USD)</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {paymentMethods.map((method) => {
              const Icon = paymentIcons[method.icon];
              return (
                <a
                  key={method.id}
                  href={method.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-6 bg-[#121212] border border-white/10 hover:border-[#00FFD1]/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-[#00FFD1]/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#00FFD1]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{method.name}</h3>
                    <p className="text-white/40 text-sm">Instant payment</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/40" />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="bg-[#121212] border-white/10 rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Complete Your Order</DialogTitle>
            <DialogDescription className="text-white/60">
              Select your payment method to continue
            </DialogDescription>
          </DialogHeader>
          
          {selectedCharacter && (
            <div className="space-y-6 py-4">
              {/* Character Preview */}
              <div className="flex items-center gap-4 p-4 bg-black/50 border border-white/10">
                <div className="w-20 h-20 bg-black/50 flex items-center justify-center overflow-hidden">
                  {selectedCharacter.icon ? (
                    <img 
                      src={selectedCharacter.icon} 
                      alt={selectedCharacter.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-[#00FFD1]">
                      {selectedCharacter.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#00FFD1]">{selectedCharacter.name}</h3>
                  <p className="text-white/60 capitalize">{selectedClass}</p>
                  <p className="text-white/80">{serviceType?.name}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-black/50 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-[#00FFD1] font-bold text-2xl">
                      {formatPrice(getPrice(selectedCharacter.basePrice))}
                    </span>
                    {currency !== 'USD' && (
                      <p className="text-white/40 text-sm">
                        (${getPrice(selectedCharacter.basePrice)} USD)
                      </p>
                    )}
                  </div>
                </div>
                {selectedServiceType === 'lord-boosting' && (
                  <p className="text-white/40 text-sm text-right mt-1">
                    (base {formatPrice(selectedCharacter.basePrice)} + {formatPrice(10)} boosting)
                  </p>
                )}
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Select Payment Method (USD)</h4>
                {paymentMethods.map((method) => {
                  const Icon = paymentIcons[method.icon];
                  return (
                    <Button
                      key={method.id}
                      onClick={() => handlePayment(method)}
                      disabled={creating}
                      className="w-full bg-white/5 hover:bg-[#00FFD1] hover:text-black text-white border border-white/10 hover:border-[#00FFD1] rounded-none py-6 justify-between disabled:opacity-50"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {method.name}
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  );
                })}
              </div>

              <p className="text-white/40 text-sm text-center">
                After payment, join our Discord and open a ticket with your receipt
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Info */}
      <section className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-[#121212] border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#00FFD1]/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[#00FFD1]" />
                </div>
                <h3 className="text-xl font-semibold text-white">Priority Farm</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  We host the farm setup for you
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  You do the farming work yourself
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  Base prices - no additional fee
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  Instant access after payment
                </li>
              </ul>
            </div>

            <div className="p-8 bg-[#121212] border border-[#00FFD1]/30 shadow-[0_0_30px_rgba(0,255,209,0.1)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#00FFD1] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Lord Boosting</h3>
                  <Badge className="bg-[#00FFD1]/20 text-[#00FFD1] rounded-none mt-1">POPULAR</Badge>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  We do all the farming for you
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  Expert boosters handle everything
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  +{formatPrice(10)} on base price per character
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <Check className="w-5 h-5 text-[#00FFD1] flex-shrink-0 mt-0.5" />
                  24-48 hour completion time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
