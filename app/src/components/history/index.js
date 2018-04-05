import React from 'react';
import { connect } from 'react-redux';

import "./style.css";
import Header from "../header/page.js";
import List from "./list.js";
import Filler from "./filler.js";
import Report from "./report.js";
// import Footer from "../footer";
import lodashget from 'lodash.get';


class App extends React.Component {

    render() {
        const {curdevice,devicetype,retlist} = this.props;
        if(!!curdevice){
          const ticktimestringlist = lodashget(retlist,'ticktimestring',[]);
          return (
              <div className="monitorPage">
                  <Header history={this.props.history} title={`${lodashget(curdevice,'name','')}-${lodashget(curdevice,'locationname','')}`}/>
                  <Filler curdevice={curdevice} devicetype={devicetype}/>
                  <List curdevice={curdevice} devicetype={devicetype}/>
                  {ticktimestringlist.length>0 && <Report title="历史温度曲线" ticktimestring={ticktimestringlist} vlist={retlist.temperature}/>}
                  {ticktimestringlist.length>0 && <Report title="历史降雨量曲线" ticktimestring={ticktimestringlist} vlist={retlist.rainfall}/>}
                  {ticktimestringlist.length>0 && <Report title="历史湿度曲线" ticktimestring={ticktimestringlist} vlist={retlist.humidity}/>}
                  {ticktimestringlist.length>0 && <Report title="历史风力曲线" ticktimestring={ticktimestringlist} vlist={retlist.windspeed}/>}
                  {ticktimestringlist.length>0 && <Report title="历史气压曲线" ticktimestring={ticktimestringlist} vlist={retlist.pressure}/>}
              </div>
          );
        }
        return <div />

    }
}

const mapStateToProps = ({device:{devices,devicetype},historydevice:{historydevices}},props) => {
		const curdevice = devices[props.match.params.id];
    const retlist = lodashget(historydevices,`${props.match.params.id}`,[]);
    return {curdevice,devicetype,retlist};
}
export default connect(mapStateToProps)(App);