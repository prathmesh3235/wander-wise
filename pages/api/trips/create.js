import { getSession } from 'next-auth/react';
import dbConnect from '../../../api-lib/db';
import Trip from '../../../models/Trip';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    await dbConnect();
    
    const tripData = {
      ...req.body,
      owner: session.user.id
    };
    
    const trip = await Trip.create(tripData);
    
    res.status(201).json({
      success: true,
      trip
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}