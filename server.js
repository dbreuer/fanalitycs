//require('harp').server(__dirname + '/app', { port: process.env.PORT || 5000 });
var express = require("express");
var mysql = require('mysql');
var http = require('https');
var app = express();

app.use(express.logger());
app.use(express.static(__dirname + '/app'));



var db_config = {
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bc4772bd22385d',
    password: '07bd757f',
    database: 'heroku_59be257c73828ca'
};

var connection;

function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.

    connection.connect(function(err) {              	// The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 1000); // We introduce a delay before attempting to reconnect,
        }                                     	// to avoid a hot loop, and to allow our node script to
    });                                     	// process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 	// Connection to the MySQL server is usually
            handleDisconnect();                      	// lost due to either server restart, or a
        } else {                                      	// connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();
app.get('/', function(request, response) {
    response.send('OK');
});

app.get('/api/all/users', function(request, response) {
    var timestamp = Math.round(+new Date()/1000);
    connection.query('SELECT * FROM clock_table GROUP BY fid', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.json(rows);
    });
});


app.get('/api/:uid/users', function(request, response) {
    var timestamp = Math.round(+new Date()/1000);
    connection.query('SELECT * FROM clock_table WHERE uid = "' + request.params.uid + '" GROUP BY fid', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.json(rows);
    });
});

app.get('/api/all/status', function(request, response) {
    var timestamp = Math.round(+new Date()/1000);
    connection.query('SELECT * FROM clock_table LEFT JOIN social_networks ON clock_table.fid = social_networks.fid order by name, timestamp', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        var data = [
            {
                key: null,
                values: [],
                mean: null
            },
            {
                key: null,
                values: [],
                mean: null
            },
            {
                key: null,
                values: [],
                mean: null
            }

        ];
        var x = 0;
        for (var i in rows) {
            var tmp = [rows[i].timestamp+'000', rows[i].likes ];

            if (data[x].key && data[x].key != rows[i].name ) {

                //data[x].bar =  true;
                x++;
            }
            data[x].key = unescape(rows[i].name);

            if (data[x].mean == null) {
                data[x].mean = rows[i].likes;
            }


            //console.log(rows[i].name, data[x].key);
            if (tmp !== null) {
                data[x].values.push(tmp);
            }

        }
        response.json(data);
    });
});


app.get('/api/:fid/status', function(request, response) {
    var timestamp = Math.round(+new Date()/1000);
    connection.query('SELECT * FROM clock_table LEFT JOIN social_networks ON clock_table.fid = social_networks.fid WHERE clock_table.fid = "'+request.params.fid+'"', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
    var data = [{
        key: 'response Name',
        values: [],
        mean: 250
    }];
        for (var i in rows) {
            var tmp = [rows[i].timestamp+'000', rows[i].likes];
            //data[0].values.push(tmp);
            data[0].values[i] = tmp;
            data[0].key = unescape(rows[i].name);
            data[0].mean = rows[0].likes;
            tmp = null;
        }
        response.json(data);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
