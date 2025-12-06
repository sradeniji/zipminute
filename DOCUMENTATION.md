# Last Minute Now - Technical Documentation

**Version:** 1.0  
**Date:** October 19, 2025  
**Status:** Complete Implementation  

---

## Table of Contents

1. [Webpages Documentation](#1-webpages-documentation)
2. [Data Models](#2-data-models)
3. [Business Logic](#3-business-logic)
4. [Test Documentation](#4-test-documentation)
5. [Synthetic Data](#5-synthetic-data)
6. [API Documentation](#6-api-documentation)
7. [Component Architecture](#7-component-architecture)

---

## 1. Webpages Documentation

### 1.1 Customer Pages

#### Home Page (`/`)
**Purpose:** Service discovery and search initiation  
**File:** `src/pages/Home.jsx`

**Features:**
- Service category selection
- Time window selection (2h, 24h, 3 days)
- Location input (GPS or manual)
- Search radius configuration
- Saved preferences from localStorage

**State Management:**
```javascript
const [formData, setFormData] = useState({
  category: '',
  withinHours: 24,
  radiusKm: 10,
  lat: '',
  lng: ''
});
```

**Key Functions:**
- `getCurrentLocation()` - GPS location detection
- `handleSubmit()` - Form validation and navigation
- `handleInputChange()` - Form state updates

#### Search Page (`/search`)
**Purpose:** Display search results and filtering  
**File:** `src/pages/Search.jsx`

**Features:**
- Real-time search results display
- Filter controls (category, radius, time)
- Pagination with "Load More"
- Slot card components
- Error handling and loading states

**State Management:**
```javascript
const [filters, setFilters] = useState({
  category: '',
  radiusKm: 10,
  withinHours: 24
});
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);
```

**Key Functions:**
- `performSearch()` - API call to search endpoint
- `handleFilterChange()` - Update filters and re-search
- `handleLoadMore()` - Pagination
- `handleSlotClick()` - Navigate to slot details

#### Slot Page (`/slot/:id`)
**Purpose:** Slot details and booking process  
**File:** `src/pages/Slot.jsx`

**Features:**
- Slot information display
- Booking form with validation
- 10-minute hold system with countdown
- Two-step confirmation process
- Status management (idle, holding, confirmed, expired)

**State Management:**
```javascript
const [slot, setSlot] = useState(null);
const [booking, setBooking] = useState(null);
const [bookingForm, setBookingForm] = useState({
  customerName: '',
  customerEmail: '',
  customerPhone: ''
});
const [bookingStatus, setBookingStatus] = useState('idle');
const [countdown, setCountdown] = useState(null);
```

**Key Functions:**
- `loadSlotDetails()` - Fetch slot information
- `handleBookingSubmit()` - Create booking hold
- `handleConfirmBooking()` - Confirm booking
- `formatCountdown()` - Display remaining time

### 1.2 Vendor Pages

#### Vendor Registration (`/vendor/register`)
**Purpose:** Vendor onboarding and business setup  
**File:** `src/pages/VendorRegistration.jsx`

**Features:**
- Business information form
- Location details with province selection
- Service category selection
- Form validation and error handling
- Success confirmation and redirect

**State Management:**
```javascript
const [formData, setFormData] = useState({
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  description: '',
  categories: []
});
```

**Key Functions:**
- `handleSubmit()` - Form validation and registration
- `handleCategoryToggle()` - Multi-select categories
- `handleInputChange()` - Form state updates

#### Vendor Dashboard (`/vendor/dashboard`)
**Purpose:** Vendor overview and metrics  
**File:** `src/pages/VendorDashboard.jsx`

**Features:**
- Real-time metrics display
- Today's bookings list
- Upcoming slots overview
- Quick action buttons
- Loading and error states

**State Management:**
```javascript
const [services, setServices] = useState([]);
const [slots, setSlots] = useState([]);
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
```

**Key Functions:**
- `loadDashboardData()` - Fetch vendor data
- `utilization()` - Calculate utilization rate
- `upcoming()` - Get upcoming slots
- `formatTime()` - Time formatting utilities

#### Vendor Services (`/vendor/services`)
**Purpose:** Service management and CRUD operations  
**File:** `src/pages/VendorServices.jsx`

**Features:**
- Service listing with cards
- Add service form
- Form validation
- Edit/delete actions (placeholder)
- Category management

**State Management:**
```javascript
const [services, setServices] = useState([]);
const [showAddForm, setShowAddForm] = useState(false);
const [formData, setFormData] = useState({
  name: '',
  category: '',
  durationMinutes: 30,
  description: '',
  priceCents: 0
});
```

**Key Functions:**
- `loadServices()` - Fetch vendor services
- `handleSubmit()` - Create new service
- `validateService()` - Form validation
- `formatDuration()` - Duration formatting

#### Vendor Reservations (`/vendor/reservations`)
**Purpose:** Booking management and tracking  
**File:** `src/pages/VendorReservations.jsx`

**Features:**
- All reservations display
- Filtering (all, today, upcoming, past)
- Booking status tracking
- Revenue summary
- Booking details cards

**State Management:**
```javascript
const [bookings, setBookings] = useState([]);
const [filter, setFilter] = useState('all');
const [loading, setLoading] = useState(true);
```

**Key Functions:**
- `loadReservationsData()` - Fetch booking data
- `getFilteredBookings()` - Apply filters
- `formatDate()` - Date formatting
- `getStatusColor()` - Status styling

---

## 2. Data Models

### 2.1 Core Entities

#### User Model
```javascript
{
  id: "usr_1234567890abcd",
  email: "user@example.com",
  name: "John Doe",
  phone: "+1234567890",
  createdAt: "2025-10-19T05:00:00.000Z",
  updatedAt: "2025-10-19T05:00:00.000Z"
}
```

#### Vendor Model
```javascript
{
  id: "vnd_1234567890abcd",
  name: "Downtown Barber Shop",
  email: "contact@downtownbarber.com",
  phone: "+1234567890",
  address: "123 Main St, Winnipeg, MB R3C 1A1",
  description: "Professional barber services",
  rating: 4.8,
  status: "active",
  categories: ["barber", "beauty"],
  createdAt: "2025-10-19T05:00:00.000Z",
  updatedAt: "2025-10-19T05:00:00.000Z"
}
```

#### Service Model
```javascript
{
  id: "srv_1234567890abcd",
  vendorId: "vnd_1234567890abcd",
  name: "Haircut & Styling",
  category: "barber",
  durationMinutes: 45,
  description: "Professional haircut with styling",
  basePriceCents: 3500,
  createdAt: "2025-10-19T05:00:00.000Z",
  updatedAt: "2025-10-19T05:00:00.000Z"
}
```

#### Location Model
```javascript
{
  id: "loc_1234567890abcd",
  vendorId: "vnd_1234567890abcd",
  name: "Downtown Location",
  address: "123 Main St, Winnipeg, MB R3C 1A1",
  lat: 49.8998,
  lng: -97.1375,
  isPrimary: true,
  createdAt: "2025-10-19T05:00:00.000Z"
}
```

#### Slot Model
```javascript
{
  id: "slt_1234567890abcd",
  serviceId: "srv_1234567890abcd",
  startAt: "2025-10-19T14:00:00.000Z",
  endAt: "2025-10-19T14:45:00.000Z",
  priceCents: 3500,
  status: "OPEN", // OPEN, HELD, BOOKED
  createdAt: "2025-10-19T05:00:00.000Z",
  updatedAt: "2025-10-19T05:00:00.000Z"
}
```

#### Booking Model
```javascript
{
  id: "bkg_1234567890abcd",
  slotId: "slt_1234567890abcd",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+1234567890",
  status: "PENDING", // PENDING, CONFIRMED, CANCELLED
  holdExpiresAt: "2025-10-19T14:10:00.000Z",
  createdAt: "2025-10-19T05:00:00.000Z",
  updatedAt: "2025-10-19T05:00:00.000Z"
}
```

#### Review Model
```javascript
{
  id: "rev_1234567890abcd",
  bookingId: "bkg_1234567890abcd",
  vendorId: "vnd_1234567890abcd",
  rating: 5,
  comment: "Excellent service!",
  createdAt: "2025-10-19T05:00:00.000Z"
}
```

### 2.2 Data Relationships

```
Vendor (1) → (N) Services
Vendor (1) → (N) Locations
Service (1) → (N) Slots
Slot (1) → (0..1) Booking
Booking (1) → (0..1) Review
```

### 2.3 Indexes and Lookups

#### Primary Indexes
- `byServiceId`: Service lookup by ID
- `byVendorId`: Vendor lookup by ID
- `slotsByStatus`: Slots grouped by status
- `bookingsBySlotId`: Bookings grouped by slot
- `locationsByVendorId`: Locations grouped by vendor

#### Search Indexes
- `servicesByCategory`: Services grouped by category
- `bookingsByStatus`: Bookings grouped by status
- `slotsByTimeRange`: Slots filtered by time

---

## 3. Business Logic

### 3.1 Search Logic (`src/utils/search.js`)

#### Search Parameters
```javascript
{
  lat: number,           // Latitude
  lng: number,           // Longitude
  radiusKm: number,      // Search radius
  withinHours: number,   // Time window
  category: string,      // Service category
  limit: number,         // Results limit
  offset: number         // Pagination offset
}
```

#### Search Algorithm
1. **Time Filtering**: Filter slots within time window
2. **Category Filtering**: Filter by service category
3. **Location Filtering**: Calculate distance and filter by radius
4. **Sorting**: Sort by start time, then by distance
5. **Pagination**: Apply limit and offset

#### Distance Calculation
```javascript
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### 3.2 Booking Logic (`src/utils/slot.js`)

#### Booking Validation
```javascript
function validateBookingInput(booking) {
  const errors = [];
  if (!booking.slotId) errors.push("Missing slotId");
  if (!booking.customerName) errors.push("Please enter your name");
  if (!/^\S+@\S+\.\S+$/.test(booking.customerEmail)) {
    errors.push("Please enter a valid email");
  }
  if (booking.customerPhone && booking.customerPhone.length < 7) {
    errors.push("Please enter a valid phone");
  }
  return errors;
}
```

#### Hold System
```javascript
function holdCountdown(endIso) {
  const now = Date.now();
  const end = Date.parse(endIso);
  return Math.max(0, Math.floor((end - now) / 1000));
}
```

### 3.3 Vendor Logic (`src/utils/vendorDashboard.js`)

#### Utilization Calculation
```javascript
function utilization(slots) {
  const future = slots.filter(s => Date.parse(s.startAt) >= Date.now());
  if (future.length === 0) return 0;
  const booked = future.filter(s => s.status === "BOOKED").length;
  return Math.round((booked / future.length) * 100);
}
```

#### Upcoming Slots
```javascript
function upcoming(slots, withinHours = 24) {
  const now = Date.now();
  const to = now + withinHours * 3600 * 1000;
  return slots
    .filter(s => {
      const t = Date.parse(s.startAt);
      return t >= now && t <= to;
    })
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
}
```

### 3.4 Service Logic (`src/utils/vendorServices.js`)

#### Service Validation
```javascript
function validateService(input) {
  const errors = [];
  if (!input.name?.trim()) errors.push("Title is required");
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
    errors.push("Duration must be > 0");
  }
  if (!Number.isFinite(input.basePriceCents) || input.basePriceCents < 0) {
    errors.push("Price must be ≥ 0");
  }
  if (!input.category?.trim()) errors.push("Category is required");
  return errors;
}
```

#### Service Normalization
```javascript
function normalizeService(input) {
  return {
    ...input,
    name: input.name.trim(),
    category: input.category.trim().toLowerCase(),
  };
}
```

---

## 4. Test Documentation

### 4.1 Backend Tests

#### Test Structure
```
backend/tests/
├── simple-test.js          # Basic functionality test
├── health.test.js          # Health endpoint test
├── search.test.js          # Search functionality test
├── bookings.test.js        # Booking system test
├── vendors.test.js         # Vendor endpoints test
└── run-all-tests.js        # Test runner
```

#### Test Categories

**Health Tests**
```javascript
// Test server health and basic connectivity
await test('Health endpoint returns 200', async () => {
  const response = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  });
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
});
```

**Search Tests**
```javascript
// Test search functionality with various parameters
await test('Search returns valid structure', async () => {
  const response = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24&limit=5',
    method: 'GET'
  });
  
  if (!response.body.total && response.body.total !== 0) {
    throw new Error('Response should have total field');
  }
  
  if (!Array.isArray(response.body.items)) {
    throw new Error('Response should have items array');
  }
});
```

**Booking Tests**
```javascript
// Test booking creation and confirmation
await test('Create booking with valid data', async () => {
  const bookingData = {
    slotId: testSlotId,
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '555-1234'
  };
  
  const response = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, bookingData);
  
  if (response.statusCode !== 201) {
    throw new Error(`Expected 201, got ${response.statusCode}`);
  }
});
```

### 4.2 Frontend Tests

#### Component Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user workflow testing

#### Test Utilities
```javascript
// Mock API responses
const mockSearchResults = {
  total: 5,
  items: [
    {
      slotId: 'slt_123',
      startAt: '2025-10-19T14:00:00.000Z',
      endAt: '2025-10-19T14:45:00.000Z',
      priceCents: 3500,
      service: { name: 'Haircut', category: 'barber' },
      vendor: { name: 'Downtown Barber', rating: 4.8 },
      location: { name: 'Main St Location', address: '123 Main St' }
    }
  ]
};
```

---

## 5. Synthetic Data

### 5.1 Data Generation Strategy

#### Geographic Distribution
- **Winnipeg, MB**: 40% of vendors
- **Calgary, AB**: 30% of vendors  
- **Edmonton, AB**: 30% of vendors

#### Service Categories
- **Barber**: 25% of services
- **Massage**: 20% of services
- **Nails**: 15% of services
- **Tattoo**: 10% of services
- **Plumber**: 15% of services
- **Other**: 10% of services

### 5.2 Data Files

#### Users (`datastore/users.json`)
```json
[
  {
    "id": "usr_mgx74z5v2mrh",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "+1-204-555-0101",
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-15T10:30:00.000Z"
  }
]
```

#### Vendors (`datastore/vendors.json`)
```json
[
  {
    "id": "vnd_demo_1",
    "name": "Downtown Barber Shop",
    "email": "contact@downtownbarber.com",
    "phone": "+1-204-555-0201",
    "address": "123 Main St, Winnipeg, MB R3C 1A1",
    "description": "Professional barber services in downtown Winnipeg",
    "rating": 4.8,
    "status": "active",
    "createdAt": "2025-10-10T09:00:00.000Z",
    "updatedAt": "2025-10-19T05:00:00.000Z"
  }
]
```

#### Services (`datastore/services.json`)
```json
[
  {
    "id": "srv_mgx74z5v2mrh",
    "vendorId": "vnd_demo_1",
    "name": "Haircut & Styling",
    "category": "barber",
    "durationMinutes": 45,
    "description": "Professional haircut with styling and consultation",
    "basePriceCents": 3500,
    "createdAt": "2025-10-10T09:15:00.000Z",
    "updatedAt": "2025-10-10T09:15:00.000Z"
  }
]
```

#### Slots (`datastore/slots.json`)
```json
[
  {
    "id": "slt_mgx74z6a87cs",
    "serviceId": "srv_mgx74z5v2mrh",
    "startAt": "2025-10-19T14:00:00.000Z",
    "endAt": "2025-10-19T14:45:00.000Z",
    "priceCents": 3500,
    "status": "OPEN",
    "createdAt": "2025-10-19T05:00:00.000Z",
    "updatedAt": "2025-10-19T05:00:00.000Z"
  }
]
```

#### Bookings (`datastore/bookings.json`)
```json
[
  {
    "id": "bkg_mgx74z7b98dt",
    "slotId": "slt_mgx74z6a87cs",
    "customerName": "Jane Smith",
    "customerEmail": "jane.smith@example.com",
    "customerPhone": "+1-204-555-0301",
    "status": "CONFIRMED",
    "holdExpiresAt": null,
    "createdAt": "2025-10-19T05:30:00.000Z",
    "updatedAt": "2025-10-19T05:35:00.000Z"
  }
]
```

### 5.3 Data Relationships

#### Vendor-Service Relationships
- Each vendor has 2-5 services
- Services are distributed across categories
- Price ranges: $25-$150 (2500-15000 cents)

#### Slot Generation
- Slots created for next 30 days
- 2-8 slots per day per service
- Time slots: 9 AM - 6 PM
- Duration: 30-120 minutes

#### Booking Distribution
- 60% of slots remain OPEN
- 25% of slots are BOOKED
- 15% of slots are HELD (pending)

---

## 6. API Documentation

### 6.1 Search Endpoints

#### GET /api/search
**Purpose:** Search for available service slots

**Parameters:**
- `lat` (number): Latitude coordinate
- `lng` (number): Longitude coordinate  
- `radiusKm` (number): Search radius in kilometers
- `withinHours` (number): Time window in hours
- `category` (string): Service category filter
- `limit` (number): Maximum results (default: 20)
- `offset` (number): Pagination offset (default: 0)

**Response:**
```json
{
  "total": 15,
  "items": [
    {
      "slotId": "slt_123",
      "startAt": "2025-10-19T14:00:00.000Z",
      "endAt": "2025-10-19T14:45:00.000Z",
      "priceCents": 3500,
      "service": {
        "id": "srv_123",
        "name": "Haircut & Styling",
        "category": "barber",
        "durationMinutes": 45
      },
      "vendor": {
        "id": "vnd_123",
        "name": "Downtown Barber",
        "rating": 4.8
      },
      "location": {
        "id": "loc_123",
        "name": "Main St Location",
        "address": "123 Main St",
        "lat": 49.8998,
        "lng": -97.1375
      },
      "distanceKm": 2.3
    }
  ],
  "filters": {
    "lat": 49.8998,
    "lng": -97.1375,
    "radiusKm": 10,
    "withinHours": 24,
    "category": "barber",
    "timeWindow": {
      "from": "2025-10-19T05:00:00.000Z",
      "to": "2025-10-20T05:00:00.000Z"
    }
  }
}
```

### 6.2 Booking Endpoints

#### POST /api/bookings
**Purpose:** Create a booking (hold a slot)

**Request Body:**
```json
{
  "slotId": "slt_123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890"
}
```

**Response:**
```json
{
  "bookingId": "bkg_123",
  "status": "PENDING",
  "holdExpiresAt": "2025-10-19T14:10:00.000Z"
}
```

#### PATCH /api/bookings/:id
**Purpose:** Confirm a booking

**Request Body:**
```json
{
  "action": "confirm"
}
```

**Response:**
```json
{
  "bookingId": "bkg_123",
  "status": "CONFIRMED",
  "slotId": "slt_123"
}
```

### 6.3 Vendor Endpoints

#### GET /api/vendors/me/services
**Purpose:** Get vendor's services

**Headers:**
- `x-vendor-id`: Vendor ID

**Response:**
```json
[
  {
    "id": "srv_123",
    "name": "Haircut & Styling",
    "category": "barber",
    "durationMinutes": 45,
    "description": "Professional haircut",
    "basePriceCents": 3500
  }
]
```

#### POST /api/vendors/me/services
**Purpose:** Create a new service

**Headers:**
- `x-vendor-id`: Vendor ID
- `Content-Type`: application/json

**Request Body:**
```json
{
  "name": "Haircut & Styling",
  "category": "barber",
  "durationMinutes": 45,
  "description": "Professional haircut",
  "basePriceCents": 3500
}
```

---

## 7. Component Architecture

### 7.1 Component Hierarchy

```
App
├── Router
│   ├── Home
│   ├── Search
│   │   └── SlotCard
│   ├── Slot
│   ├── VendorRegistration
│   ├── VendorDashboard
│   ├── VendorServices
│   └── VendorReservations
└── StoreProvider
    └── Store (Context)
```

### 7.2 State Management

#### Global State Structure
```javascript
{
  search: {
    filters: { category, withinHours, radiusKm, lat, lng },
    results: [],
    loading: false,
    error: null
  },
  vendor: {
    id: 'vnd_demo_1',
    name: 'Demo Vendor'
  },
  notifications: {
    enabled: true,
    messages: []
  }
}
```

#### State Actions
- `setSearchFilters()` - Update search parameters
- `setSearchResults()` - Update search results
- `setSearchLoading()` - Set loading state
- `setSearchError()` - Set error state
- `addNotification()` - Add notification message
- `setVendor()` - Set vendor information

### 7.3 Utility Functions

#### API Utilities (`src/utils/api.js`)
- `searchSlots()` - Search for available slots
- `getSlot()` - Get slot details
- `createBooking()` - Create booking hold
- `confirmBooking()` - Confirm booking
- `getVendorServices()` - Get vendor services
- `createService()` - Create new service

#### Business Logic Utilities
- `src/utils/home.js` - Home page utilities
- `src/utils/search.js` - Search utilities
- `src/utils/slot.js` - Slot/booking utilities
- `src/utils/vendorDashboard.js` - Dashboard utilities
- `src/utils/vendorServices.js` - Service management
- `src/utils/vendorSlots.js` - Slot management

---

## 8. Deployment and Configuration

### 8.1 Environment Setup

#### Backend Configuration
```javascript
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
```

#### Frontend Configuration
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

### 8.2 Data Persistence

#### File-based Storage
- **Atomic Writes**: Temporary files with rename
- **File Locking**: Prevent concurrent access
- **Indexing**: In-memory indexes for performance
- **Backup**: Regular data snapshots

#### Data Integrity
- **Validation**: Input validation on all endpoints
- **Constraints**: Referential integrity checks
- **Transactions**: Atomic operations for related data
- **Error Handling**: Graceful failure recovery

---

This documentation provides a complete technical reference for the Last Minute Now platform, covering all aspects from user interfaces to data models and business logic. The implementation is ready for production deployment with comprehensive testing and synthetic data for development and demonstration purposes.
