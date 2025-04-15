
import { MerchantData } from "@/types/eligibility";

// Local storage keys
const MERCHANT_DATA_STORAGE_KEY = "uploadedMerchantData";

// IndexedDB configuration
const DB_NAME = "MerchantDB";
const DB_VERSION = 1;
const MERCHANT_STORE = "merchants";

/**
 * Initialize the IndexedDB database
 */
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("Database error:", event);
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for merchants if it doesn't exist
      if (!db.objectStoreNames.contains(MERCHANT_STORE)) {
        const objectStore = db.createObjectStore(MERCHANT_STORE, { keyPath: "mid" });
        // Create indexes for common search fields
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("businessCategory", "businessCategory", { unique: false });
      }
    };
  });
};

/**
 * Save all merchant data to IndexedDB
 */
export const saveMerchantData = async (merchants: MerchantData[]): Promise<void> => {
  try {
    // First save to localStorage as a fallback
    localStorage.setItem(MERCHANT_DATA_STORAGE_KEY, JSON.stringify(merchants));
    
    // Then save to IndexedDB
    const db = await initDatabase();
    const transaction = db.transaction(MERCHANT_STORE, "readwrite");
    const store = transaction.objectStore(MERCHANT_STORE);
    
    // Clear existing data
    store.clear();
    
    // Add all merchants
    merchants.forEach(merchant => {
      store.put(merchant);
    });
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`Saved ${merchants.length} merchants to IndexedDB`);
        resolve();
      };
      
      transaction.onerror = (event) => {
        console.error("Transaction error:", event);
        reject(new Error("Failed to save merchants"));
      };
    });
  } catch (error) {
    console.error("Error saving merchant data:", error);
    // If IndexedDB fails, we still have localStorage backup
  }
};

/**
 * Load merchant data from storage (tries IndexedDB first, falls back to localStorage)
 */
export const loadMerchantData = async (): Promise<MerchantData[]> => {
  try {
    // Try to get data from IndexedDB
    const db = await initDatabase();
    const transaction = db.transaction(MERCHANT_STORE, "readonly");
    const store = transaction.objectStore(MERCHANT_STORE);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result && request.result.length > 0) {
          console.log(`Loaded ${request.result.length} merchants from IndexedDB`);
          resolve(request.result);
        } else {
          // Fall back to localStorage if IndexedDB is empty
          const localData = loadMerchantDataFromLocalStorage();
          
          // If we found data in localStorage but not in IndexedDB, let's save it to IndexedDB for next time
          if (localData.length > 0) {
            saveMerchantData(localData).catch(console.error);
          }
          
          resolve(localData);
        }
      };
      
      request.onerror = (event) => {
        console.error("Error loading data from IndexedDB:", event);
        // Fall back to localStorage
        resolve(loadMerchantDataFromLocalStorage());
      };
    });
  } catch (error) {
    console.error("Failed to load from IndexedDB:", error);
    // Fall back to localStorage
    return loadMerchantDataFromLocalStorage();
  }
};

/**
 * Load merchant data from localStorage (used as fallback)
 */
const loadMerchantDataFromLocalStorage = (): MerchantData[] => {
  try {
    const savedMerchants = localStorage.getItem(MERCHANT_DATA_STORAGE_KEY);
    if (savedMerchants) {
      const parsedData = JSON.parse(savedMerchants);
      
      // Ensure that the data is an array
      if (Array.isArray(parsedData)) {
        console.log("Loaded merchant data from localStorage:", parsedData.length, "merchants");
        return parsedData;
      }
    }
    return [];
  } catch (error) {
    console.error("Error loading saved merchant data from localStorage", error);
    return [];
  }
};

/**
 * Find a merchant by ID or name
 */
export const findMerchant = async (searchTerm: string): Promise<MerchantData | null> => {
  if (!searchTerm || searchTerm.trim() === "") {
    return null;
  }
  
  try {
    const db = await initDatabase();
    const transaction = db.transaction(MERCHANT_STORE, "readonly");
    const store = transaction.objectStore(MERCHANT_STORE);
    
    // First try exact match on MID
    const midRequest = store.get(searchTerm);
    
    return new Promise((resolve) => {
      midRequest.onsuccess = () => {
        if (midRequest.result) {
          resolve(midRequest.result);
        } else {
          // If no exact MID match, try name index
          const nameIndex = store.index("name");
          const range = IDBKeyRange.bound(
            searchTerm.toLowerCase(), 
            searchTerm.toLowerCase() + '\uffff'
          );
          
          const nameRequest = nameIndex.openCursor(range);
          
          nameRequest.onsuccess = () => {
            const cursor = nameRequest.result;
            if (cursor) {
              // Return the first match
              resolve(cursor.value);
            } else {
              // No matches found
              resolve(null);
            }
          };
          
          nameRequest.onerror = () => {
            resolve(null);
          };
        }
      };
      
      midRequest.onerror = () => {
        resolve(null);
      };
    });
  } catch (error) {
    console.error("Error finding merchant:", error);
    
    // Fall back to localStorage search
    const merchants = loadMerchantDataFromLocalStorage();
    const foundMerchant = merchants.find(
      m => m.mid.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return foundMerchant || null;
  }
};
