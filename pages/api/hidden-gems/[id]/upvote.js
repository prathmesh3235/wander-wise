import { getSession } from 'next-auth/react';
import dbConnect from '../../../../api-lib/db';
import HiddenGem from '../../../../models/HiddenGem';
import User from '../../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Hidden Gem ID is required' });
  }
  
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    await dbConnect();
    
    // Find the gem
    const gem = await HiddenGem.findById(id);
    
    if (!gem) {
      return res.status(404).json({ message: 'Hidden gem not found' });
    }
    
    // Find the user
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already upvoted
    if (user.upvotedGems && user.upvotedGems.includes(id)) {
      return res.status(400).json({ message: 'Already upvoted this gem' });
    }
    
    // Add to user's upvoted gems
    if (!user.upvotedGems) {
      user.upvotedGems = [];
    }
    
    user.upvotedGems.push(id);
    await user.save();
    
    // Increment gem upvotes
    gem.upvotes = (gem.upvotes || 0) + 1;
    await gem.save();
    
    res.status(200).json({
      success: true,
      upvotes: gem.upvotes
    });
  } catch (error) {
    console.error(`Error upvoting gem ${id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}