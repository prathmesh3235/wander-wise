import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import Layout from '../../components/layout/Layout';

export default function TripsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/trips');
    }
  }, [status, router]);

  // Fetch user's trips
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchTrips = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/trips');
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch trips');
          }
          
          setTrips(data.trips || []);
        } catch (error) {
          console.error('Error fetching trips:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTrips();
    }
  }, [status]);
   // Filter trips based on date
   const filteredTrips = trips.filter(trip => {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    if (filter === 'upcoming') {
      return startDate > now;
    } else if (filter === 'current') {
      return startDate <= now && endDate >= now;
    } else if (filter === 'past') {
      return endDate < now;
    }
    
    return true; // 'all' filter
  });

  if (status === 'loading') {
    return (
      <Layout title="My Trips | Wander Wise">
        <div className="container mx-auto px-4 pt-16 pb-24">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Trips | Wander Wise">
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <Link href="/plan" className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-md">
              Plan New Trip
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {/* Filter tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              {['all', 'upcoming', 'current', 'past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    filter === tab
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab} Trips
                </button>
              ))}
            </nav>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't planned any trips yet."
                  : filter === 'upcoming'
                  ? "You don't have any upcoming trips planned."
                  : filter === 'current'
                  ? "You don't have any trips in progress."
                  : "You don't have any past trips."}
              </p>
              <Link href="/plan" className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
                Plan Your First Trip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => {
                const startDate = new Date(trip.startDate);
                const endDate = new Date(trip.endDate);
                const now = new Date();
                const isUpcoming = startDate > now;
                const isCurrent = startDate <= now && endDate >= now;
                const isPast = endDate < now;
                
                return (
                  <Link href={`/trips/${trip._id}`} key={trip._id}>
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                      <div className="relative">
                        <div className="h-48 bg-gray-200">
                          <Image
                            src={trip.coverImage || '/images/trip-placeholder.jpg'}
                            alt={trip.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        {isUpcoming && (
                          <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                            Upcoming
                          </div>
                        )}
                        
                        {isCurrent && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            In Progress
                          </div>
                        )}
                        
                        {isPast && (
                          <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                            Completed
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{trip.title}</h3>
                        
                        <div className="flex items-center mb-2 text-gray-600 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{trip.destination.name}</span>
                        </div>
                        
                        <div className="flex items-center mb-4 text-gray-600 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        {trip.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
                        )}
                        
                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: trip.budget.currency || 'USD'
                            }).format(trip.budget.total)}
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
