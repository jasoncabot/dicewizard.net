import React from 'react';
import { SessionContext } from './session-context';
import Welcome from './Welcome';
import Lobby from './Lobby';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      table: ''
    }

    this.start = this.start.bind(this);
    this.roll = this.roll.bind(this);
    this.leave = this.leave.bind(this);

    this.updateName = this.updateName.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.updateDiceCount = this.updateDiceCount.bind(this);
    this.updateDiceSize = this.updateDiceSize.bind(this);

    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.onTableChanged = this.onTableChanged.bind(this);
  }

  componentDidMount() {
    // this.context.on('table_changed', this.onTableChanged);
    // this.context.on('message', this.onMessageReceived);
  }

  componentWillUnmount() {
    // this.context.off('table_changed', this.onTableChanged);
    // this.context.off('message', this.onMessageReceived);
  }

  start() {
    // if (this.state.table && this.state.table.length > 0) {
    //   this.context.emit('join', { name: this.state.name, table: this.state.table });
    // } else {
    //   this.context.emit('create', { name: this.state.name });
    // }
  }

  roll() {
    // this.context.emit('roll', { count: this.state.diceCount, size: this.state.diceSize });
  }

  leave() {
    // this.context.emit('leave', { name: this.state.name, table: this.state.table });
  }

  updateName(name) {
    this.setState({ name });
  }

  updateTable(table) {
    this.setState({ table });
  }

  updateDiceCount(event) {
    this.setState({ diceCount: event.target.value });
  }

  updateDiceSize(event) {
    this.setState({ diceSize: event.target.value });
  }

  onTableChanged(data) {
    console.log('changed table with ' + JSON.stringify(data));
    this.setState({
      name: data.name,
      table: data.table
    });
  }

  onMessageReceived(data) {
    console.log('updated log with ' + JSON.stringify(data));
    const updatedLog = this.state.log;
    updatedLog.push(data);
    this.setState({ log: updatedLog });
  }

  contentFromState() {

    // Prompt for name if we don't have one already
    if (this.state.name.length === 0) {
      return (<Welcome onNameUpdated={this.updateName} />);
    }

    // Prompt to join a table if we don't have one
    if (this.state.table.length === 0) {
      return (<Lobby name={this.state.name} onEntered={this.updateTable} />);
    }

    return (<div>table</div>);
  }

  render() {
    const content = this.contentFromState();
    return (
      <div className="App">
        <div className="title">DatT</div>
        {content}
      </div>
    );
  }
}
App.contextType = SessionContext;

export default App;
