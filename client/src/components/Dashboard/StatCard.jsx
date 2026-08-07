function StatCard({ title, value, icon, color = "bg-green-600" }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-white text-xl shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
