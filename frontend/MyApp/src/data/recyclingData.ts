// src/recyclingData.ts

export interface Center {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    wasteTypes: string[];
}

export const REAL_CENTERS: Center[] = [
    // --- RISHON LEZION ---
    {
        id: 1,
        name: 'Azrieli Mall Rishonim',
        address: 'Nimrod St 2, Rishon LeTsiyon',
        latitude: 31.9510,
        longitude: 34.8055,
        wasteTypes: ['Electronics', 'Bottles', 'Paper']
    },
    {
        id: 2,
        name: 'Yes Planet Rishon',
        address: 'HaMea VeEsrim St 4, Rishon LeTsiyon',
        latitude: 31.9764,
        longitude: 34.7667,
        wasteTypes: ['Glass', 'Plastic']
    },
    {
        id: 3,
        name: 'Gold Mall (Kenyon HaZahav)',
        address: 'David Sakharov St 21, Rishon LeTsiyon',
        latitude: 31.9918,
        longitude: 34.7735,
        wasteTypes: ['Clothing', 'Batteries', 'Cartons']
    },

    // --- TEL AVIV ---
    {
        id: 4,
        name: 'Dizengoff Center',
        address: 'Dizengoff St 50, Tel Aviv',
        latitude: 32.0754,
        longitude: 34.7757,
        wasteTypes: ['Electronics', 'Bottles', 'Paper']
    },
    {
        id: 5,
        name: 'Sarona Market Recycling',
        address: 'Aluf Kalman Magen St 3, Tel Aviv',
        latitude: 32.0718,
        longitude: 34.7889,
        wasteTypes: ['Plastic', 'Glass', 'Organic']
    },
    {
        id: 6,
        name: 'Tel Aviv Port (Namal)',
        address: 'Nemal Tel Aviv St 12, Tel Aviv',
        latitude: 32.0970,
        longitude: 34.7736,
        wasteTypes: ['Plastic', 'Paper']
    },

    // --- JERUSALEM ---
    {
        id: 7,
        name: 'The First Station',
        address: 'David Remez St 4, Jerusalem',
        latitude: 31.7665,
        longitude: 35.2243,
        wasteTypes: ['Glass', 'Paper', 'Clothing']
    },
    
    // --- HAIFA ---
    {
        id: 8,
        name: 'Grand Canyon Mall',
        address: 'Simha Golan Rd 54, Haifa',
        latitude: 32.7876,
        longitude: 35.0069,
        wasteTypes: ['Electronics', 'Batteries']
    }
];