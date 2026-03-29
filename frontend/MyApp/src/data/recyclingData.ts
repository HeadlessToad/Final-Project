// src/recyclingData.ts
// ============================================================================
// DATA PROCESSING MODULE:
// This file is responsible for importing the raw GeoJSON data downloaded from 
// Overpass Turbo (OpenStreetMap) and transforming it into a clean, typed array 
// of 'Center' objects that the application (maps, lists, filters) can consume.
// ============================================================================

import rawGeoJson from '../recycling_centers.json';

// Defines the structure of a standardized recycling center in our application
export interface Center {
    id: number;              // Unique identifier
    name: string;            // Display name of the center
    address: string;         // Display address (if available)
    latitude: number;        // Map coordinate (Y)
    longitude: number;       // Map coordinate (X)
    wasteTypes: string[];    // Array of accepted waste categories (e.g., ['Plastic', 'Glass'])
}

// STRICT FILTERING LOGIC
// We map over the raw GeoJSON features and extract only the relevant information.
// Any feature that doesn't match our specific app categories is filtered out.
export const REAL_CENTERS: Center[] = (rawGeoJson as any).features
    .map((feature: any, index: number) => {
        
        // GeoJSON explicitly stores coordinates as [longitude, latitude]
        const lng = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        
        // 'properties' contains all the OpenStreetMap tags (amenity, recycling:*, name:*, etc.)
        const p = feature.properties;

        // 1. Name Strategy: 
        // Try to find an official name in various languages.
        // Fallback to constructing a name from the street address.
        // Ultimate fallback to a generic "Recycling Point" string.
        let name = p.name || p["name:en"] || p["name:he"];
        if (!name && p["addr:street"]) {
            name = `${p["addr:street"]} Recycling`;
        }
        if (!name) name = "Recycling Point";

        // 2. Detect Types (Updated to: Plastic, Glass, Metal, Paper, Cardboard)
        // We check various OSM tags to determine which of our 5 core categories this bin supports.
        const detectedTypes: string[] = [];
        
        // Plastic (including robust checks for generic plastic, bottles, and packaging)
        if (p['recycling:plastic'] === 'yes' || p['recycling:plastic_bottles'] === 'yes' || p['recycling:plastic_packaging'] === 'yes') {
            detectedTypes.push('Plastic');
        }
        
        // Glass (checking generic glass, specific amenities, or glass bottles)
        if (p['recycling:glass'] === 'yes' || p['amenity'] === 'recycling_glass' || p['recycling:glass_bottles'] === 'yes') {
            detectedTypes.push('Glass');
        }
        
        // Metal (Checking for general metal, scrap metal, or specifically beverage cans)
        if (p['recycling:metal'] === 'yes' || p['recycling:cans'] === 'yes' || p['recycling:scrap_metal'] === 'yes') {
            detectedTypes.push('Metal');
        }
        
        // Paper (Checking generic paper tags or specific paper recycling amenities)
        if (p['recycling:paper'] === 'yes' || p['amenity'] === 'recycling_paper') {
            detectedTypes.push('Paper');
        }
        
        // Cardboard (Specifically looking for cardboard recycling facilities)
        if (p['recycling:cardboard'] === 'yes') {
            detectedTypes.push('Cardboard');
        }

        // 3.The filter: 
        // If we processed this node but found NO specific types that our app supports 
        // (e.g., if it was a battery-only bin), we return null to mark it for deletion.
        if (detectedTypes.length === 0) {
            return null;
        }

        // Return the cleanly formatted Center object
        return {
            id: index + 1,
            name: name,
            address: p["addr:street"] 
                     ? `${p["addr:street"]} ${p["addr:housenumber"] || ''}` // E.g., "Herzl 45"
                     : "Street location",
            latitude: lat,
            longitude: lng,
            wasteTypes: detectedTypes
        };
    })
    // 🧹 Delete the nulls: This removes any bins that didn't support our 5 core categories
    .filter((item: Center | null) => item !== null);