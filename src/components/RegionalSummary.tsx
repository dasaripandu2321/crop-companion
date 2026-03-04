import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Cloud, Droplets, TrendingUp, Users, AlertCircle, CheckCircle2, Sprout } from "lucide-react";
import { API_URL } from "@/config";

interface RegionalSummaryProps {
  region: string;
  crop: string;
  soilData: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
}

interface RegionalData {
  regional_suitability: {
    score: number;
    explanation: string;
  };
  climate_match: {
    temperature_fit: string;
    rainfall_fit: string;
    seasonal_timing: string;
  };
  soil_compatibility: {
    soil_match: string;
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

export function RegionalSummary({ region, crop, soilData }: RegionalSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RegionalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegionalSummary();
  }, [region, crop]);

  const fetchRegionalSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/regional-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          crop,
          ...soilData,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch regional summary");

      const result = await response.json();
      setData(result.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getFitBadge = (fit: string) => {
    const colors = {
      excellent: "bg-green-500",
      good: "bg-blue-500",
      moderate: "bg-yellow-500",
      poor: "bg-red-500",
    };
    return (
      <Badge className={colors[fit as keyof typeof colors] || "bg-gray-500"}>
        {fit}
      </Badge>
    );
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading regional insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error || "Failed to load regional data"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Regional Suitability Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Regional Suitability: {region}</CardTitle>
            </div>
            <div className={`text-3xl font-bold ${getSuitabilityColor(data.regional_suitability.score)}`}>
              {data.regional_suitability.score}/100
            </div>
          </div>
          <CardDescription>{data.regional_suitability.explanation}</CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="climate" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="climate">Climate</TabsTrigger>
          <TabsTrigger value="practices">Practices</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Climate Match */}
        <TabsContent value="climate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5" />
                <span>Climate Compatibility</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Temperature Fit:</span>
                {getFitBadge(data.climate_match.temperature_fit)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rainfall Fit:</span>
                {getFitBadge(data.climate_match.rainfall_fit)}
              </div>
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium mb-1">Seasonal Timing:</p>
                <p className="text-sm text-muted-foreground">{data.climate_match.seasonal_timing}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5" />
                <span>Soil Compatibility</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Soil Match:</span>
                {getFitBadge(data.soil_compatibility.soil_match)}
              </div>
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium mb-1">Recommended Amendments:</p>
                <p className="text-sm text-muted-foreground">{data.soil_compatibility.amendments_needed}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Weather Advisory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.weather_advisory}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Practices */}
        <TabsContent value="practices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sprout className="h-5 w-5" />
                <span>Recommended Varieties</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.regional_best_practices.varieties}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5" />
                <span>Irrigation Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.regional_best_practices.irrigation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Pest Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.regional_best_practices.pest_management}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alternative Crops</CardTitle>
              <CardDescription>Other suitable crops for your region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.alternative_crops.map((altCrop, idx) => (
                  <Badge key={idx} variant="outline">
                    {altCrop}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Insights */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Market Demand</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.market_insights.local_demand}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nearby Markets (Mandis)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.market_insights.nearby_mandis}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.market_insights.price_trends}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Success Stories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.success_stories}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Government Support */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Regional Schemes & Subsidies</span>
              </CardTitle>
              <CardDescription>Government support available in {region}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{data.regional_schemes}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
