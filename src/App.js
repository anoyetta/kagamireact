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
    const animationStyle = this.props.anim?`icon-move `+animSpeed+`s linear`:``;
    return(
      <li style={{animation: animationStyle}} className={(this.props.action.category===4)?"ability":"gcd"}>
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
    const icon = this.state.active?<img src={arrowUpIcon} alt=""></img>:<img src={arrowDownIcon} alt=""></img>;

    return(
      <div className="container">
        <ul className="title" onClick={this.onClick}>
          <li><img src={historyIcon} alt=""></img></li>
          <li>{this.props.title}</li>
          <li>{this.props.duration}</li>
          <li style={{float: `right`, marginRight: `1em`}}>{icon}</li>
        </ul>
        <ul key={this.props.actions.length} className="context" style={{display: activated}}>
          <img style={{height: `2rem`}} src={arrowRightIcon} alt=">"></img>
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
      window: [],
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
      newWindowArray.push(<KagamiAction key={action.timestamp} anim={true} action={action} />)
      let newCurrentArray = this.state.current;
      newCurrentArray.push(<KagamiAction key={action.timestamp} anim={false} action={action} />);
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
            <KagamiContainer title="Current Rotation" duration="" actions={this.state.current}/>
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