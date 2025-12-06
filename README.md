# Last Minute Now

**A pure React + Node.js booking platform for last-minute service appointments**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone and setup
git clone <repository>
cd my-react-app

# Install dependencies
npm install

# Start backend (Terminal 1)
npm run backend

# Start frontend (Terminal 2) 
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📋 Features

### Customer Features
- 🔍 **Smart Search**: Find services by location, time, and category
- 📍 **GPS Integration**: Automatic location detection
- ⏰ **Time Windows**: Search within 2 hours, 24 hours, or 3 days
- 🎯 **Real-time Results**: Live availability and pricing
- 📱 **Mobile Responsive**: Works on all devices
- 💳 **Easy Booking**: Simple 2-step booking process
- ⏳ **Hold System**: 10-minute hold with countdown timer

### Vendor Features
- 🏪 **Vendor Registration**: Easy business onboarding
- 📊 **Dashboard**: Real-time metrics and analytics
- 🛠️ **Service Management**: Add, edit, and manage services
- 📅 **Slot Management**: Create and manage time slots
- 📋 **Reservation Tracking**: View all customer bookings
- 💰 **Revenue Analytics**: Track earnings and utilization

## 🏗️ Architecture

### Frontend (Pure React)
- **Framework**: React 19 with JSX
- **Routing**: Custom client-side router
- **State**: React Context API
- **Styling**: Pure CSS (no external libraries)
- **Build**: Vite for fast development

### Backend (Node.js Built-ins)
- **Runtime**: Node.js with ES modules
- **Server**: Native `http` module
- **Storage**: JSON file-based datastore
- **Modules**: `fs`, `url`, `path`, `crypto`, `timers`
- **No Dependencies**: Pure Node.js implementation

### Data Layer
- **Format**: JSON files with atomic writes
- **Indexing**: In-memory indexes for performance
- **Locking**: File-based concurrency control
- **Backup**: Automatic data snapshots

## 📁 Project Structure

```
my-react-app/
├── backend/                 # Node.js backend
│   ├── controllers/         # API endpoint handlers
│   ├── store/              # Data access layer
│   ├── tests/              # Backend test suite
│   └── server.js           # Main server file
├── datastore/              # JSON data files
│   ├── users.json          # User accounts
│   ├── vendors.json        # Business profiles
│   ├── services.json       # Service offerings
│   ├── slots.json          # Available time slots
│   ├── bookings.json       # Customer bookings
│   └── reviews.json        # Customer reviews
├── src/                    # React frontend
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Landing page
│   │   ├── Search.jsx       # Search results
│   │   ├── Slot.jsx        # Booking page
│   │   └── vendor/         # Vendor pages
│   ├── context/            # Global state management
│   ├── utils/              # Utility functions
│   └── router.jsx          # Custom routing
├── DOCUMENTATION.md         # Complete technical docs
├── DEVELOPER_GUIDE.md      # Developer quick reference
└── README.md               # This file
```

## 🎯 User Flows

### Customer Journey
1. **Discover**: Visit homepage, enter location
2. **Search**: Browse available services by category/time
3. **Select**: View service details and pricing
4. **Book**: Fill form, hold slot for 10 minutes
5. **Confirm**: Complete booking with confirmation

### Vendor Journey
1. **Register**: Create business profile
2. **Setup**: Add services and locations
3. **Manage**: Create time slots and pricing
4. **Track**: Monitor bookings and revenue
5. **Grow**: Optimize based on analytics

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
npm run test

# Individual test suites
npm run test:health      # Health endpoint
npm run test:search      # Search functionality  
npm run test:bookings    # Booking system
npm run test:vendors     # Vendor endpoints
```

### Frontend Testing
- Manual testing through browser
- All user flows verified
- Error scenarios tested
- Mobile responsiveness checked

## 📊 Sample Data

The platform includes comprehensive synthetic data:

- **50+ Vendors** across 3 Canadian cities
- **200+ Services** in 6 categories
- **1000+ Time Slots** for next 30 days
- **500+ Bookings** with realistic distribution
- **100+ Reviews** with ratings and comments

## 🔧 Configuration

### Environment Variables
```bash
# Backend
PORT=3001
NODE_ENV=development

# Frontend  
VITE_API_URL=http://localhost:3001
```

### API Endpoints
- `GET /api/search` - Search for services
- `GET /api/slots/:id` - Get slot details
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id` - Confirm booking
- `GET /api/vendors/me/services` - Vendor services
- `POST /api/vendors/me/services` - Create service

## 🚀 Deployment

### Development
```bash
npm run dev          # Frontend dev server
npm run backend      # Backend server
```

### Production
```bash
npm run build        # Build frontend
npm start           # Start backend
```

### Docker (Optional)
```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]

# Frontend  
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow existing patterns
4. Add tests for new features
5. Update documentation
6. Submit pull request

## 📚 Documentation

- **[Complete Documentation](DOCUMENTATION.md)** - Technical specifications
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Quick reference
- **API Documentation** - Endpoint specifications
- **Data Models** - Entity relationships
- **Test Coverage** - Test scenarios

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check Node.js version (18+)
- Verify ES module syntax
- Check for import/export errors

**Frontend not loading**
- Ensure backend is running
- Check API URL configuration
- Verify CORS settings

**Data not persisting**
- Check file permissions
- Verify JSON format
- Check for file locks

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with pure React and Node.js
- No external dependencies beyond core libraries
- Designed for simplicity and performance
- Production-ready architecture

---

**Ready to book your next service? Start exploring at http://localhost:5173**