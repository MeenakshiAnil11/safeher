import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-pink-100 via-white to-lavender-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-pink-600 hover:text-pink-800 transition-colors">
              Women’s Health & Safety
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/features" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              Features
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              Contact
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">
              Login / Register
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-pink-600 focus:outline-none focus:text-pink-600"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 0 1 1.414 1.414l-4.828 4.829 4.828 4.828z"/>
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-lg mt-2">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors font-medium" onClick={toggleMenu}>
                Home
              </Link>
              <Link to="/features" className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors font-medium" onClick={toggleMenu}>
                Features
              </Link>
              <Link to="/about" className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors font-medium" onClick={toggleMenu}>
                About
              </Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors font-medium" onClick={toggleMenu}>
                Contact
              </Link>
              <Link to="/login" className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors font-medium" onClick={toggleMenu}>
                Login / Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
