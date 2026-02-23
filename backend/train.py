"""
train.py - Generates synthetic disaster dataset, engineers severity scores,
trains a RandomForestClassifier, and saves the model to model.pkl.
"""

import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ── Reproducibility ────────────────────────────────────────────────────────────
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "disaster_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")


def generate_dataset(n: int = 1000) -> pd.DataFrame:
    """Generate a synthetic disaster dataset if no CSV exists yet."""
    disaster_types = ["Flood", "Earthquake", "Hurricane", "Wildfire", "Drought"]

    deaths = np.random.exponential(scale=200, size=n).astype(int) + 1
    affected = np.random.exponential(scale=50_000, size=n).astype(int) + 100
    damage_usd = np.random.exponential(scale=5_000_000, size=n) + 10_000

    df = pd.DataFrame(
        {
            "disaster_type": np.random.choice(disaster_types, size=n),
            "deaths": deaths,
            "affected": affected,
            "damage_usd": damage_usd,
        }
    )
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add log-transformed feature columns and a severity class label."""
    df = df.copy()

    # Log-transform to compress heavy tails
    df["log_deaths"] = np.log1p(df["deaths"])
    df["log_affected"] = np.log1p(df["affected"])
    df["log_damage"] = np.log1p(df["damage_usd"])

    # Composite severity score (equal weights)
    df["severity_score"] = (
        df["log_deaths"] + df["log_affected"] + df["log_damage"]
    ) / 3.0

    # Bin into Low / Medium / High using tertiles
    df["severity_class"] = pd.qcut(
        df["severity_score"],
        q=3,
        labels=["Low", "Medium", "High"],
    )

    return df


def train_model(df: pd.DataFrame) -> RandomForestClassifier:
    """Train a RandomForestClassifier and return the fitted model."""
    feature_cols = ["log_deaths", "log_affected", "log_damage"]
    X = df[feature_cols].values
    y = df["severity_class"].astype(str).values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    clf = RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE)
    clf.fit(X_train, y_train)

    print("Classification report (test set):")
    print(classification_report(y_test, clf.predict(X_test)))

    return clf


def main():
    # Load or generate dataset
    if os.path.exists(CSV_PATH):
        print(f"Loading existing dataset from {CSV_PATH}")
        df = pd.read_csv(CSV_PATH)
    else:
        print("Generating synthetic disaster dataset …")
        df = generate_dataset()
        df.to_csv(CSV_PATH, index=False)
        print(f"Dataset saved to {CSV_PATH}")

    # Feature engineering
    df = engineer_features(df)

    # Train model
    model = train_model(df)

    # Persist model
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
