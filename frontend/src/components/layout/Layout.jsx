import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CurrencySelector from '../CurrencySelector';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <CurrencySelector />
    </div>
  );
};

export default Layout;
