import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, Shield, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { siteLogo, discordServer } from '../../data/mock';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, login, logout, isAdmin, isBooster, loading } = useAuth();
  const location = useLocation();

  // Debug log
  console.log('Header auth state:', { isAuthenticated, username: user?.username, loading });

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'FAQ', path: '/faq' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={siteLogo} 
              alt="TRS Logo" 
              className="w-12 h-12 rounded-lg object-cover transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,255,209,0.5)]"
            />
            <span className="text-xl font-semibold text-white tracking-tight hidden sm:block">
              The Rival Syndicate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-lg font-normal transition-colors duration-300 ${
                  isActive(link.path)
                    ? 'text-[#6FD2C0]'
                    : 'text-[#4D4D4D] hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-none">
                    <Avatar className="w-8 h-8 rounded-none">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-[#00FFD1] text-black rounded-none">
                        {user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#121212] border-white/10 rounded-none min-w-[200px]">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 text-white hover:text-[#00FFD1] cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {(isAdmin || isBooster) && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 text-white hover:text-[#00FFD1] cursor-pointer">
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-white hover:text-[#00FFD1] cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={login}
                className="bg-[#00FFD1] text-black hover:bg-transparent hover:text-[#00FFD1] border-2 border-[#00FFD1] rounded-none px-6 py-2 font-medium transition-all duration-300"
              >
                Login with Discord
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 py-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg px-4 py-2 transition-colors duration-300 ${
                    isActive(link.path)
                      ? 'text-[#6FD2C0] bg-white/5'
                      : 'text-[#4D4D4D] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg px-4 py-2 text-[#4D4D4D] hover:text-white flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    My Orders
                  </Link>
                  {(isAdmin || isBooster) && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg px-4 py-2 text-[#4D4D4D] hover:text-white flex items-center gap-2"
                    >
                      <Shield className="w-5 h-5" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-lg px-4 py-2 text-[#4D4D4D] hover:text-white flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={login}
                  className="mx-4 bg-[#00FFD1] text-black py-3 font-medium"
                >
                  Login with Discord
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
