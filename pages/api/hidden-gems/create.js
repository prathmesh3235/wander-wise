import { getSession } from 'next-auth/react';
import dbConnect from '../../../api-lib/db';
import HiddenGem from '../../../models/HiddenGem';

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
    
    const gemData = {
      ...req.body,
      submittedBy: session.user.id
    };
    
    const hiddenGem = await HiddenGem.create(gemData);
    
    // Get the populated hidden gem
    const populatedGem = await HiddenGem.findById(hiddenGem._id)
      .populate('submittedBy', 'name profileImage');
    
    res.status(201).json({
      success: true,
      hiddenGem: populatedGem
    });
  } catch (error) {
    console.error('Error creating hidden gem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}