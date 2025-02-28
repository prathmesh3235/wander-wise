import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout/Layout';
import HiddenGemCard from '../../components/hidden-gems/HiddenGemCard';
import HiddenGemMap from '../../components/hidden-gems/HiddenGemMap';

export default function HiddenGemsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [filters, setFilters] = useState({
    category: '',
    priceRange: 0,
    crowdLevel: 0,
    verified: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Categories for filtering
  const categories = [
    'All', 'Viewpoint', 'Local Food', 'Beach', 'Park', 
    'Cafe', 'Art', 'Historical', 'Nature', 'Architecture', 
    'Shopping', 'Cultural', 'Other'
  ];

  // Fetch hidden gems with filters
  useEffect(() => {
    const fetchGems = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        
        if (filters.category && filters.category !== 'All') {
          queryParams.append('category', filters.category);
        }
        
        if (filters.priceRange > 0) {
          queryParams.append('priceRange', filters.priceRange);
        }
        
        if (filters.crowdLevel > 0) {
          queryParams.append('crowdLevel', filters.crowdLevel);
        }
        
        if (filters.verified) {
          queryParams.append('verified', 'true');
        }
        
        const response = await fetch(`/api/hidden-gems?${queryParams.toString()}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch hidden gems');
        }
        
        setGems(data.gems || []);
      } catch (error) {
        console.error('Error fetching hidden gems:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGems();
  }, [filters, searchQuery]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    setSearchQuery(searchInput);
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'All' ? '' : category
    }));
  };

  return (
    <Layout title="Hidden Gems | Wander Wise">
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hidden Gems</h1>
              <p className="text-lg text-gray-600">
                Discover unique, off-the-beaten-path locations shared by travelers
              </p>
            </div>
            
            {session && (
              <Link href="/hidden-gems/add" className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-md">
                Share a Hidden Gem
              </Link>
            )}
          </div>
          
          {/* View Toggle and Search */}
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-teal-600' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'map' 
                    ? 'bg-white shadow-sm text-teal-600' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-1 max-w-xl">
              <input
                type="text"
                name="search"
                placeholder="Search hidden gems..."
                className="flex-grow px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                defaultValue={searchQuery}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>
          
          {/* Category Filters */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 py-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    (category === 'All' && !filters.category) || filters.category === category
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {/* Display Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <div>
              {gems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No hidden gems found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                  {session && (
                    <Link href="/hidden-gems/add" className="inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
                      Share Your First Hidden Gem
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gems.map((gem) => (
                    <HiddenGemCard key={gem._id} gem={gem} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[600px] rounded-lg overflow-hidden shadow-md">
              <HiddenGemMap gems={gems} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}