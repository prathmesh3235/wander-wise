import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import LocationSearch from '../planner/LocationSearch';

export default function AddGemForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      name: '',
      coordinates: {
        lat: null,
        lng: null
      },
      address: ''
    },
    category: '',
    photos: [],
    bestTimeToVisit: '',
    crowdLevel: 3,
    priceRange: 2,
    tips: ''
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Categories for hidden gems
  const categories = [
    'Viewpoint', 'Local Food', 'Beach', 'Park', 'Cafe', 'Art', 
    'Historical', 'Nature', 'Architecture', 'Shopping', 'Cultural', 'Other'
  ];

  // Check if user is logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/hidden-gems/add');
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: {
        name: location.name,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        address: location.address || ''
      }
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 photos
    if (files.length + photoFiles.length > 5) {
      setError('You can upload a maximum of 5 photos');
      return;
    }
    
    setError('');
    setPhotoFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removePhoto = (index) => {
    const newPhotoFiles = [...photoFiles];
    const newPhotoPreviewUrls = [...photoPreviewUrls];
    
    newPhotoFiles.splice(index, 1);
    newPhotoPreviewUrls.splice(index, 1);
    
    setPhotoFiles(newPhotoFiles);
    setPhotoPreviewUrls(newPhotoPreviewUrls);
  };

  const goToNextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.name || !formData.description || !formData.location.name || !formData.category) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (step === 2) {
      if (photoFiles.length === 0) {
        setError('Please upload at least one photo');
        return;
      }
    }
    
    setError('');
    setStep(prev => prev + 1);
  };

  const goToPreviousStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate all required fields
    if (!formData.name || !formData.description || !formData.location.name || !formData.category || photoFiles.length === 0) {
      setError('Please fill in all required fields and upload at least one photo');
      setIsLoading(false);
      return;
    }
    
    try {
      // First, upload the photos
      const photoUploadPromises = photoFiles.map(async (file) => {
        const photoFormData = new FormData();
        photoFormData.append('file', file);
        
        const photoResponse = await fetch('/api/upload', {
          method: 'POST',
          body: photoFormData
        });
        
        const photoData = await photoResponse.json();
        
        if (!photoResponse.ok) {
          throw new Error(photoData.message || 'Error uploading photo');
        }
        
        return photoData.url;
      });
      
      const photoUrls = await Promise.all(photoUploadPromises);
      
      // Then, create the hidden gem
      const response = await fetch('/api/hidden-gems/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photos: photoUrls
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error creating hidden gem');
      }
      
      router.push(`/hidden-gems/${data.hiddenGem._id}`);
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Share a Hidden Gem</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-1/3 h-1 rounded-full ${
                s < step ? 'bg-teal-600' : s === step ? 'bg-teal-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Basic Info</span>
          <span>Photos</span>
          <span>Details</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="What do you call this place?"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Tell us what makes this place special..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <LocationSearch onSelect={handleLocationSelect} />
              {formData.location.name && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.location.name}
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`border rounded-md p-3 cursor-pointer text-center ${
                      formData.category === category 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, category }))}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Photos */}
        {step === 2 && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Photos <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Upload photos of this hidden gem. Please add at least one photo, maximum 5.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-w-3 aspect-h-2 rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {photoFiles.length < 5 && (
                  <div className="aspect-w-3 aspect-h-2 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-teal-500 cursor-pointer">
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="mt-2 text-sm text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        multiple
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-500">
                {photoFiles.length === 0 
                  ? 'No photos uploaded yet' 
                  : `${photoFiles.length} ${photoFiles.length === 1 ? 'photo' : 'photos'} uploaded`}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 3: Additional Details */}
        {step === 3 && (
          <div>
            <div className="mb-4">
              <label htmlFor="bestTimeToVisit" className="block text-gray-700 font-medium mb-2">
                Best Time to Visit
              </label>
              <input
                type="text"
                id="bestTimeToVisit"
                name="bestTimeToVisit"
                value={formData.bestTimeToVisit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="E.g., Early morning, Sunset, Spring, Weekdays..."
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="crowdLevel" className="block text-gray-700 font-medium mb-2">
                Crowd Level
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="crowdLevel"
                  name="crowdLevel"
                  min="1"
                  max="5"
                  value={formData.crowdLevel}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-600">
                  {formData.crowdLevel === 1 && 'Empty'}
                  {formData.crowdLevel === 2 && 'Few People'}
                  {formData.crowdLevel === 3 && 'Moderate'}
                  {formData.crowdLevel === 4 && 'Busy'}
                  {formData.crowdLevel === 5 && 'Very Crowded'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="priceRange" className="block text-gray-700 font-medium mb-2">
                Price Range
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="priceRange"
                  name="priceRange"
                  min="1"
                  max="5"
                  value={formData.priceRange}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-600">
                  {formData.priceRange === 1 && 'Free'}
                  {formData.priceRange === 2 && 'Inexpensive'}
                  {formData.priceRange === 3 && 'Moderate'}
                  {formData.priceRange === 4 && 'Expensive'}
                  {formData.priceRange === 5 && 'Very Expensive'}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="tips" className="block text-gray-700 font-medium mb-2">
                Tips for Visitors
              </label>
              <textarea
                id="tips"
                name="tips"
                value={formData.tips}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Any special advice for people visiting this place? (e.g., parking tips, best features, what to bring...)"
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Share Hidden Gem'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}