"""
Risk Radar / Explainable Rule-Based Risk Engine.

Instead of only reacting to a disruption webhook (see services/disruption.py),
this module proactively scores every connection (edge) in a trip graph BEFORE
anything goes wrong, using a transparent, explainable, rule-based heuristic:

    weighted_risk = (w_hist_eff * historical_delay_risk)
                  + (w_buff_eff * buffer_risk)
                  + (w_seas_eff * seasonal_conditions_risk)

Weights (Configured):
    - Historical route/service risk: 40% (0.40)
    - Connection buffer risk:        40% (0.40)
    - Seasonal conditions heuristic: 20% (0.20)

When historical route data is unavailable, we DO NOT invent a synthetic delay
probability. Instead, available components are dynamically re-normalized to 1.0.

Data confidence is calculated strictly from empirical sample size (not 100 - risk).
Artificial jitter is completely removed; the risk score only changes when inputs change.

Architecture note:
A lightweight background scheduler thread (see app/__init__.py) and in-memory
cache (_risk_cache) periodically refresh every trip. In production, this can be
backed by a distributed scheduler (e.g. Celery / RQ) and Redis cache.
"""

import os
import csv
import threading
from datetime import datetime, timezone

from app.core.db import db
from app.models.node import ItineraryNode, NodeType
from app.models.edge import DependencyEdge
from app.models.trip import Trip

# ---------------------------------------------------------------------------
# Tunable heuristic base weights
# ---------------------------------------------------------------------------
CONFIGURED_WEIGHTS = {
    "historical": 0.40,
    "buffer": 0.40,
    "seasonal": 0.20,
}

# Legacy weight constants for backwards-compatible imports
WEIGHT_ROUTE = 0.40
WEIGHT_WEATHER = 0.20
WEIGHT_BUFFER = 0.40

# Minimum "safe" buffer (minutes) before a connection is considered thin,
# by the type of the node the traveller is connecting INTO.
SAFE_BUFFER_MINUTES = {
    NodeType.FLIGHT.value: 90,
    NodeType.TRAIN.value: 45,
    NodeType.CAB.value: 20,
    NodeType.HOTEL.value: 30,
    NodeType.ACTIVITY.value: 20,
}

# ---------------------------------------------------------------------------
# Seasonal Conditions Heuristic / Seasonal Risk Factor
#
# NOTE: These values are heuristic seasonal conditions severity factors (0.0 - 1.0)
# used for offline rule-based risk evaluation. They can later be replaced with
# live or historical weather forecast APIs (e.g., Open-Meteo).
# Keyed by lowercase location keyword and month (1-12).
# ---------------------------------------------------------------------------
SEASONAL_LOCATION_RISK = {
    # Monsoon belt (Jun-Sep): heavy rain / flooding disrupts flights, trains, cabs
    "mumbai":    {6: 0.55, 7: 0.65, 8: 0.60, 9: 0.45, "default": 0.15},
    "pune":      {6: 0.45, 7: 0.55, 8: 0.50, 9: 0.35, "default": 0.12},
    "goa":       {6: 0.50, 7: 0.60, 8: 0.55, 9: 0.40, "default": 0.12},
    "kolkata":   {6: 0.40, 7: 0.50, 8: 0.50, 9: 0.35, "default": 0.14},
    "chennai":   {10: 0.55, 11: 0.60, 12: 0.35, "default": 0.15},
    # Winter fog belt (Dec-Jan): North India low-visibility delays, esp. flights/trains
    "delhi":     {12: 0.62, 1: 0.58, 2: 0.25, "default": 0.18},
    "lucknow":   {12: 0.55, 1: 0.50, "default": 0.16},
    "amritsar":  {12: 0.58, 1: 0.55, "default": 0.17},
    # Hill / weather-variable routes
    "shimla":    {1: 0.5, 2: 0.45, 7: 0.35, 8: 0.35, "default": 0.20},
    "srinagar":  {1: 0.55, 2: 0.50, 12: 0.5, "default": 0.22},
    # Generally stable
    "bangalore": {"default": 0.10},
    "hyderabad": {"default": 0.12},
}
DEFAULT_SEASONAL_RISK = 0.15  # Default baseline for locations without specific entries

RISK_LEVELS = [
    (75, "CRITICAL"),
    (55, "HIGH"),
    (30, "MEDIUM"),
    (0, "LOW"),
]

# ---------------------------------------------------------------------------
# Historical CSV dataset loader and matcher
# ---------------------------------------------------------------------------
_CSV_LOCK = threading.Lock()
_HISTORICAL_CACHE = None
_CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data",
    "historical_delays.csv"
)


def load_historical_delays(csv_path: str = None) -> list[dict]:
    """Load historical delay records from CSV with caching."""
    global _HISTORICAL_CACHE
    path = csv_path or _CSV_PATH
    with _CSV_LOCK:
        if _HISTORICAL_CACHE is not None and not csv_path:
            return _HISTORICAL_CACHE

        records = []
        if not os.path.exists(path):
            return records

        with open(path, mode="r", encoding="utf-8-sig") as f:
            lines = [line for line in f if line.strip() and not line.strip().startswith("#")]
            if not lines:
                return records
            reader = csv.DictReader(lines)
            for raw_row in reader:
                try:
                    mode = (raw_row.get("mode") or "").strip().upper()
                    origin = (raw_row.get("origin") or "").strip().upper()
                    dest = (raw_row.get("destination") or "").strip().upper()
                    month_str = (raw_row.get("month") or "").strip()
                    month = int(month_str) if month_str.isdigit() else None
                    operator = (raw_row.get("operator") or "").strip()
                    svc = (raw_row.get("service_number") or "").strip().upper()
                    sample_size = int(float(raw_row.get("sample_size") or 0))
                    d15 = int(float(raw_row.get("delayed_15") or 0))
                    d30 = int(float(raw_row.get("delayed_30") or 0))
                    d60 = int(float(raw_row.get("delayed_60") or 0))
                    avg_d = float(raw_row.get("avg_delay_minutes") or 0.0)

                    records.append({
                        "mode": mode,
                        "origin": origin,
                        "destination": dest,
                        "month": month,
                        "operator": operator,
                        "service_number": svc,
                        "sample_size": sample_size,
                        "delayed_15": d15,
                        "delayed_30": d30,
                        "delayed_60": d60,
                        "avg_delay_minutes": avg_d,
                    })
                except (ValueError, TypeError):
                    continue

        if not csv_path:
            _HISTORICAL_CACHE = records
        return records


def _clean_str(val: str | None) -> str:
    return (val or "").strip().upper()


def lookup_historical_delay(
    mode: str | None,
    origin: str | None,
    destination: str | None,
    month: int | None = None,
    operator: str | None = None,
    service_number: str | None = None,
    records: list[dict] | None = None
) -> dict:
    """
    Match historical delay records from CSV using available itinerary data.
    
    Preference order:
      1. service_number + route + month
      2. operator + route + month
      3. route + month
      4. route regardless of month

    Returns { 'available': True, 'risk': delayed_30/sample_size, ... }
    or { 'available': False } if no record exists.
    """
    if records is None:
        records = load_historical_delays()

    if not records:
        return {"available": False}

    target_mode = _clean_str(mode)
    target_origin = _clean_str(origin)
    target_dest = _clean_str(destination)
    target_svc = _clean_str(service_number)
    target_operator = (operator or "").strip().lower()

    if not target_origin or not target_dest:
        return {"available": False}

    # Filter candidates by mode (if provided) and origin -> destination route
    candidates = []
    for r in records:
        if target_mode and r["mode"] and r["mode"] != target_mode:
            continue
        if r["origin"] == target_origin and r["destination"] == target_dest:
            candidates.append(r)

    if not candidates:
        return {"available": False}

    matched_record = None
    match_type = None

    # Priority 1: service_number + route + month
    if target_svc and month:
        for r in candidates:
            if r["service_number"] and r["service_number"] == target_svc and r["month"] == month:
                matched_record = r
                match_type = "service_number_route_month"
                break

    # Priority 2: operator + route + month
    if not matched_record and target_operator and month:
        for r in candidates:
            if r["operator"] and r["operator"].lower() == target_operator and r["month"] == month:
                matched_record = r
                match_type = "operator_route_month"
                break

    # Priority 3: route + month
    if not matched_record and month:
        for r in candidates:
            if r["month"] == month:
                matched_record = r
                match_type = "route_month"
                break

    # Priority 4: route regardless of month
    if not matched_record:
        for r in candidates:
            if r["month"] is None or not matched_record:
                matched_record = r
                match_type = "route"
                if r["month"] is None:
                    break

    if not matched_record or matched_record["sample_size"] <= 0:
        return {"available": False}

    sample_size = matched_record["sample_size"]
    d30 = matched_record["delayed_30"]
    d15 = matched_record["delayed_15"]
    d60 = matched_record["delayed_60"]

    risk = min(1.0, max(0.0, d30 / sample_size))
    d15_rate = min(1.0, max(0.0, d15 / sample_size))
    d30_rate = min(1.0, max(0.0, d30 / sample_size))
    d60_rate = min(1.0, max(0.0, d60 / sample_size))

    return {
        "available": True,
        "risk": risk,
        "sample_size": sample_size,
        "avg_delay_minutes": matched_record["avg_delay_minutes"],
        "delayed_15_rate": round(d15_rate, 4),
        "delayed_30_rate": round(d30_rate, 4),
        "delayed_60_rate": round(d60_rate, 4),
        "match_type": match_type,
    }


def calculate_data_confidence(sample_size: int | None) -> dict:
    """
    Calculate data confidence based on historical sample size.
    Confidence reflects sample volume/reliability, completely distinct from risk score.
    """
    if sample_size is None or sample_size <= 0:
        return {"score": 0, "level": "INSUFFICIENT_DATA", "sample_size": 0}
    elif sample_size >= 200:
        return {"score": 90, "level": "HIGH", "sample_size": sample_size}
    elif sample_size >= 75:
        return {"score": 70, "level": "MEDIUM", "sample_size": sample_size}
    elif sample_size >= 20:
        return {"score": 50, "level": "LOW", "sample_size": sample_size}
    else:
        return {"score": 25, "level": "VERY_LOW", "sample_size": sample_size}


# ---------------------------------------------------------------------------
# In-memory cache populated by the background scheduler (app/__init__.py)
# ---------------------------------------------------------------------------
_cache_lock = threading.Lock()
_risk_cache = {}  # trip_id -> {"generated_at": iso, "data": {...}}
CACHE_TTL_SECONDS = 90

# ---------------------------------------------------------------------------
# Proactive alert log
#
# Records connections that newly cross into HIGH or CRITICAL risk.
# Duplicates are prevented during repeated scans while remaining in high risk.
# ---------------------------------------------------------------------------
_alert_log = {}  # trip_id -> list[dict], most recent first
ALERT_LOG_CAP = 50


def _record_new_alerts(trip_id: str, previous_data: dict | None, new_data: dict) -> list:
    """
    Record alert only when a connection newly enters HIGH or CRITICAL risk.
    If it was already HIGH/CRITICAL in the previous cycle, do not duplicate.
    """
    prev_high_target_ids = set()
    if previous_data:
        for c in previous_data.get("connections", []):
            if c.get("risk_level") in ("HIGH", "CRITICAL"):
                prev_high_target_ids.add(c["target_node_id"])

    new_alerts = []
    for c in new_data.get("connections", []):
        if c.get("risk_level") in ("HIGH", "CRITICAL") and c["target_node_id"] not in prev_high_target_ids:
            new_alerts.append({
                "trip_id": trip_id,
                "detected_at": new_data["generated_at"],
                "edge_source_node_id": c["source_node_id"],
                "target_node_id": c["target_node_id"],
                "target_title": c["target_title"],
                "risk_level": c["risk_level"],
                "risk_score": c["risk_score"],
                "message": c["message"],
            })

    if new_alerts:
        with _cache_lock:
            log = _alert_log.setdefault(trip_id, [])
            log[:0] = new_alerts
            del log[ALERT_LOG_CAP:]

    return new_alerts


def get_alerts(trip_id: str, limit: int = 20) -> list:
    with _cache_lock:
        return list(_alert_log.get(trip_id, []))[:limit]


def _risk_level(score_val: int | float) -> str:
    for threshold, label in RISK_LEVELS:
        if score_val >= threshold:
            return label
    return "LOW"


def _location_keyword(location: str, title: str) -> str:
    haystack = f"{location or ''} {title or ''}".lower()
    for key in SEASONAL_LOCATION_RISK:
        if key in haystack:
            return key
    return ""


def _seasonal_weather_risk(location: str, title: str, when: datetime | None) -> tuple[float, str]:
    key = _location_keyword(location, title)
    month = when.month if when else datetime.now(timezone.utc).month
    if key and key in SEASONAL_LOCATION_RISK:
        table = SEASONAL_LOCATION_RISK[key]
        return table.get(month, table.get("default", DEFAULT_SEASONAL_RISK)), key
    return DEFAULT_SEASONAL_RISK, key or "general"


def _buffer_risk(actual_gap_minutes: float | None, target_type: str) -> float:
    safe = SAFE_BUFFER_MINUTES.get(target_type, 30)
    if actual_gap_minutes is None:
        return 0.5
    if actual_gap_minutes <= 0:
        return 1.0
    if actual_gap_minutes >= safe:
        # Residual risk floor
        return max(0.03, 0.15 * (safe / max(actual_gap_minutes, 1)))
    # Linear ramp from safe buffer -> 0 gap
    return min(1.0, 1.0 - (actual_gap_minutes / safe))


def _suggested_actions(target_type: str, risk_level: str, recommended_buffer: int) -> list:
    actions = []
    if risk_level in ("HIGH", "CRITICAL"):
        if target_type == NodeType.CAB.value:
            actions.append("Pre-book a backup cab slotted for the delayed arrival window")
        elif target_type == NodeType.HOTEL.value:
            actions.append("Pre-notify the hotel of a possible late check-in to hold the room")
        elif target_type in (NodeType.FLIGHT.value, NodeType.TRAIN.value):
            actions.append("Check the next available departure as a fallback before you travel")
        actions.append(f"Add ~{recommended_buffer} extra minutes of buffer to this connection")
    elif risk_level == "MEDIUM":
        actions.append(f"Consider padding this connection with {recommended_buffer} more minutes")
    else:
        actions.append("No action needed — this connection is comfortably buffered")
    return actions


def _connection_message(
    source_title: str,
    target_title: str,
    location: str,
    buffer_minutes: int,
    risk_score: int,
    hist_available: bool,
    hist_d30_pct: int | None
) -> str:
    loc_txt = f" in {location.split(',')[0].split('•')[0].strip()}" if location else ""
    if hist_available and hist_d30_pct is not None:
        return (
            f"Your {buffer_minutes}-min layover before {target_title}{loc_txt} has a "
            f"{risk_score}/100 Risk Radar score ({hist_d30_pct}% historical 30+ min delay rate) — want a buffer plan pre-computed?"
        )
    return (
        f"Your {buffer_minutes}-min layover before {target_title}{loc_txt} has a "
        f"{risk_score}/100 Risk Radar score based on connection buffer and seasonal factors — want a buffer plan pre-computed?"
    )


def score_connection(source: ItineraryNode, target: ItineraryNode, min_buffer_minutes: int) -> dict:
    """
    Compute explainable, rule-based Risk Radar breakdown for a single source->target connection.
    
    Dynamically re-normalizes weights when historical data is absent.
    Confidence score is derived from historical sample volume.
    Zero artificial jitter.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Connection buffer calculation
    actual_gap = None
    if source.end_time and target.start_time:
        actual_gap = (target.start_time - source.end_time).total_seconds() / 60.0

    buffer_raw = _buffer_risk(actual_gap, target.node_type)
    safe_buffer = SAFE_BUFFER_MINUTES.get(target.node_type, 30)
    current_buffer = int(actual_gap) if actual_gap is not None else min_buffer_minutes
    recommended_buffer = max(0, int(safe_buffer - current_buffer)) if current_buffer < safe_buffer else 0

    # 2. Seasonal conditions heuristic
    weather_raw, loc_keyword = _seasonal_weather_risk(
        target.location or source.location or "",
        f"{source.title} {target.title}",
        source.start_time or target.start_time
    )

    # 3. Historical lookup for the incoming transport leg (source node)
    month = source.start_time.month if source.start_time else None
    hist_match = lookup_historical_delay(
        mode=source.node_type,
        origin=source.origin,
        destination=source.destination,
        month=month,
        operator=source.operator,
        service_number=source.service_number
    )

    # 4. Weight normalization across available components
    available_factors = {}
    if hist_match.get("available"):
        available_factors["historical"] = hist_match["risk"]
    available_factors["buffer"] = buffer_raw
    available_factors["seasonal"] = weather_raw

    total_weight = sum(CONFIGURED_WEIGHTS[f] for f in available_factors)
    effective_weights = {
        f: CONFIGURED_WEIGHTS[f] / total_weight for f in available_factors
    }

    weighted_risk = sum(effective_weights[f] * available_factors[f] for f in available_factors)
    risk_score = max(0, min(100, round(weighted_risk * 100)))
    level = _risk_level(risk_score)

    sample_size = hist_match.get("sample_size") if hist_match.get("available") else None
    confidence = calculate_data_confidence(sample_size)

    d30_pct = round(hist_match["delayed_30_rate"] * 100) if hist_match.get("available") else None
    msg = _connection_message(
        source.title, target.title, target.location or "", current_buffer, risk_score,
        hist_match.get("available", False), d30_pct
    )

    # Rich factor breakdown structure
    factors_payload = {
        "historical": {
            "available": hist_match.get("available", False),
            "raw_score": hist_match.get("risk"),
            "configured_weight": CONFIGURED_WEIGHTS["historical"],
            "effective_weight": round(effective_weights.get("historical", 0.0), 3),
            "sample_size": hist_match.get("sample_size", 0),
            "avg_delay_minutes": hist_match.get("avg_delay_minutes", 0.0),
            "delayed_15_rate": hist_match.get("delayed_15_rate", 0.0),
            "delayed_30_rate": hist_match.get("delayed_30_rate", 0.0),
            "delayed_60_rate": hist_match.get("delayed_60_rate", 0.0),
            "match_type": hist_match.get("match_type"),
        },
        "buffer": {
            "available": True,
            "raw_score": round(buffer_raw, 3),
            "configured_weight": CONFIGURED_WEIGHTS["buffer"],
            "effective_weight": round(effective_weights.get("buffer", 0.0), 3),
            "available_minutes": current_buffer,
            "safe_minutes": safe_buffer,
        },
        "seasonal": {
            "available": True,
            "raw_score": round(weather_raw, 3),
            "configured_weight": CONFIGURED_WEIGHTS["seasonal"],
            "effective_weight": round(effective_weights.get("seasonal", 0.0), 3),
            "location_keyword": loc_keyword,
        }
    }

    return {
        "source_node_id": source.id,
        "target_node_id": target.id,
        "source_title": source.title,
        "target_title": target.title,
        "target_location": target.location,
        "source_origin": source.origin,
        "source_destination": source.destination,
        "connection_buffer_minutes": current_buffer,
        "safe_buffer_minutes": safe_buffer,
        "risk_score": risk_score,
        "risk_level": level,
        "last_evaluated_at": now_iso,
        "next_refresh_seconds": 45,
        "proactively_flagged": level in ("HIGH", "CRITICAL") and target.status == "OK",
        "factors": factors_payload,
        "data_confidence": confidence,
        "recommended_extra_buffer_minutes": recommended_buffer,
        "suggested_actions": _suggested_actions(target.node_type, level, recommended_buffer or 15),
        "message": msg,
    }


def compute_trip_risk_radar(trip_id: str) -> dict:
    """Recompute the full Risk Radar report for a trip (no caching)."""
    now_iso = datetime.now(timezone.utc).isoformat()
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(ItineraryNode.start_time).all()
    node_ids = [n.id for n in nodes]
    edges = DependencyEdge.query.filter(DependencyEdge.source_node_id.in_(node_ids)).all() if node_ids else []
    node_map = {n.id: n for n in nodes}

    connections = []
    for edge in edges:
        source = node_map.get(edge.source_node_id)
        target = node_map.get(edge.target_node_id)
        if not source or not target:
            continue
        connection = score_connection(source, target, edge.min_buffer_minutes)
        connection["edge_id"] = edge.id
        connections.append(connection)

    overall_risk = round(sum(c["risk_score"] for c in connections) / len(connections)) if connections else 0
    flagged = [c for c in connections if c["proactively_flagged"]]

    # Overall data confidence averaged over available historical observations
    sample_sizes = [
        c["factors"]["historical"]["sample_size"]
        for c in connections if c["factors"]["historical"]["available"]
    ]
    avg_samples = sum(sample_sizes) / len(sample_sizes) if sample_sizes else 0
    overall_confidence = calculate_data_confidence(int(avg_samples))

    return {
        "trip_id": trip_id,
        "generated_at": now_iso,
        "last_evaluated_at": now_iso,
        "overall_risk_score": overall_risk,
        "overall_risk_level": _risk_level(overall_risk),
        "data_confidence": overall_confidence,
        "proactively_flagged_count": len(flagged),
        "connections": connections,
    }


def get_cached_risk_radar(trip_id: str, force_refresh: bool = False) -> dict:
    """Serve from the background-refreshed cache when possible; compute on demand otherwise."""
    with _cache_lock:
        entry = _risk_cache.get(trip_id)

    if not force_refresh and entry:
        gen_time = datetime.fromisoformat(entry["generated_at"].replace("Z", "+00:00"))
        age = (datetime.now(timezone.utc) - gen_time).total_seconds()
        if age < CACHE_TTL_SECONDS:
            return entry["data"]

    previous_data = entry["data"] if entry else None
    data = compute_trip_risk_radar(trip_id)
    _record_new_alerts(trip_id, previous_data, data)
    with _cache_lock:
        _risk_cache[trip_id] = {"generated_at": data["generated_at"], "data": data}
    return data


def refresh_all_trips_risk_cache(app):
    """
    Background scheduler job: recompute the Risk Radar for every trip in the
    DB and refresh the cache, so the proactive model runs continuously.
    """
    with app.app_context():
        try:
            trip_ids = [t.id for t in Trip.query.all()]
            for trip_id in trip_ids:
                with _cache_lock:
                    previous_entry = _risk_cache.get(trip_id)
                previous_data = previous_entry["data"] if previous_entry else None

                data = compute_trip_risk_radar(trip_id)
                _record_new_alerts(trip_id, previous_data, data)
                with _cache_lock:
                    _risk_cache[trip_id] = {"generated_at": data["generated_at"], "data": data}
        except Exception as exc:  # pragma: no cover - defensive background job
            print(f"[risk-radar] background refresh failed: {exc}")
