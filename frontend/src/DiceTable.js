import React from 'react';
import { SocketContext } from './socket-context';
import './DiceTable.css';

const RollHistory = (props) => {

    const lines = props.log.map((item, idx) => {
        return (
            <li className="{id}" key={item.id}>{item.msg}</li>
        );
    });
    return (<ul>{lines}</ul>);
}

class DiceTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            count: 1,
            size: 20
        }

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
        return (
            <div className="container">
                <div>Table: '{this.props.table}'</div>
                <div className="dice">
                    <form onSubmit={this.roll}>
                        <div>
                            <input onChange={this.updateDiceCount} value={this.state.count} type="number" min="1" max="999" />d<input onChange={this.updateDiceSize} value={this.state.size} type="number" min="1" max="100" />
                        </div>
                        <div>
                            <button className="brutal" type="submit" autoFocus>roll</button>
                        </div>
                    </form>
                </div>
                <RollHistory log={this.props.log} />
                <button className="brutal secondary" onClick={this.leave}>leave {this.props.table}</button><br />
            </div>
        );
    }
}

DiceTable.contextType = SocketContext;

export default DiceTable;