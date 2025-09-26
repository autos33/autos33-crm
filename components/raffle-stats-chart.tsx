"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface RaffleStatsChartProps {
  stats: {
    vendidos: number
    disponibles: number
    reservados: number
    total: number
  }
}

export function RaffleStatsChart({ stats }: RaffleStatsChartProps) {
  const data = [
    {
      name: "Vendidos",
      value: stats.vendidos,
      color: "#10b981",
    },
    {
      name: "Disponibles",
      value: stats.disponibles,
      color: "#3b82f6",
    },
  ]

  // Only add reservados if there are any
  if (stats.reservados > 0) {
    data.push({
      name: "Reservados",
      value: stats.reservados,
      color: "#f59e0b",
    })
  }

  const COLORS = data.map((item) => item.color)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / stats.total) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            {data.value.toLocaleString()} boletos ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => <span style={{ color: entry.color }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
