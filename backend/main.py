"""
main.py - FastAPI application for the Disaster Resource Allocation System.

Endpoints
---------
POST /predict  – Predict disaster severity (Low / Medium / High)
POST /optimize – Allocate resources via LP optimization
"""

import os
import logging
from contextlib import asynccontextmanager

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from optimizer import optimize_resources

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# ── Global model container ─────────────────────────────────────────────────────
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the trained model on startup."""
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"model.pkl not found at {MODEL_PATH}. "
            "Run `python train.py` first to generate it."
        )
    model = joblib.load(MODEL_PATH)
    logger.info("Model loaded from %s", MODEL_PATH)
    yield
    # Cleanup (if needed) goes here
    model = None


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Disaster Resource Allocation API",
    description="Predict disaster severity and optimise resource allocation.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow cross-origin requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ─────────────────────────────────────────────────
class PredictRequest(BaseModel):
    deaths: float = Field(..., ge=0, description="Number of deaths")
    affected: float = Field(..., ge=0, description="Number of people affected")
    damage_usd: float = Field(..., ge=0, description="Estimated damage in USD")


class PredictResponse(BaseModel):
    severity: str


class OptimizeRequest(BaseModel):
    deaths: float = Field(..., ge=0)
    affected: float = Field(..., ge=0)
    damage_usd: float = Field(..., ge=0)
    budget: float | None = Field(None, ge=0, description="Optional budget override (USD)")


class OptimizeResponse(BaseModel):
    severity: str
    resource_plan: dict
    total_cost: float


# ── Helper ─────────────────────────────────────────────────────────────────────
def _predict_severity(deaths: float, affected: float, damage_usd: float) -> str:
    """Compute log-features and return predicted severity class."""
    log_deaths = np.log1p(deaths)
    log_affected = np.log1p(affected)
    log_damage = np.log1p(damage_usd)
    features = np.array([[log_deaths, log_affected, log_damage]])
    return model.predict(features)[0]


# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.post("/predict", response_model=PredictResponse, summary="Predict disaster severity")
def predict(req: PredictRequest):
    """Return the predicted severity class (Low / Medium / High)."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")
    severity = _predict_severity(req.deaths, req.affected, req.damage_usd)
    return PredictResponse(severity=severity)


@app.post("/optimize", response_model=OptimizeResponse, summary="Optimise resource allocation")
def optimize(req: OptimizeRequest):
    """
    Predict severity, then run LP to allocate food_kits, medical_units,
    and shelters within the given (or default) budget.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    severity = _predict_severity(req.deaths, req.affected, req.damage_usd)

    result = optimize_resources(severity=severity, budget=req.budget)

    return OptimizeResponse(
        severity=severity,
        resource_plan=result["resource_plan"],
        total_cost=result["total_cost"],
    )


@app.get("/health", summary="Health check")
def health():
    return {"status": "ok"}
