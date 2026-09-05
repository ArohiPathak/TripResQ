"""
app/services/plan_scorer.py
Intelligent Personalized Recovery Plan Scorer for TripResQ.
Calculates transparent heuristic/demo metrics and normalizes scores (0-100)
based on user priorities: FASTEST, CHEAPEST, MAX_REFUND, LEAST_DISRUPTION.
"""

from typing import List, Dict, Any

PRIORITY_FASTEST = "FASTEST"
PRIORITY_CHEAPEST = "CHEAPEST"
PRIORITY_MAX_REFUND = "MAX_REFUND"
PRIORITY_LEAST_DISRUPTION = "LEAST_DISRUPTION"

VALID_PRIORITIES = [
    PRIORITY_FASTEST,
    PRIORITY_CHEAPEST,
    PRIORITY_MAX_REFUND,
    PRIORITY_LEAST_DISRUPTION
]

PRIORITY_LABELS = {
    PRIORITY_FASTEST: "Fastest Recovery",
    PRIORITY_CHEAPEST: "Lowest Cost",
    PRIORITY_MAX_REFUND: "Maximum Refund",
    PRIORITY_LEAST_DISRUPTION: "Least Disruption"
}


def _normalize_min_best(value: float, min_val: float, max_val: float) -> float:
    """Normalize where smaller values are better (e.g. cost, duration, changes)."""
    if max_val == min_val:
        return 100.0
    return max(0.0, min(100.0, (1.0 - (value - min_val) / (max_val - min_val)) * 100.0))


def _normalize_max_best(value: float, min_val: float, max_val: float) -> float:
    """Normalize where larger values are better (e.g. time saved, refund)."""
    if max_val == min_val:
        return 100.0 if max_val > 0 else 50.0
    return max(0.0, min(100.0, ((value - min_val) / (max_val - min_val)) * 100.0))


def generate_plan_reason(plan: Dict[str, Any], priority: str) -> str:
    """
    Generates a clear, transparent 'Why this plan?' reason derived from actual plan data.
    """
    p_type = plan.get("priority")
    cost = plan.get("estimated_cost", 0)
    refund = plan.get("estimated_refund", 0)
    time_saved = plan.get("time_saved_minutes", 0)
    changes = plan.get("affected_nodes", 1)

    h, m = divmod(time_saved, 60)
    time_str = f"{h}h {m}m" if h > 0 and m > 0 else (f"{h}h" if h > 0 else f"{m}m")

    if priority == PRIORITY_FASTEST:
        if time_saved > 0:
            return f"Arrives earliest by saving ~{time_str} compared to standard rebooking with {changes} itinerary change."
        return f"Prioritizes the earliest possible transit departure with {changes} change."

    elif priority == PRIORITY_CHEAPEST:
        if cost == 0 and refund > 0:
            return f"Zero additional cost (₹0 copay) backed by an estimated ₹{refund:,} travel compensation credit."
        elif cost == 0:
            return "Zero additional cost (₹0 copay) covered under TripResQ auto-rebooking protection."
        return f"Lowest estimated copay of ₹{cost:,} while resolving broken connections."

    elif priority == PRIORITY_MAX_REFUND:
        if refund > 0:
            return f"Maximizes financial recovery with an estimated ₹{refund:,} full statutory claim and ₹0 cancellation fees."
        return "Initiates maximum statutory refund and cancellation claims."

    elif priority == PRIORITY_LEAST_DISRUPTION:
        return f"Preserves maximum existing bookings — changes only {changes} itinerary stop while keeping downstream lodging intact."

    return f"Optimized recovery alternative tailored for your travel journey."


def score_and_rank_plans(candidate_plans: List[Dict[str, Any]], priority: str = PRIORITY_FASTEST) -> List[Dict[str, Any]]:
    """
    Takes candidate recovery plans, normalizes their heuristic metrics,
    calculates 0-100 composite scores based on the selected priority,
    ranks them, and marks exactly the top plan as recommended.
    """
    if not candidate_plans:
        return []

    norm_priority = priority.upper() if priority else PRIORITY_FASTEST
    if norm_priority not in VALID_PRIORITIES:
        norm_priority = PRIORITY_FASTEST

    # Extract bounds for normalization
    costs = [p.get("estimated_cost", 0) for p in candidate_plans]
    refunds = [p.get("estimated_refund", 0) for p in candidate_plans]
    time_saveds = [p.get("time_saved_minutes", 0) for p in candidate_plans]
    changes = [p.get("affected_nodes", 1) for p in candidate_plans]

    min_cost, max_cost = min(costs), max(costs)
    min_ref, max_ref = min(refunds), max(refunds)
    min_ts, max_ts = min(time_saveds), max(time_saveds)
    min_ch, max_ch = min(changes), max(changes)

    scored_list = []
    for plan in candidate_plans:
        p_copy = dict(plan)
        p_type = p_copy.get("priority")

        cur_cost = p_copy.get("estimated_cost", 0)
        cur_ref = p_copy.get("estimated_refund", 0)
        cur_ts = p_copy.get("time_saved_minutes", 0)
        cur_ch = p_copy.get("affected_nodes", 1)

        # 0-100 Normalized sub-scores
        s_cost = _normalize_min_best(cur_cost, min_cost, max_cost)
        s_refund = _normalize_max_best(cur_ref, min_ref, max_ref)
        s_time_saved = _normalize_max_best(cur_ts, min_ts, max_ts)
        s_disruption = _normalize_min_best(cur_ch, min_ch, max_ch)

        # Weights by priority
        if norm_priority == PRIORITY_FASTEST:
            base_score = (
                0.60 * s_time_saved +
                0.20 * s_disruption +
                0.10 * s_cost +
                0.10 * s_refund
            )
            if p_type == PRIORITY_FASTEST:
                base_score += 20.0
            elif p_type == PRIORITY_MAX_REFUND:
                base_score -= 30.0  # Traveler asked for fastest way to destination, not cancel

        elif norm_priority == PRIORITY_CHEAPEST:
            base_score = (
                0.60 * s_cost +
                0.20 * s_refund +
                0.10 * s_disruption +
                0.10 * s_time_saved
            )
            if p_type == PRIORITY_CHEAPEST:
                base_score += 20.0
            elif p_type == PRIORITY_MAX_REFUND:
                base_score -= 15.0

        elif norm_priority == PRIORITY_MAX_REFUND:
            base_score = (
                0.70 * s_refund +
                0.15 * s_cost +
                0.10 * s_disruption +
                0.05 * s_time_saved
            )
            if p_type == PRIORITY_MAX_REFUND:
                base_score += 25.0

        elif norm_priority == PRIORITY_LEAST_DISRUPTION:
            base_score = (
                0.60 * s_disruption +
                0.20 * s_time_saved +
                0.10 * s_cost +
                0.10 * s_refund
            )
            if p_type == PRIORITY_LEAST_DISRUPTION:
                base_score += 20.0
            elif p_type == PRIORITY_MAX_REFUND:
                base_score -= 30.0

        else:
            base_score = 75.0

        final_score = int(round(min(100.0, max(5.0, base_score))))

        # Guarantee direct priority match achieves top score
        if p_type == norm_priority:
            final_score = max(final_score, 95)

        p_copy["score"] = final_score
        scored_list.append(p_copy)

    # Sort descending by score; break ties by lower cost
    scored_list.sort(key=lambda x: (x.get("score", 0), -x.get("estimated_cost", 0)), reverse=True)

    # Assign rank and recommended flag
    for idx, sp in enumerate(scored_list):
        sp["rank"] = idx + 1
        sp["recommended"] = (idx == 0)
        sp["reason"] = generate_plan_reason(sp, norm_priority)

    return scored_list
