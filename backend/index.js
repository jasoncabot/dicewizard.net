const io = require('socket.io')();

const guid = () => {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

const randomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const roll = (count, size) => {
    var total = 0;
    for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * size) + 1;
    }
    return total;
};

let tables = {};
let messages = {};

const name = (id) => {
    return (tables[id] || {}).name;
}

const table = (id) => {
    return (tables[id] || {}).table;
}

const rollInBounds = ({ size, count }) => {
    // TODO: verify
    return true;
}

const log = (socket, action, data) => {
    console.log(JSON.stringify({
        id: socket.id, action, data
    }));
}

const appendText = (table, text) => {
    let message = {
        id: guid(),
        msg: text,
        table: table,
        at: Date.now()
    };
    io.to(table).emit('message', message);

    const updatedMessages = messages[table] || [];
    updatedMessages.unshift(message);
    messages[table] = updatedMessages;
}

io.on('connection', (socket) => {
    log(socket, 'connected');

    socket.on('join', (data) => {
        log(socket, 'joined', data);

        // TODO: validate that data.table is correct length and type   
        // TODO: check that data.table exists
        tables[socket.id] = {
            table: data.table, // table id
            name: data.name // person name
        };

        socket.join(data.table);
        appendText(data.table, name(socket.id) + ' joined');

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: data.table,
            log: messages[data.table] || []
        });
    });

    socket.on('create', (data) => {
        log(socket, 'create', data);
        const tableId = randomString(4);
        tables[socket.id] = {
            table: tableId,
            name: data.name // person name
        };
        socket.join(tableId);
        appendText(data.table, name(socket.id) + ' started');

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: tableId,
            log: messages[tableId] || []
        });
    });

    socket.on('leave', (data) => {
        log(socket, 'leave', data);

        io.to(data.table).emit('message', {
            id: guid(),
            msg: name(socket.id) + ' left',
            table: data.table,
            at: Date.now()
        });

        tables[socket.id] = {};
        socket.leave(data.table);

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: '',
            log: []
        });
    });

    socket.on('roll', (data) => {
        log(socket, 'roll', data);
        if (!rollInBounds(data)) {
            log(socket, 'roll', { error: 'data not in bounds' });
            return;
        }
        const text = name(socket.id) + ' rolled ' + roll(data.count, data.size) + ' (' + data.count + 'd' + data.size + ')'
        appendText(table(socket.id), text);
    });
});

io.listen(process.env.PORT);
