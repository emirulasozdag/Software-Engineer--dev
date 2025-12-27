from __future__ import annotations


def score_to_cefr(score: int) -> str:
    # Simple mapping for MVP; replace with real rubric later.
    if score < 20:
        return "A1"
    if score < 40:
        return "A2"
    if score < 60:
        return "B1"
    if score < 75:
        return "B2"
    if score < 90:
        return "C1"
    return "C2"


def overall_level(levels: list[str]) -> str:
    order = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    # Conservative: overall = min of skills
    min_level = min(levels, key=lambda x: order.get(x, 0))
    return min_level
