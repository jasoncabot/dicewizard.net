import React, { useState } from "react";


const Welcome: React.FC<{ savedName: string, onNameUpdated: (name: string) => void }> = ({ savedName, onNameUpdated }) => {

    const [name, setName] = useState(savedName);

    const start = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onNameUpdated(name);
    }

    const updateName = (e: React.FormEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
    }

    return (
        <form className="welcome" onSubmit={start}>
            <p><label htmlFor="name_entry">Enter your name</label></p>
            <p><input className="name_entry brutal" onChange={updateName} autoFocus /></p>
            <p><button className="brutal" type="submit">Go</button></p>
        </form>
    );
}

export { Welcome };

