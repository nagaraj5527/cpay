import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PincodeService {
  private readonly CACHE_PREFIX = 'apccb_pincode_cache_v2_';

  // Local dictionary for instant lookups (0ms latency)
  private readonly localPincodes: Record<string, any[]> = {
    // Koppal, Karnataka (User's entered pincode in screenshot)
    '583282': [
      {
        Status: 'Success',
        Message: 'Number of pincode(s) found: 7',
        PostOffice: [
          { Name: 'Bargoor', Block: 'Gangavati', District: 'Koppal', State: 'Karnataka' },
          { Name: 'Gundur', Block: 'Gangavati', District: 'Koppal', State: 'Karnataka' },
          { Name: 'Gundur Camp', Block: 'Gangavati', District: 'Koppal', State: 'Karnataka' },
          { Name: 'Mushtoor', Block: 'Gangavati', District: 'Koppal', State: 'Karnataka' },
          { Name: 'Siddapur', Block: 'Gangavati', District: 'Koppal', State: 'Karnataka' },
          { Name: 'Singanhal', Block: 'Gangavati', District: 'Koppal', State: 'Karnataka' },
          { Name: 'Sriramnagar (Koppal)', Block: 'Gangavati', District: 'Koppal', State: 'Karnataka' }
        ]
      }
    ],
    // Warangal, Telangana (Matches Gurijala / Duggondi from screenshot)
    '506331': [
      {
        Status: 'Success',
        Message: 'Number of pincode(s) found: 9',
        PostOffice: [
          { Name: 'Gurijala', Block: 'Duggondi', District: 'Warangal', State: 'Telangana' },
          { Name: 'Mandapalli', Block: 'Duggondi', District: 'Warangal', State: 'Telangana' },
          { Name: 'Mohammadapur', Block: 'Duggondi', District: 'Warangal', State: 'Telangana' },
          { Name: 'Mondrai', Block: 'Sangem', District: 'Warangal', State: 'Telangana' },
          { Name: 'Nachenapalli', Block: 'Duggondi', District: 'Warangal', State: 'Telangana' },
          { Name: 'Timmapet', Block: 'Duggondi', District: 'Warangal', State: 'Telangana' },
          { Name: 'Togarrai', Block: 'Duggondi', District: 'Warangal', State: 'Telangana' },
          { Name: 'Venkatapuram', Block: 'Duggondi', District: 'Warangal', State: 'Telangana' },
          { Name: 'Viswanathapur', Block: 'Geesugonda', District: 'Warangal', State: 'Telangana' }
        ]
      }
    ],
    // Hyderabad G.P.O., Telangana
    '500001': [
      {
        Status: 'Success',
        Message: 'Number of pincode(s) found: 1',
        PostOffice: [
          { Name: 'Hyderabad G.P.O.', Block: 'Nampally', District: 'Hyderabad', State: 'Telangana' }
        ]
      }
    ],
    // Bengaluru G.P.O., Karnataka
    '560001': [
      {
        Status: 'Success',
        Message: 'Number of pincode(s) found: 1',
        PostOffice: [
          { Name: 'Bengaluru G.P.O.', Block: 'Bangalore North', District: 'Bangalore', State: 'Karnataka' }
        ]
      }
    ],
    // New Delhi G.P.O., Delhi
    '110001': [
      {
        Status: 'Success',
        Message: 'Number of pincode(s) found: 1',
        PostOffice: [
          { Name: 'New Delhi G.P.O.', Block: 'Connaught Place', District: 'New Delhi', State: 'Delhi' }
        ]
      }
    ],
    // Mumbai G.P.O., Maharashtra
    '400001': [
      {
        Status: 'Success',
        Message: 'Number of pincode(s) found: 1',
        PostOffice: [
          { Name: 'Mumbai G.P.O.', Block: 'Mumbai', District: 'Mumbai', State: 'Maharashtra' }
        ]
      }
    ],
    // Chennai G.P.O., Tamil Nadu
    '600001': [
      {
        Status: 'Success',
        Message: 'Number of pincode(s) found: 1',
        PostOffice: [
          { Name: 'Chennai G.P.O.', Block: 'Fort St. George', District: 'Chennai', State: 'Tamil Nadu' }
        ]
      }
    ],
    // Kolkata G.P.O., West Bengal
    '700001': [
      {
        Status: 'Success',
        Message: 'Number of pincode(s) found: 1',
        PostOffice: [
          { Name: 'Kolkata G.P.O.', Block: 'Kolkata', District: 'Kolkata', State: 'West Bengal' }
        ]
      }
    ]
  };

  constructor() {}

  /**
   * Fetches postal details for a given pincode.
   * Priority:
   * 1. Hardcoded local dictionary (0ms)
   * 2. localStorage Cache (0ms)
   * 3. Network Fetch (Fallback, then updates localStorage Cache)
   */
  async fetchPincode(pincode: string): Promise<any[]> {
    console.log(`🔍 [PincodeService] Request lookup for pincode: ${pincode}`);

    // 1. Check local dictionary
    if (this.localPincodes[pincode]) {
      console.log(`⚡ [PincodeService] Cache hit (Local Memory Dictionary) for pincode: ${pincode}`);
      return JSON.parse(JSON.stringify(this.localPincodes[pincode])); // Return deep copy
    }

    // 2. Check localStorage cache
    const cacheKey = `${this.CACHE_PREFIX}${pincode}`;
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log(`💾 [PincodeService] Cache hit (localStorage Cache) for pincode: ${pincode}`);
        return JSON.parse(cachedData);
      }
    } catch (e) {
      console.warn(`[PincodeService] Failed to read from localStorage:`, e);
    }

    // 3. Fallback to API call
    console.log(`🌐 [PincodeService] Cache miss. Fetching from api.postalpincode.in for pincode: ${pincode}`);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Store in localStorage if request was successful
      if (data && data[0] && data[0].Status === 'Success') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          console.log(`📥 [PincodeService] Cached fetched details for pincode: ${pincode}`);
        } catch (e) {
          console.warn(`[PincodeService] Failed to write to localStorage:`, e);
        }
      }
      return data;
    } catch (error) {
      console.error(`❌ [PincodeService] Failed fetching pincode details:`, error);
      throw error;
    }
  }
}
