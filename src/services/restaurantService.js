/**
 * Restaurant Service for TripResQ
 *
 * Real nearby restaurant, café, and fast-food discovery using OpenStreetMap Overpass API.
 * Normalized schemas, precise Haversine distance calculations, honest opening hours,
 * and verified OpenStreetMap / Wikimedia Commons image resolution.
 * No fabricated ratings, prices, or fake stock photos.
 */

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

/**
 * Calculate Great-Circle distance between two coordinates using Haversine formula (in km).
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return 999.0;
  }
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place (e.g. 0.8 km)
}

/**
 * Format address string from OSM tags
 */
function extractAddress(tags = {}) {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb'] || tags['addr:neighbourhood']) parts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
  if (tags['addr:city'] || tags['addr:town']) parts.push(tags['addr:city'] || tags['addr:town']);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  // Fallback to street / location note if available
  return tags['addr:full'] || tags['street'] || tags['note'] || null;
}

/**
 * Check if the establishment is vegetarian based on real OSM tags
 */
function isVegetarianFromTags(tags = {}) {
  const dietVeg = tags['diet:vegetarian'];
  const dietVegan = tags['diet:vegan'];
  const dietJain = tags['diet:jain'];
  const cuisine = (tags['cuisine'] || '').toLowerCase();

  if (dietVeg === 'yes' || dietVeg === 'only' || dietVeg === 'strict') return true;
  if (dietVegan === 'yes' || dietVegan === 'only') return true;
  if (dietJain === 'yes' || dietJain === 'only') return true;
  if (cuisine.includes('vegetarian') || cuisine.includes('pure_veg') || cuisine.includes('pure veg')) return true;

  if (dietVeg === 'no') return false;

  return null; // Not specified
}

/**
 * Check if vegan options exist from real OSM tags
 */
function isVeganFromTags(tags = {}) {
  const dietVegan = tags['diet:vegan'];
  return dietVegan === 'yes' || dietVegan === 'only';
}

/**
 * Basic evaluation of simple opening_hours (e.g., "07:00-23:00", "24/7", "Mo-Su 10:00-22:00")
 */
export function checkIsOpenNow(openingHoursStr) {
  if (!openingHoursStr || typeof openingHoursStr !== 'string') {
    return null; // Unknown
  }

  const clean = openingHoursStr.trim();
  if (clean === '24/7' || clean.toLowerCase().includes('24/7')) {
    return { isOpen: true, statusText: 'Open 24/7' };
  }

  // Check simple time range pattern "HH:MM-HH:MM"
  const timeMatch = clean.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const openH = parseInt(timeMatch[1], 10);
    const openM = parseInt(timeMatch[2], 10);
    const closeH = parseInt(timeMatch[3], 10);
    const closeM = parseInt(timeMatch[4], 10);

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;

    let isOpen = false;
    if (closeMins > openMins) {
      isOpen = currentMins >= openMins && currentMins < closeMins;
    } else {
      isOpen = currentMins >= openMins || currentMins < closeMins;
    }

    return {
      isOpen,
      statusText: isOpen ? `Open now (${clean})` : `Closed (${clean})`
    };
  }

  return {
    isOpen: null,
    statusText: clean
  };
}

/**
 * Resolves a real photo from OSM or Wikimedia Commons tags.
 * Follows strict priority without fabricating images:
 * 1. Direct OSM image tag
 * 2. Wikimedia Commons tag (resolved via Special:FilePath)
 * 3. Wikidata-linked image (if formatted)
 * 4. Returns null for styled placeholder fallback
 *
 * @param {Object} restaurant
 * @returns {{url: string, source: string, attribution: string}|null}
 */
export function resolveRestaurantImage(restaurant) {
  if (!restaurant) return null;

  // 1. Direct OSM image tag
  if (restaurant.rawImage) {
    const raw = restaurant.rawImage.trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return {
        url: raw,
        source: 'OpenStreetMap',
        attribution: 'Image via OpenStreetMap'
      };
    }
    if (raw.startsWith('File:') || raw.startsWith('Image:')) {
      const fileName = raw.replace(/^(File|Image):/i, '').trim();
      return {
        url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=640`,
        source: 'Wikimedia Commons',
        attribution: `Wikimedia Commons: ${fileName}`
      };
    }
  }

  // 2. Wikimedia Commons tag
  if (restaurant.wikimediaCommons) {
    let fileName = restaurant.wikimediaCommons.trim();
    if (fileName.startsWith('File:') || fileName.startsWith('Image:')) {
      fileName = fileName.replace(/^(File|Image):/i, '').trim();
    }
    // Ignore Category: references if not a direct file
    if (!fileName.startsWith('Category:') && fileName.length > 0) {
      return {
        url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=640`,
        source: 'Wikimedia Commons',
        attribution: `Wikimedia Commons: ${fileName}`
      };
    }
  }

  // 3. Wikidata tag if formatted as direct URL
  if (restaurant.wikidata && restaurant.wikidata.startsWith('http')) {
    return {
      url: restaurant.wikidata,
      source: 'Wikidata',
      attribution: 'Image via Wikidata'
    };
  }

  return null;
}

/**
 * Fetch real nearby restaurants from OpenStreetMap Overpass API.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMeters - Search radius in meters (e.g. 1000, 3000, 5000)
 * @returns {Promise<Array<Object>>} Normalized restaurant list sorted by distance
 */
export async function getNearbyRestaurants(lat, lng, radiusMeters = 3000) {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return [];
  }

  const cleanRadius = Math.max(500, Math.min(10000, parseInt(radiusMeters, 10) || 3000));

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"restaurant|cafe|fast_food"](around:${cleanRadius},${lat},${lng});
      way["amenity"~"restaurant|cafe|fast_food"](around:${cleanRadius},${lat},${lng});
    );
    out center tags;
  `.trim();

  let rawElements = null;
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TripResQ-TravelApp/1.0'
        }
      });

      if (response.ok) {
        const json = await response.json();
        rawElements = json.elements || [];
        break;
      }
    } catch (err) {
      lastError = err;
      // Try next endpoint mirror
      continue;
    }
  }

  if (!rawElements) {
    console.warn('[restaurantService] Overpass query failed on all endpoints:', lastError);
    return [];
  }

  // Normalize elements
  const normalized = [];
  const seenNames = new Set();

  for (const el of rawElements) {
    const tags = el.tags || {};
    const name = tags.name || tags['name:en'] || tags['brand'] || null;

    // Skip unnamed nodes to keep list clean and readable
    if (!name) continue;

    // Extract coordinates (way elements provide center: {lat, lon})
    const itemLat = el.lat != null ? el.lat : el.center?.lat;
    const itemLng = el.lon != null ? el.lon : el.center?.lon;

    if (itemLat == null || itemLng == null) continue;

    // Deduplicate identical names nearby within same query
    const dedupKey = `${name.toLowerCase()}-${itemLat.toFixed(3)}-${itemLng.toFixed(3)}`;
    if (seenNames.has(dedupKey)) continue;
    seenNames.add(dedupKey);

    const distanceKm = calculateHaversineDistance(lat, lng, itemLat, itemLng);
    const openingHours = tags.opening_hours || null;
    const openStatus = openingHours ? checkIsOpenNow(openingHours) : null;
    const vegetarian = isVegetarianFromTags(tags);
    const vegan = isVeganFromTags(tags);
    const address = extractAddress(tags);

    // Cuisines list
    let cuisineList = [];
    if (tags.cuisine) {
      cuisineList = tags.cuisine
        .split(';')
        .map(c => c.trim().replace(/_/g, ' '))
        .filter(Boolean);
    }

    // Optional metadata tags from real OSM attributes
    const phone = tags.phone || tags['contact:phone'] || tags['phone:mobile'] || null;
    const website = tags.website || tags['contact:website'] || tags['url'] || null;
    const takeaway = tags.takeaway || null; // 'yes', 'no', 'only'
    const delivery = tags.delivery || null; // 'yes', 'no', 'only'
    const outdoorSeating = tags.outdoor_seating || null; // 'yes', 'no'
    const wheelchair = tags.wheelchair || null; // 'yes', 'no', 'limited', 'designated'
    const internetAccess = tags.internet_access || null; // 'wlan', 'yes', 'no', 'wifi'
    const smoking = tags.smoking || null; // 'no', 'outside', 'isolated', 'separated', 'yes'

    // Real image tags if present in OSM
    const rawImage = tags.image || tags['image:menu'] || null;
    const wikimediaCommons = tags.wikimedia_commons || tags['wikimedia_commons:image'] || null;
    const wikidata = tags.wikidata || null;

    const baseRestaurant = {
      id: `osm-${el.type}-${el.id}`,
      osmId: el.id,
      osmType: el.type,
      osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      name,
      latitude: itemLat,
      longitude: itemLng,
      address,
      cuisine: cuisineList.length > 0 ? cuisineList : null,
      openingHours,
      openStatus,
      vegetarian,
      vegan,
      type: tags.amenity || 'restaurant',
      phone,
      website,
      takeaway,
      delivery,
      outdoorSeating,
      wheelchair,
      internetAccess,
      smoking,
      rawImage,
      wikimediaCommons,
      wikidata,
      distanceKm
    };

    // Pre-resolve image if real OSM/Wikimedia source exists
    const resolvedImage = resolveRestaurantImage(baseRestaurant);

    normalized.push({
      ...baseRestaurant,
      imageUrl: resolvedImage ? resolvedImage.url : null,
      imageSource: resolvedImage ? resolvedImage.source : null,
      imageAttribution: resolvedImage ? resolvedImage.attribution : null
    });
  }

  // Sort Nearest First
  normalized.sort((a, b) => a.distanceKm - b.distanceKm);

  return normalized;
}
