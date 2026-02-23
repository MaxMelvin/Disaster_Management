import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE });

export async function predictSeverity({ disaster_type, deaths, affected, damage_usd }) {
  const response = await api.post("/predict", {
    disaster_type,
    deaths: Number(deaths),
    affected: Number(affected),
    damage_usd: Number(damage_usd),
  });
  return response.data;
}

export async function optimizeResources({ severity_level, budget }) {
  const response = await api.post("/optimize", {
    severity_level,
    budget: Number(budget),
  });
  return response.data;
}
