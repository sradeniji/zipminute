# Last Minute Now - Developer Guide

## Quick Start

### 1. Start the Backend
```bash
cd my-react-app
npm run backend
```

### 2. Start the Frontend (in another terminal)
```bash
cd my-react-app
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Key URLs

### Customer Flow
- **Home**: http://localhost:5173/
- **Search**: http://localhost:5173/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24
- **Slot Details**: http://localhost:5173/slot/slt_mgx74z6a87cs

### Vendor Flow
- **Registration**: http://localhost:5173/vendor/register
- **Dashboard**: http://localhost:5173/vendor/dashboard
- **Services**: http://localhost:5173/vendor/services
- **Reservations**: http://localhost:5173/vendor/reservations

## API Testing

### Test Search
```bash
curl "http://localhost:3001/api/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24&limit=5"
```

### Test Health
```bash
curl "http://localhost:3001/api/health"
```

### Test Backend
```bash
npm run test
```

## File Structure

```
my-react-app/
├── backend/                 # Node.js backend
│   ├── controllers/         # API endpoints
│   ├── store/              # Data layer
│   ├── tests/              # Backend tests
│   └── server.js           # Main server
├── datastore/              # JSON data files
├── src/                    # React frontend
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── context/            # State management
│   ├── utils/              # Utility functions
│   └── router.jsx          # Custom router
└── DOCUMENTATION.md        # Full documentation
```

## Development Tips

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/router.jsx`
3. Update navigation links

### Adding New API Endpoints
1. Create controller in `backend/controllers/`
2. Add route in `backend/router.js`
3. Add test in `backend/tests/`

### State Management
- Use `useStore()` hook for global state
- Local state with `useState()` for component-specific data
- Context provides: search, vendor, notifications

### Data Models
- All models defined in `DOCUMENTATION.md`
- JSON files in `datastore/` directory
- Atomic writes with file locking

## Common Issues

### Backend Not Starting
- Check for ES module errors
- Ensure all imports use `.js` extension
- Verify `__dirname` usage in ES modules

### Frontend Not Loading
- Check if backend is running on port 3001
- Verify API calls in browser network tab
- Check console for JavaScript errors

### Data Not Persisting
- Check file permissions in `datastore/`
- Verify JSON file format
- Check for file locking issues

## Testing

### Run All Tests
```bash
npm run test
```

### Individual Tests
```bash
npm run test:health
npm run test:search
npm run test:bookings
npm run test:vendors
```

### Frontend Testing
- Manual testing through browser
- Check all user flows
- Test error scenarios

## Production Deployment

### Backend
- Set `NODE_ENV=production`
- Use process manager (PM2)
- Configure reverse proxy (nginx)

### Frontend
- Build with `npm run build`
- Serve static files
- Configure API URL

### Database
- Consider migrating to PostgreSQL
- Implement proper authentication
- Add data backup strategy

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Test both frontend and backend
5. Verify data integrity

## Support

- Check `DOCUMENTATION.md` for detailed specs
- Review test files for examples
- Examine existing components for patterns
- Use browser dev tools for debugging
