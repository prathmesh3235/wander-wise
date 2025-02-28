import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Category colors
const COLORS = {
  accommodation: '#8884d8',
  food: '#FF8042',
  transportation: '#0088FE',
  activities: '#00C49F',
  shopping: '#FFBB28',
  other: '#FF8042'
};

export default function BudgetSummary({ trip, expenses }) {
  const [summaryData, setSummaryData] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [percentUsed, setPercentUsed] = useState(0);
  
  // Process expenses data for visualization
  useEffect(() => {
    if (!expenses || expenses.length === 0) return;
    
    // Calculate total spent
    const spent = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    setTotalSpent(spent);
    
    // Calculate remaining budget
    const remaining = Math.max(0, trip.budget.total - spent);
    setRemainingBudget(remaining);
    
    // Calculate percent of budget used
    const percent = trip.budget.total > 0 ? (spent / trip.budget.total) * 100 : 0;
    setPercentUsed(percent);
    
    // Group expenses by category
    const categories = {};
    expenses.forEach(expense => {
      const category = expense.category.toLowerCase();
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += expense.amount;
    });
    
    // Convert to array for chart
    const data = Object.keys(categories).map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: categories[category],
      color: COLORS[category] || '#999'
    }));
    
    setSummaryData(data);
  }, [expenses, trip.budget.total]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: trip.budget.currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Budget Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-1">Total Budget</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(trip.budget.total)}
          </p>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-700 mb-1">Spent</h3>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-sm text-blue-600">
            {percentUsed.toFixed(1)}% of budget used
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-medium text-green-700 mb-1">Remaining</h3>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(remainingBudget)}
          </p>
        </div>
      </div>
      
      {summaryData.length > 0 ? (
        <div className="h-80 mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summaryData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {summaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value)} 
                itemStyle={{ color: '#333' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No expense data to visualize</p>
        </div>
      )}
      
      <div className="mt-4">
        <div className="h-4 bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full ${
              percentUsed > 100 ? 'bg-red-500' : 'bg-teal-500'
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-600">0%</span>
          <span className={percentUsed > 100 ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {percentUsed > 100 ? 'Over budget!' : '100%'}
          </span>
        </div>
      </div>
    </div>
  );
}
