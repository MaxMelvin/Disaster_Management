"""
Model training for disaster severity classification.
Trains a RandomForestClassifier and saves it as model.pkl.
"""

import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

from data_pipeline import run_pipeline


def train_model(
    X_train, y_train, n_estimators: int = 100, random_state: int = 42
) -> RandomForestClassifier:
    """Train a RandomForestClassifier on the provided data."""
    model = RandomForestClassifier(
        n_estimators=n_estimators, random_state=random_state
    )
    model.fit(X_train, y_train)
    return model


def evaluate_model(model: RandomForestClassifier, X_test, y_test) -> dict:
    """Evaluate the model and return accuracy and classification report."""
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    return {"accuracy": acc, "report": report}


def save_model(model: RandomForestClassifier, filepath: str = "model.pkl") -> None:
    """Save the trained model to disk."""
    joblib.dump(model, filepath)


def main() -> None:
    """Run training pipeline end-to-end."""
    dataset_path = os.path.join(os.path.dirname(__file__), "disaster_data.csv")
    X_train, X_test, y_train, y_test = run_pipeline(dataset_path)

    print("Training RandomForestClassifier...")
    model = train_model(X_train, y_train)

    results = evaluate_model(model, X_test, y_test)
    print(f"Accuracy: {results['accuracy']:.4f}")
    print("Classification Report:")
    print(results["report"])

    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    save_model(model, model_path)
    print(f"Model saved to {model_path}")


if __name__ == "__main__":
    main()
