import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const ReportGraph = ({ data, type }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-600">No data available for visualization.</p>;
  }

  // Transform data into a format suitable for Recharts
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value: typeof value === "number" ? value : 0 // Ensure value is a number
  }));

  // Define colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  switch (type) {
    case "User Engagement":
      return (
        <BarChart width={600} height={400} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      );

    case "Web Analytics":
      return (
        <LineChart width={600} height={400} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#82ca9d" />
        </LineChart>
      );

    case "Sales and Revenue":
      return (
        <PieChart width={600} height={400}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      );

    default:
      return <p className="text-gray-600">No visualization available for this report type.</p>;
  }
};

export default ReportGraph; // ✅ Ensure it is exported correctly
