import React from 'react';
import { SocketContext } from './socket-context';
import './DiceTable.css';

const RollHistory = (props) => {

    const lines = props.log.map((item, idx) => {
        return (
            <li key={item.id}>{item.msg}</li>
        );
    });
    return (<ol>{lines}</ol>);
}

class DiceTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            count: 1,
            size: 20
        }

        console.log('DiceTable.constructor: ' + JSON.stringify(props));

        this.roll = this.roll.bind(this);
        this.leave = this.leave.bind(this);

        this.updateDiceCount = this.updateDiceCount.bind(this);
        this.updateDiceSize = this.updateDiceSize.bind(this);

        this.onMessageReceived = this.onMessageReceived.bind(this);
    }

    componentDidMount() {
        this.context.on('message', this.onMessageReceived);
        if (this.props.table && this.props.table.length > 0) {
            this.context.emit('join', { name: this.props.name, table: this.props.table });
        } else {
            this.context.emit('create', { name: this.props.name });
        }
    }

    componentWillUnmount() {
        this.context.off('message', this.onMessageReceived);
    }

    updateDiceCount(event) {
        this.setState({ count: event.target.value });
    }

    updateDiceSize(event) {
        this.setState({ size: event.target.value });
    }

    onMessageReceived(data) {
        console.log('DiceTable.onMessageReceived: ' + JSON.stringify(data));
        this.props.updateLog(data);
    }

    roll(e) {
        e.preventDefault();
        this.context.emit('roll', { count: this.state.count, size: this.state.size });
    }

    leave() {
        this.context.emit('leave', { name: this.props.name, table: this.props.table });
    }

    render() {
        console.log('DIceTable.render');
        return (
            <div className="container">
                <div>Table: '{this.props.table}'</div>
                <div className="dice">
                    <form onSubmit={this.roll}>
                    <input onChange={this.updateDiceCount} value={this.state.count} />d<input onChange={this.updateDiceSize} value={this.state.size} />
                    <button className="brutal" type="submit" autoFocus>roll</button>
                    </form>
                </div>
                <button className="brutal secondary" onClick={this.leave}>leave {this.props.table}</button><br />
                <RollHistory log={this.props.log} />
            </div>
        );
    }
}

DiceTable.contextType = SocketContext;

export default DiceTable;