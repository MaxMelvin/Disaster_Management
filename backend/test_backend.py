"""Tests for backend modules: data_pipeline, optimizer, and API."""

import os
import sys
import numpy as np
import pandas as pd
import pytest

# Ensure backend is on the path
sys.path.insert(0, os.path.dirname(__file__))

from data_pipeline import (
    handle_missing_values,
    compute_severity_score,
    classify_severity,
    assign_severity_labels,
)
from optimizer import optimize_resources


# --- data_pipeline tests ---

class TestDataPipeline:
    def test_handle_missing_values(self):
        df = pd.DataFrame({"deaths": [1, np.nan], "affected": [np.nan, 5], "damage_usd": [100, np.nan]})
        result = handle_missing_values(df)
        assert result["deaths"].isna().sum() == 0
        assert result["affected"].isna().sum() == 0
        assert result["damage_usd"].isna().sum() == 0

    def test_compute_severity_score(self):
        df = pd.DataFrame({"deaths": [0, 100], "affected": [0, 10000], "damage_usd": [0, 1e6]})
        result = compute_severity_score(df)
        assert "severity_score" in result.columns
        assert result["severity_score"].iloc[0] == 0.0
        assert result["severity_score"].iloc[1] > 0.0

    def test_classify_severity_low(self):
        assert classify_severity(2.0) == "Low"

    def test_classify_severity_medium(self):
        assert classify_severity(7.0) == "Medium"

    def test_classify_severity_high(self):
        assert classify_severity(12.0) == "High"

    def test_assign_severity_labels(self):
        df = pd.DataFrame({"severity_score": [1.0, 7.0, 15.0]})
        result = assign_severity_labels(df)
        assert list(result["severity_level"]) == ["Low", "Medium", "High"]


# --- optimizer tests ---

class TestOptimizer:
    def test_optimize_low_severity(self):
        result = optimize_resources("Low", 1_000_000)
        assert "resource_plan" in result
        assert "total_cost" in result
        assert result["total_cost"] <= 1_000_000

    def test_optimize_medium_severity(self):
        result = optimize_resources("Medium", 1_000_000)
        assert "resource_plan" in result
        assert result["resource_plan"]["food_kits"] >= 3000

    def test_optimize_high_severity(self):
        result = optimize_resources("High", 10_000_000)
        assert "resource_plan" in result
        assert result["resource_plan"]["food_kits"] >= 15000

    def test_optimize_insufficient_budget(self):
        result = optimize_resources("High", 100)
        assert "error" in result

    def test_optimize_unknown_severity(self):
        result = optimize_resources("Unknown", 100000)
        assert "error" in result

    def test_optimize_meets_minimum_demand(self):
        result = optimize_resources("Low", 1_000_000)
        plan = result["resource_plan"]
        assert plan["food_kits"] >= 500
        assert plan["medical_units"] >= 20
        assert plan["shelters"] >= 100


# --- API tests ---

class TestAPI:
    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from main import app
        return TestClient(app)

    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_optimize_endpoint(self, client):
        resp = client.post("/optimize", json={"severity_level": "Low", "budget": 500000})
        assert resp.status_code == 200
        data = resp.json()
        assert data["resource_plan"] is not None
        assert data["total_cost"] <= 500000

    def test_optimize_endpoint_insufficient(self, client):
        resp = client.post("/optimize", json={"severity_level": "High", "budget": 10})
        assert resp.status_code == 200
        data = resp.json()
        assert data["error"] is not None

    def test_predict_endpoint_no_model(self, client):
        """If model is not loaded, predict returns 503."""
        from main import model
        if model is None:
            resp = client.post("/predict", json={
                "disaster_type": "Flood",
                "deaths": 100,
                "affected": 50000,
                "damage_usd": 1000000,
            })
            assert resp.status_code == 503
