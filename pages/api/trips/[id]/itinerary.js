import { getSession } from 'next-auth/react';
import dbConnect from '../../../../api-lib/db';
import Trip from '../../../../models/Trip';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Trip ID is required' });
  }
  
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    await dbConnect();
    
    // Check if trip exists and user is owner
    const trip = await Trip.findOne({
      _id: id,
      owner: session.user.id
    });
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied' });
    }
    
    const { itinerary } = req.body;
    
    if (!itinerary || !Array.isArray(itinerary)) {
      return res.status(400).json({ message: 'Valid itinerary data is required' });
    }
    
    // Update itinerary
    trip.itinerary = itinerary;
    await trip.save();
    
    res.status(200).json({
      success: true,
      itinerary: trip.itinerary
    });
  } catch (error) {
    console.error(`Error updating itinerary for trip ${id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}