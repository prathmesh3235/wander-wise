import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../components/layout/Layout';
import TripForm from '../components/planner/TripForm';

export default function PlanPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [initialDestination, setInitialDestination] = useState(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/plan');
    }
  }, [status, router]);

  // Extract destination from query params if available
  useEffect(() => {
    if (router.query.destination && router.query.lat && router.query.lng) {
      setInitialDestination({
        name: router.query.destination,
        lat: parseFloat(router.query.lat),
        lng: parseFloat(router.query.lng),
        country: router.query.country || ''
      });
    }
  }, [router.query]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <Layout title="Plan Your Trip | Wander Wise">
        <div className="container mx-auto px-4 pt-16 pb-24">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Plan Your Trip | Wander Wise">
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Plan Your Dream Trip</h1>
            <p className="text-lg text-gray-600 mb-8">
              Create a personalized travel plan with smart itinerary suggestions, budget tracking, and local experiences.
            </p>
            
            <TripForm initialDestination={initialDestination} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
