import { getSession } from 'next-auth/react';
import dbConnect from '../../../api-lib/db';
import HiddenGem from '../../../models/HiddenGem';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();
      
      const { 
        page = 1, 
        limit = 12, 
        category,
        priceRange,
        crowdLevel,
        verified,
        search,
        near,
        radius
      } = req.query;
      
      // Build query
      const query = {};
      
      // Filter by category
      if (category) {
        query.category = category;
      }
      
      // Filter by price range
      if (priceRange) {
        query.priceRange = parseInt(priceRange);
      }
      
      // Filter by crowd level
      if (crowdLevel) {
        query.crowdLevel = parseInt(crowdLevel);
      }
      
      // Filter verified only
      if (verified === 'true') {
        query.isVerified = true;
      }
      
      // Search by name or description
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Filter by location proximity
      if (near && radius) {
        const [lat, lng] = near.split(',').map(coord => parseFloat(coord));
        const radiusInKm = parseInt(radius);
        
        if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusInKm)) {
          query['location.coordinates'] = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: radiusInKm * 1000 // Convert km to meters
            }
          };
        }
      }
      
      // Pagination
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;
      
      // Get total count for pagination
      const total = await HiddenGem.countDocuments(query);
      
      // Get gems with submitter info
      const gems = await HiddenGem.find(query)
        .populate('submittedBy', 'name profileImage')
        .sort({ upvotes: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);
      
      // Add submitter name and image for client convenience
      const enhancedGems = gems.map(gem => {
        const { submittedBy, ...rest } = gem.toObject();
        return {
          ...rest,
          submittedByName: submittedBy?.name || 'Anonymous',
          submittedByImage: submittedBy?.profileImage || '/images/default-avatar.png',
          submittedBy: submittedBy?._id
        };
      });
      
      // Check if user has upvoted any of these gems
      const session = await getSession({ req });
      if (session) {
        const user = await User.findById(session.user.id);
        
        if (user && user.upvotedGems?.length > 0) {
          enhancedGems.forEach(gem => {
            gem.hasUpvoted = user.upvotedGems.includes(gem._id);
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        gems: enhancedGems,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        total
      });
    } catch (error) {
      console.error('Error fetching hidden gems:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}
