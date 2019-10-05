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
      started: false
    }

    this.onTableChanged = this.onTableChanged.bind(this);

    this.updateName = this.updateName.bind(this);
    this.updateTable = this.updateTable.bind(this);
  }

  componentDidMount() {
    this.context.on('table_changed', this.onTableChanged);
  }

  componentWillUnmount() {
    this.context.off('table_changed', this.onTableChanged);
  }

  updateName = (name) => {
    console.log('updating name to ' + name);
    window.sessionStorage.name = name;
    this.setState({ name });
  }

  updateTable = (table) => {
    console.log('udpating table to ' + table);
    window.sessionStorage.table = table;
    this.setState({ table, started: true });
  }

  onTableChanged(data) {
    console.log('changed table with ' + JSON.stringify(data));
    window.sessionStorage.name = data.name;
    window.sessionStorage.table = data.table;
    this.setState({
      name: data.name,
      table: data.table,
      log: data.log,
      started: data.table.length > 0
    });
  }

  buildContent(state) {

    // Prompt for name if we don't have one already
    if (state.name.length === 0) {
      return (<Welcome onNameUpdated={this.updateName} />);
    }

    // Prompt to join a table if we don't have one
    if (state.table.length === 0 && !state.started) {
      return (<Lobby name={state.name} onEntered={this.updateTable} />);
    }

    return (<DiceTable name={state.name} table={state.table} history={state.log} />);
  }

  render() {
    const content = this.buildContent(this.state);
    return (
      <div className="App">
        <div className="title">DatT</div>
        {content}
      </div>
    );
  }
}

App.contextType = SocketContext;

export default App;
