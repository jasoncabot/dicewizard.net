import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import '../styles/DiceTable.css';

export interface Message {
    id: string
    message: string
    subtext: string
}

const RollHistory: React.FC<{ log: Message[] }> = ({ log }) => {

    const lines = log.map(({ id, message, subtext }, idx) =>
        <li key={id}>
            {idx === 0 ? "> " : ""}<abbr title={subtext}>{message}</abbr>
        </li>
    );
    return (<ul>{lines}</ul>);
}

export const DiceTable: React.FC<{ name: string, table: string, socket: WebSocket | null, onLeave: () => void }> = ({ name, table, socket, onLeave }) => {

    const sizes = [4, 6, 8, 10, 12, 20, 100];

    const [count, setCount] = useState(1);
    const [sizeIndex, setSizeIndex] = useState(5);
    const [log, setLog] = useState([] as Message[]);

    const roll = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        socket?.send(JSON.stringify({ action: 'roll', count, size: sizes[sizeIndex] }));
    }

    const updateDiceCount = (event: ChangeEvent<HTMLInputElement>) => {
        setCount(parseInt(event.target.value, 10));
    }

    const updateDiceSize = (event: ChangeEvent<HTMLSelectElement>) => {
        const next = parseInt(event.target.value, 10);
        console.log('got next ' + next);
        const foundIndex = sizes.indexOf(next);
        const clamp = (x: number) => Math.max(0, Math.min(sizes.length - 1, x));
        if (foundIndex >= 0) {
            setSizeIndex(foundIndex);
        } else if (next > sizes[sizeIndex]) {
            setSizeIndex(clamp(sizeIndex + 1));
        } else if (next < sizes[sizeIndex]) {
            setSizeIndex(clamp(sizeIndex - 1));
        }
    }

    const leave = () => {
        socket?.send(JSON.stringify({ action: 'leave' }));
        onLeave();
    }

    useEffect(() => {
        const onMessageReceived = (message: MessageEvent<any>) => {
            const { action, name, id, value, subtext, results } = JSON.parse(message.data);
            const logLength = 10;
            switch (action) {
                case "join": // someone joined
                    setLog((previous) => [{ id, message: `${name} joined ${table}`, subtext }, ...previous.slice(0, logLength)]);
                    break;
                case "roll": // someone rolled
                let truncatedResults: any[];
                if (results.length > 5) {
                    truncatedResults = results.slice(0, 2);
                    truncatedResults.push("...");
                    truncatedResults.push(results.slice(-1));
                } else {
                    truncatedResults = results;
                }
                setLog((previous) => [{ id, message: `${name} rolled ${value} (${truncatedResults.join(',')})`, subtext }, ...previous.slice(0, logLength)]);
                    break;
                case "leave": // someone left
                    setLog((previous) => [{ id, message: `${name} left ${table}`, subtext }, ...previous.slice(0, logLength)]);
                    break;
            }
        }

        const onSocketError = (error: Event) => {
            console.error("Socket error " + error);
        }

        socket?.addEventListener('message', onMessageReceived);
        socket?.addEventListener('error', onSocketError);
        return function cleanup() {
            socket?.removeEventListener('message', onMessageReceived);
            socket?.removeEventListener('error', onSocketError);
        };
    }, [socket, table]);

    const diceOptions = sizes.map((value, index) => (
        <option value={value}>{value}</option>                        
    ))

    return (
        <div className="container">
            <div>Table: '{table}'</div>
            <div className="dice">
                <form onSubmit={roll}>
                    <div>
                        <input onChange={updateDiceCount} value={count} type="number" min="1" max="999" />d
                        <select value={sizes[sizeIndex]} onChange={updateDiceSize}>
                            {diceOptions}
                        </select>
                    </div>
                    <div>
                        <button className="brutal" type="submit" autoFocus>roll</button>
                    </div>
                </form>
            </div>
            <RollHistory log={log} />
            <button className="brutal secondary" onClick={leave}>leave {table}</button><br />
        </div>
    );
}
