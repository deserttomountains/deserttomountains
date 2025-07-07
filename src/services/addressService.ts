// Address service for fetching Indian states and cities from reliable APIs

export interface State {
  name: string;
  code: string;
}

export interface City {
  name: string;
  state: string;
}

export interface PincodeData {
  postOffice: string;
  district: string;
  state: string;
  pincode: string;
  postOffices?: Array<{
    name: string;
    branchType: string;
    deliveryStatus: string;
    block: string;
  }>;
}

class AddressService {
  private static instance: AddressService;
  private statesCache: State[] = [];
  private citiesCache: Map<string, string[]> = new Map();

  static getInstance(): AddressService {
    if (!AddressService.instance) {
      AddressService.instance = new AddressService();
    }
    return AddressService.instance;
  }

  // Get all Indian states
  async getStates(): Promise<State[]> {
    if (this.statesCache.length > 0) {
      return this.statesCache;
    }

    try {
      // Using a reliable API for Indian states
      const response = await fetch('https://api.countrystatecity.in/v1/countries/IN/states', {
        headers: {
          'X-CSCAPI-KEY': process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.statesCache = data.map((state: any) => ({
          name: state.name,
          code: state.iso2
        }));
        return this.statesCache;
      }
    } catch (error) {
      console.warn('Failed to fetch states from API, using fallback data');
    }

    // Fallback to static data for states (this is manageable)
    this.statesCache = [
      { name: "Andhra Pradesh", code: "AP" },
      { name: "Arunachal Pradesh", code: "AR" },
      { name: "Assam", code: "AS" },
      { name: "Bihar", code: "BR" },
      { name: "Chhattisgarh", code: "CG" },
      { name: "Goa", code: "GA" },
      { name: "Gujarat", code: "GJ" },
      { name: "Haryana", code: "HR" },
      { name: "Himachal Pradesh", code: "HP" },
      { name: "Jharkhand", code: "JH" },
      { name: "Karnataka", code: "KA" },
      { name: "Kerala", code: "KL" },
      { name: "Madhya Pradesh", code: "MP" },
      { name: "Maharashtra", code: "MH" },
      { name: "Manipur", code: "MN" },
      { name: "Meghalaya", code: "ML" },
      { name: "Mizoram", code: "MZ" },
      { name: "Nagaland", code: "NL" },
      { name: "Odisha", code: "OD" },
      { name: "Punjab", code: "PB" },
      { name: "Rajasthan", code: "RJ" },
      { name: "Sikkim", code: "SK" },
      { name: "Tamil Nadu", code: "TN" },
      { name: "Telangana", code: "TS" },
      { name: "Tripura", code: "TR" },
      { name: "Uttar Pradesh", code: "UP" },
      { name: "Uttarakhand", code: "UK" },
      { name: "West Bengal", code: "WB" },
      { name: "Delhi", code: "DL" },
      { name: "Jammu and Kashmir", code: "JK" },
      { name: "Ladakh", code: "LA" },
      { name: "Chandigarh", code: "CH" },
      { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DN" },
      { name: "Lakshadweep", code: "LD" },
      { name: "Puducherry", code: "PY" }
    ];
    return this.statesCache;
  }

  // Get cities by state using India Post API
  async getCitiesByState(stateName: string): Promise<string[]> {
    const cacheKey = stateName.toLowerCase();
    
    if (this.citiesCache.has(cacheKey)) {
      return this.citiesCache.get(cacheKey)!;
    }

    try {
      // Method 1: Try India Post API first (most reliable)
      const cities = await this.getCitiesFromIndiaPost(stateName);
      if (cities.length > 0) {
        this.citiesCache.set(cacheKey, cities);
        return cities;
      }

      // Method 2: Try Country State City API
      const citiesFromAPI = await this.getCitiesFromAPI(stateName);
      if (citiesFromAPI.length > 0) {
        this.citiesCache.set(cacheKey, citiesFromAPI);
        return citiesFromAPI;
      }

    } catch (error) {
      console.warn(`Failed to fetch cities for ${stateName}, using fallback data`);
    }

    // Method 3: Fallback to static data for major cities
    const fallbackCities = this.getFallbackCities(stateName);
    this.citiesCache.set(cacheKey, fallbackCities);
    return fallbackCities;
  }

  // Get cities from India Post API using pincode search
  private async getCitiesFromIndiaPost(stateName: string): Promise<string[]> {
    const cities = new Set<string>();
    
    // Use some known pincodes from major cities in the state
    const statePincodes = this.getStatePincodes(stateName);
    
    for (const pincode of statePincodes.slice(0, 10)) { // Limit to first 10 pincodes
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        if (response.ok) {
          const data = await response.json();
          if (data[0]?.PostOffice) {
            data[0].PostOffice.forEach((postOffice: any) => {
              if (postOffice.State === stateName) {
                cities.add(postOffice.District);
                cities.add(postOffice.Block);
              }
            });
          }
        }
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to fetch data for pincode ${pincode}`);
      }
    }
    
    return Array.from(cities).filter(city => city && city.trim() !== '');
  }

  // Get cities from Country State City API
  private async getCitiesFromAPI(stateName: string): Promise<string[]> {
    try {
      const stateCode = this.getStateCode(stateName);
      if (!stateCode) return [];

      const response = await fetch(`https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`, {
        headers: {
          'X-CSCAPI-KEY': process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.map((city: any) => city.name);
      }
    } catch (error) {
      console.warn('Failed to fetch cities from API');
    }
    
    return [];
  }

  // Get address details by pincode (useful for auto-filling)
  async getAddressByPincode(pincode: string): Promise<PincodeData | null> {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.ok) {
        const data = await response.json();
        if (data[0]?.PostOffice?.length > 0) {
          const firstPostOffice = data[0].PostOffice[0];
          
          // Extract all post offices for this pincode
          const postOffices = data[0].PostOffice.map((po: any) => ({
            name: po.Name,
            branchType: po.BranchType,
            deliveryStatus: po.DeliveryStatus,
            block: po.Block
          }));

          return {
            postOffice: firstPostOffice.Name,
            district: firstPostOffice.District,
            state: firstPostOffice.State,
            pincode: pincode,
            postOffices: postOffices
          };
        }
      }
    } catch (error) {
      console.warn('Failed to fetch address by pincode');
    }
    
    return null;
  }

  // Helper method to get state code
  private getStateCode(stateName: string): string | null {
    const state = this.statesCache.find(s => s.name === stateName);
    return state?.code || null;
  }

  // Fallback cities for major states
  private getFallbackCities(stateName: string): string[] {
    const fallbackData: { [key: string]: string[] } = {
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Nanded"],
      "Delhi": ["New Delhi", "Delhi Cantonment", "Civil Lines", "Karol Bagh", "Paharganj", "Connaught Place", "Chanakyapuri", "Dwarka", "Rohini", "Pitampura"],
      "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Vellore", "Erode", "Tiruppur", "Thoothukkudi", "Dindigul"],
      "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Siddipet"],
      "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Anand", "Bharuch", "Junagadh"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad"],
      "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur"],
      "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sri Ganganagar", "Sikar"],
      "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Pathankot", "Hoshiarpur", "Moga", "Firozpur", "Sangrur"],
      "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
      "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Kottayam"],
      "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
      "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai", "Katihar", "Chhapra"],
      "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Baleshwar", "Baripada", "Bhadrak", "Balangir"],
      "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Sivasagar"],
      "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chatra"],
      "Chhattisgarh": ["Raipur", "Bhilai", "Korba", "Bilaspur", "Durg", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Chirmiri", "Dhamtari"],
      "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwara", "Ramnagar", "Pithoragarh"],
      "Himachal Pradesh": ["Shimla", "Mandi", "Solan", "Kullu", "Dharamshala", "Bilaspur", "Chamba", "Una", "Hamirpur", "Kangra"],
      "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Valpoi", "Sanquelim", "Curchorem", "Cuncolim"]
    };
    
    return fallbackData[stateName] || [];
  }

  // Sample pincodes for major cities in each state
  private getStatePincodes(stateName: string): string[] {
    const pincodeData: { [key: string]: string[] } = {
      "Maharashtra": ["400001", "411001", "440001", "400601", "422001", "431001", "413001", "416001", "444601", "431601"],
      "Delhi": ["110001", "110002", "110003", "110004", "110005", "110006", "110007", "110008", "110009", "110010"],
      "Karnataka": ["560001", "570001", "580001", "575001", "590001", "577001", "583001", "585001", "586101", "577201"],
      "Tamil Nadu": ["600001", "641001", "625001", "636001", "620001", "632001", "638001", "641601", "628001", "624001"],
      "Telangana": ["500001", "506001", "503001", "505001", "505325", "507001", "509001", "508001", "504001", "502110"],
      "Gujarat": ["380001", "395001", "390001", "360001", "364001", "361001", "382001", "388001", "362001", "362601"],
      "Uttar Pradesh": ["226001", "208001", "201001", "282001", "221001", "250001", "211001", "202001", "244001", "284001"],
      "West Bengal": ["700001", "711101", "713201", "713301", "734001", "713101", "732101", "742101", "743101", "721301"],
      "Rajasthan": ["302001", "342001", "324001", "334001", "305001", "313001", "311001", "301001", "335001", "332001"],
      "Punjab": ["141001", "143001", "144001", "147001", "151001", "145001", "146001", "142001", "144401", "148001"],
      "Haryana": ["122001", "121001", "132103", "133001", "135001", "124001", "125001", "132001", "124507", "136119"],
      "Kerala": ["695001", "682001", "673001", "680001", "691001", "688001", "678001", "673001", "670001", "686001"],
      "Madhya Pradesh": ["462001", "452001", "482001", "474001", "456001", "470001", "455001", "485001", "457001", "486001"],
      "Bihar": ["800001", "823001", "812001", "842001", "854301", "846001", "802301", "851111", "854101", "841301"],
      "Odisha": ["751001", "753001", "769001", "760001", "768001", "752001", "756001", "757001", "768001", "754001"],
      "Assam": ["781001", "788001", "786001", "785001", "782001", "786125", "784001", "783101", "783330", "785700"],
      "Jharkhand": ["834001", "831001", "826001", "827001", "814112", "825301", "815301", "829117", "822101", "825101"],
      "Chhattisgarh": ["492001", "490001", "495677", "495001", "491001", "491441", "494001", "497001", "497335", "493773"],
      "Uttarakhand": ["248001", "249401", "247667", "263139", "263153", "244713", "249201", "246149", "244715", "262501"],
      "Himachal Pradesh": ["171001", "175001", "173212", "175101", "176057", "174001", "176301", "177220", "174021", "176001"],
      "Goa": ["403001", "403601", "403802", "403507", "403401", "403501", "403505", "403505", "403705", "403703"]
    };
    
    return pincodeData[stateName] || [];
  }

  // Clear cache (useful for testing or when data needs refresh)
  clearCache(): void {
    this.statesCache = [];
    this.citiesCache.clear();
  }
}

export default AddressService.getInstance(); 