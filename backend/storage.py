import json
import os
from datetime import datetime

STORAGE_PATH = os.path.join(os.path.dirname(__file__), "storage.json")

DEFAULT_STATE = {
    "inventory": {
        "food_kits": 50000,
        "medical_units": 2000,
        "shelters": 10000
    },
    "history": []
}

def load_storage():
    if not os.path.exists(STORAGE_PATH):
        save_storage(DEFAULT_STATE)
        return DEFAULT_STATE
    try:
        with open(STORAGE_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_STATE

def save_storage(data):
    with open(STORAGE_PATH, "w") as f:
        json.dump(data, f, indent=4)

def update_inventory(resources: dict):
    data = load_storage()
    for item, count in resources.items():
        if item in data["inventory"]:
            data["inventory"][item] -= count
    save_storage(data)

def add_history(prediction: dict, optimization: dict):
    data = load_storage()
    history_entry = {
        "timestamp": datetime.now().isoformat(),
        "prediction": prediction,
        "optimization": optimization
    }
    data["history"].append(history_entry)
    save_storage(data)

def get_inventory():
    return load_storage()["inventory"]

def get_history():
    return load_storage()["history"]

# Inventory alert thresholds
ALERT_THRESHOLDS = {
    "food_kits": 10000,
    "medical_units": 500,
    "shelters": 2000,
}

def get_stats():
    """Compute aggregate KPIs from history."""
    data = load_storage()
    history = data.get("history", [])
    inventory = data.get("inventory", {})

    total_analyses = len(history)
    total_cost = sum(h.get("optimization", {}).get("total_cost", 0) for h in history)
    total_food = sum(h.get("optimization", {}).get("resource_plan", {}).get("food_kits", 0) for h in history)
    total_medical = sum(h.get("optimization", {}).get("resource_plan", {}).get("medical_units", 0) for h in history)
    total_shelters = sum(h.get("optimization", {}).get("resource_plan", {}).get("shelters", 0) for h in history)

    severity_counts = {"Low": 0, "Medium": 0, "High": 0}
    for h in history:
        sev = h.get("prediction", {}).get("severity", "")
        if sev in severity_counts:
            severity_counts[sev] += 1

    return {
        "total_analyses": total_analyses,
        "total_cost": total_cost,
        "total_resources_deployed": total_food + total_medical + total_shelters,
        "severity_distribution": severity_counts,
        "current_inventory": inventory,
    }

def get_alerts():
    """Check inventory thresholds and return active alerts."""
    inventory = get_inventory()
    alerts = []
    for item, threshold in ALERT_THRESHOLDS.items():
        current = inventory.get(item, 0)
        if current <= 0:
            alerts.append({"type": "critical", "resource": item, "current": current, "threshold": threshold, "message": f"{item.replace('_', ' ').title()} depleted!"})
        elif current < threshold:
            alerts.append({"type": "warning", "resource": item, "current": current, "threshold": threshold, "message": f"{item.replace('_', ' ').title()} below {threshold:,} — currently {current:,}"})
    return alerts
