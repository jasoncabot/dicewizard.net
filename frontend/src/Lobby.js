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
                Welcome {this.props.name}, take a seat at a particular table or leave empty to start a new table
                <p><input className="brutal" onChange={this.updateTable} autoFocus /></p>
                <p><button className="brutal" type="submit">{this.state.buttonText}</button></p>
            </form>
        );
    }

    updateTable(e) {
        let table = e.target.value;
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