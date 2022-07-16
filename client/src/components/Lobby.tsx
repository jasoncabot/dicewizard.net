import { useState } from "react";

const Lobby: React.FC<{ name: string, onTableUpdated: (table: string, connection: string) => void }> = ({ name, onTableUpdated }) => {

    const [buttonText, setButtonText] = useState("Start");
    const [table, setTable] = useState("");

    const start = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/seats`, { method: "POST", body: JSON.stringify({ name, table }) })
            .then(async r => { if (!r.ok) throw new Error(await r.text()); return r })
            .then(response => response.json())
            .then(response => { return { websocketURL: `${process.env.REACT_APP_WS_ENDPOINT}/api/connection?table=${response.table}&token=${response.token}`, table: response.table } })
            .then(({ websocketURL, table }) => onTableUpdated(table, websocketURL))
            .catch(e => console.error(`Unable to join table "${table}" as ${name}. ` + e))
            ;
    }

    const updateTable = (e: React.FormEvent<HTMLInputElement>) => {
        const code = e.currentTarget.value.toUpperCase();
        setTable(code);
        setButtonText(code.length === 0 ? "Start" : "Join");
    }

    return (
        <form className="lobby" onSubmit={start}>
            <p>Welcome {name}</p>
            <p>Join an existing table?</p>
            <p><input className="brutal" pattern=".{4,4}" onChange={updateTable} value={table} maxLength={4} autoFocus /></p>
            <p><button className="brutal" type="submit">{buttonText}</button></p>
        </form>
    );
}

export { Lobby };
