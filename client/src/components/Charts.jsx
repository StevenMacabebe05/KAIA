import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

const BLUE = '#1e40d8'
const BLUE_LIGHT = '#dbe6ff'
const BLUE_50 = '#eff4ff'
const ORANGE = '#f97316'
const GREEN = '#16a34a'
const INK_500 = '#64748b'
const INK_100 = '#eef2f7'

/* ---------- shared tooltip ---------- */
function ChartTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #eef2f7',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(11,18,32,0.12)',
        fontSize: 13,
      }}
    >
      {label !== undefined && (
        <div style={{ fontWeight: 700, marginBottom: 6, color: '#0b1220' }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600, marginTop: 2 }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>{p.name}: </span>
          {prefix}
          {Number(p.value).toLocaleString()}
          {suffix}
        </div>
      ))}
    </div>
  )
}

/* ---------- 1. Donations over time (line) ---------- */
export function DonationLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.25} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={INK_100} vertical={false} />
        <XAxis
          dataKey="month"
          stroke={INK_500}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={INK_500}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₱${Math.round(v / 1000)}k`}
        />
        <Tooltip content={<ChartTooltip prefix="₱" />} />
        <Line
          type="monotone"
          dataKey="amount"
          name="Donations"
          stroke={BLUE}
          strokeWidth={3}
          dot={{ fill: BLUE, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: ORANGE, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ---------- 2. Campaigns raised vs goal (bar) ---------- */
export function CampaignBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
        barGap={6}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={INK_100} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={INK_500}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis
          stroke={INK_500}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₱${Math.round(v / 1000)}k`}
        />
        <Tooltip content={<ChartTooltip prefix="₱" />} cursor={{ fill: 'rgba(30,64,216,0.04)' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="circle"
          iconSize={10}
        />
        <Bar dataKey="raised" name="Raised" fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={36} />
        <Bar dataKey="goal" name="Goal" fill={BLUE_LIGHT} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ---------- 3. Status donut ---------- */
const STATUS_COLORS = {
  urgent: ORANGE,
  active: BLUE,
  almost_complete: GREEN,
  completed: INK_500,
}

export function StatusDonut({ data }) {
  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={90}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={STATUS_COLORS[entry.key] || BLUE} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--blue-700)' }}>
          {data.reduce((s, d) => s + d.value, 0)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>
          Total
        </div>
      </div>
    </div>
  )
}

/* ---------- 4. Activity area chart (My KAIA) ---------- */
export function ActivityAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gradDonations" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.4} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradVolunteers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ORANGE} stopOpacity={0.4} />
            <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={INK_100} vertical={false} />
        <XAxis
          dataKey="month"
          stroke={INK_500}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={INK_500}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="circle"
          iconSize={10}
        />
        <Area
          type="monotone"
          dataKey="donations"
          name="Donations (₱)"
          stroke={BLUE}
          strokeWidth={2.5}
          fill="url(#gradDonations)"
        />
        <Area
          type="monotone"
          dataKey="volunteers"
          name="Volunteer hours"
          stroke={ORANGE}
          strokeWidth={2.5}
          fill="url(#gradVolunteers)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ---------- 5. Category donut (My KAIA) ---------- */
const CATEGORY_COLORS = [
  '#1e40d8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
  '#f97316', '#fb923c', '#fdba74',
]

export function CategoryDonut({ data }) {
  if (!data.length) {
    return (
      <div
        style={{
          height: 240,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--ink-500)',
          fontSize: 13,
        }}
      >
        No donations yet
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip prefix="₱" />} />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
          iconSize={10}
          layout="vertical"
          align="right"
          verticalAlign="middle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

/* ---------- 6. Inline sparkline (stat cards) ---------- */
export function Sparkline({ data, color = BLUE, width = 88, height = 34 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={areaPoints}
        fill={color}
        fillOpacity="0.1"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}