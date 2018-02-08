import React from 'react';
import "./style.css";
import Header from "../header/page.js";
import List from "./list.js";
import Filler from "./filler.js";
import Footer from "../footer";

class App extends React.Component {

    render() {
        return (
            <div className="datameterPage">
                <Header title="数据监控" history={this.props.history} />
                <Filler />
                <List history={this.props.history} />
                <Footer history={this.props.history} sel={"datameter"} />
            </div>
        );
    }
}

export default App;