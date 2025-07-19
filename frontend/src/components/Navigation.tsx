
import { useState, useEffect, useRef } from "react";
import { BookOpen, Menu, X, User, Search, Heart, Library, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from '@/components/ui/button';
import { jwtDecode, JwtPayload } from "jwt-decode";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const navigate = useNavigate();
  let firstName = null;
  let isLoggedIn = false;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode<{ username?: string } & JwtPayload>(token);
      // Try to get first name from username (assume 'First Last')
      if (decoded && typeof decoded === 'object' && decoded.username) {
        firstName = String(decoded.username).split(" ")[0];
        isLoggedIn = true;
      }
    } catch {}
  }

  let navItems;
  if (isLoggedIn) {
    navItems = [
      { name: "My Library", href: "/library", icon: Library },
      { name: "Search", href: "/catalog", icon: Search },
      { name: "Recommendations", href: "/recommendations", icon: Sparkles },
    ];
  } else {
    navItems = [];
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              BookVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth/User Info */}
          <div className="hidden md:flex items-center space-x-4 text-lg">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors focus:outline-none"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-lg">
                    {firstName ? firstName[0].toUpperCase() : "U"}
                  </span>
                  <span className="text-gray-700 font-semibold text-xl">{firstName}</span>
                  <svg className="w-4 h-4 ml-1 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-t-lg text-lg"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-b-lg text-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-600 hover:text-purple-600 text-xl" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg text-xl" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-purple-600" asChild>
                  <Link to="/login">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
