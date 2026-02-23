"""
FastAPI application for disaster severity prediction and resource optimization.
"""

import os
from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from optimizer import optimize_resources

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


# --- Request / Response schemas ---

class PredictRequest(BaseModel):
    disaster_type: str = Field(..., description="Type of disaster (e.g. Flood, Earthquake)")
    deaths: float = Field(..., ge=0, description="Number of deaths")
    affected: float = Field(..., ge=0, description="Number of people affected")
    damage_usd: float = Field(..., ge=0, description="Estimated damage in USD")


class PredictResponse(BaseModel):
    severity_level: str


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

    prediction = model.predict(df)[0]
    return PredictResponse(severity_level=prediction)


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest) -> OptimizeResponse:
    """Optimize resource allocation for a given severity and budget."""
    result = optimize_resources(req.severity_level, req.budget)
    if "error" in result:
        return OptimizeResponse(error=result["error"])
    return OptimizeResponse(
        resource_plan=result["resource_plan"],
        total_cost=result["total_cost"],
    )


@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "model_loaded": model is not None}
