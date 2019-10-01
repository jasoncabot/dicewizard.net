import React from 'react';

const DiceTable = (props) => {

        // <div>
    //   <input onChange={this.updateDiceCount} value={this.state.diceCount} />d<input onChange={this.updateDiceSize} value={this.state.diceSize} />
    //   <button onClick={this.roll}>roll</button><br />
    // </div>
    // <button onClick={this.leave}>leave</button><br />

    const lines = props.log.map((item, idx) => {
        return (
            <li key={item.id}>{item.msg}</li>
        );
    });
    return (<ol>{lines}</ol>);
}

export default DiceTable;