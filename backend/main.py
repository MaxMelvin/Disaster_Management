"""
FastAPI application for disaster severity prediction and resource optimization.
"""

import os
from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Response
import io
import csv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from optimizer import optimize_resources
from storage import load_storage, save_storage, update_inventory, add_history, get_inventory, get_history, get_stats, get_alerts

# Load trained model at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model = None
model_features: list[str] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model on startup."""
    global model, model_features
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        model_features = list(model.feature_names_in_)
    else:
        print(f"Warning: Model file not found at {MODEL_PATH}. /predict will be unavailable.")
    yield


app = FastAPI(
    title="Disaster Resource Allocation API",
    description="Predict disaster severity and optimize resource allocation.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Root Route ---
@app.get("/")
def read_root():
    return {
        "message": "Disaster Resource Allocation API is running",
        "endpoints": ["/predict", "/optimize", "/warehouse", "/history", "/export/history", "/health", "/docs"]
    }


# --- Request / Response schemas ---

class PredictRequest(BaseModel):
    disaster_type: str = Field(..., description="Type of disaster (e.g. Flood, Earthquake)")
    deaths: float = Field(..., ge=0, description="Number of deaths")
    affected: float = Field(..., ge=0, description="Number of people affected")
    damage_usd: float = Field(..., ge=0, description="Estimated damage in USD")


class PredictResponse(BaseModel):
    severity_level: str
    confidence: float
    feature_importance: dict[str, float]


class OptimizeRequest(BaseModel):
    severity_level: str = Field(..., description="Severity level: Low, Medium, or High")
    budget: float = Field(..., gt=0, description="Available budget in USD")


class OptimizeResponse(BaseModel):
    resource_plan: dict[str, int] | None = None
    total_cost: int | None = None
    error: str | None = None


# --- Endpoints ---

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    """Predict disaster severity level from input parameters."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Train the model first.")

    # Build feature vector matching the trained model's expected columns
    data: dict = {
        "deaths": [req.deaths],
        "affected": [req.affected],
        "damage_usd": [req.damage_usd],
    }
    # One-hot encode disaster_type to match training features
    for feat in model_features:
        if feat.startswith("disaster_type_"):
            dtype = feat.replace("disaster_type_", "")
            data[feat] = [1.0 if req.disaster_type == dtype else 0.0]

    df = pd.DataFrame(data)
    # Ensure all expected columns exist, fill missing with 0
    for col in model_features:
        if col not in df.columns:
            df[col] = 0.0
    df = df[model_features]

    # Predict class and probabilities
    prediction = model.predict(df)[0]
    probabilities = model.predict_proba(df)[0]
    classes = list(model.classes_)
    confidence = float(max(probabilities))

    # Calculate Feature Importance (simulating SHAP impact for this specific prediction)
    # For RandomForest, we can use global importances or specific contribution
    # Here we simplify with global importance but formatted for the UI
    importance = {}
    for feat, score in zip(model_features, model.feature_importances_):
        # Only include non-zero or interesting features
        if score > 0.01:
            importance[feat] = float(score)

    return PredictResponse(
        severity_level=prediction,
        confidence=confidence,
        feature_importance=importance
    )


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest) -> OptimizeResponse:
    """Optimize resource allocation for a given severity and budget."""
    result = optimize_resources(req.severity_level, req.budget)
    if "error" in result:
        return OptimizeResponse(error=result["error"])
    
    # Track optimization in history and deduct from inventory
    update_inventory(result["resource_plan"])
    # Note: We don't have the predict request here, but in a real app we'd link them.
    # For now, we record a simplified history entry or just the optimization.
    add_history({"severity": req.severity_level}, result)

    return OptimizeResponse(
        resource_plan=result["resource_plan"],
        total_cost=result["total_cost"],
    )


@app.get("/warehouse")
def get_warehouse_status():
    """Get current inventory levels."""
    return get_inventory()


@app.get("/history")
def get_all_history():
    """Get all past prediction and optimization history."""
    return get_history()


@app.get("/stats")
def get_dashboard_stats():
    """Get aggregate KPIs for the dashboard."""
    return get_stats()


@app.get("/alerts")
def get_system_alerts():
    """Get active inventory alerts."""
    return get_alerts()


@app.get("/export/history")
def export_history_csv():
    """Export historical data as a CSV file."""
    history = get_history()
    if not history:
        raise HTTPException(status_code=404, detail="No history found to export.")

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Timestamp", "Severity", "Total Cost", "Food Kits", "Medical Units", "Shelters"])
    
    # Rows
    for entry in history:
        prediction = entry.get("prediction", {})
        optimization = entry.get("optimization", {})
        plan = optimization.get("resource_plan", {})
        writer.writerow([
            entry.get("timestamp"),
            prediction.get("severity"),
            optimization.get("total_cost"),
            plan.get("food_kits"),
            plan.get("medical_units"),
            plan.get("shelters")
        ])
    
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=disaster_history.csv"}
    )


@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "model_loaded": model is not None}
