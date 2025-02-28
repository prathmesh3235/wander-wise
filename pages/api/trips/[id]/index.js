import { getSession } from 'next-auth/react';
import dbConnect from '../../../../api-lib/db';
import Trip from '../../../../models/Trip';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Trip ID is required' });
  }
  
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  await dbConnect();
  
  try {
    // Check if trip exists and user has access
    const trip = await Trip.findOne({
      _id: id,
      $or: [
        { owner: session.user.id },
        { companions: session.user.id },
        { isPublic: true }
      ]
    });
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied' });
    }
    
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        trip
      });
    }
    
    if (req.method === 'PUT') {
      // Only trip owner can update
      if (trip.owner.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this trip' });
      }
      
      const updatedTrip = await Trip.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json({
        success: true,
        trip: updatedTrip
      });
    }
    
    if (req.method === 'DELETE') {
      // Only trip owner can delete
      if (trip.owner.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this trip' });
      }
      
      await Trip.findByIdAndDelete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Trip deleted successfully'
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(`Error processing trip ${id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}