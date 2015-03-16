/**
 * Created by davidwestbury on 13/03/2015.
 */
var express = require("express");
var mysql = require('mysql');
var http = require('https');
var app = express();
app.use(express.logger());

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
    var timestamp = Math.round(+new Date()/1000);
    //fifteenSeconsAfterMinute();
    connection.query('insert into clock_table (fid, likes, timestamp ) values(185643387303, 1001,  "' + timestamp + '")', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['Hello World!!!! HOLA MUNDO!!!!', rows]);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});

//For specific times, use a chron job
var fifteenSeconsAfterMinute = function() {

    var timestamp = Math.round(+new Date()/1000);
    connection.query('SELECT fid FROM clock_table GROUP BY fid', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        for (var user in rows) {
            var url = 'https://graph.facebook.com/' + rows[user].fid + '?fields=id,name,is_verified,likes&access_token=794122650601154|1DPhNia4bi3oxqrfbBRenCQfvM0';

            http.get(url, function(res) {
                var body = '';
                res.on('data', function(chunk) {
                    body += chunk;
                });

                res.on('end', function() {
                    var fbResponse = JSON.parse(body)
                    connection.query('insert into clock_table (fid, likes, timestamp, is_verified ) values('+fbResponse.id+', '+fbResponse.likes+',  "' + timestamp + '", "'+fbResponse.is_verified+'")', function(err, rows, fields) {
                        if (err) {
                            console.log('error: ', err);
                            throw err;
                        }
                        console.log(['INSERT rows', rows])
                        //response.send(['INSERT rows', rows]);
                    });
                });


                //connection.query('insert into clock_table (fid, likes, timestamp ) values(res, 1001,  "' + timestamp + '")', function(err, rows, fields) {
                //    if (err) {
                //        console.log('error: ', err);
                //        throw err;
                //    }
                //    response.send(['Hello World!!!! HOLA MUNDO!!!!', rows]);
                //});


            }).on('error', function(e) {
                console.log("Got error: ", e);
            });
        }
    });

    //connection.query('insert into clock_table (fid, likes, timestamp ) values("185643387303", "1001",  "' + timestamp + '")', function(err, rows, fields) {
    //    if (err) {
    //        console.log('error: ', err);
    //        throw err;
    //    }
    //    response.send(['Hello World!!!! HOLA MUNDO!!!!', rows]);
    //});
};

var CronJob = require('cron').CronJob;
new CronJob({
    cronTime: "60 * * * * *",//after every hour
    onTick: fifteenSeconsAfterMinute,
    start: true,
    timeZone: "America/Los_Angeles"
});