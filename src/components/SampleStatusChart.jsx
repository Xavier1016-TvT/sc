import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { COLORS } from './StatusBadge'

export default function SampleStatusChart({ counts }) {
  const data = [
    { name: '通过', value: counts.通过 || 0 },
    { name: '未通过', value: counts.未通过 || 0 },
    { name: '进行中', value: counts.进行中 || 0 },
  ].filter((d) => d.value > 0)

  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <div className="card flex items-center justify-center h-72 text-slate-400 text-sm">
        暂无子项目数据
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-slate-800 mb-2">订单贴样状态</h3>
      <p className="text-sm text-slate-500 mb-4">
        通过 {counts.通过 || 0} / 未通过 {counts.未通过 || 0} / 进行中 {counts.进行中 || 0}
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) => `${name} ${value}`}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {['通过', '未通过', '进行中'].map((status) => {
          const count = counts[status] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={status}>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>{status}</span>
                <span>{count} ({pct.toFixed(0)}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: COLORS[status] }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
