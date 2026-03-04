# Regional Summaries Feature - AI-Powered Regional Insights

## Overview

The Regional Summaries feature provides AI-powered, region-specific crop recommendations and insights for Indian farmers. It analyzes soil data, climate conditions, and regional characteristics to deliver personalized agricultural advice.

## Features

### 1. **Regional Suitability Analysis**
- Scores crop suitability (0-100) for specific regions
- Explains why a crop is suitable or unsuitable for the region
- Considers local climate, soil, and agricultural practices

### 2. **Climate Compatibility**
- Temperature fit assessment
- Rainfall pattern analysis
- Seasonal planting and harvesting recommendations

### 3. **Soil Compatibility**
- Soil type matching
- Region-specific soil amendments
- pH and nutrient recommendations

### 4. **Regional Best Practices**
- Locally adapted crop varieties
- Region-specific irrigation strategies
- Common pest management for the area

### 5. **Market Insights**
- Local market demand analysis
- Nearby agricultural markets (mandis)
- Regional price trends and patterns

### 6. **Success Stories**
- Examples of successful farmers in the region
- Proven cultivation techniques

### 7. **Government Support**
- State-specific agricultural schemes
- Available subsidies and support programs
- Contact information for local agriculture departments

### 8. **Weather Advisory**
- Seasonal weather patterns
- Regional climate challenges
- Precautionary measures

### 9. **Alternative Crops**
- Suggestions for other suitable crops
- Diversification opportunities

## Supported Regions

The system currently supports 15 major Indian agricultural regions:

1. **Punjab** - Semi-arid to sub-humid, Alluvial soil
2. **Haryana** - Semi-arid, Alluvial soil
3. **Uttar Pradesh** - Tropical to sub-tropical, Alluvial soil
4. **Maharashtra** - Tropical to semi-arid, Black cotton soil
5. **Karnataka** - Tropical to semi-arid, Red laterite & black soil
6. **Tamil Nadu** - Tropical, Red loamy, black & alluvial soil
7. **Andhra Pradesh** - Tropical, Red sandy, black & alluvial soil
8. **Telangana** - Semi-arid to tropical, Red sandy & black soil
9. **West Bengal** - Tropical to sub-tropical, Alluvial & laterite soil
10. **Kerala** - Tropical humid, Laterite & alluvial soil
11. **Gujarat** - Semi-arid to arid, Alluvial & black soil
12. **Rajasthan** - Arid to semi-arid, Sandy & alluvial soil
13. **Madhya Pradesh** - Tropical to sub-tropical, Black, red & alluvial soil
14. **Bihar** - Sub-tropical, Alluvial soil
15. **Odisha** - Tropical, Red laterite & alluvial soil

## API Endpoints

### Get Available Regions
```http
GET /api/regions
```

**Response:**
```json
{
  "regions": ["Punjab", "Haryana", "Uttar Pradesh", ...]
}
```

### Get Regional Summary
```http
POST /api/regional-summary
```

**Request Body:**
```json
{
  "region": "Punjab",
  "crop": "Rice",
  "N": 80,
  "P": 48,
  "K": 40,
  "temperature": 24,
  "humidity": 82,
  "ph": 6.5,
  "rainfall": 230
}
```

**Response:**
```json
{
  "region": "Punjab",
  "crop": "Rice",
  "summary": {
    "regional_suitability": {
      "score": 85,
      "explanation": "Rice is well-suited to Punjab's climate..."
    },
    "climate_match": {
      "temperature_fit": "good",
      "rainfall_fit": "excellent",
      "seasonal_timing": "Plant in June-July, harvest in October-November"
    },
    "soil_compatibility": {
      "soil_match": "excellent",
      "amendments_needed": "Add organic compost..."
    },
    "regional_best_practices": {
      "varieties": "PR-126, PR-128, Pusa-44",
      "irrigation": "Maintain 5cm standing water...",
      "pest_management": "Monitor stem borers..."
    },
    "market_insights": {
      "local_demand": "High demand in local markets",
      "nearby_mandis": "Ludhiana, Amritsar, Patiala",
      "price_trends": "Stable with MSP support"
    },
    "success_stories": "Many farmers in Punjab...",
    "regional_schemes": "PM-KISAN, PMFBY, Punjab state schemes",
    "weather_advisory": "Monitor for water scarcity...",
    "alternative_crops": ["Wheat", "Cotton", "Sugarcane"]
  }
}
```

## React Components

### RegionalSummary Component

Displays comprehensive regional insights in a tabbed interface.

```tsx
import { RegionalSummary } from "@/components/RegionalSummary";

<RegionalSummary
  region="Punjab"
  crop="Rice"
  soilData={{
    N: 80,
    P: 48,
    K: 40,
    temperature: 24,
    humidity: 82,
    ph: 6.5,
    rainfall: 230
  }}
/>
```

**Props:**
- `region` (string): Selected Indian state/region
- `crop` (string): Predicted or selected crop
- `soilData` (object): Soil and climate parameters

**Features:**
- Loading state with spinner
- Error handling with user-friendly messages
- Tabbed interface for organized information
- Color-coded suitability scores
- Responsive design

### RegionSelector Component

Dropdown selector for choosing Indian regions.

```tsx
import { RegionSelector } from "@/components/RegionSelector";

<RegionSelector
  value={selectedRegion}
  onChange={(region) => setSelectedRegion(region)}
/>
```

**Props:**
- `value` (string): Currently selected region
- `onChange` (function): Callback when region changes
- `className` (string, optional): Additional CSS classes

## Integration Examples

### Example 1: Add to Prediction Results

```tsx
import { useState } from "react";
import { RegionalSummary } from "@/components/RegionalSummary";
import { RegionSelector } from "@/components/RegionSelector";

function PredictionResults({ prediction, soilData }) {
  const [region, setRegion] = useState("Punjab");

  return (
    <div className="space-y-6">
      <h2>Predicted Crop: {prediction.crop}</h2>
      
      <RegionSelector value={region} onChange={setRegion} />
      
      <RegionalSummary
        region={region}
        crop={prediction.crop}
        soilData={soilData}
      />
    </div>
  );
}
```

### Example 2: Add to Prediction Form

```tsx
function PredictionForm() {
  const [formData, setFormData] = useState({
    N: 80, P: 48, K: 40,
    temperature: 24, humidity: 82,
    ph: 6.5, rainfall: 230,
    region: "Punjab"
  });
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    setResult(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <RegionSelector
          value={formData.region}
          onChange={(region) => setFormData({...formData, region})}
        />
        <button type="submit">Get Recommendation</button>
      </form>

      {result && (
        <RegionalSummary
          region={formData.region}
          crop={result.crop}
          soilData={formData}
        />
      )}
    </div>
  );
}
```

## Backend Architecture

### Files Structure

```
backend/
├── app.py                    # Main Flask app with endpoints
├── regional_service.py       # Regional summary logic
├── gemini_service.py         # AI integration
└── .env                      # Environment variables
```

### Key Functions

**regional_service.py:**
- `generate_regional_summary()` - Main AI-powered summary generator
- `get_mock_regional_summary()` - Fallback mock data
- `get_available_regions()` - Returns list of supported regions
- `INDIAN_REGIONS` - Dictionary of regional characteristics

### AI Integration

The system uses Google's Gemini AI to generate intelligent, context-aware regional summaries. It:

1. Takes region characteristics from the database
2. Combines with user's soil/climate data
3. Sends structured prompt to Gemini AI
4. Parses JSON response
5. Falls back to mock data if AI unavailable

### Fallback Mechanism

If Gemini API is unavailable or fails:
- System automatically uses mock data
- Ensures uninterrupted service
- Logs errors for debugging
- Returns realistic placeholder information

## Configuration

### Environment Variables

Add to `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env` file

## Testing

### Test Regional Summary Endpoint

```bash
curl -X POST http://localhost:5000/api/regional-summary \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Punjab",
    "crop": "Rice",
    "N": 80,
    "P": 48,
    "K": 40,
    "temperature": 24,
    "humidity": 82,
    "ph": 6.5,
    "rainfall": 230
  }'
```

### Test Regions Endpoint

```bash
curl http://localhost:5000/api/regions
```

## Customization

### Add New Regions

Edit `backend/regional_service.py`:

```python
INDIAN_REGIONS = {
    "Your_Region": {
        "climate": "Climate description",
        "soil": "Soil type",
        "major_crops": ["Crop1", "Crop2"],
        "rainfall": "Range in mm",
        "challenges": ["Challenge1", "Challenge2"]
    }
}
```

### Customize AI Prompt

Modify `REGIONAL_SUMMARY_PROMPT` in `regional_service.py` to adjust:
- Information depth
- Language style
- Additional fields
- Output format

### Style Customization

The components use Tailwind CSS and shadcn/ui. Customize by:
- Modifying className props
- Updating color schemes
- Adjusting card layouts
- Changing badge colors

## Best Practices

1. **Always provide region selection** - Let users choose their location
2. **Show loading states** - Regional summaries take 2-5 seconds
3. **Handle errors gracefully** - Display user-friendly error messages
4. **Cache results** - Consider caching for same region+crop combinations
5. **Mobile responsive** - Test on different screen sizes
6. **Accessibility** - Ensure keyboard navigation works

## Troubleshooting

### Issue: "Region not supported"
**Solution:** Check region name matches exactly (case-sensitive)

### Issue: API timeout
**Solution:** Increase timeout in `generate_regional_summary()` or check network

### Issue: Empty response
**Solution:** Verify Gemini API key is valid and has quota

### Issue: Mock data always returned
**Solution:** Check `.env` file has correct `GEMINI_API_KEY`

## Future Enhancements

- [ ] Add more regions (international support)
- [ ] Historical weather data integration
- [ ] Satellite imagery analysis
- [ ] Farmer community feedback
- [ ] Multi-language support for summaries
- [ ] Real-time market price integration
- [ ] Crop disease prediction by region
- [ ] Water availability forecasting

## Support

For issues or questions:
- Check the example files in `src/components/RegionalSummary.example.tsx`
- Review API responses in browser console
- Check backend logs for errors
- Verify environment variables are set correctly

## License

Part of Farm Futura AI project
