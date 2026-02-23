# 🚨 AI Disaster Resource Allocation System

> Predict disaster severity and optimize emergency resource distribution using Machine Learning + Linear Programming.

---

## 🌍 Overview

This project is an AI-powered disaster response system that:

- 📊 Predicts disaster severity from historical impact data  
- 🤖 Uses Machine Learning (RandomForest) for classification  
- 📦 Optimizes resource allocation (food kits, medical units, shelters)  
- 💰 Minimizes total cost under budget constraints  
- ⚡ Provides a clean React-based interface  

Built for learning end-to-end ML system architecture.

---

## 🏗 Project Structure

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

---

## 🧠 Tech Stack

### 🔙 Backend
- 🐍 Python 3.11
- ⚡ FastAPI
- 🌲 scikit-learn (RandomForest)
- 📐 PuLP (Linear Programming)
- 📊 pandas / numpy
- 💾 joblib

### 🖥 Frontend
- ⚛ React
- 🎨 Tailwind CSS
- 📈 Recharts
- 🔗 Axios

---

## 🚀 Getting Started

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

---

## 🎯 Features

✅ ML-based severity prediction
✅ Budget-constrained optimization
✅ Clean API design
✅ Modular architecture
✅ Modern UI

---

## 📌 API Endpoints

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

---

## 🔬 Running Tests

```bash
cd backend
python -m pytest test_backend.py -v
```

---

## 🏁 Status

🟢 Functional
🔵 Educational Project
🧠 Designed for ML + Systems learning
