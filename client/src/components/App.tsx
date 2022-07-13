import React, { useRef, useState } from "react";
import "../styles/App.css";
import { DiceTable } from "./DiceTable";
import { Lobby } from "./Lobby";
import { Welcome } from "./Welcome";

const AppContainer = (props: { children?: React.ReactNode }) => <div className="app">
  <div className="title">
    <span role="img" aria-labelledby="dice-wizard">
      🎲🧙
    </span>
  </div>
  {props.children}
</div>

const App: React.FC = () => {

  const [name, setName] = useState((window.sessionStorage.name || "") as string);
  const [table, setTable] = useState((window.sessionStorage.table || "") as string);
  const socket = useRef(null as WebSocket | null);

  const openSocketForConnection = (connection: string) => {
    const ws = new WebSocket(connection, []);
    ws.onclose = (_: CloseEvent) => {
      socket.current = null;
    };
    socket.current = ws;
  }

  const closeSocketForConnection = () => {
    socket.current?.close(1000);
    socket.current = null;
  }

  // 1. Ask for name
  if (!name || name.length === 0) {
    return (<AppContainer>
      <Welcome savedName={name} onNameUpdated={setName} />
    </AppContainer>);
  }

  // 2. Ask for table
  if (!table || table.length === 0) {
    return (<AppContainer>
      <Lobby name={name} onTableUpdated={(table, url) => {
        setTable(table)
        openSocketForConnection(url);
      }} />
    </AppContainer>)
  }

  // 3. Got a name and table? Great let's rock 'n roll
  return (<AppContainer>
    <DiceTable name={name} table={table} socket={socket.current} onLeave={() => {
      closeSocketForConnection();
      setTable("");
    }} />
  </AppContainer>);
}

export { App };
