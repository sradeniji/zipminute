import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lock from './lock.js';
import indexer from './indexer.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to datastore directory
const DATASTORE_PATH = path.join(__dirname, '../../datastore');

// In-memory state
let state = {
  users: [],
  vendors: [],
  services: [],
  locations: [],
  slots: [],
  bookings: [],
  reviews: [],
  meta: {}
};

// Indexes (built by indexer)
let indexes = {};

// Load all JSON files from datastore
const loadAll = () => {
  try {
    console.log('Loading datastore...');
    
    const files = ['users', 'vendors', 'services', 'locations', 'slots', 'bookings', 'reviews', 'meta'];
    
    files.forEach(fileName => {
      const filePath = path.join(DATASTORE_PATH, `${fileName}.json`);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        state[fileName] = JSON.parse(content);
        console.log(`Loaded ${fileName}.json: ${Array.isArray(state[fileName]) ? state[fileName].length : 'object'} items`);
      } catch (error) {
        console.warn(`Warning: Could not load ${fileName}.json:`, error.message);
        state[fileName] = Array.isArray(state[fileName]) ? [] : {};
      }
    });

    // Build indexes
    indexes = indexer.rebuild(state);
    console.log('Datastore loaded and indexed successfully');
    
    return state;
  } catch (error) {
    console.error('Error loading datastore:', error);
    throw error;
  }
};

// Save specific files (atomic writes)
const save = async (filesToSave) => {
  return await lock.withLock(async () => {
    const files = filesToSave || Object.keys(state);
    
    for (const fileName of files) {
      if (!state[fileName]) continue;
      
      const filePath = path.join(DATASTORE_PATH, `${fileName}.json`);
      const tempPath = `${filePath}.tmp`;
      
      try {
        // Write to temporary file first
        fs.writeFileSync(tempPath, JSON.stringify(state[fileName], null, 2));
        
        // Atomic rename
        fs.renameSync(tempPath, filePath);
        console.log(`Saved ${fileName}.json`);
      } catch (error) {
        console.error(`Error saving ${fileName}.json:`, error);
        // Clean up temp file if it exists
        try {
          fs.unlinkSync(tempPath);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        throw error;
      }
    }
  });
};

// Get current state
const getState = () => state;

// Get indexes
const getIndexes = () => indexes;

// Update state and rebuild indexes
const updateState = (updates) => {
  Object.assign(state, updates);
  indexes = indexer.rebuild(state);
};

// Helper to get a single item by ID
const getById = (collection, id) => {
  return state[collection]?.find(item => item.id === id);
};

// Helper to get items by field
const getByField = (collection, field, value) => {
  return state[collection]?.filter(item => item[field] === value) || [];
};

// Helper to add item to collection
const addItem = (collection, item) => {
  if (!state[collection]) {
    state[collection] = [];
  }
  state[collection].push(item);
  indexes = indexer.rebuild(state);
};

// Helper to update item in collection
const updateItem = (collection, id, updates) => {
  const index = state[collection]?.findIndex(item => item.id === id);
  if (index !== -1) {
    state[collection][index] = { ...state[collection][index], ...updates };
    indexes = indexer.rebuild(state);
    return true;
  }
  return false;
};

// Helper to remove item from collection
const removeItem = (collection, id) => {
  const index = state[collection]?.findIndex(item => item.id === id);
  if (index !== -1) {
    state[collection].splice(index, 1);
    indexes = indexer.rebuild(state);
    return true;
  }
  return false;
};

export default {
  loadAll,
  save,
  getState,
  getIndexes,
  updateState,
  getById,
  getByField,
  addItem,
  updateItem,
  removeItem
};


