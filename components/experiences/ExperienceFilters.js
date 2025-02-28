import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ExperienceFilters({ onFilterChange }) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    category: '',
    price: [],
    duration: [],
    rating: 0,
    languages: []
  });
  
  // Available filter options
  const categories = [
    'Food & Drink', 
    'Outdoor Adventures', 
    'City Tours', 
    'Cultural', 
    'Nightlife', 
    'Workshops', 
    'Wellness'
  ];
  
  const durationOptions = [
    { value: '0-2', label: 'Less than 2 hours' },
    { value: '2-4', label: '2-4 hours' },
    { value: '4-8', label: 'Half day (4-8 hours)' },
    { value: '8+', label: 'Full day (8+ hours)' }
  ];
  
  const priceOptions = [
    { value: '0-50', label: 'Budget ($0-$50)' },
    { value: '50-100', label: 'Regular ($50-$100)' },
    { value: '100-200', label: 'Premium ($100-$200)' },
    { value: '200+', label: 'Luxury ($200+)' }
  ];
  
  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 
    'Japanese', 'Chinese', 'Arabic', 'Russian'
  ];

  // Initialize filters from URL query params
  useEffect(() => {
    const queryFilters = {};
    
    if (router.query.category) {
      queryFilters.category = router.query.category;
    }
    
    if (router.query.price) {
      queryFilters.price = Array.isArray(router.query.price) 
        ? router.query.price 
        : [router.query.price];
    }
    
    if (router.query.duration) {
      queryFilters.duration = Array.isArray(router.query.duration) 
        ? router.query.duration 
        : [router.query.duration];
    }
    
    if (router.query.rating) {
      queryFilters.rating = parseInt(router.query.rating);
    }
    
    if (router.query.languages) {
      queryFilters.languages = Array.isArray(router.query.languages) 
        ? router.query.languages 
        : [router.query.languages];
    }
    
    setFilters({...filters, ...queryFilters});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  const handleFilterChange = (key, value) => {
    let newFilters;
    
    // Handle array-based filters (multi-select)
    if (['price', 'duration', 'languages'].includes(key)) {
      if (filters[key].includes(value)) {
        // Remove if already selected
        newFilters = {
          ...filters,
          [key]: filters[key].filter(item => item !== value)
        };
      } else {
        // Add if not selected
        newFilters = {
          ...filters,
          [key]: [...filters[key], value]
        };
      }
    } else {
      // Handle single-value filters
      newFilters = {
        ...filters,
        [key]: value
      };
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Update URL query params
    const query = {...router.query};
    
    if (newFilters[key]?.length === 0 || newFilters[key] === '') {
      delete query[key];
    } else {
      query[key] = newFilters[key];
    }
    
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      price: [],
      duration: [],
      rating: 0,
      languages: []
    };
    
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    
    // Remove all filter query params
    router.push({
      pathname: router.pathname
    }, undefined, { shallow: true });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button 
          onClick={clearFilters}
          className="text-sm text-teal-600 hover:text-teal-800"
        >
          Clear All
        </button>
      </div>
      
      {/* Category Filter */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Category</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange('category', category === filters.category ? '' : category)}
              className={`px-3 py-1 text-sm rounded-full ${
                filters.category === category 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Price Range Filter */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Price Range</h4>
        <div className="space-y-2">
          {priceOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.price.includes(option.value)}
                onChange={() => handleFilterChange('price', option.value)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Duration Filter */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Duration</h4>
        <div className="space-y-2">
          {durationOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.duration.includes(option.value)}
                onChange={() => handleFilterChange('duration', option.value)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Rating Filter */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Minimum Rating</h4>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleFilterChange('rating', rating === filters.rating ? 0 : rating)}
              className="mr-1"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-6 w-6 ${rating <= filters.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-700">
            {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
          </span>
        </div>
      </div>
      
      {/* Languages Filter */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Languages</h4>
        <div className="space-y-2">
          {languageOptions.slice(0, 5).map((language) => (
            <label key={language} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.languages.includes(language)}
                onChange={() => handleFilterChange('languages', language)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{language}</span>
            </label>
          ))}
        </div>
        
        {/* Show/Hide more languages */}
        {languageOptions.length > 5 && (
          <button
            className="mt-2 text-sm text-teal-600 hover:text-teal-800"
            onClick={() => {/* Toggle showing more languages */}}
          >
            Show more
          </button>
        )}
      </div>
    </div>
  );
}