export default async function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    try {
      // This is a mock implementation
      // In a real application, you would use a geocoding API like Google Maps, Mapbox, or OpenStreetMap
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample locations for demo
      const locations = [
        { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
        { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
        { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
        { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
        { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
        { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
        { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
        { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
        { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 }
      ];
      
      // Filter locations based on query
      const results = locations.filter(location => {
        const searchString = `${location.name} ${location.country}`.toLowerCase();
        return searchString.includes(query.toLowerCase());
      });
      
      res.status(200).json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error searching locations:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }