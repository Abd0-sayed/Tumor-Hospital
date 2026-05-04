import NumberTicker from './Counter';
import '../admin/styles/admin.css'
import group from'../assets/group.png'
import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer,
LabelList
} from "recharts";
function Achart ({x,y}) {
    
// console.log(xarray);
// console.log(yarray);


// var dt = xarray.map((item, index) => {
//   return {
//     name: item,
//     value: yarray[index]
//   };
// });

// console.log(x);
// console.log(y);
// console.log(yarray);

// const data = [
//     { name: "Doctors", value: 50 },
//     { name: "Patients", value: 200 },
//     { name: "Bills", value: 120 }
// ];

const data = x.map((name, index) => ({
  name: name,
  value: y[index]
}));

// console.log(data);

  return (
    <ResponsiveContainer width="100%" height={300}>

    <BarChart  data={data}>
      <XAxis dataKey="name" stroke="#000000" />
      <YAxis stroke="#000000"  />
      <Tooltip cursor={false} />
      <CartesianGrid stroke="#000000" />
<Bar dataKey="value" fill="#8884d8">
      <LabelList dataKey="value" position="inside" style={{ fill: "#fff", fontWeight: "bold" }} /> 
    </Bar>    </BarChart>
    </ResponsiveContainer>
  );
}
export default Achart