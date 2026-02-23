"""
Data pipeline for disaster severity classification.
Loads CSV data, engineers features, and prepares train/test splits.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


def load_data(filepath: str) -> pd.DataFrame:
    """Load disaster dataset from CSV."""
    df = pd.read_csv(filepath)
    return df


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Fill missing numeric values with 0."""
    numeric_cols = ["deaths", "affected", "damage_usd"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].fillna(0)
    return df


def compute_severity_score(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute severity_score from deaths, affected, and damage_usd.
    severity_score = 0.5 * log(1 + deaths) + 0.3 * log(1 + affected) + 0.2 * log(1 + damage_usd)
    """
    df["severity_score"] = (
        0.5 * np.log1p(df["deaths"])
        + 0.3 * np.log1p(df["affected"])
        + 0.2 * np.log1p(df["damage_usd"])
    )
    return df


def classify_severity(score: float, thresholds: tuple[float, float] = (5.0, 10.0)) -> str:
    """Convert severity_score into Low / Medium / High."""
    low_thresh, high_thresh = thresholds
    if score < low_thresh:
        return "Low"
    elif score < high_thresh:
        return "Medium"
    else:
        return "High"


def assign_severity_labels(
    df: pd.DataFrame, thresholds: tuple[float, float] = (5.0, 10.0)
) -> pd.DataFrame:
    """Add severity_level column based on severity_score quantiles or fixed thresholds."""
    df["severity_level"] = df["severity_score"].apply(
        lambda s: classify_severity(s, thresholds)
    )
    return df


def prepare_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """
    Prepare feature matrix X and target y.
    Features: disaster_type (encoded), deaths, affected, damage_usd
    Target: severity_level
    """
    df_encoded = pd.get_dummies(df, columns=["disaster_type"], drop_first=True)
    feature_cols = [c for c in df_encoded.columns if c not in [
        "severity_score", "severity_level", "year", "country"
    ]]
    X = df_encoded[feature_cols]
    y = df_encoded["severity_level"]
    return X, y


def split_data(
    X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, random_state: int = 42
) -> tuple:
    """Split into train and test sets."""
    return train_test_split(X, y, test_size=test_size, random_state=random_state)


def run_pipeline(filepath: str) -> tuple:
    """Execute the full data pipeline and return X_train, X_test, y_train, y_test."""
    df = load_data(filepath)
    df = handle_missing_values(df)
    df = compute_severity_score(df)
    df = assign_severity_labels(df)
    X, y = prepare_features(df)
    X_train, X_test, y_train, y_test = split_data(X, y)
    return X_train, X_test, y_train, y_test
