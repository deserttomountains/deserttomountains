# Address Service API Setup Guide

This guide explains how to set up the address service for Indian states and cities data.

## Available APIs

### 1. India Post API (Recommended - Free)
- **URL**: `https://api.postalpincode.in/pincode/{pincode}`
- **Features**: 
  - Free to use
  - No API key required
  - Official government data
  - Comprehensive pincode database
- **Rate Limits**: None specified
- **Usage**: Used for pincode validation and address auto-fill

### 2. Country State City API (Optional - Free Tier)
- **URL**: `https://api.countrystatecity.in/v1/countries/IN/states`
- **Features**:
  - Free tier available
  - Comprehensive state and city data
  - Requires API key
- **Rate Limits**: 1000 requests/month (free tier)
- **Usage**: Used as backup for states and cities data

## Setup Instructions

### Step 1: Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# Optional: Country State City API Key
NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY=your_api_key_here
```

### Step 2: Get API Key (Optional)

If you want to use the Country State City API:

1. Visit: https://countrystatecity.in/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file

### Step 3: Test the Setup

The address service will automatically:
1. Try to fetch data from APIs first
2. Fall back to static data if APIs fail
3. Cache results for better performance

## How It Works

### Data Sources Priority:
1. **India Post API** (pincode-based city discovery)
2. **Country State City API** (comprehensive city list)
3. **Static Fallback Data** (major cities only)

### Features:
- **Smart Caching**: Results are cached to avoid repeated API calls
- **Graceful Degradation**: Falls back to static data if APIs are unavailable
- **Pincode Auto-fill**: Automatically fills state and city from pincode
- **Search Functionality**: Users can search through states and cities
- **Real-time Validation**: Validates pincodes as users type

### Performance:
- **Fast Loading**: Cached data loads instantly
- **Minimal API Calls**: Only calls APIs when necessary
- **Offline Support**: Works with static data when offline

## API Response Examples

### India Post API Response:
```json
[
  {
    "Message": "Number of Post Office(s) found: 1",
    "Status": "Success",
    "PostOffice": [
      {
        "Name": "Connaught Place",
        "Description": null,
        "BranchType": "Head Post Office",
        "DeliveryStatus": "Delivery",
        "Taluk": "New Delhi",
        "Circle": "Delhi",
        "District": "New Delhi",
        "Division": "Delhi G.P.O.",
        "Region": "Delhi",
        "State": "Delhi",
        "Country": "India",
        "Pincode": "110001"
      }
    ]
  }
]
```

### Country State City API Response:
```json
[
  {
    "id": 1,
    "name": "Andhra Pradesh",
    "iso2": "AP",
    "country_id": 101
  }
]
```

## Troubleshooting

### Common Issues:

1. **API Key Not Working**
   - Check if the API key is correctly set in `.env.local`
   - Verify the API key is valid and not expired
   - Check if you've exceeded the free tier limits

2. **Slow Loading**
   - The service caches data, so subsequent loads will be faster
   - Check your internet connection
   - APIs might be temporarily down

3. **Missing Cities**
   - The service uses multiple fallback methods
   - If cities are missing, they'll be added to the static fallback data
   - Consider upgrading to a paid API plan for more comprehensive data

### Fallback Behavior:

If all APIs fail, the service will:
1. Use static state data (always available)
2. Use static city data for major cities
3. Show appropriate error messages to users
4. Continue functioning with limited data

## Customization

### Adding More Cities:
Edit the `getFallbackCities` method in `src/services/addressService.ts`:

```typescript
private getFallbackCities(stateName: string): string[] {
  const fallbackData: { [key: string]: string[] } = {
    "Your State": ["City 1", "City 2", "City 3"],
    // ... existing data
  };
  return fallbackData[stateName] || [];
}
```

### Adding More Pincodes:
Edit the `getStatePincodes` method to include more pincodes for better city discovery.

## Security Notes

- API keys are stored in environment variables (not in code)
- No sensitive data is logged
- API calls are made from the client-side (browser)
- Consider implementing rate limiting for production use

## Support

For issues with:
- **India Post API**: Contact India Post
- **Country State City API**: Contact their support
- **Implementation**: Check the service code and error logs 