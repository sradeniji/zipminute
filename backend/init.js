import datastore from './store/datastore.js';

// Initialize datastore on startup
const init = async () => {
  try {
    console.log('Initializing datastore...');
    await datastore.loadAll();
    console.log('Datastore initialized successfully');
  } catch (error) {
    console.error('Failed to initialize datastore:', error);
    process.exit(1);
  }
};

export { init };


