import React from 'react';
import Welcome from './Welcome';
import Lobby from './Lobby';
import DiceTable from './DiceTable';
import { SocketContext } from './socket-context';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: window.sessionStorage.name || '',
      table: window.sessionStorage.table || '',
      log: [],
      started: false
    }

    this.onTableChanged = this.onTableChanged.bind(this);
    this.onDisconnected = this.onDisconnected.bind(this);

    this.updateName = this.updateName.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.updateLog = this.updateLog.bind(this);
  }

  componentDidMount() {
    this.context.on('table_changed', this.onTableChanged);
    this.context.on('disconnect', this.onDisconnected);
  }

  componentWillUnmount() {
    this.context.off('table_changed', this.onTableChanged);
    this.context.off('disconnect', this.onDisconnected);
  }

  updateName = (name) => {
    window.sessionStorage.name = name;
    this.setState({ name });
  }

  updateTable = (table) => {
    window.sessionStorage.table = table;
    this.setState({ table, started: true });
  }

  updateLog = (data) => {
    const updatedLog = this.state.log;
    updatedLog.unshift(data);
    this.setState({ log: updatedLog });
  }

  onTableChanged(data) {
    window.sessionStorage.name = data.name;
    window.sessionStorage.table = data.table;
    this.setState({
      name: data.name,
      table: data.table,
      log: data.log,
      started: data.table.length > 0
    });
  }

  onDisconnected(reason) {
    this.setState({ table: '', started: false });
  }

  buildContent(state, updater) {

    // Prompt for name if we don't have one already
    if (state.name.length === 0) {
      return (<Welcome onNameUpdated={this.updateName} />);
    }

    // Prompt to join a table if we don't have one
    if (state.table.length === 0 && !state.started) {
      return (<Lobby name={state.name} onEntered={this.updateTable} />);
    }

    return (<DiceTable name={state.name} table={state.table} log={state.log} updateLog = { updater } />);
}

render() {
  const content = this.buildContent(this.state, this.updateLog);
  return (
    <div className="app">
      <div className="title">
        <span role="img" aria-labelledby="dice-wizard">
          🎲🧙
          </span>
      </div>
      {content}
    </div>
  );
}
}

App.contextType = SocketContext;

export default App;
