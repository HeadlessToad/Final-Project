// src/recyclingData.ts

import rawGeoJson from '../recycling_centers.json';

export interface Center {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    wasteTypes: string[];
}

// 🔥 STRICT FILTERING LOGIC
export const REAL_CENTERS: Center[] = (rawGeoJson as any).features
    .map((feature: any, index: number) => {
        
        const lng = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        const p = feature.properties;

        // 1. Name Strategy: Use real name, or construct one from the address
        let name = p.name || p["name:en"] || p["name:he"];
        if (!name && p["addr:street"]) {
            name = `${p["addr:street"]} Recycling`;
        }
        if (!name) name = "Recycling Point";

        // 2. Detect Types
        const detectedTypes: string[] = [];
        if (p['recycling:glass'] === 'yes' || p['amenity'] === 'recycling_glass') detectedTypes.push('Glass');
        if (p['recycling:paper'] === 'yes' || p['amenity'] === 'recycling_paper') detectedTypes.push('Paper');
        if (p['recycling:cans'] === 'yes') detectedTypes.push('Cans');
        if (p['recycling:plastic'] === 'yes') detectedTypes.push('Plastic');
        if (p['recycling:clothes'] === 'yes') detectedTypes.push('Clothing');
        if (p['recycling:batteries'] === 'yes') detectedTypes.push('Batteries');
        if (p['recycling:electronics'] === 'yes') detectedTypes.push('Electronics');

        // 3. 🚨 THE FILTER: If we found NO specific types, return null (mark for deletion)
        if (detectedTypes.length === 0) {
            return null;
        }

        return {
            id: index + 1,
            name: name,
            address: p["addr:street"] 
                     ? `${p["addr:street"]} ${p["addr:housenumber"] || ''}`
                     : "Street location",
            latitude: lat,
            longitude: lng,
            wasteTypes: detectedTypes
        };
    })
    .filter((item: Center | null) => item !== null); // 🧹 Delete the nulls (the bad data)