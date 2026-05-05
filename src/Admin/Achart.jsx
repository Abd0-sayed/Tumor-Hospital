import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

function Achart({ x, y }) {
  const data = x.map((name, index) => ({
    name: name,
    value: y[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={390}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#d7dae4"
        />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#1f2c6c", fontSize: 14, fontWeight: 500 }}
          dy={10}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#1f2c6c", fontSize: 14 }}
        />

        <Tooltip
          cursor={{ fill: "rgba(215, 218, 228, 0.2)" }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />

        <Bar
          dataKey="value"
          radius={[6, 6, 0, 0]} // Rounded top corners
          barSize={65}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index % 2 === 0 ? "#159ce8" : "#1e2b6b"}
            />
          ))}

          <LabelList
            dataKey="value"
            position="top"
            style={{ fill: "#1f2c6c", fontWeight: "bold", fontSize: "16px" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default Achart;
