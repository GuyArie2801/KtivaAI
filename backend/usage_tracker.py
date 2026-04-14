import json
import os

USAGE_FILE = "usage_stats.json"
DEFAULT_LIMIT = 50000  # Default token limit

def get_usage():
    if not os.path.exists(USAGE_FILE):
        return {"used": 0, "limit": DEFAULT_LIMIT}
    
    try:
        with open(USAGE_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {"used": 0, "limit": DEFAULT_LIMIT}

def update_usage(tokens: int):
    stats = get_usage()
    stats["used"] += tokens
    with open(USAGE_FILE, "w") as f:
        json.dump(stats, f)
    return stats
