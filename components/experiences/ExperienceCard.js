import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function ExperienceCard({ experience }) {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(experience.isSaved || false);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/signin?callbackUrl=/experiences';
      return;
    }
    
    setIsSaving(true);
    
    try {
      const endpoint = isSaved 
        ? `/api/users/bookmarks/remove?type=experience&id=${experience._id}`
        : `/api/users/bookmarks/add?type=experience&id=${experience._id}`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Link href={`/experiences/${experience._id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative">
          <div className="aspect-w-16 aspect-h-9 relative w-full h-48">
            <Image
              src={experience.images[0] || '/images/experience-placeholder.jpg'}
              alt={experience.title}
              fill
              className="object-cover"
            />
          </div>
          
          <button
            disabled={isSaving}
            onClick={handleSaveToggle}
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full z-10 hover:bg-opacity-100"
          >
            {isSaved ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
          
          <div className="absolute bottom-2 left-2">
            <div className="bg-white bg-opacity-90 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: experience.currency || 'USD'
              }).format(experience.price)}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{experience.title}</h3>
          
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">{experience.location.name}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{experience.description}</p>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i}
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ${i < Math.floor(experience.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">
                    {experience.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-600">{experience.reviews.length} reviews</span>
              </div>
              
              <div className="text-sm text-gray-600">
                {experience.duration} {experience.duration === 1 ? 'hour' : 'hours'}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-3">
              {experience.categories.slice(0, 3).map((category, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
              {experience.categories.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-full">
                  +{experience.categories.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}