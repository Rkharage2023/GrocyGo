import { useState, useEffect, useMemo } from "react";
import { FaChartBar, FaBoxes, FaTags, FaShoppingBag, FaDollarSign, FaCalculator, FaDownload } from "react-icons/fa";
import API from "../../services/api";

function AdminReports() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStock: 0,
  });
  const [allOrders, setAllOrders] = useState([]);
  
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 6);
  const [startDate, setStartDate] = useState(defaultStartDate.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [datePreset, setDatePreset] = useState("LAST_7_DAYS");

  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === "TODAY") {
      // already today
    } else if (preset === "YESTERDAY") {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
    } else if (preset === "LAST_7_DAYS") {
      start.setDate(today.getDate() - 6);
    } else if (preset === "LAST_30_DAYS") {
      start.setDate(today.getDate() - 29);
    } else if (preset === "THIS_MONTH") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (preset === "LAST_MONTH") {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    if (preset !== "CUSTOM") {
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    }
  };
  
  const [loading, setLoading] = useState(true);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, orderRes] = await Promise.all([
          API.get("/products?limit=1000"),
          API.get("/categories"),
          API.get("/orders/admin/orders?limit=1000"),
        ]);

        const products = prodRes.data.data?.products || [];
        const categories = catRes.data.data || [];
        setStats({
          totalProducts: prodRes.data.data?.totalProducts || 0,
          totalCategories: categories.length,
          lowStock: products.filter((p) => p.stock <= 5).length,
        });

        const orders = orderRes.data.data?.orders || orderRes.data.data || [];
        setAllOrders(orders);
      } catch (err) {
        console.error("Error loading report analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const reportData = useMemo(() => {
    // 1. Parse chart end date (local timezone safe)
    let chartEndDate = new Date();
    if (endDate) {
      const [year, month, day] = endDate.split("-").map(Number);
      chartEndDate = new Date(year, month - 1, day);
    }
    chartEndDate.setHours(23, 59, 59, 999);

    // 2. Parse chart start date (local timezone safe)
    let chartStartDate = new Date();
    if (startDate) {
      const [year, month, day] = startDate.split("-").map(Number);
      chartStartDate = new Date(year, month - 1, day);
    } else {
      chartStartDate.setDate(chartStartDate.getDate() - 6);
    }
    chartStartDate.setHours(0, 0, 0, 0);

    // 3. Define the days to draw for the chart
    let diffTime = chartEndDate - chartStartDate;
    if (diffTime < 0) diffTime = 0; // fallback if dates are inverted
    let daysToDraw = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    // Limit chart to 60 days to prevent crowding, but keep stats for the whole range
    const maxChartDays = 60;
    const actualChartDays = Math.min(daysToDraw, maxChartDays);

    // 4. Initialize daily sales map for the chart period (local timezone safe)
    const dailyMap = {};
    for (let i = actualChartDays - 1; i >= 0; i--) {
      const d = new Date(chartEndDate);
      d.setDate(chartEndDate.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      
      dailyMap[dateStr] = {
        dateLabel: actualChartDays <= 7
          ? d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })
          : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        shortLabel: d.toLocaleDateString("en-IN", { day: "numeric" }),
        revenue: 0,
      };
    }

    // 5. Filter orders for stats (summary cards & status distribution)
    const statsOrders = allOrders.filter((o) => {
      if (!o.createdAt) return false;
      const created = new Date(o.createdAt);
      return created >= chartStartDate && created <= chartEndDate;
    });

    // 6. Populate the daily sales chart
    statsOrders.forEach((o) => {
      const createdDate = new Date(o.createdAt);
      const year = createdDate.getFullYear();
      const month = String(createdDate.getMonth() + 1).padStart(2, "0");
      const day = String(createdDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      if (dailyMap[dateStr] && o.paymentStatus === "PAID") {
        dailyMap[dateStr].revenue += parseFloat(o.totalAmount || 0);
      }
    });

    // 7. Calculate stats metrics from statsOrders
    const paidOrders = statsOrders.filter((o) => o.paymentStatus === "PAID");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
    const aov = paidOrders.length ? totalRevenue / paidOrders.length : 0;
    const orderCount = statsOrders.length;
    
    // Profit Calculation
    const totalProfit = paidOrders.reduce((sum, o) => {
      let orderProfit = 0;
      if (o.OrderItems && o.OrderItems.length > 0) {
        o.OrderItems.forEach(item => {
          const itemRevenue = parseFloat(item.subtotal || 0);
          const itemCost = parseFloat(item.purchasePriceAtOrder || 0) * item.quantity;
          orderProfit += (itemRevenue - itemCost);
        });
      }
      return sum + orderProfit;
    }, 0);

    // Status distribution from statsOrders
    const dist = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    statsOrders.forEach((o) => {
      if (dist[o.status] !== undefined) {
        dist[o.status]++;
      }
    });

    return {
      totalRevenue,
      totalProfit,
      aov,
      orderCount,
      statusDistribution: dist,
      dailySales: Object.values(dailyMap),
    };
  }, [allOrders, startDate, endDate]);

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${reportData.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      icon: <FaDollarSign />,
      color: "bg-emerald-500",
      text: `Paid earnings (selected date range)`,
    },
    {
      label: "Total Profit",
      value: `₹${reportData.totalProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      icon: <FaChartBar />,
      color: "bg-teal-500",
      text: `Calculated profit (selected date range)`,
    },
    {
      label: "Average Order Value (AOV)",
      value: `₹${reportData.aov.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      icon: <FaCalculator />,
      color: "bg-blue-500",
      text: "Revenue per paid basket",
    },
    {
      label: "Total Orders",
      value: reportData.orderCount.toString(),
      icon: <FaShoppingBag />,
      color: "bg-purple-500",
      text: `Placed logs (selected date range)`,
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toString(),
      icon: <FaBoxes />,
      color: "bg-green-500",
      text: "Active catalog items",
    },
    {
      label: "Total Categories",
      value: stats.totalCategories.toString(),
      icon: <FaTags />,
      color: "bg-orange-500",
      text: "Product groups",
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStock.toString(),
      icon: <FaBoxes />,
      color: "bg-red-500",
      text: "5 units or less",
    },
  ];

  // SVG Chart configurations
  const maxRevenue = Math.max(...reportData.dailySales.map((d) => d.revenue), 100);
  const chartHeight = 150;
  const numDays = reportData.dailySales.length || 7;
  const paddingLeft = 75;
  const paddingRight = 20;
  const availableChartWidth = 600 - paddingLeft - paddingRight;
  const totalBarSpace = availableChartWidth / numDays;
  const barWidth = Math.max(Math.floor(totalBarSpace * 0.65), 5);
  const gap = totalBarSpace - barWidth;

  const handleExportCSV = () => {
    if (!reportData) return;
    const headers = ["Metric", "Value"];
    const rows = [
      ["Date Range Start", startDate],
      ["Date Range End", endDate],
      ["Total Revenue (INR)", reportData.totalRevenue.toFixed(2)],
      ["Total Profit (INR)", reportData.totalProfit.toFixed(2)],
      ["Average Order Value (AOV INR)", reportData.aov.toFixed(2)],
      ["Total Orders Placed", reportData.orderCount],
      ["Total Catalog Products", stats.totalProducts],
      ["Total Categories", stats.totalCategories],
      ["Low Stock Alerts", stats.lowStock],
      ["", ""],
      ["Date", "Daily Revenue (INR)"],
      ...reportData.dailySales.map(d => [d.dateLabel, d.revenue.toFixed(2)]),
      ["", ""],
      ["Status", "Order Count"],
      ...Object.entries(reportData.statusDistribution).map(([status, count]) => [status, count])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DakeKiranaStore_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header with period and slot date filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-gray-500 mt-2 text-base">Visualize financial metrics and category catalogs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition shadow-sm"
          >
            <FaDownload /> Export CSV
          </button>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto max-w-full">
            <select
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition cursor-pointer"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
            <div className="w-px h-6 bg-gray-200 mx-1 shrink-0"></div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap pl-1">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset("CUSTOM");
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap pl-1">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset("CUSTOM");
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-3xl shadow-sm p-6 flex items-center gap-5 border border-gray-100 hover:shadow-md transition duration-200">
            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-white text-xl`}>
              {card.icon}
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : card.value}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{card.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Interactive SVG Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <FaChartBar className="text-green-600" />{" "}
              {`Daily Revenue (${numDays} Days)`}
            </h2>
            <p className="text-xs text-gray-400 mb-6">Excludes pending or cancelled orders.</p>
          </div>

          <div className="h-64 flex items-end justify-center">
            {loading ? (
              <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-20" />
            ) : reportData.dailySales.length === 0 ? (
              <div className="text-gray-400 text-sm mb-20">No sales records to plot.</div>
            ) : (
              <div className="w-full h-full relative">
                <svg viewBox="0 0 600 240" className="w-full h-full" style={{ overflow: "visible" }}>
                  {/* Grid Lines */}
                  <line x1="75" y1="40" x2="580" y2="40" stroke="#f9fafb" strokeWidth="1" />
                  <line x1="75" y1="90" x2="580" y2="90" stroke="#f9fafb" strokeWidth="1" />
                  <line x1="75" y1="140" x2="580" y2="140" stroke="#f9fafb" strokeWidth="1" />
                  <line x1="75" y1="190" x2="580" y2="190" stroke="#f3f4f6" strokeWidth="1.5" />
                  
                  {/* Y-Axis Labels */}
                  <text x="60" y="44" textAnchor="end" className="text-[10px] fill-gray-400 font-bold">₹{Math.round(maxRevenue).toLocaleString()}</text>
                  <text x="60" y="119" textAnchor="end" className="text-[10px] fill-gray-400 font-bold">₹{Math.round(maxRevenue / 2).toLocaleString()}</text>
                  <text x="60" y="194" textAnchor="end" className="text-[10px] fill-gray-400 font-bold">₹0</text>

                  {reportData.dailySales.map((day, index) => {
                    const barHeight = (day.revenue / maxRevenue) * chartHeight;
                    const x = paddingLeft + index * (barWidth + gap) + gap / 2;
                    const y = 190 - barHeight;
                    const isHovered = hoveredBarIndex === index;

                    return (
                      <g 
                        key={index}
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        className="cursor-pointer group"
                      >
                        {/* Hover Overlay */}
                        <rect
                          x={x - gap / 4}
                          y="30"
                          width={barWidth + gap / 2}
                          height="170"
                          fill={isHovered ? "rgba(243, 244, 246, 0.45)" : "transparent"}
                          rx="10"
                          className="transition-colors duration-150"
                        />
                        
                        {/* Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill={isHovered ? "#059669" : "#10b981"}
                          rx={numDays > 10 ? "2" : "5"}
                          className="transition-all duration-300 ease-out"
                        />
                        
                        {/* Label */}
                        <text
                          x={x + barWidth / 2}
                          y="210"
                          textAnchor="middle"
                          className={`text-[9px] font-bold transition-colors duration-150 ${isHovered ? "fill-gray-800" : "fill-gray-400"}`}
                        >
                          {numDays <= 7 ? day.dateLabel : (index % 5 === 0 ? day.shortLabel : "")}
                        </text>

                        {/* Tooltip */}
                        {isHovered && (
                          <g className="animate-fadeIn">
                            <rect
                              x={x + barWidth / 2 - 50}
                              y={y - 32}
                              width="100"
                              height="24"
                              fill="#1f2937"
                              rx="6"
                              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                            />
                            <text
                              x={x + barWidth / 2}
                              y={y - 16}
                              textAnchor="middle"
                              fill="#ffffff"
                              className="text-[10px] font-extrabold"
                            >
                              ₹{day.revenue.toFixed(2)}
                            </text>
                            <polygon
                              points={`${x + barWidth / 2 - 4},${y - 8} ${x + barWidth / 2 + 4},${y - 8} ${x + barWidth / 2},${y - 4}`}
                              fill="#1f2937"
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Status Allocation</h2>
            <p className="text-xs text-gray-400 mb-6">Proportion of orders by status.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {Object.entries(reportData.statusDistribution).map(([status, count]) => {
                const total = reportData.orderCount || 1;
                const percentage = ((count / total) * 100).toFixed(0);
                
                let progressColor = "bg-yellow-500";
                if (status === "CONFIRMED") progressColor = "bg-blue-500";
                if (status === "COMPLETED") progressColor = "bg-green-500";
                if (status === "CANCELLED") progressColor = "bg-red-500";

                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">{status}</span>
                      <span className="text-gray-400 font-semibold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${progressColor} rounded-full transition-all duration-500 ease-out`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
