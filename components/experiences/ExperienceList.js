import { useState, useEffect } from 'react';
import ExperienceCard from './ExperienceCard';

export default function ExperienceList({ initialExperiences = [], filters = {} }) {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Reset when filters change
    setExperiences(initialExperiences);
    setPage(1);
    setHasMore(true);
  }, [initialExperiences, filters]);

  const loadMoreExperiences = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams({
        page: page + 1,
        limit: 12,
        ...filters
      });
      
      const response = await fetch(`/api/experiences?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.experiences.length === 0) {
          setHasMore(false);
        } else {
          setExperiences(prev => [...prev, ...data.experiences]);
          setPage(page + 1);
        }
      } else {
        console.error('Error fetching experiences:', data.message);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {experiences.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <ExperienceCard key={experience._id} experience={experience} />
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMoreExperiences}
                disabled={loading}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}