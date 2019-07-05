import React from 'react';
import './App.css';
function importAll(r) {
  let images = {};
  r.keys().map((item) => { images[item.replace('./', '')] = r(item); });
  return images;
}
const action_icons = importAll(require.context('./action_icons', false, /\.png$/));
const job_icons = importAll(require.context('./job_icons/svg', false, /\.svg$/));
const other_icons = importAll(require.context('./other_icons', false, /\.svg$/));
const TEST_MODEL = {
  "player": "Ram Ram",
  "job": "BLU",
  "encDPS": 0.0,
  "duration": "00:00:00",
  "zone": "kagami v190705",
  "time": "2019-05-23 17:00:00.000",
  "isActive": false,
  "actions": []
}
// var OVERLAY_PLUGIN_API;
var animSpeed = 10;

class KagamiAction extends React.Component{
  render(){
    const animationStyle = this.props.anim?`icon-move `+animSpeed+`s linear`:``;
    return(
      <li style={{animation: animationStyle}} className={(this.props.action.category===4)?"ability":"gcd"}>
        <img src={action_icons[this.props.action.icon]} alt={this.props.action.name} />
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
    const icon = this.state.active?<img src={other_icons["NaviUp.svg"]} alt=""></img>:<img src={other_icons["NaviBottom.svg"]} alt=""></img>;

    return(
      <div className="container">
        <ul className="title" onClick={this.onClick}>
          <li><img src={other_icons["MarketLimit.svg"]} alt=""></img></li>
          <li>{this.props.title}</li>
          <li>{this.props.subtitle}</li>
          <li style={{float: `right`, marginRight: `1em`}}>{icon}</li>
          {/* <li style={{float: `right`, marginRight: `1em`}} onClick={() => this.props.remove(this.props.key)}><img src={removeIcon} alt=""></img></li> */}
        </ul>
        <ul key={this.props.actions.length} className="context" style={{display: activated}}>
          <img style={{height: `2rem`}} src={other_icons["RoundArrowRight.svg"]} alt=">"></img>
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
      lastSeq: -1,
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
    this.setState({
      model: TEST_MODEL,
      lastSeq: -1,
      window: [],
      current: [],
      history: []
    });
  }
  save(){
    const savedCurrentArray = this.state.current;
    let newHistoryArray = this.state.history;
    newHistoryArray.unshift({
      "key": this.state.model.time,
      "title": this.state.model.player, 
      "subtitle": this.state.model.encDPS, 
      "actions": savedCurrentArray.slice()
    });
    this.setState({
      history: newHistoryArray
    })
  }
  reset(){
    if(this.state.lastSeq !== -1
      && this.state.current.length > 0){
        this.save();
        this.setState({
          current: []
        });
    }
    // OVERLAY_PLUGIN_API.endEncounter();
  }
  // remove(key){
  //   const newHistoryArray = this.state.history;
  //   const index = newHistoryArray.findIndex((index) => index.key === key);
  //   if(index === 1) return;
  //   newHistoryArray.splice(index, 1);
  //   this.setState({
  //     history: newHistoryArray
  //   })
  // }
  readActions(actions){
    actions.some((action) => {
      let newWindowArray = this.state.window;
      newWindowArray.push(<KagamiAction key={"w"+action.seq} anim={true} action={action} />)
      let newCurrentArray = this.state.current;
      newCurrentArray.push(<KagamiAction key={action.seq} anim={false} action={action} />);
      this.setState({
        window: newWindowArray,
        current: newCurrentArray
      });
    })
  }

  update(json){
    if(json.time !== this.state.model.time){
      let modelSeq = this.state.lastSeq;
      let pushingActions = [];
      if(json.actions.length > 0){
        if(modelSeq !== -1){
          json.actions.some((action) => {
            if(action.category !== 1){ // is not AA; is action.
              if(action.seq > modelSeq){
                pushingActions.unshift(action);
              }
              else return true; // ignore after duplication
            }
          });
          this.readActions(pushingActions);
        }
        else if(json.actions[0].category !== 1) this.readActions([json.actions[0]]);
        this.setState({lastSeq: json.actions[0].seq});
      }
      this.setState({model: json});
    }
  }

  /* =========================== */
  componentDidMount(){
    document.addEventListener('onActionUpdated', ((e) => {
      this.update(e.detail);
    }));
    document.addEventListener('onEndEncounter', ((e) => {
      this.reset();
    }));
    document.addEventListener("onOverlayStateUpdate", ((e) => {
      if (!e.detail.isLocked) {
        this.displayResizeHandle();
      } else {
        this.hideResizeHandle();
      }
    }));
    // OVERLAY_PLUGIN_API = window.OverlayPluginApi;
  }
  render(){
    let history = this.state.history;
    history = history.map((container) => {
      return(<KagamiContainer key={container.key} title={container.title} subtitle={container.subtitle} actions={container.actions}/>)
    });
    return (
      <div id="root">
        <div className="top">
          <nav className="KagamiNav">
            <ul>
              <li key={this.state.model.job}><img src={job_icons[this.state.model.job+".svg"]} alt={this.state.model.job} /></li> {/* job icon */}
              <li key={this.state.model.encDPS}>{this.state.model.encDPS}</li> {/* encDPS */}
              <li key={this.state.model.duration}>{this.state.model.duration}</li> {/* duration */}
              <li key="reset" onClick={this.reset}><img src={other_icons["ViewRefresh.svg"]} alt="reset"></img></li> {/* reset svg button */}
              <li key="cleanup" onClick={this.cleanup}><img src={other_icons["TrashCan.svg"]} alt="cleanup"></img></li> {/* cleanup svg button */}
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
            <KagamiContainer key="current" title="Current Rotation" subtitle="" actions={this.state.current}/>
          </div>
          <div className="history">
            {history}
          </div>
        </div>
      </div>
    );
  }
}

export default App;