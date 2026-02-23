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

## 🏗 System Architecture


---

## 📊 ML Logic

Severity Score:
0.5 * log(1 + deaths)

0.3 * log(1 + affected)

0.2 * log(1 + damage_usd)


Classified into:
- 🟢 Low
- 🟡 Medium
- 🔴 High

---

## 📦 Resource Allocation

| Severity | Food Kits | Medical Units | Shelters |
|-----------|-----------|---------------|-----------|
| Low       | 500       | 20            | 100       |
| Medium    | 3000      | 120           | 800       |
| High      | 15000     | 500           | 5000      |

Optimization Objective:
> Minimize total cost while meeting demand and staying within budget.

---

## 🚀 How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt
python train.py
uvicorn main:app --reload

Frontend
cd frontend
npm install
npm run dev


📌 API Endpoints
POST /predict

Returns severity classification.

POST /optimize

Returns optimized resource allocation plan.

🎯 Features

✅ ML-based severity prediction

✅ Budget-constrained optimization

✅ Clean API design

✅ Modular architecture

✅ Modern UI

🔬 Learning Outcomes

End-to-end ML pipeline

Feature engineering

Model evaluation

Linear programming

Full-stack integration

📈 Future Improvements

🔍 SHAP explainability

🐳 Docker deployment

📊 Model monitoring

☁ Cloud hosting

🏁 Status

🟢 Functional
🔵 Educational Project
🧠 Designed for ML + Systems learning
