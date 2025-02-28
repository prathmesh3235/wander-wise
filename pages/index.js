import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/layout/Layout';
import LocationSearch from '../components/planner/LocationSearch';

export default function HomePage() {
  const { data: session } = useSession();
  const [destination, setDestination] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const handleLocationSelect = (location) => {
    setDestination(location);
  };

  const handleStartPlanning = () => {
    if (!destination) {
      setShowSearch(true);
      return;
    }
    
    // Redirect to trip planning page with selected destination
    window.location.href = `/plan?destination=${encodeURIComponent(destination.name)}&lat=${destination.lat}&lng=${destination.lng}&country=${encodeURIComponent(destination.country || '')}`;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-500 to-blue-500 text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Travel Smarter, Experience More
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white">
              Create personalized travel plans, discover hidden gems, and connect with locals for authentic experiences.
            </p>
            
            <div>
              {showSearch ? (
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg">
                  <p className="text-gray-800 font-medium mb-2">Where do you want to go?</p>
                  <LocationSearch onSelect={handleLocationSelect} />
                  
                  {destination && (
                    <div className="mt-3 text-gray-800">
                      <p>Selected: <span className="font-medium">{destination.name}, {destination.country}</span></p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleStartPlanning}
                      className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                      disabled={!destination}
                    >
                      Start Planning
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowSearch(true)}
                    className="px-6 py-3 bg-white text-teal-600 font-medium rounded-lg hover:bg-teal-50 shadow-md"
                  >
                    Plan a Trip
                  </button>
                  
                  <Link href="/experiences" className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10">
                    Browse Experiences
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Smart Travel Planning Made Easy</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Wander Wise helps you plan, organize, and experience travel in a whole new way
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Trip Planner</h3>
                <p className="text-gray-600">
                  Build custom itineraries with our intuitive drag-and-drop interface. Get AI-powered recommendations based on your travel style.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hidden Gems Discovery</h3>
                <p className="text-gray-600">
                  Explore local secrets and off-the-beaten-path destinations shared by travelers and locals who know the area best.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Experience Matchmaking</h3>
                <p className="text-gray-600">
                  Connect with local guides and experience curators for authentic adventures tailored to your interests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Find inspiration for your next adventure
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Tokyo', image: '/images/destinations/tokyo.jpg', count: '2,345 experiences' },
              { name: 'Paris', image: '/images/destinations/paris.jpg', count: '1,872 experiences' },
              { name: 'New York', image: '/images/destinations/new-york.jpg', count: '2,103 experiences' },
              { name: 'Bali', image: '/images/destinations/bali.jpg', count: '1,456 experiences' }
            ].map((destination) => (
              <Link href={`/discover?destination=${destination.name}`} key={destination.name} className="group">
                <div className="relative overflow-hidden rounded-xl shadow-md aspect-w-3 aspect-h-2">
                  <div className="relative h-56 w-full">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{destination.name}</h3>
                    <p className="text-sm">{destination.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Travelers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                avatar: '/images/testimonials/avatar-1.jpg',
                location: 'London, UK',
                quote: 'Wander Wise completely transformed how I plan my trips. The local experiences I found were incredible and made my vacation truly memorable.'
              },
              {
                name: 'Marcus Chen',
                avatar: '/images/testimonials/avatar-2.jpg',
                location: 'Toronto, Canada',
                quote: 'As someone who loves to find hidden gems, this platform is a goldmine. I discovered places I would have never found in guidebooks.'
              },
              {
                name: 'Elena Rodriguez',
                avatar: '/images/testimonials/avatar-3.jpg',
                location: 'Barcelona, Spain',
                quote: 'The budget tracking feature helped me stay on track financially during my 3-month backpacking trip across Southeast Asia.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join Wander Wise today and discover a new way to travel. Plan smarter, experience more, and create memories that last a lifetime.
          </p>
          
          {session ? (
            <Link href="/plan" className="inline-block px-8 py-3 bg-white text-teal-600 font-medium rounded-lg hover:bg-teal-50 shadow-md">
              Plan Your Trip Now
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/register" className="inline-block px-8 py-3 bg-white text-teal-600 font-medium rounded-lg hover:bg-teal-50 shadow-md">
                Sign Up for Free
              </Link>
              <Link href="/auth/signin" className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10">
                Log In
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}