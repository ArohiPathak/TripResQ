"""
Deterministic mock weather data for TripResQ demo scenario.
Provides weather conditions per route segment for Risk Radar calculations.
"""

WEATHER_CONDITIONS = {
    "DEL": {
        "city": "Delhi",
        "condition": "Thunderstorms",
        "icon": "⛈️",
        "temperature_c": 34,
        "humidity_pct": 88,
        "wind_kph": 45,
        "visibility_km": 3,
        "risk_level": "HIGH",
        "risk_score": 85,
        "advisory": "Severe thunderstorms with lightning. Flight delays likely.",
    },
    "BOM": {
        "city": "Mumbai",
        "condition": "Partly Cloudy",
        "icon": "🌤️",
        "temperature_c": 30,
        "humidity_pct": 72,
        "wind_kph": 15,
        "visibility_km": 8,
        "risk_level": "LOW",
        "risk_score": 20,
        "advisory": "Normal operations expected. Light overcast skies.",
    },
    "GOI": {
        "city": "Goa",
        "condition": "Sunny",
        "icon": "☀️",
        "temperature_c": 32,
        "humidity_pct": 65,
        "wind_kph": 10,
        "visibility_km": 12,
        "risk_level": "NONE",
        "risk_score": 5,
        "advisory": "Clear skies. Perfect travel conditions.",
    },
}


def get_route_risk(origin_code: str, dest_code: str) -> dict:
    """
    Calculate risk score for a route segment based on weather at both endpoints.
    Returns a risk assessment dict.
    """
    origin_wx = WEATHER_CONDITIONS.get(origin_code, {})
    dest_wx = WEATHER_CONDITIONS.get(dest_code, {})

    origin_risk = origin_wx.get("risk_score", 0)
    dest_risk = dest_wx.get("risk_score", 0)

    # Weighted: departure weather matters more (70%) than arrival (30%)
    combined_risk = int(origin_risk * 0.7 + dest_risk * 0.3)

    if combined_risk >= 70:
        level = "HIGH"
    elif combined_risk >= 40:
        level = "MEDIUM"
    elif combined_risk >= 15:
        level = "LOW"
    else:
        level = "NONE"

    return {
        "origin": origin_wx,
        "destination": dest_wx,
        "combined_risk_score": combined_risk,
        "risk_level": level,
    }
