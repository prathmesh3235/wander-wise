import { getSession } from 'next-auth/react';
import dbConnect from '../../../../../api-lib/db';
import Trip from '../../../../../models/Trip';

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
        { companions: session.user.id }
      ]
    });
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied' });
    }
    
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        expenses: trip.expenses || []
      });
    }
    
    if (req.method === 'POST') {
      const expenseData = {
        ...req.body,
        // Add any additional fields if needed
      };
      
      // Add expense to trip
      trip.expenses.push(expenseData);
      
      // Update total spent in budget
      trip.budget.spent = (trip.budget.spent || 0) + expenseData.amount;
      
      await trip.save();
      
      return res.status(201).json({
        success: true,
        expense: trip.expenses[trip.expenses.length - 1]
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(`Error processing expenses for trip ${id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}