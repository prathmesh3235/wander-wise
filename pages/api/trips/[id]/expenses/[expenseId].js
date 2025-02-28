import { getSession } from 'next-auth/react';
import dbConnect from '../../../../../api-lib/db';
import Trip from '../../../../../models/Trip';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id, expenseId } = req.query;
  
  if (!id || !expenseId) {
    return res.status(400).json({ message: 'Trip ID and Expense ID are required' });
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
    
    // Find the expense
    const expense = trip.expenses.id(expenseId);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    if (req.method === 'PUT') {
      // Update expense
      Object.keys(req.body).forEach(key => {
        expense[key] = req.body[key];
      });
      
      // Update budget spent amount
      trip.budget.spent = trip.expenses.reduce((total, exp) => total + exp.amount, 0);
      
      await trip.save();
      
      return res.status(200).json({
        success: true,
        expense
      });
    }
    
    if (req.method === 'DELETE') {
      // Remove expense and update budget
      const deletedAmount = expense.amount;
      trip.expenses.pull(expenseId);
      trip.budget.spent = (trip.budget.spent || 0) - deletedAmount;
      
      await trip.save();
      
      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully'
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(`Error processing expense ${expenseId} for trip ${id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}