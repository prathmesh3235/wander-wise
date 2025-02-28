import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { format } from 'date-fns';

export default function ItineraryBuilder({ trip, onSave }) {
  const [itinerary, setItinerary] = useState(trip.itinerary || []);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate dates array between trip start and end dates
  const getDates = () => {
    const dates = [];
    const currentDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const tripDates = getDates();

  // Initialize empty itinerary if needed
  const ensureItinerary = () => {
    if (itinerary.length === 0) {
      const newItinerary = tripDates.map(date => ({
        date,
        activities: [],
        notes: ''
      }));
      setItinerary(newItinerary);
      return newItinerary;
    }
    return itinerary;
  };

  // Add a new activity to a specific day
  const addActivity = (dayIndex) => {
    setCurrentActivity({
      dayIndex,
      activity: {
        title: '',
        description: '',
        startTime: new Date().setHours(9, 0, 0, 0),
        endTime: new Date().setHours(11, 0, 0, 0),
        cost: 0,
        category: 'sightseeing',
        isBooked: false,
      }
    });
    setIsEditing(true);
  };

  // Edit an existing activity
  const editActivity = (dayIndex, activityIndex) => {
    setCurrentActivity({
      dayIndex,
      activityIndex,
      activity: {...itinerary[dayIndex].activities[activityIndex]}
    });
    setIsEditing(true);
  };

  // Remove an activity
  const removeActivity = (dayIndex, activityIndex) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(newItinerary);
  };

  // Save activity after editing
  const saveActivity = () => {
    if (!currentActivity) return;
    
    const { dayIndex, activityIndex, activity } = currentActivity;
    const newItinerary = [...itinerary];
    
    if (activityIndex !== undefined) {
      // Edit existing activity
      newItinerary[dayIndex].activities[activityIndex] = activity;
    } else {
      // Add new activity
      newItinerary[dayIndex].activities.push(activity);
    }
    
    setItinerary(newItinerary);
    setCurrentActivity(null);
    setIsEditing(false);
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { source, destination } = result;
    
    // Dropped outside the list
    if (!destination) return;
    
    const sourceDay = parseInt(source.droppableId.split('-')[1]);
    const destinationDay = parseInt(destination.droppableId.split('-')[1]);
    
    // Create a copy of the itinerary
    const newItinerary = [...itinerary];
    
    // Get the activity being moved
    const [movedActivity] = newItinerary[sourceDay].activities.splice(source.index, 1);
    
    // Insert the activity at the new position
    newItinerary[destinationDay].activities.splice(destination.index, 0, movedActivity);
    
    setItinerary(newItinerary);
  };

  // Save itinerary changes to the server
  const saveItinerary = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/trips/${trip._id}/itinerary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itinerary }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save itinerary');
      }
      
      onSave && onSave(itinerary);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      // Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  // Ensure itinerary is initialized
  const currentItinerary = ensureItinerary();

  // Activity form in a modal
  const ActivityForm = () => {
    if (!currentActivity) return null;
    
    const { activity } = currentActivity;
    
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setCurrentActivity({
        ...currentActivity,
        activity: {
          ...activity,
          [name]: type === 'checkbox' ? checked : value
        }
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">
            {currentActivity.activityIndex !== undefined ? 'Edit Activity' : 'Add Activity'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={activity.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
              placeholder="Activity name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={activity.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
              placeholder="Brief description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={format(new Date(activity.startTime), 'HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const date = new Date(activity.startTime);
                  date.setHours(parseInt(hours), parseInt(minutes));
                  setCurrentActivity({
                    ...currentActivity,
                    activity: {
                      ...activity,
                      startTime: date.getTime()
                    }
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={format(new Date(activity.endTime), 'HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const date = new Date(activity.endTime);
                  date.setHours(parseInt(hours), parseInt(minutes));
                  setCurrentActivity({
                    ...currentActivity,
                    activity: {
                      ...activity,
                      endTime: date.getTime()
                    }
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Cost
              </label>
              <input
                type="number"
                name="cost"
                value={activity.cost}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              <select
                name="category"
                value={activity.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
              >
                <option value="sightseeing">Sightseeing</option>
                <option value="food">Food & Dining</option>
                <option value="transport">Transportation</option>
                <option value="accommodation">Accommodation</option>
                <option value="activity">Activity</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isBooked"
                checked={activity.isBooked}
                onChange={handleChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Already booked</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setCurrentActivity(null);
                setIsEditing(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveActivity}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Trip Itinerary</h2>
        <button
          onClick={saveItinerary}
          disabled={isSaving}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-8">
          {currentItinerary.map((day, dayIndex) => (
            <div key={dayIndex} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">
                {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
              </h3>
              
              <Droppable droppableId={`day-${dayIndex}`}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-24"
                  >
                    {day.activities.length === 0 ? (
                      <p className="text-gray-500 italic text-center py-4">No activities planned yet</p>
                    ) : (
                      day.activities.map((activity, activityIndex) => (
                        <Draggable
                          key={`activity-${dayIndex}-${activityIndex}`}
                          draggableId={`activity-${dayIndex}-${activityIndex}`}
                          index={activityIndex}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white border rounded-md p-3 shadow-sm hover:shadow transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{activity.title}</h4>
                                  
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {format(new Date(activity.startTime), 'h:mm a')} - {format(new Date(activity.endTime), 'h:mm a')}
                                  </div>
                                  
                                  {activity.description && (
                                    <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                                  )}
                                  
                                  <div className="flex items-center mt-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                      activity.category === 'food' ? 'bg-orange-100 text-orange-800' :
                                      activity.category === 'sightseeing' ? 'bg-blue-100 text-blue-800' :
                                      activity.category === 'transport' ? 'bg-gray-100 text-gray-800' :
                                      activity.category === 'accommodation' ? 'bg-purple-100 text-purple-800' :
                                      activity.category === 'activity' ? 'bg-green-100 text-green-800' :
                                      activity.category === 'shopping' ? 'bg-pink-100 text-pink-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                                    </span>
                                    
                                    {activity.isBooked && (
                                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                                        Booked
                                      </span>
                                    )}
                                    
                                    {activity.cost > 0 && (
                                      <span className="ml-2 text-sm text-gray-600">
                                        {new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: trip.budget.currency || 'USD'
                                        }).format(activity.cost)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => editActivity(dayIndex, activityIndex)}
                                    className="text-gray-500 hover:text-teal-600"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  
                                  <button
                                    onClick={() => removeActivity(dayIndex, activityIndex)}
                                    className="text-gray-500 hover:text-red-600"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              
              <div className="mt-4">
                <textarea
                  placeholder="Day notes..."
                  value={day.notes || ''}
                  onChange={(e) => {
                    const newItinerary = [...itinerary];
                    newItinerary[dayIndex].notes = e.target.value;
                    setItinerary(newItinerary);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 text-sm"
                  rows={2}
                />
              </div>
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => addActivity(dayIndex)}
                  className="inline-flex items-center px-3 py-1.5 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Activity
                </button>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      {isEditing && <ActivityForm />}
    </div>
  );
}
         