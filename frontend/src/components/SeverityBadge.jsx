const COLORS = {
  Low: "bg-green-100 text-green-800 border-green-300",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  High: "bg-red-100 text-red-800 border-red-300",
};

export default function SeverityBadge({ level }) {
  const colorClass = COLORS[level] || "bg-gray-100 text-gray-800 border-gray-300";
  return (
    <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold border-2 ${colorClass}`}>
      {level} Severity
    </span>
  );
}
