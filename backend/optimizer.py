"""
Resource allocation optimizer using PuLP linear programming.
Minimizes total cost while meeting minimum resource demand within budget.
"""

from pulp import LpMinimize, LpProblem, LpVariable, LpStatus, value

# Resource demand by severity level
DEMAND_MAP: dict[str, dict[str, int]] = {
    "Low": {"food_kits": 500, "medical_units": 20, "shelters": 100},
    "Medium": {"food_kits": 3000, "medical_units": 120, "shelters": 800},
    "High": {"food_kits": 15000, "medical_units": 500, "shelters": 5000},
}

# Unit costs
COSTS: dict[str, int] = {
    "food_kits": 10,
    "medical_units": 200,
    "shelters": 500,
}


def optimize_resources(severity_level: str, budget: float) -> dict:
    """
    Optimize resource allocation for a given severity level and budget.

    Returns a dict with resource_plan and total_cost, or an error message.
    """
    if severity_level not in DEMAND_MAP:
        return {"error": f"Unknown severity level: {severity_level}"}

    demand = DEMAND_MAP[severity_level]

    # Create LP problem
    prob = LpProblem("Disaster_Resource_Allocation", LpMinimize)

    # Decision variables (must meet at least minimum demand)
    food = LpVariable("food_kits", lowBound=demand["food_kits"], cat="Integer")
    medical = LpVariable("medical_units", lowBound=demand["medical_units"], cat="Integer")
    shelters = LpVariable("shelters", lowBound=demand["shelters"], cat="Integer")

    # Objective: minimize total cost
    total_cost_expr = (
        COSTS["food_kits"] * food
        + COSTS["medical_units"] * medical
        + COSTS["shelters"] * shelters
    )
    prob += total_cost_expr, "Total_Cost"

    # Budget constraint
    prob += total_cost_expr <= budget, "Budget_Constraint"

    # Solve
    prob.solve()

    if LpStatus[prob.status] != "Optimal":
        return {
            "error": "Optimization infeasible: budget too low to meet minimum demand.",
            "minimum_required": (
                demand["food_kits"] * COSTS["food_kits"]
                + demand["medical_units"] * COSTS["medical_units"]
                + demand["shelters"] * COSTS["shelters"]
            ),
        }

    resource_plan = {
        "food_kits": int(value(food)),
        "medical_units": int(value(medical)),
        "shelters": int(value(shelters)),
    }
    total_cost = int(value(prob.objective))

    return {"resource_plan": resource_plan, "total_cost": total_cost}
