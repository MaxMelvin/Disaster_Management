"""
optimizer.py - Linear-programming resource allocator using PuLP.

Given a severity level, a budget, and optional demand overrides, it finds the
minimum-cost allocation of food_kits, medical_units, and shelters that still
satisfies the minimum demand for each resource type.
"""

from typing import Dict
import pulp

# ── Resource cost table (USD per unit) ────────────────────────────────────────
UNIT_COSTS: Dict[str, float] = {
    "food_kits": 50.0,
    "medical_units": 200.0,
    "shelters": 500.0,
}

# ── Default minimum demands by severity class ──────────────────────────────────
DEFAULT_DEMAND: Dict[str, Dict[str, int]] = {
    "Low": {
        "food_kits": 100,
        "medical_units": 20,
        "shelters": 10,
    },
    "Medium": {
        "food_kits": 500,
        "medical_units": 100,
        "shelters": 50,
    },
    "High": {
        "food_kits": 2000,
        "medical_units": 400,
        "shelters": 200,
    },
}

# ── Default budgets by severity class (USD) ────────────────────────────────────
DEFAULT_BUDGET: Dict[str, float] = {
    "Low": 50_000.0,
    "Medium": 200_000.0,
    "High": 800_000.0,
}


def optimize_resources(
    severity: str,
    budget: float | None = None,
    demand: Dict[str, int] | None = None,
) -> Dict:
    """
    Solve the LP:
        minimize   sum(cost_i * x_i)
        subject to sum(cost_i * x_i) <= budget
                   x_i >= min_demand_i  for each resource i
                   x_i >= 0            (integer)

    Returns a dict with:
        - resource_plan: {resource: allocated_quantity}
        - total_cost:    float
        - status:        PuLP solver status string
    """
    if severity not in DEFAULT_DEMAND:
        raise ValueError(
            f"Unknown severity '{severity}'. Expected one of {list(DEFAULT_DEMAND)}."
        )

    budget = budget if budget is not None else DEFAULT_BUDGET[severity]
    min_demand = demand if demand is not None else DEFAULT_DEMAND[severity]

    # ── Decision variables ─────────────────────────────────────────────────────
    problem = pulp.LpProblem("disaster_resource_allocation", pulp.LpMinimize)

    vars_ = {
        resource: pulp.LpVariable(
            resource,
            lowBound=min_demand.get(resource, 0),
            cat="Integer",
        )
        for resource in UNIT_COSTS
    }

    # ── Objective: minimise total cost ─────────────────────────────────────────
    problem += pulp.lpSum(UNIT_COSTS[r] * vars_[r] for r in UNIT_COSTS), "total_cost"

    # ── Constraint: stay within budget ─────────────────────────────────────────
    problem += (
        pulp.lpSum(UNIT_COSTS[r] * vars_[r] for r in UNIT_COSTS) <= budget,
        "budget_constraint",
    )

    # ── Solve (silent) ─────────────────────────────────────────────────────────
    solver = pulp.PULP_CBC_CMD(msg=False)
    problem.solve(solver)

    status = pulp.LpStatus[problem.status]

    resource_plan = {
        resource: int(var.varValue) if var.varValue is not None else 0
        for resource, var in vars_.items()
    }
    total_cost = sum(UNIT_COSTS[r] * resource_plan[r] for r in resource_plan)

    return {
        "status": status,
        "resource_plan": resource_plan,
        "total_cost": round(total_cost, 2),
    }
