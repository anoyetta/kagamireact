import React from 'react';
import './App.css';
import resetIcon from './svg/ViewRefresh.svg';
import cleanupIcon from './svg/TrashCan.svg';
import historyIcon from './svg/MarketLimit.svg';
import arrowRightIcon from './svg/RoundArrowRight.svg';
import arrowUpIcon from './svg/NaviUp.svg';
import arrowDownIcon from './svg/NaviBottom.svg';
function importAll(r) {
  let images = {};
  r.keys().map((item) => { images[item.replace('./', '')] = r(item); });
  return images;
}
const images = importAll(require.context('./action_icons', false, /\.png$/));
const RELEASE_NOTE= [
  <li>version alpha
    <ul>
      <li>- まれにアクションが取れない?</li>
      <li>- CPU,memory使用量が多すぎ</li>
      <li>- config機能未実装</li>
      <li>- 見た目が悪すぎる</li>
    </ul>
  </li>
];
const TEST_MODEL = {
  "player": "",
  "job": "BLU",
  "encDPS": 0.0,
  "duration": "00:00:00",
  "zone": "kagami",
  "time": "2019-05-23 00:00:00.000",
  "isActive": false,
  "actions": []
}
var animSpeed = 10;

class KagamiAction extends React.Component{
  render(){
    const animationStyle = {
      animation: `icon-move `+animSpeed+`s linear`
    };
    return(
      <li style={animationStyle} className={(this.props.action.category===4)?"ability":"gcd"}>
        <img src={images[this.props.action.icon]} alt={this.props.action.name} />
      </li>
    )
  }
}

class KagamiContainer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      active: false
    }
  }
  onClick = () => {
    this.setState({active: !this.state.active});
  }

  render(){
    const activated = this.state.active?`inline`:`none`;
    const icon = this.state.active?<img src={arrowUpIcon}></img>:<img src={arrowDownIcon}></img>;

    return(
      <div className="container">
        <ul className="title" onClick={this.onClick}>
          <li><img src={historyIcon} alt=""></img></li>
          <li>{this.props.title}</li>
          <li>{this.props.duration}</li>
          <li style={{float: `right`, marginRight: `1em`}}>{icon}</li>
        </ul>
        <ul className="context" style={{display: activated}}>
          <img style={{height: `2rem`}} src={arrowRightIcon}></img>
          {this.props.actions}
        </ul>
      </div>
    )
  }
}



class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      model: TEST_MODEL,
      lastTimestamp: -1,
      window: [],
      current: [],
      history: []
    };

    this.cleanup = this.cleanup.bind(this);
    this.reset = this.reset.bind(this);
  }
  displayResizeHandle() {
    document.documentElement.classList.add("resizeHandle");
  }
  hideResizeHandle() {
    document.documentElement.classList.remove("resizeHandle");
  }
  
  /* ========================== */
  cleanup(){
    console.log("cleanup");
    this.setState({
      model: TEST_MODEL,
      lastTimestamp: -1,
      current: [],
      history: []
    });
  }
  reset(){
    if(this.state.lastTimestamp !== -1){
      console.log("reset");
      let newHistoryArray = this.state.history;
      const savedCurrentArray = this.state.current;
      newHistoryArray.unshift({
        "title": this.state.model.zone, 
        "duration": this.state.model.duration, 
        "actions": savedCurrentArray.slice()
      });
      this.setState({
        lastTimestamp: -1,
        current: [],
        history: newHistoryArray
      });
    }
  }
  readAction(action, timestamp){
    if(action.category !== 1){
      let newWindowArray = this.state.window;
      newWindowArray.push(<KagamiAction key={action.timestamp} action={action} />)
      let newCurrentArray = this.state.current;
      newCurrentArray.push(<KagamiAction key={action.timestamp} action={action} />);
      this.setState({
        lastTimestamp: timestamp,
        window: newWindowArray,
        current: newCurrentArray
      });
    }
  }

  update(json){
    if(json.job !== this.state.model.job
      && 1){
        this.reset();
    }
    if(json.actions.length > 0
      && 1){
        if(this.state.lastTimestamp === -1){ // first model; read only last one action.
          this.readAction(json.actions[0], new Date(json.actions[0].timestamp));
        }
        else{ // continue reading all action
          json.actions.some((action) => {
            const timestamp = new Date(action.timestamp);
            if(timestamp > this.state.lastTimestamp){
              this.readAction(action, timestamp);
              return false;
            } 
            else {return true;} // ignore after duplicated action.
          });
        }
    }
    else{ 
      this.reset();
    }
    this.setState({model: json});
  }

  /* =========================== */
  componentDidMount(){
    document.addEventListener('onOverlayDataUpdate', ((e) => {
      this.update(e.detail);
    }));
    document.addEventListener("onOverlayStateUpdate", ((e) => {
      if (!e.detail.isLocked) {
        this.displayResizeHandle();
      } else {
        this.hideResizeHandle();
      }
    }));
  }
  render(){
    let history = this.state.history;
    history = history.map((container) => {
      return(<KagamiContainer title={container.title} duration={container.duration} actions={container.actions} />)
    });
    return (
      <div id="root">
        <div className="top">
          <nav className="KagamiNav">
            <ul>
              <li key={this.state.model.job}><img src={images[this.state.model.job+".png"]} alt={this.state.model.job} /></li> {/* job icon */}
              <li key={this.state.model.encDPS}>{this.state.model.encDPS}</li> {/* encDPS */}
              <li key={this.state.model.duration}>{this.state.model.duration}</li> {/* duration */}
              <li key="reset" onClick={this.reset}><img src={resetIcon} alt="reset"></img></li> {/* reset svg button */}
              <li key="cleanup" onClick={this.cleanup}><img src={cleanupIcon} alt="cleanup"></img></li> {/* cleanup svg button */}
              {/* <li key="config">config</li> config svg button */}
              <li key={this.state.model.zone}>{this.state.model.zone}</li> {/* zone */}
            </ul>
          </nav>
          <div className="KagamiWindow">
            <ul>
              {this.state.window}
            </ul>
          </div>
        </div>
        <div className="KagamiContainer">
          <div className="current">
            <KagamiContainer key={history.length} title="Current Rotation" duration="" actions={this.state.current}/>
          </div>
          <div className="history">
            {history}
          </div>
          <div className="releaseNote">
            <KagamiContainer title="release note" duration="" actions={RELEASE_NOTE} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;

// const TEST_MODEL = {
//   "player": "Ram Ram",
//   "job": "MNK",
//   "encDPS": 7644.0,
//   "duration": "00:00:49",
//   "zone": "Private Cottage - Shirogane",
//   "time": "2019-05-22 21:43:04.821",
//   "isActive": true,
//   "actions": [
//     {
//       "seq": 16,
//       "source": "[21:42:14.781] 15:102CC0EE:Ram Ram:1EB9:疾風羅刹衝:400009E3:木人:730003:4CF0000:0F:20000:10:4DC8000:0:0:0:0:0:0:0:0:0:0:165452:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:111.4847:13.38636:30.02:",
//       "timestamp": "2019-05-22 21:42:15.880",
//       "actor": "Ram Ram",
//       "id": 7865,
//       "name": "疾風羅刹衝:400009E3:木人:730003:4CF0000:0F:20000:10:4DC8000:0:0:0:0:0:0:0:0:0:0:165452:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:111.4847:13.38636",
//       "icon": "002539.png",
//       "category": 4,
//       "recastTime": 30.0
//     },
//     {
//       "seq": 17,
//       "source": "[21:42:15.566] 15:102CC0EE:Ram Ram:42:破砕拳:400009E3:木人:1C730203:6EA0000:E5E90F:F60000:3E:8000:3000A10:6B8000:1C:428000:0:0:0:0:0:0:164221:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:111.4847:13.38636:30.02:",
//       "timestamp": "2019-05-22 21:42:16.432",
//       "actor": "Ram Ram",
//       "id": 66,
//       "name": "破砕拳:400009E3:木人:1C730203:6EA0000:E5E90F:F60000:3E:8000:3000A10:6B8000:1C:428000:0:0:0:0:0:0:164221:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:111.4847:13.38636",
//       "icon": "000204.png",
//       "category": 3,
//       "recastTime": 2.5
//     },
//     {
//       "seq": 18,
//       "source": "[21:42:15.566] 15:102CC0EE:Ram Ram:07:攻撃:400009E3:木人:730103:CA80000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:164221:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:111.4847:13.38636:30.02:",
//       "timestamp": "2019-05-22 21:42:16.432",
//       "actor": "Ram Ram",
//       "id": 7,
//       "name": "攻撃:400009E3:木人:730103:CA80000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:164221:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:111.4847:13.38636",
//       "icon": "000405.png",
//       "category": 1,
//       "recastTime": 0.0
//     },
//     {
//       "seq": 19,
//       "source": "[21:42:16.368] 15:102CC0EE:Ram Ram:1EBC:疾風の極意:400009E3:木人:730103:84F0000:0F:20000:3E:8000:0:0:0:0:0:0:0:0:0:0:160981:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:960:1000:117.77:5.48476:30.02:",
//       "timestamp": "2019-05-22 21:42:17.265",
//       "actor": "Ram Ram",
//       "id": 7868,
//       "name": "疾風の極意:400009E3:木人:730103:84F0000:0F:20000:3E:8000:0:0:0:0:0:0:0:0:0:0:160981:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:960:1000:117.77:5.48476",
//       "icon": "002543.png",
//       "category": 4,
//       "recastTime": 0.0
//     },
//     {
//       "seq": 20,
//       "source": "[21:42:17.879] 15:102CC0EE:Ram Ram:07:攻撃:400009E3:木人:730003:8EC0000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:155833:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:117.7893:5.490648:30.02:",
//       "timestamp": "2019-05-22 21:42:18.692",
//       "actor": "Ram Ram",
//       "id": 7,
//       "name": "攻撃:400009E3:木人:730003:8EC0000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:155833:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:117.7893:5.490648",
//       "icon": "000405.png",
//       "category": 1,
//       "recastTime": 0.0
//     },
//     {
//       "seq": 21,
//       "source": "[21:42:17.967] 15:102CC0EE:Ram Ram:4A:双竜脚:400009E3:木人:E730003:D4B0000:F60F:3350000:6001410:6C8000:1C:4A8000:0:0:0:0:0:0:0:0:155833:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:117.7893:5.490648:30.02:",
//       "timestamp": "2019-05-22 21:42:18.898",
//       "actor": "Ram Ram",
//       "id": 74,
//       "name": "双竜脚:400009E3:木人:E730003:D4B0000:F60F:3350000:6001410:6C8000:1C:4A8000:0:0:0:0:0:0:0:0:155833:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:1000:1000:117.7893:5.490648",
//       "icon": "002528.png",
//       "category": 3,
//       "recastTime": 2.5
//     },
//     {
//       "seq": 22,
//       "source": "[21:42:18.767] 15:102CC0EE:Ram Ram:3F:紅蓮の構え:102CC0EE:Ram Ram:60F:670000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:51518:51518:5160:5160:950:1000:117.6385:5.246813:30.02:51518:51518:5160:5160:950:1000:117.6385:5.246813:30.02:",
//       "timestamp": "2019-05-22 21:42:19.665",
//       "actor": "Ram Ram",
//       "id": 63,
//       "name": "紅蓮の構え:102CC0EE:Ram Ram:60F:670000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:51518:51518:5160:5160:950:1000:117.6385:5.246813:30.02:51518:51518:5160:5160:950:1000:117.6385:5.246813",
//       "icon": "000205.png",
//       "category": 4,
//       "recastTime": 3.0
//     },
//     {
//       "seq": 23,
//       "source": "[21:42:20.165] 15:102CC0EE:Ram Ram:3D:双掌打:400009E3:木人:F730303:1AC80000:3E:8000:A10:658000:9001E10:6D8000:1C:3D8000:0:0:0:0:0:0:150146:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:",
//       "timestamp": "2019-05-22 21:42:21.107",
//       "actor": "Ram Ram",
//       "id": 61,
//       "name": "双掌打:400009E3:木人:F730303:1AC80000:3E:8000:A10:658000:9001E10:6D8000:1C:3D8000:0:0:0:0:0:0:150146:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:950:1000:117.5688:5.166104",
//       "icon": "000213.png",
//       "category": 3,
//       "recastTime": 2.5
//     },
//     {
//       "seq": 24,
//       "source": "[21:42:20.191] 15:102CC0EE:Ram Ram:07:攻撃:400009E3:木人:730103:F7A0000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:150146:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:",
//       "timestamp": "2019-05-22 21:42:21.107",
//       "actor": "Ram Ram",
//       "id": 7,
//       "name": "攻撃:400009E3:木人:730103:F7A0000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:150146:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:950:1000:117.5688:5.166104",
//       "icon": "000405.png",
//       "category": 1,
//       "recastTime": 0.0
//     },
//     {
//       "seq": 25,
//       "source": "[21:42:20.969] 15:102CC0EE:Ram Ram:3B:発勁:102CC0EE:Ram Ram:1E0F:640000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:",
//       "timestamp": "2019-05-22 21:42:21.833",
//       "actor": "Ram Ram",
//       "id": 59,
//       "name": "発勁:102CC0EE:Ram Ram:1E0F:640000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:51518:51518:5160:5160:950:1000:117.5688:5.166104",
//       "icon": "000212.png",
//       "category": 4,
//       "recastTime": 60.0
//     },
//     {
//       "seq": 26,
//       "source": "[21:42:21.769] 15:102CC0EE:Ram Ram:1CE3:紅蓮の極意:102CC0EE:Ram Ram:F001E10:49D8000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:",
//       "timestamp": "2019-05-22 21:42:22.609",
//       "actor": "Ram Ram",
//       "id": 7395,
//       "name": "紅蓮の極意:102CC0EE:Ram Ram:F001E10:49D8000:0:0:0:0:0:0:0:0:0:0:0:0:0:0:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:51518:51518:5160:5160:950:1000:117.5688:5.166104",
//       "icon": "002541.png",
//       "category": 4,
//       "recastTime": 90.0
//     },
//     {
//       "seq": 27,
//       "source": "[21:42:22.569] 15:102CC0EE:Ram Ram:38:崩拳:400009E3:木人:B730303:34C80000:3E:8000:3E:8000:3000A10:6B8000:1C:388000:0:0:0:0:0:0:138313:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:950:1000:117.5688:5.166104:30.02:",
//       "timestamp": "2019-05-22 21:42:23.379",
//       "actor": "Ram Ram",
//       "id": 56,
//       "name": "崩拳:400009E3:木人:B730303:34C80000:3E:8000:3E:8000:3000A10:6B8000:1C:388000:0:0:0:0:0:0:138313:165452:0:0:1000:1000:119.7027:6.072867:32.01069:51518:51518:5160:5160:950:1000:117.5688:5.166104",
//       "icon": "000210.png",
//       "category": 3,
//       "recastTime": 2.5
//     }
//   ]
// }