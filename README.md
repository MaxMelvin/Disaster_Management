# Disaster Resource Allocation System

AI-powered disaster resource allocation system that predicts impact severity from historical disaster data and optimizes relief distribution (food, medical, shelters) using machine learning and linear programming.

## Project Structure

```
root/
├── backend/
│   ├── data_pipeline.py      # Data loading, feature engineering, severity classification
│   ├── train.py               # RandomForestClassifier training and evaluation
│   ├── optimizer.py           # PuLP linear programming resource optimization
│   ├── main.py                # FastAPI endpoints (/predict, /optimize)
│   ├── generate_dataset.py    # Synthetic dataset generator
│   ├── disaster_data.csv      # Training dataset
│   ├── model.pkl              # Trained model (generated, git-ignored)
│   ├── requirements.txt       # Python dependencies
│   └── test_backend.py        # Backend tests
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DisasterForm.jsx    # Input form
│   │   │   ├── SeverityBadge.jsx   # Color-coded severity display
│   │   │   ├── ResourceCards.jsx   # Resource allocation cards
│   │   │   └── ResourceChart.jsx   # Bar chart visualization
│   │   ├── services/api.js         # Axios API client
│   │   ├── App.jsx                 # Main application
│   │   └── main.jsx                # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Tech Stack

- **Backend**: Python, FastAPI, scikit-learn, PuLP, pandas, numpy
- **Frontend**: React (Vite), Tailwind CSS, Axios, Recharts
- **ML Model**: RandomForestClassifier for severity prediction
- **Optimization**: Linear Programming for resource allocation under budget constraints

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt

# Generate dataset and train model
python generate_dataset.py
python train.py

# Start API server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## API Endpoints

### POST /predict
Predict disaster severity level.

**Request:**
```json
{
  "disaster_type": "Flood",
  "deaths": 150,
  "affected": 50000,
  "damage_usd": 5000000
}
```

**Response:**
```json
{
  "severity_level": "Medium"
}
```

### POST /optimize
Optimize resource allocation within budget.

**Request:**
```json
{
  "severity_level": "Medium",
  "budget": 1000000
}
```

**Response:**
```json
{
  "resource_plan": {
    "food_kits": 3000,
    "medical_units": 120,
    "shelters": 800
  },
  "total_cost": 454000
}
```

## Running Tests

```bash
cd backend
python -m pytest test_backend.py -v
```
