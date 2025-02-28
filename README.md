# Wander Wise - Your Personal Travel Companion

Wander Wise is a full-stack travel application built with Next.js, React, Node.js, and MongoDB. The platform helps travelers plan their trips, discover unique experiences, connect with local guides, find hidden gems, and manage their travel budget.

## Features

### Interactive Trip Planner
- Create customized itineraries with a drag-and-drop interface
- Get smart suggestions based on your travel style and interests
- Manage your day-to-day activities with an intuitive timeline view

### Local Experience Matchmaker
- Browse and book authentic experiences offered by local guides
- Filter by category, duration, price, and language
- Read verified reviews from other travelers

### Hidden Gems Discovery
- Find off-the-beaten-path locations shared by fellow travelers
- Contribute by adding your own discovered secret spots
- View on an interactive map to plan your route

### Smart Budget Tracker
- Set and manage your travel budget
- Track expenses by category with visual analytics
- Split costs with travel companions

### Immersive Travel Journal
- Document your journey with notes and photos
- Pin memories to specific locations
- Share your experiences with the community

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Node.js (built into Next.js API routes)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Map Integration**: Leaflet
- **UI Components**: React Beautiful DnD, Recharts
- **Form Handling**: React Hook Form

## Project Structure

```
wander-wise/
├── api-lib/         # API utilities and database connection
├── components/      # React components
│   ├── budget/      # Budget tracking components
│   ├── experiences/ # Experience marketplace components
│   ├── hidden-gems/ # Hidden gems discovery components
│   ├── journal/     # Travel journal components
│   ├── layout/      # Layout components
│   ├── planner/     # Trip planning components
│   └── ui/          # Reusable UI components
├── models/          # Mongoose schema models
├── pages/           # Next.js pages and API routes
│   ├── api/         # Backend API endpoints
│   ├── auth/        # Authentication pages
│   ├── experiences/ # Experience marketplace pages
│   ├── hidden-gems/ # Hidden gems pages 
│   └── trips/       # Trip planning pages
├── public/          # Static assets
└── styles/          # Global styles
```

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/wander-wise.git
   cd wander-wise
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application can be deployed to platforms like Vercel or Netlify:

### Vercel (Recommended for Next.js)

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Configure the environment variables.
4. Deploy!

## Future Enhancements

- **AI Trip Recommendations**: Personalized trip suggestions based on user preferences
- **Weather Integration**: Real-time weather data for better planning
- **Offline Capabilities**: Access critical information without internet connection
- **Social Features**: Connect with other travelers and share recommendations
- **Mobile App**: Native mobile applications for iOS and Android

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.