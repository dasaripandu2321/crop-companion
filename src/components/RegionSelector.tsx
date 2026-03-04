import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { API_URL } from "@/config";

interface RegionSelectorProps {
  value: string;
  onChange: (region: string) => void;
  className?: string;
}

export function RegionSelector({ value, onChange, className = "" }: RegionSelectorProps) {
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/regions`);
      const data = await response.json();
      setRegions(data.regions || []);
    } catch (error) {
      console.error("Failed to fetch regions:", error);
      // Fallback to hardcoded list
      setRegions([
        "Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Karnataka",
        "Tamil Nadu", "Andhra Pradesh", "Telangana", "West Bengal", "Kerala",
        "Gujarat", "Rajasthan", "Madhya Pradesh", "Bihar", "Odisha"
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="region" className="flex items-center space-x-2">
        <MapPin className="h-4 w-4" />
        <span>Select Your Region</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id="region">
          <SelectValue placeholder={loading ? "Loading regions..." : "Choose your state"} />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
