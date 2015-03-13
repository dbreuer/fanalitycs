/**
 * Created by davidwestbury on 13/03/2015.
 */
//For specific times, use a chron job
var fifteenSeconsAfterMinute = function() {
    console.log("Another minute is gone forever. Hopefully, you made the most of it...");
};

var CronJob = require('cron').CronJob;
new CronJob({
    cronTime: "15 * * * * *",//15 seconds after every minute
    onTick: fifteenSeconsAfterMinute,
    start: true,
    timeZone: "America/Los_Angeles"
});
