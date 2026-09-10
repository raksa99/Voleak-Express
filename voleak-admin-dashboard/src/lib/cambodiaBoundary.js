// Cambodia Official Geographic Boundary & World Mask GeoJSON
// Used to strictly mask out all neighboring countries (Thailand, Laos, Vietnam, oceans)
// and highlight ONLY the Kingdom of Cambodia on Leaflet maps.

export const CAMBODIA_COORDINATES = [
  [103.582, 10.563],
  [103.497, 10.632],
  [103.201, 10.825],
  [103.090, 11.153],
  [102.923, 11.642],
  [102.584, 12.186],
  [102.612, 12.551],
  [102.482, 12.923],
  [102.348, 13.394],
  [102.521, 13.672],
  [102.684, 13.915],
  [102.988, 14.152],
  [103.241, 14.364],
  [103.682, 14.432],
  [104.125, 14.412],
  [104.582, 14.394],
  [105.012, 14.285],
  [105.412, 14.321],
  [105.812, 14.215],
  [106.125, 14.482],
  [106.521, 14.682],
  [107.125, 14.712],
  [107.582, 14.612],
  [107.621, 14.125],
  [107.512, 13.621],
  [107.612, 13.125],
  [107.382, 12.682],
  [107.125, 12.215],
  [106.782, 11.912],
  [106.412, 11.782],
  [106.148, 11.082],
  [106.120, 11.047],
  [105.882, 10.923],
  [105.512, 10.825],
  [105.125, 10.712],
  [104.782, 10.512],
  [104.482, 10.412],
  [104.182, 10.394],
  [103.912, 10.425],
  [103.582, 10.563],
];

// Inverted World Polygon Mask: World boundary with Cambodia cutout hole
// Outer ring = world [-180, -90] to [180, 90]
// Inner ring = Cambodia coordinates in reverse order
export const CAMBODIA_MASK_GEOJSON = {
  type: 'Feature',
  properties: {
    name: 'Cambodia Only Mask',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      // Outer World Ring (covers entire globe outside Cambodia)
      [
        [-180.0, -90.0],
        [180.0, -90.0],
        [180.0, 90.0],
        [-180.0, 90.0],
        [-180.0, -90.0],
      ],
      // Inner Hole = Cambodia Boundary
      CAMBODIA_COORDINATES,
    ],
  },
};

// Cambodia Single Boundary GeoJSON
export const CAMBODIA_BORDER_GEOJSON = {
  type: 'Feature',
  properties: {
    name: 'Kingdom of Cambodia',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [CAMBODIA_COORDINATES],
  },
};

// Standard Leaflet bounds restricted to Cambodia
export const CAMBODIA_BOUNDS = [
  [9.8, 102.1], // Southwest
  [14.9, 107.9], // Northeast
];

export const CAMBODIA_CENTER = [12.5657, 104.991];
