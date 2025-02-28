import { useState } from 'react';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LocationSearch from './LocationSearch';

export default function TripForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    destination: {
      name: '',
      coordinates: {
        lat: null,
        lng: null
      },
      country: ''
    },
    budget: {
      total: '',
      currency: 'USD'
    },
    travelStyle: 'comfort'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [name]: value
      }
    }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData(prev => ({
      ...prev,
      startDate: start,
      endDate: end || start
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      destination: {
        name: location.name,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        country: location.country
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/trips/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      router.push(`/trips/${data.trip._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Plan Your Trip</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Trip Name
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Summer in Italy"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="A two-week adventure exploring Italian cuisine and culture"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Destination
          </label>
          <LocationSearch onSelect={handleLocationSelect} />
          {formData.destination.name && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {formData.destination.name}, {formData.destination.country}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Travel Dates
          </label>
          <DatePicker
            selected={formData.startDate}
            onChange={handleDateChange}
            startDate={formData.startDate}
            endDate={formData.endDate}
            selectsRange
            minDate={new Date()}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="total" className="block text-gray-700 font-medium mb-2">
              Budget
            </label>
            <input
              type="number"
              id="total"
              name="total"
              value={formData.budget.total}
              onChange={handleBudgetChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="5000"
            />
          </div>
          
          <div>
            <label htmlFor="currency" className="block text-gray-700 font-medium mb-2">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.budget.currency}
              onChange={handleBudgetChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Travel Style
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`border rounded-md p-4 cursor-pointer ${
                formData.travelStyle === 'budget' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, travelStyle: 'budget' }))}
            >
              <h3 className="font-medium">Budget</h3>
              <p className="text-sm text-gray-600">Affordable options, hostels, public transport</p>
            </div>
            
            <div
              className={`border rounded-md p-4 cursor-pointer ${
                formData.travelStyle === 'comfort' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, travelStyle: 'comfort' }))}
            >
              <h3 className="font-medium">Comfort</h3>
              <p className="text-sm text-gray-600">Mid-range hotels, balanced experiences</p>
            </div>
            
            <div
              className={`border rounded-md p-4 cursor-pointer ${
                formData.travelStyle === 'luxury' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, travelStyle: 'luxury' }))}
            >
              <h3 className="font-medium">Luxury</h3>
              <p className="text-sm text-gray-600">Premium accommodations, exclusive experiences</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}