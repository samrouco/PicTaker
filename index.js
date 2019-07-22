console.log("PicTaker running");

//Enviroment setup (using and config)
var Twit = require('twit');
var config = require('./config');
var fs = require('fs');
var request = require('request');
var readLine = require('readline');

var rl = readLine.createInterface(process.stdin, process.stdout);
var T = new Twit(config);
var workingUserId = "";
var stream;
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function userFound(err, data, response){
    if(data.length <= 0){
        console.log("User not found");
        rl.prompt();
    }else{
        //console.log(data);
        workingUserId = data[0].id_str;
        stream = T.stream("statuses/filter", {follow: workingUserId});
        console.log("Stream with user " + workingUserId + " started");
        stream.on("tweet", function(tweet){
            console.log("Tweet recived");
            if(tweet.entities.media != undefined){ //Media exists
                console.log("Tweet contains media")
                for(var i = 0; i < tweet.entities.media.length; i++){
                    var tweetUser = tweet.user.screen_name;
                    var imageUrl = tweet.entities.media[i].media_url;
                    var imageId = tweet.entities.media[i].id;
                    var resultName = imageId + tweetUser + ".png"
                    download(imageUrl, "./images/" + resultName, function(){ console.log('File copied: ' + resultName); });
                }
            }else{
                console.log("Tweet doesnt contains media");
            }
        })
    }
}

//Execution
rl.setPrompt("user>");
rl.prompt();
rl.on('line', function(searchUser) {
    T.get("users/search", { q: "@" + searchUser, count: 1 }, userFound)
}).on('close',function(){
    process.exit(0);
});

