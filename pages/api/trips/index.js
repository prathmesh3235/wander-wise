import { getSession } from 'next-auth/react';
import dbConnect from '../../../api-lib/db';
import Trip from '../../../models/Trip';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    await dbConnect();
    
    // Get trips where user is owner or companion
    const trips = await Trip.find({
      $or: [
        { owner: session.user.id },
        { companions: session.user.id }
      ]
    }).sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      trips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}