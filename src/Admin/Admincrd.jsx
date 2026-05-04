import NumberTicker from './Counter';
import '../admin/styles/admin.css'
import group from'../assets/group.png'
function Admincrd ({image,val,pfx,title}) {
    return(
<div className="card">
  <div className="content">
    <img src={image} alt="doctor"/>
    
    <p className='para'>{title}</p>
    <NumberTicker 
        value={val}
        duration={2500}
        className="text-4xl font-bold rqm"
        prefix={pfx}
        />
  </div>
</div>

)
}
export default Admincrd