import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-process lock for single process deployment
let isLocked = false;
let lockQueue = [];

// File-based lock for multi-process deployment (optional)
const LOCK_FILE = path.join(__dirname, '../../.write.lock');

// Simple mutex lock
const withLock = async (fn) => {
  return new Promise((resolve, reject) => {
    const execute = async () => {
      if (isLocked) {
        lockQueue.push(execute);
        return;
      }
      
      isLocked = true;
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        isLocked = false;
        const next = lockQueue.shift();
        if (next) {
          setImmediate(next);
        }
      }
    };
    
    execute();
  });
};

// File-based lock (for multi-process scenarios)
const withFileLock = async (fn) => {
  let lockFd = null;
  
  try {
    // Try to create lock file exclusively
    lockFd = fs.openSync(LOCK_FILE, 'wx');
    
    // Execute the function
    const result = await fn();
    return result;
    
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error('Database is locked by another process');
    }
    throw error;
  } finally {
    if (lockFd !== null) {
      try {
        fs.closeSync(lockFd);
        fs.unlinkSync(LOCK_FILE);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }
};

// Choose lock implementation based on environment
const useFileLock = process.env.USE_FILE_LOCK === 'true';

export default {
  withLock: useFileLock ? withFileLock : withLock
};


