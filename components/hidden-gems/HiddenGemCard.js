import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function HiddenGemCard({ gem }) {
  const { data: session } = useSession();
  const [upvotes, setUpvotes] = useState(gem.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(gem.hasUpvoted || false);
  const [loading, setLoading] = useState(false);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/signin?callbackUrl=/hidden-gems';
      return;
    }
    
    setLoading(true);
    
    try {
      const endpoint = hasUpvoted 
        ? `/api/hidden-gems/${gem._id}/downvote` 
        : `/api/hidden-gems/${gem._id}/upvote`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        setHasUpvoted(!hasUpvoted);
        setUpvotes(prevUpvotes => hasUpvoted ? prevUpvotes - 1 : prevUpvotes + 1);
      }
    } catch (error) {
      console.error('Error updating upvote:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCrowdLevelText = (level) => {
    switch(level) {
      case 1: return 'Empty';
      case 2: return 'Quiet';
      case 3: return 'Moderate';
      case 4: return 'Busy';
      case 5: return 'Crowded';
      default: return 'Unknown';
    }
  };

  const getPriceLevelText = (level) => {
    switch(level) {
      case 1: return 'Free';
      case 2: return 'Inexpensive';
      case 3: return 'Moderate';
      case 4: return 'Expensive';
      case 5: return 'Very Expensive';
      default: return 'Unknown';
    }
  };

  return (
    <Link href={`/hidden-gems/${gem._id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative">
          <div className="aspect-w-16 aspect-h-9 relative w-full h-48">
            <Image
              src={gem.photos[0] || '/images/gem-placeholder.jpg'}
              alt={gem.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="absolute top-2 right-2 flex space-x-2">
            {gem.isVerified && (
              <div className="px-2 py-1 bg-teal-500 text-white text-xs rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-lg font-medium text-white mb-1">{gem.name}</h3>
            <div className="flex items-center text-white text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{gem.location.name}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-800 px-2 py-1 bg-gray-100 rounded-full">
              {gem.category}
            </span>
            
            <button
              onClick={handleUpvote}
              disabled={loading}
              className={`flex items-center space-x-1 text-sm ${
                hasUpvoted ? 'text-teal-600' : 'text-gray-600 hover:text-teal-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>{upvotes}</span>
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gem.description}</p>
          
          <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{getCrowdLevelText(gem.crowdLevel)}</span>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{getPriceLevelText(gem.priceRange)}</span>
            </div>
            
            {gem.bestTimeToVisit && (
              <div className="flex items-center col-span-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Best time: {gem.bestTimeToVisit}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex items-center">
            <div className="w-6 h-6 rounded-full overflow-hidden relative">
              <Image
                src={gem.submittedByImage || '/images/default-avatar.png'}
                alt={gem.submittedByName}
                fill
                className="object-cover"
              />
            </div>
            <span className="ml-2 text-xs text-gray-600">
              Shared by {gem.submittedByName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
