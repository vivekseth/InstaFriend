var express = require('express');
var app = express();
var URL = require('url');
var HTTP = require('http'); 
var querystring = require('querystring');

app.use(express.logger())
app.use(express.bodyParser());

var chat_url = "http://www.pandorabots.com/pandora/talk-xml";

app.get('/', function(req, res){
  res.send('Welcome to InstaChat! please text +1 (908) 698-4131 to use. InstaFriend enjoys talking to new people! <br /><br /> Please note that all chat logs are recorded by default, so don\'t give any identifying information!<br /><br /> Made using Twilio API and PandoraBots API');
})

app.post('/', function(req, res){
  var from = req.body["From"];
  var text = req.body["Body"];
  var data = {
    "botid" : "c4592e67ee345c1d",
    "custid" : from,
    "input" : text
  };
  create_post_req(chat_url, data, function(data) {
    var msg = parse_chatbot_response(data);
    text_respond(res, msg); 
  });  
});

var port = process.env.PORT || 5001
app.listen(port, function(){
  console.log("Listening on port " + port);
})

//helper functions

function text_respond(res, msg) {
  res.setHeader('content-type', 'text/xml');
  var string = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
  string += "<Response><Message>"+msg+"</Message></Response>";
  res.send(string);
} 
function create_post_req(url, data, oncomplete) {
  var post_data = querystring.stringify(data);
  var options = URL.parse(url);
  options['method'] = 'POST';
  options['headers'] = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length' : post_data.length
  };
  var post_req = HTTP.request(options, function(post_res){
    var data = '';
    post_res.on('data', function(chunk){
      data += chunk;
    });
    post_res.on('end', function(){
      //data is complete
      oncomplete(data);
    })
  });
  post_req.write(post_data);
  post_req.end();
}
function parse_chatbot_response(data) {
   var temp = (""+data).match(/<that>.*?<\/that>/)[0];
   var new_msg = temp.substring(6, temp.length - 7);
   return new_msg;
}


