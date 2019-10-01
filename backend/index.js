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

const name = (id) => {
    return (tables[id] || {}).name;
}

const table = (id) => {
    return (tables[id] || {}).table;
}

const rollInBounds = ({size, count}) => {
    // TODO: verify
    return true;
}

io.on('connection', (socket) => {
    console.log(socket.id + ' connected');

    socket.on('join', (data) => {
        console.log(socket.id + ' joined ' + JSON.stringify(data));
        tables[socket.id] = {
            table: data.table, // table id
            name: data.name // person name
        };
        socket.join(data.table);

        // TODO: check that data.table exists

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: data.table,
            log: [
                { id: guid(), msg: 'this is a sample message of an existing table (joining)', table: data.table, at: Date.now() }
            ]
        });
    });

    socket.on('create', (data) => {
        console.log(socket.id + ' created ' + JSON.stringify(data));
        const tableId = randomString(4);
        tables[socket.id] = {
            table: tableId,
            name: data.name // person name
        };
        socket.join(tableId);

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: tableId,
            log: [
                { id: guid(), msg: 'this is a sample message of an existing table (creating)', table: data.table, at: Date.now() }
            ]
        });
    });

    socket.on('leave', (data) => {
        console.log(socket.id + ' left ' + JSON.stringify(data));
        tables[socket.id] = {};
        socket.leave(data.table);

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: '',
            log: []
        });
    });

    socket.on('roll', (data) => {
        if (!rollInBounds(data)) {
            console.log('invalid roll from ' + socket.id + ' of ' + data.count + 'd' + data.size);
            return;
        }
        console.log(socket.id + ' rolled ' + JSON.stringify(data));
        const sentAt = Date.now();
        const tableId = table(socket.id);
        io.to(tableId).emit('message', {
            id: guid(),
            msg: name(socket.id) + ' rolled ' + roll(data.count, data.size) + ' (' + data.count + 'd' + data.size + ')',
            table: tableId,
            at: sentAt
        });
    });
});

io.listen(4500);