import re
from typing import Tuple, Optional, Dict, Any

def parse_reference_range(ref_str: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
    """
    Parses a reference range string into numerical (low, high) tuple.
    Supported formats:
    - "13.5 - 17.5" / "13.5-17.5" / "13 – 17" / "13 to 17"
    - "< 200" / "<= 200" / "<200"
    - "> 50" / ">= 50" / ">50"
    """
    if not ref_str:
        return None, None

    ref_clean = str(ref_str).strip()

    # Format: "< 200" or "<= 200"
    if ref_clean.startswith("<"):
        val_str = ref_clean.lstrip("<=").strip()
        try:
            return None, float(val_str)
        except ValueError:
            return None, None

    # Format: "> 50" or ">= 50"
    if ref_clean.startswith(">"):
        val_str = ref_clean.lstrip(">=").strip()
        try:
            return float(val_str), None
        except ValueError:
            return None, None

    # Format: "13.5 to 17.5" or "13 to 17"
    if " to " in ref_clean.lower():
        parts = ref_clean.lower().split(" to ")
        try:
            return float(parts[0].strip()), float(parts[1].strip())
        except ValueError:
            return None, None

    # Format: "13.5 - 17.5" or "13.5 – 17.5" or "13-17"
    sep_match = re.split(r'[-–—]', ref_clean)
    if len(sep_match) == 2:
        try:
            return float(sep_match[0].strip()), float(sep_match[1].strip())
        except ValueError:
            return None, None

    return None, None

def classify_result(value: float, ref_low: Optional[float], ref_high: Optional[float]) -> str:
    """
    Evaluates numeric value against bounds to return 'LOW', 'HIGH', 'NORMAL', or 'UNKNOWN'.
    """
    if ref_low is None and ref_high is None:
        return "UNKNOWN"
    
    if ref_low is not None and value < ref_low:
        return "LOW"
    
    if ref_high is not None and value > ref_high:
        return "HIGH"
    
    return "NORMAL"

def calculate_trend(prev_val: Optional[float], curr_val: Optional[float]) -> Dict[str, Any]:
    """
    Calculates change, percentage_change (safely handling division by zero), and trend direction.
    """
    if prev_val is None and curr_val is not None:
        return {
            "previous_value": None,
            "current_value": curr_val,
            "change": None,
            "percentage_change": None,
            "trend": "NEW"
        }

    if prev_val is not None and curr_val is None:
        return {
            "previous_value": prev_val,
            "current_value": None,
            "change": None,
            "percentage_change": None,
            "trend": "MISSING_FROM_CURRENT"
        }

    if prev_val is None and curr_val is None:
        return {
            "previous_value": None,
            "current_value": None,
            "change": None,
            "percentage_change": None,
            "trend": "UNKNOWN"
        }

    diff = round(curr_val - prev_val, 2)
    
    if prev_val == 0.0:
        pct_change = None
    else:
        pct_change = round(((curr_val - prev_val) / abs(prev_val)) * 100.0, 2)

    if diff > 0.001:
        trend_dir = "INCREASING"
    elif diff < -0.001:
        trend_dir = "DECREASING"
    else:
        trend_dir = "STABLE"

    return {
        "previous_value": prev_val,
        "current_value": curr_val,
        "change": diff,
        "percentage_change": pct_change,
        "trend": trend_dir
    }
