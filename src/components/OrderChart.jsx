import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function OrderChart({ data }) {
  if (!data.length) {
    return (
      <div className="card flex items-center justify-center h-72 text-slate-400 text-sm">
        暂无订单数据
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-slate-800 mb-4">订单对比</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(v) => [v, '']}
          />
          <Legend />
          <Bar dataKey="订单数量" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="已出货" fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="已贴回" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
