# Testing Regional Summaries Feature

## Quick Test Checklist

- [ ] Backend server starts without errors
- [ ] Regions API returns list of 15 states
- [ ] Regional summary API returns valid JSON
- [ ] Frontend components render correctly
- [ ] Region selector dropdown works
- [ ] Regional summary displays all tabs
- [ ] Loading states show properly
- [ ] Error handling works
- [ ] Mock data fallback functions

## Backend Testing

### 1. Start the Backend Server

```bash
cd farm-futura-ai-main/backend
python app.py
```

**Expected Output:**
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### 2. Test Regions Endpoint

```bash
curl http://localhost:5000/api/regions
```

**Expected Response:**
```json
{
  "regions": [
    "Punjab",
    "Haryana",
    "Uttar Pradesh",
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Andhra Pradesh",
    "Telangana",
    "West Bengal",
    "Kerala",
    "Gujarat",
    "Rajasthan",
    "Madhya Pradesh",
    "Bihar",
    "Odisha"
  ]
}
```

### 3. Test Regional Summary Endpoint (Rice in Punjab)

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

**Expected Response Structure:**
```json
{
  "region": "Punjab",
  "crop": "Rice",
  "summary": {
    "regional_suitability": {
      "score": 85,
      "explanation": "..."
    },
    "climate_match": {
      "temperature_fit": "good",
      "rainfall_fit": "excellent",
      "seasonal_timing": "..."
    },
    ...
  }
}
```

### 4. Test Different Regions

**Cotton in Maharashtra:**
```bash
curl -X POST http://localhost:5000/api/regional-summary \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Maharashtra",
    "crop": "Cotton",
    "N": 100,
    "P": 50,
    "K": 80,
    "temperature": 25,
    "humidity": 65,
    "ph": 6.8,
    "rainfall": 90
  }'
```

**Wheat in Haryana:**
```bash
curl -X POST http://localhost:5000/api/regional-summary \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Haryana",
    "crop": "Wheat",
    "N": 75,
    "P": 55,
    "K": 45,
    "temperature": 22,
    "humidity": 65,
    "ph": 6.8,
    "rainfall": 90
  }'
```

### 5. Test Error Handling

**Invalid Region:**
```bash
curl -X POST http://localhost:5000/api/regional-summary \
  -H "Content-Type: application/json" \
  -d '{
    "region": "InvalidState",
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

**Expected Error:**
```json
{
  "region": "InvalidState",
  "crop": "Rice",
  "summary": {
    "error": "Region 'InvalidState' not supported. Available regions: Punjab, Haryana, ..."
  }
}
```

**Missing Parameters:**
```bash
curl -X POST http://localhost:5000/api/regional-summary \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Punjab"
  }'
```

**Expected Error:**
```json
{
  "error": "Region and crop are required"
}
```

## Frontend Testing

### 1. Start Frontend Development Server

```bash
cd farm-futura-ai-main
npm run dev
```

**Expected Output:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 2. Test RegionSelector Component

Create a test page:

```tsx
// src/pages/TestRegional.tsx
import { useState } from "react";
import { RegionSelector } from "@/components/RegionSelector";

export default function TestRegional() {
  const [region, setRegion] = useState("Punjab");

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Region Selector Test</h1>
      <RegionSelector value={region} onChange={setRegion} />
      <p className="mt-4">Selected: {region}</p>
    </div>
  );
}
```

**Manual Tests:**
- [ ] Dropdown opens on click
- [ ] All 15 regions are listed
- [ ] Selection updates the value
- [ ] Loading state shows initially
- [ ] No console errors

### 3. Test RegionalSummary Component

```tsx
// src/pages/TestRegionalSummary.tsx
import { RegionalSummary } from "@/components/RegionalSummary";

export default function TestRegionalSummary() {
  const soilData = {
    N: 80,
    P: 48,
    K: 40,
    temperature: 24,
    humidity: 82,
    ph: 6.5,
    rainfall: 230,
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl mb-4">Regional Summary Test</h1>
      <RegionalSummary
        region="Punjab"
        crop="Rice"
        soilData={soilData}
      />
    </div>
  );
}
```

**Manual Tests:**
- [ ] Loading spinner shows initially
- [ ] Data loads within 5 seconds
- [ ] Suitability score displays correctly
- [ ] All 4 tabs are present (Climate, Practices, Market, Support)
- [ ] Tab switching works smoothly
- [ ] Badges show correct colors
- [ ] Cards render properly
- [ ] Text is readable
- [ ] No layout issues on mobile

### 4. Test Error States

**Test with backend stopped:**
1. Stop the Flask backend
2. Reload the frontend page
3. Verify error message displays
4. Check console for network error

**Expected Behavior:**
- Red error card appears
- User-friendly error message
- No app crash

### 5. Test Loading States

**Simulate slow network:**
1. Open browser DevTools
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Reload page
5. Observe loading spinner

**Expected Behavior:**
- Spinner shows immediately
- Spinner disappears when data loads
- No flash of content

## Integration Testing

### Test Full Prediction Flow

1. **Navigate to prediction form**
2. **Enter soil parameters:**
   - N: 80
   - P: 48
   - K: 40
   - Temperature: 24°C
   - Humidity: 82%
   - pH: 6.5
   - Rainfall: 230mm

3. **Select region:** Punjab

4. **Submit form**

5. **Verify prediction result shows**

6. **Verify regional summary displays below**

7. **Test changing region:**
   - Change to "Maharashtra"
   - Verify summary updates
   - Check different recommendations

### Test Multiple Crops

Test these combinations:

| Region | Crop | Expected Suitability |
|--------|------|---------------------|
| Punjab | Rice | High (80-90) |
| Punjab | Wheat | High (80-90) |
| Maharashtra | Cotton | High (80-90) |
| Tamil Nadu | Rice | High (80-90) |
| Kerala | Coconut | High (85-95) |
| Rajasthan | Bajra | High (80-90) |
| Karnataka | Coffee | High (80-90) |

## Performance Testing

### Response Time Test

```bash
# Test 10 requests and measure time
for i in {1..10}; do
  time curl -X POST http://localhost:5000/api/regional-summary \
    -H "Content-Type: application/json" \
    -d '{
      "region": "Punjab",
      "crop": "Rice",
      "N": 80, "P": 48, "K": 40,
      "temperature": 24, "humidity": 82,
      "ph": 6.5, "rainfall": 230
    }' > /dev/null 2>&1
done
```

**Expected:**
- With Gemini API: 2-5 seconds per request
- With mock data: <100ms per request

### Concurrent Requests Test

```bash
# Test 5 concurrent requests
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/regional-summary \
    -H "Content-Type: application/json" \
    -d '{
      "region": "Punjab",
      "crop": "Rice",
      "N": 80, "P": 48, "K": 40,
      "temperature": 24, "humidity": 82,
      "ph": 6.5, "rainfall": 230
    }' &
done
wait
```

**Expected:**
- All requests complete successfully
- No server crashes
- Responses within reasonable time

## Browser Compatibility Testing

Test in these browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

**Check:**
- Components render correctly
- Dropdowns work
- Tabs switch properly
- No console errors
- Responsive layout works

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through region selector
- [ ] Open dropdown with Enter/Space
- [ ] Navigate options with arrow keys
- [ ] Select with Enter
- [ ] Tab through tabs
- [ ] Switch tabs with arrow keys

### Screen Reader Testing
- [ ] Region selector announces properly
- [ ] Tab labels are read
- [ ] Card content is accessible
- [ ] Error messages are announced

## Common Issues & Solutions

### Issue: "Connection refused"
**Cause:** Backend not running  
**Solution:** Start Flask server with `python app.py`

### Issue: "CORS error"
**Cause:** CORS not configured  
**Solution:** Verify `flask-cors` is installed and `CORS(app)` is in app.py

### Issue: "Empty regions list"
**Cause:** API endpoint not working  
**Solution:** Check backend logs, verify route is registered

### Issue: "Always shows mock data"
**Cause:** No Gemini API key  
**Solution:** Add `GEMINI_API_KEY` to `.env` file

### Issue: "Timeout error"
**Cause:** Gemini API slow or unavailable  
**Solution:** Increase timeout or use mock data

### Issue: "Components not found"
**Cause:** Import paths incorrect  
**Solution:** Verify `@/components` alias is configured in tsconfig.json

## Automated Testing (Optional)

### Backend Unit Tests

```python
# backend/test_regional.py
import pytest
from regional_service import get_available_regions, generate_regional_summary

def test_get_regions():
    regions = get_available_regions()
    assert len(regions) == 15
    assert "Punjab" in regions

def test_regional_summary():
    result = generate_regional_summary(
        "Punjab", "Rice",
        {"N": 80, "P": 48, "K": 40, "temperature": 24,
         "humidity": 82, "ph": 6.5, "rainfall": 230}
    )
    assert "regional_suitability" in result
    assert result["regional_suitability"]["score"] >= 0
    assert result["regional_suitability"]["score"] <= 100
```

Run tests:
```bash
cd backend
pytest test_regional.py
```

### Frontend Component Tests

```tsx
// src/components/__tests__/RegionSelector.test.tsx
import { render, screen } from '@testing-library/react';
import { RegionSelector } from '../RegionSelector';

test('renders region selector', () => {
  render(<RegionSelector value="Punjab" onChange={() => {}} />);
  expect(screen.getByText(/Select Your Region/i)).toBeInTheDocument();
});
```

Run tests:
```bash
npm run test
```

## Test Report Template

```
Regional Summaries Feature - Test Report
Date: ___________
Tester: ___________

Backend Tests:
[ ] Server starts successfully
[ ] Regions API works
[ ] Regional summary API works
[ ] Error handling works
[ ] Mock fallback works

Frontend Tests:
[ ] RegionSelector renders
[ ] RegionalSummary renders
[ ] Loading states work
[ ] Error states work
[ ] Tabs function properly

Integration Tests:
[ ] Full prediction flow works
[ ] Region changes update summary
[ ] Multiple crops tested

Performance:
[ ] Response time < 5s
[ ] No memory leaks
[ ] Handles concurrent requests

Browser Compatibility:
[ ] Chrome
[ ] Firefox
[ ] Safari
[ ] Mobile

Accessibility:
[ ] Keyboard navigation
[ ] Screen reader compatible

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Status: [ ] PASS  [ ] FAIL
```

---

**Testing Complete!** If all tests pass, the feature is ready for production use.
