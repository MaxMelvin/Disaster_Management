const ICONS = {
  food_kits: "🍱",
  medical_units: "🏥",
  shelters: "🏠",
};

const LABELS = {
  food_kits: "Food Kits",
  medical_units: "Medical Units",
  shelters: "Shelters",
};

export default function ResourceCards({ plan, totalCost }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(plan).map(([key, value]) => (
          <div key={key} className="bg-white rounded-xl shadow p-5 text-center">
            <div className="text-3xl mb-2">{ICONS[key]}</div>
            <div className="text-sm text-gray-500 font-medium">{LABELS[key]}</div>
            <div className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 rounded-xl p-4 text-center">
        <span className="text-sm text-blue-600 font-medium">Total Cost: </span>
        <span className="text-xl font-bold text-blue-800">${totalCost.toLocaleString()}</span>
      </div>
    </div>
  );
}
