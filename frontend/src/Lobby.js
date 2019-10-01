import React from 'react';
import './Lobby.css';

class Lobby extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            table: '',
            buttonText: 'Start'
        }

        this.updateTable = this.updateTable.bind(this);
        this.start = this.start.bind(this);
    }

    render() {
        return (
            <form className="lobby" onSubmit={this.start}>
                <p>Welcome {this.props.name}</p>
                <p>You can Start and create a new table, or enter a 4-digit table code and Join</p>
                <p><input className="brutal" pattern=".{4,4}" onChange={this.updateTable} value={this.state.table} maxLength="4" autoFocus /></p>
                <p><button className="brutal" type="submit">{this.state.buttonText}</button></p>
            </form>
        );
    }

    updateTable(e) {
        let table = e.target.value.toUpperCase();
        let buttonText = table === '' ? 
            'Start' : 
            'Join';
        this.setState({ table, buttonText });
    }

    start(e) {
        e.preventDefault();
        this.props.onEntered(this.state.table);
    }
};

export default Lobby;