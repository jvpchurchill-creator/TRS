import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Currency symbols and names
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

const CurrencySelector = () => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'USD';
  });

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: newCurrency }));
  };

  // Listen for currency changes from other components
  useEffect(() => {
    const handleExternalChange = (e) => {
      setCurrency(e.detail);
    };
    window.addEventListener('currencyChange', handleExternalChange);
    return () => window.removeEventListener('currencyChange', handleExternalChange);
  }, []);

  const currentCurrencyData = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-[#121212] border-[#00FFD1]/50 text-white hover:bg-[#00FFD1] hover:text-black hover:border-[#00FFD1] rounded-none px-4 py-2 shadow-lg"
          >
            <span className="mr-2">{currentCurrencyData.symbol}</span>
            {currency}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#121212] border-white/10 rounded-none max-h-[300px] overflow-y-auto">
          {CURRENCIES.map((curr) => (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              className={`cursor-pointer ${currency === curr.code ? 'bg-[#00FFD1]/20 text-[#00FFD1]' : 'text-white hover:bg-white/10'}`}
            >
              <span className="w-8">{curr.symbol}</span>
              <span className="flex-1">{curr.code}</span>
              <span className="text-white/40 text-sm">{curr.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CurrencySelector;
