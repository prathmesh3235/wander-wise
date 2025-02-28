import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Header() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-teal-600">Wander Wise</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/discover" className="text-gray-700 hover:text-teal-600 transition-colors">
            Discover
          </Link>
          <Link href="/experiences" className="text-gray-700 hover:text-teal-600 transition-colors">
            Experiences
          </Link>
          <Link href="/plan" className="text-gray-700 hover:text-teal-600 transition-colors">
            Plan a Trip
          </Link>
          <Link href="/hidden-gems" className="text-gray-700 hover:text-teal-600 transition-colors">
            Hidden Gems
          </Link>
          
          {session ? (
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image 
                    src={session.user.image || '/images/default-avatar.png'} 
                    alt={session.user.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/trips" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Trips
                  </Link>
                  <Link href="/bookmarks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Saved Places
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="px-4 py-2 rounded-md border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden bg-white shadow-md py-4 px-4">
          <Link href="/discover" className="block py-2 text-gray-700">
            Discover
          </Link>
          <Link href="/experiences" className="block py-2 text-gray-700">
            Experiences
          </Link>
          <Link href="/plan" className="block py-2 text-gray-700">
            Plan a Trip
          </Link>
          <Link href="/hidden-gems" className="block py-2 text-gray-700">
            Hidden Gems
          </Link>
          
          {session ? (
            <>
              <Link href="/profile" className="block py-2 text-gray-700">
                Profile
              </Link>
              <Link href="/trips" className="block py-2 text-gray-700">
                My Trips
              </Link>
              <Link href="/bookmarks" className="block py-2 text-gray-700">
                Saved Places
              </Link>
              <button
                onClick={() => signOut()}
                className="block w-full text-left py-2 text-gray-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col mt-4 space-y-2">
              <Link href="/auth/signin" className="px-4 py-2 rounded-md border border-teal-600 text-teal-600 text-center">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-4 py-2 rounded-md bg-teal-600 text-white text-center">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}