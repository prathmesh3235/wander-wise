import { getSession } from 'next-auth/react';
import dbConnect from '../../../api-lib/db';
import Experience from '../../../models/Experience';
import User from '../../../models/User';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Experience ID is required' });
  }
  
  await dbConnect();
  
  if (req.method === 'GET') {
    try {
      const session = await getSession({ req });
      
      // Get experience with guide and reviews data
      const experience = await Experience.findById(id)
        .populate('guide', 'name profileImage bio languages')
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'name profileImage'
          }
        });
      
      if (!experience) {
        return res.status(404).json({ message: 'Experience not found' });
      }
      
      // Check if logged in user has saved this experience
      if (session) {
        const user = await User.findById(session.user.id);
        if (user && user.bookmarks?.experiences?.length > 0) {
          experience._doc.isSaved = user.bookmarks.experiences.includes(experience._id);
        }
      }
      
      return res.status(200).json({
        success: true,
        experience
      });
    } catch (error) {
      console.error(`Error fetching experience ${id}:`, error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // Check if experience exists and user is the guide
    const experience = await Experience.findOne({
      _id: id,
      guide: session.user.id
    });
    
    if (!experience) {
      return res.status(404).json({ 
        message: 'Experience not found or you do not have permission to modify it' 
      });
    }
    
    if (req.method === 'PUT') {
      // Update experience fields
      Object.keys(req.body).forEach(key => {
        experience[key] = req.body[key];
      });
      
      await experience.save();
      
      return res.status(200).json({
        success: true,
        experience
      });
    }
    
    if (req.method === 'DELETE') {
      await Experience.findByIdAndDelete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Experience deleted successfully'
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(`Error processing experience ${id}:`, error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
