import React from 'react';
import './Welcome.css';
import { SessionContext } from './session-context';

class Welcome extends React.Component {

    constructor(props) {
        super(props);

        this.updateName = this.updateName.bind(this);
        this.start = this.start.bind(this);
    }

    componentDidMount() {
        console.log('welcome knows context is ' + this.context);
    }

    render() {
        return (
            <form className="welcome" onSubmit={this.start}>
                <p><label htmlFor="name_entry">Enter your name</label></p>
                <p><input className="name_entry brutal" onChange={this.updateName} autoFocus /></p>
                <p><button className="brutal" type="submit">Go</button></p>
            </form>
        );
    }

    updateName(e) {
        this.setState({name: e.target.value});
    }
    
    start(e) {
        e.preventDefault();
        this.props.onNameUpdated(this.state.name);
    }
    
};

Welcome.contextType = SessionContext;

export default Welcome;