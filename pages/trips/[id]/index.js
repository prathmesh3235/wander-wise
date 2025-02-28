import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format, differenceInDays, addDays } from 'date-fns';
import Layout from '../../../components/layout/Layout';
import ItineraryBuilder from '../../../components/planner/ItineraryBuilder';

export default function TripDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('itinerary');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/trips');
    }
  }, [status, router]);

  // Fetch trip details
  useEffect(() => {
    if (id && status === 'authenticated') {
      const fetchTrip = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/trips/${id}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch trip');
          }
          
          setTrip(data.trip);
        } catch (error) {
          console.error('Error fetching trip:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTrip();
    }
  }, [id, status]);

  // Update itinerary
  const handleItineraryUpdate = (updatedItinerary) => {
    setTrip(prev => ({
      ...prev,
      itinerary: updatedItinerary
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <Layout title="Trip Details | Wander Wise">
        <div className="container mx-auto px-4 pt-16 pb-24">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Trip Details | Wander Wise">
        <div className="container mx-auto px-4 pt-16 pb-24">
          <div className="bg-red-100 text-red-700 p-4 rounded-md max-w-3xl mx-auto">
            <p>{error}</p>
            <button
              onClick={() => router.push('/trips')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Return to My Trips
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout title="Trip Details | Wander Wise">
        <div className="container mx-auto px-4 pt-16 pb-24">
          <div className="text-center">
            <p className="text-gray-600">Trip not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const durationDays = differenceInDays(endDate, startDate) + 1;
  const now = new Date();
  const isUpcoming = startDate > now;
  const isCurrent = startDate <= now && endDate >= now;
  const isPast = endDate < now;

  return (
    <Layout title={`${trip.title} | Wander Wise`}>
      {/* Trip Header */}
      <div className="relative h-64 md:h-96 bg-gray-200">
        <Image
          src={trip.coverImage || '/images/trip-placeholder.jpg'}
          alt={trip.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{trip.title}</h1>
            <div className="flex flex-wrap items-center text-sm md:text-base">
              <div className="flex items-center mr-6 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{trip.destination.name}</span>
              </div>
              
              <div className="flex items-center mr-6 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{durationDays} {durationDays === 1 ? 'day' : 'days'}</span>
              </div>
              
              {(isUpcoming || isCurrent || isPast) && (
                <div className={`ml-auto rounded-full px-3 py-1 text-sm ${
                  isUpcoming ? 'bg-teal-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {isUpcoming ? 'Upcoming' : isCurrent ? 'In Progress' : 'Completed'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Trip Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {['itinerary', 'budget', 'info', 'journal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'info' ? 'Trip Info' : tab}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div>
          {activeTab === 'itinerary' && (
            <ItineraryBuilder trip={trip} onSave={handleItineraryUpdate} />
          )}
          
          {activeTab === 'budget' && (
            <div>
              {/* Budget content will be implemented later */}
              <p>Budget tracking features coming soon...</p>
            </div>
          )}
          
          {activeTab === 'info' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Trip Details</h2>
              
              {trip.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{trip.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Destination</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-800 font-medium">{trip.destination.name}</p>
                    {trip.destination.country && (
                      <p className="text-gray-600">{trip.destination.country}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Dates</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <span className="text-gray-600 w-20">From:</span>
                      <span className="text-gray-800 font-medium">{format(startDate, 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-20">To:</span>
                      <span className="text-gray-800 font-medium">{format(endDate, 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Budget</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <span className="text-gray-600 w-20">Total:</span>
                      <span className="text-gray-800 font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: trip.budget.currency || 'USD'
                        }).format(trip.budget.total)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-20">Per day:</span>
                      <span className="text-gray-800 font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: trip.budget.currency || 'USD'
                        }).format(trip.budget.total / durationDays)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Travel Style</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-800 font-medium capitalize">{trip.travelStyle || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => router.push(`/trips/${id}/edit`)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Edit Trip Details
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'journal' && (
            <div>
              {/* Journal content will be implemented later */}
              <p>Travel journal features coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}