import axios from 'axios';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || 'MAPBOX_KEY_NOT_SET';
const MAPBOX_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

type GeocodeResult = {
  location: string;
  latitude: number;
  longitude: number;
};

export async function geocodeLocations(locations: string[]): Promise<GeocodeResult[]> {
  const results: GeocodeResult[] = [];
  for (const loc of locations) {
    const url = `${MAPBOX_API}${encodeURIComponent(loc)}.json?access_token=${MAPBOX_TOKEN}`;
    const res = await axios.get(url);
    if (
      res.data.features &&
      res.data.features.length > 0 &&
      res.data.features[0].center
    ) {
      const [longitude, latitude] = res.data.features[0].center;
      results.push({ location: loc, latitude, longitude });
    } else {
      results.push({ location: loc, latitude: 0, longitude: 0 });
    }
  }
  return results;
}

// Haversine utility
type ClusteredResult = GeocodeResult & { mentionCount: number; sentimentScore: number; cluster: number };

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function haversineDistKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function clusterLocations(locData: GeocodeResult[], distanceThreshold = 300): number[] {
  const clusters: number[] = new Array(locData.length).fill(-1);
  let clusterId = 0;
  for (let i = 0; i < locData.length; i++) {
    if (clusters[i] !== -1) continue;
    clusters[i] = clusterId;
    for (let j = i + 1; j < locData.length; j++) {
      if (
        haversineDistKm(
          locData[i].latitude,
          locData[i].longitude,
          locData[j].latitude,
          locData[j].longitude
        ) < distanceThreshold
      ) {
        clusters[j] = clusterId;
      }
    }
    clusterId++;
  }
  return clusters;
}
