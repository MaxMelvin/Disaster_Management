"""
Generate a synthetic disaster dataset for training.
Run this script to create disaster_data.csv in the backend directory.
"""

import os
import numpy as np
import pandas as pd


def generate_dataset(n_samples: int = 1000, random_state: int = 42) -> pd.DataFrame:
    """Generate a synthetic disaster dataset."""
    rng = np.random.RandomState(random_state)

    disaster_types = ["Flood", "Earthquake", "Storm", "Drought", "Wildfire"]

    records = []
    for _ in range(n_samples):
        dtype = rng.choice(disaster_types)

        # Generate realistic-ish numbers based on disaster type
        if dtype == "Earthquake":
            deaths = rng.exponential(500)
            affected = rng.exponential(100000)
            damage = rng.exponential(5e8)
        elif dtype == "Flood":
            deaths = rng.exponential(100)
            affected = rng.exponential(50000)
            damage = rng.exponential(1e8)
        elif dtype == "Storm":
            deaths = rng.exponential(50)
            affected = rng.exponential(30000)
            damage = rng.exponential(2e8)
        elif dtype == "Drought":
            deaths = rng.exponential(20)
            affected = rng.exponential(200000)
            damage = rng.exponential(5e7)
        else:  # Wildfire
            deaths = rng.exponential(30)
            affected = rng.exponential(10000)
            damage = rng.exponential(1e8)

        # Introduce some missing values (~5%)
        if rng.random() < 0.05:
            deaths = np.nan
        if rng.random() < 0.05:
            affected = np.nan
        if rng.random() < 0.05:
            damage = np.nan

        records.append({
            "disaster_type": dtype,
            "deaths": deaths,
            "affected": affected,
            "damage_usd": damage,
        })

    return pd.DataFrame(records)


def main() -> None:
    """Generate and save the dataset."""
    df = generate_dataset()
    output_path = os.path.join(os.path.dirname(__file__), "disaster_data.csv")
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records -> {output_path}")


if __name__ == "__main__":
    main()
