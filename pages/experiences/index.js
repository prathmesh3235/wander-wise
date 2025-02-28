import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import ExperienceList from '../../components/experiences/ExperienceList';
import ExperienceFilters from '../../components/experiences/ExperienceFilters';

export default function ExperiencesPage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch experiences with filters
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        
        // Add all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v));
            } else {
              queryParams.append(key, value);
            }
          }
        });
        
        const response = await fetch(`/api/experiences?${queryParams.toString()}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch experiences');
        }
        
        setExperiences(data.experiences || []);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperiences();
  }, [filters, searchQuery]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    setSearchQuery(searchInput);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <Layout title="Discover Local Experiences | Wander Wise">
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Local Experiences</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Connect with local guides and find authentic experiences for your next adventure.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                name="search"
                placeholder="Search experiences..."
                className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                defaultValue={searchQuery}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700"
              >
                Search
              </button>
            </form>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <ExperienceFilters onFilterChange={handleFilterChange} />
            </div>
            
            {/* Experiences List */}
            <div className="lg:w-3/4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <ExperienceList initialExperiences={experiences} filters={filters} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
