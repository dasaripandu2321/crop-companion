# Regional Summaries - System Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────────┐         ┌─────────────────────────────┐ │
│  │ RegionSelector   │────────▶│  RegionalSummary Component  │ │
│  │  (Dropdown)      │         │  (Tabbed Display)           │ │
│  └──────────────────┘         └─────────────────────────────┘ │
│         │                                    │                  │
│         │ Select Region                      │ Request Summary  │
│         ▼                                    ▼                  │
└─────────────────────────────────────────────────────────────────┘
          │                                    │
          │ GET /api/regions                   │ POST /api/regional-summary
          │                                    │
          ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FLASK BACKEND                            │
│                                                                 │
│  ┌──────────────────┐         ┌─────────────────────────────┐ │
│  │  app.py          │────────▶│  regional_service.py        │ │
│  │  (API Routes)    │         │  (Business Logic)           │ │
│  └──────────────────┘         └─────────────────────────────┘ │
│                                           │                     │
│                                           │ Generate Summary    │
│                                           ▼                     │
│                              ┌─────────────────────────────┐   │
│                              │  INDIAN_REGIONS Database    │   │
│                              │  (15 States Data)           │   │
│                              └─────────────────────────────┘   │
│                                           │                     │
│                                           │ Combine with Input  │
│                                           ▼                     │
│                              ┌─────────────────────────────┐   │
│                              │  Gemini AI Service          │   │
│                              │  (gemini-2.0-flash)         │   │
│                              └─────────────────────────────┘   │
│                                           │                     │
│                                           │ AI Response         │
│                                           ▼                     │
│                              ┌─────────────────────────────┐   │
│                              │  JSON Parser & Validator    │   │
│                              └─────────────────────────────┘   │
│                                           │                     │
│                                           │ If Error            │
│                                           ▼                     │
│                              ┌─────────────────────────────┐   │
│                              │  Mock Data Fallback         │   │
│                              └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                           │
                                           │ Return JSON
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RESPONSE TO FRONTEND                       │
│                                                                 │
│  {                                                              │
│    "regional_suitability": { score, explanation },             │
│    "climate_match": { temperature_fit, rainfall_fit, ... },   │
│    "soil_compatibility": { soil_match, amendments },           │
│    "regional_best_practices": { varieties, irrigation, ... }, │
│    "market_insights": { demand, mandis, prices },             │
│    "success_stories": "...",                                   │
│    "regional_schemes": "...",                                  │
│    "weather_advisory": "...",                                  │
│    "alternative_crops": [...]                                  │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RegionalSummary.tsx                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Header: Suitability Score              │  │
│  │              (Color-coded 0-100)                    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                   Tabs Component                    │  │
│  │  ┌──────┬──────────┬────────┬─────────┐            │  │
│  │  │Climate│Practices│ Market │ Support │            │  │
│  │  └──────┴──────────┴────────┴─────────┘            │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         Tab Content (Cards)                 │  │  │
│  │  │  • Climate Match (badges)                   │  │  │
│  │  │  • Soil Compatibility                       │  │  │
│  │  │  • Weather Advisory                         │  │  │
│  │  │  • Best Practices                           │  │  │
│  │  │  • Market Insights                          │  │  │
│  │  │  • Government Schemes                       │  │  │
│  │  │  • Alternative Crops                        │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
User Action                    Component State              API Call
─────────────────────────────────────────────────────────────────────

Select Region     ──────▶    setRegion("Punjab")
                                    │
                                    ▼
                            useEffect triggered
                                    │
                                    ▼
                            setLoading(true)
                                    │
                                    ▼
                            fetchRegionalSummary()  ──────▶  POST /api/regional-summary
                                                                      │
                                                                      ▼
                                                              Backend Processing
                                                                      │
                                                                      ▼
                            setData(response)       ◀──────  JSON Response
                                    │
                                    ▼
                            setLoading(false)
                                    │
                                    ▼
                            Render UI with data
```

## Backend Processing Flow

```
API Request
    │
    ▼
┌─────────────────────────────────────────┐
│  1. Validate Input                      │
│     • Check region exists               │
│     • Check crop name provided          │
│     • Validate soil parameters          │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  2. Fetch Regional Data                 │
│     • Get from INDIAN_REGIONS dict      │
│     • Extract climate, soil, crops      │
│     • Get challenges & rainfall         │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  3. Build AI Prompt                     │
│     • Combine regional characteristics  │
│     • Add user's soil data              │
│     • Format as structured prompt       │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  4. Call Gemini AI                      │
│     • POST to Google AI API             │
│     • Wait for response (15s timeout)   │
│     • Handle rate limits                │
└─────────────────────────────────────────┘
    │
    ├─── Success ────▶ Parse JSON ────▶ Return Data
    │
    └─── Error ─────▶ Log Error ──────▶ Return Mock Data
```

## Error Handling Strategy

```
┌─────────────────────────────────────────┐
│         Error Scenarios                 │
└─────────────────────────────────────────┘
              │
              ├─── No API Key ──────────────▶ Use Mock Data
              │
              ├─── Network Timeout ─────────▶ Use Mock Data
              │
              ├─── Invalid JSON ────────────▶ Use Mock Data
              │
              ├─── API Rate Limit ──────────▶ Use Mock Data
              │
              ├─── Invalid Region ──────────▶ Return Error Message
              │
              └─── Server Error ────────────▶ Use Mock Data

All errors are logged for debugging
User always gets a response (never blank screen)
```

## Data Models

### Input Model
```typescript
{
  region: string;        // "Punjab", "Maharashtra", etc.
  crop: string;          // "Rice", "Wheat", etc.
  N: number;             // Nitrogen (kg/ha)
  P: number;             // Phosphorus (kg/ha)
  K: number;             // Potassium (kg/ha)
  temperature: number;   // °C
  humidity: number;      // %
  ph: number;            // 0-14
  rainfall: number;      // mm
}
```

### Output Model
```typescript
{
  regional_suitability: {
    score: number;           // 0-100
    explanation: string;
  };
  climate_match: {
    temperature_fit: "excellent" | "good" | "moderate" | "poor";
    rainfall_fit: "excellent" | "good" | "moderate" | "poor";
    seasonal_timing: string;
  };
  soil_compatibility: {
    soil_match: "excellent" | "good" | "moderate" | "poor";
    amendments_needed: string;
  };
  regional_best_practices: {
    varieties: string;
    irrigation: string;
    pest_management: string;
  };
  market_insights: {
    local_demand: string;
    nearby_mandis: string;
    price_trends: string;
  };
  success_stories: string;
  regional_schemes: string;
  weather_advisory: string;
  alternative_crops: string[];
}
```

## Performance Considerations

### Response Times
- **API Call**: 2-5 seconds (Gemini AI processing)
- **Mock Fallback**: <100ms (instant)
- **Region List**: <50ms (cached in memory)

### Optimization Strategies
1. **Caching**: Consider caching responses for same region+crop
2. **Lazy Loading**: Load regional data only when needed
3. **Debouncing**: Prevent multiple rapid API calls
4. **Preloading**: Fetch regions list on app load
5. **Error Recovery**: Automatic fallback to mock data

### Scalability
- Stateless backend (easy horizontal scaling)
- No database required (data in memory)
- API rate limiting handled gracefully
- Mock data ensures 100% uptime

## Security Considerations

1. **API Key Protection**: Stored in `.env`, never exposed to frontend
2. **Input Validation**: All inputs validated before processing
3. **Rate Limiting**: Gemini API has built-in rate limits
4. **CORS**: Configured in Flask for frontend access
5. **Error Messages**: Generic errors to users, detailed logs for devs

## Future Architecture Enhancements

```
Planned Features:
├── Database Integration
│   ├── PostgreSQL for regional data
│   ├── Redis for caching responses
│   └── Historical data storage
│
├── Advanced AI Features
│   ├── Multi-model ensemble
│   ├── Fine-tuned regional models
│   └── Real-time weather integration
│
├── Analytics
│   ├── Track popular regions
│   ├── Monitor API performance
│   └── User feedback collection
│
└── Internationalization
    ├── Support more countries
    ├── Multi-language summaries
    └── Currency conversion for prices
```

---

This architecture ensures reliability, performance, and scalability while maintaining simplicity and ease of maintenance.
