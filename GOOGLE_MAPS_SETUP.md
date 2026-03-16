# Google Maps API Setup Instructions

## Why the Interactive Map Isn't Loading

The interactive location map requires a Google Maps API key to function. If you're seeing a fallback message instead of the map, it means the API key is not configured.

## How to Fix This

### Step 1: Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for enhanced features)
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### Step 2: Add the API Key to Your Project

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add the following line:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
3. Replace `your_actual_api_key_here` with your actual API key
4. Restart your development server (`npm start`)

### Step 3: Verify the Setup

1. Open your browser's developer console
2. Navigate to the Location Tracking page
3. Look for the console message: "Google Maps API Key Status"
4. The map should now load properly

## Alternative Solutions

If you don't want to use Google Maps, the component will show:
- A fallback UI with location information
- Links to open the location in Google Maps and OpenStreetMap
- All location tracking features will still work

## Security Notes

- Never commit your API key to version control
- Add `.env` to your `.gitignore` file
- Restrict your API key to specific domains/IPs in Google Cloud Console
- Monitor your API usage to avoid unexpected charges

## Troubleshooting

If the map still doesn't load after adding the API key:

1. Check the browser console for error messages
2. Verify the API key is correct
3. Ensure the required APIs are enabled in Google Cloud Console
4. Check if there are any domain restrictions on your API key
5. Try refreshing the page or clearing browser cache

## Free Tier Limits

Google Maps API has a free tier with monthly limits:
- Maps JavaScript API: 28,000 map loads per month
- For most personal/small projects, this should be sufficient

If you exceed the free tier, you'll be charged per additional request.
