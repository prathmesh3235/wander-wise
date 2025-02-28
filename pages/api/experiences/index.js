import { getSession } from 'next-auth/react';
import dbConnect from '../../../api-lib/db';
import Experience from '../../../models/Experience';
import User from '../../../models/User';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (req.method === 'GET') {
    try {
      await dbConnect();
      
      const { 
        page = 1, 
        limit = 12, 
        category, 
        price,
        duration,
        rating,
        languages,
        search
      } = req.query;
      
      // Build query
      const query = {};
      
      // Filter by category
      if (category) {
        query.categories = category;
      }
      
      // Filter by price range
      if (price) {
        const priceRanges = Array.isArray(price) ? price : [price];
        const priceQuery = [];
        
        priceRanges.forEach(range => {
          if (range === '0-50') {
            priceQuery.push({ price: { $gte: 0, $lte: 50 } });
          } else if (range === '50-100') {
            priceQuery.push({ price: { $gt: 50, $lte: 100 } });
          } else if (range === '100-200') {
            priceQuery.push({ price: { $gt: 100, $lte: 200 } });
          } else if (range === '200+') {
            priceQuery.push({ price: { $gt: 200 } });
          }
        });
        
        if (priceQuery.length > 0) {
          query.$or = priceQuery;
        }
      }
      
      // Filter by duration
      if (duration) {
        const durationRanges = Array.isArray(duration) ? duration : [duration];
        const durationQuery = [];
        
        durationRanges.forEach(range => {
          if (range === '0-2') {
            durationQuery.push({ duration: { $gte: 0, $lte: 2 } });
          } else if (range === '2-4') {
            durationQuery.push({ duration: { $gt: 2, $lte: 4 } });
          } else if (range === '4-8') {
            durationQuery.push({ duration: { $gt: 4, $lte: 8 } });
          } else if (range === '8+') {
            durationQuery.push({ duration: { $gt: 8 } });
          }
        });
        
        if (durationQuery.length > 0) {
          query.$or = query.$or ? [...query.$or, ...durationQuery] : durationQuery;
        }
      }
      
      // Filter by minimum rating
      if (rating) {
        query.averageRating = { $gte: parseInt(rating) };
      }
      
      // Filter by languages
      if (languages) {
        query.languages = Array.isArray(languages) ? { $in: languages } : languages;
      }
      
      // Search by title or description
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Only show active experiences
      query.isActive = true;
      
      // Pagination
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;
      
      // Get total count for pagination
      const total = await Experience.countDocuments(query);
      
      // Get experiences
      const experiences = await Experience.find(query)
        .populate('guide', 'name profileImage')
        .sort({ averageRating: -1 })
        .skip(skip)
        .limit(limitNumber);
      
      // If user is logged in, check if they have saved any of these experiences
      if (session) {
        const user = await User.findById(session.user.id);
        
        if (user && user.bookmarks?.experiences?.length > 0) {
          experiences.forEach(exp => {
            exp._doc.isSaved = user.bookmarks.experiences.includes(exp._id);
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        experiences,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        total
      });
    } catch (error) {
      console.error('Error fetching experiences:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  // Create a new experience (requires authentication)
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      await dbConnect();
      
      // Check if user is registered as a guide
      const user = await User.findById(session.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!user.isGuide) {
        return res.status(403).json({ 
          message: 'Only registered guides can create experiences',
          guideRegistrationRequired: true
        });
      }
      
      const experienceData = {
        ...req.body,
        guide: session.user.id
      };
      
      const experience = await Experience.create(experienceData);
      
      return res.status(201).json({
        success: true,
        experience
      });
    } catch (error) {
      console.error('Error creating experience:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}
