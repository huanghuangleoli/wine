var port = 8888;
var serverUrl = "0.0.0.0";

var http = require("http");
var path = require("path");
var fs = require("fs");
var queryString = require("querystring");
var nodemailer = require("nodemailer");
var trim = require("trim");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'huanghuang.li.mailsender@gmail.com',
        pass: 'Gator12345'
    }
});

console.log("Starting web server at " + serverUrl + ":" + port);

function onRequest(request, response) {
  var filename = request.url || "index.html";
  filename = filename == "/" ? "index.html" : filename;
  console.log(filename);
  if (filename === "/mail/contact_me.php") {
    request.setEncoding("utf8");
    request.content = '';
    request.addListener("data", function(chunk) {
      request.content += chunk;
    });
    request.addListener("end", function() {
      var queryParams = queryString.parse(request.content);
      var mailContext = {};
      mailContext['from'] = 'noreply@huanghuang.com';
      mailContext['to'] = 'neveryes@gmail.com';
      mailContext['subject'] = 'You got a message from huanghuang test';
      mailContext['text'] = 'Hi, you got a message.\n' +
                     'email: ' + queryParams['email'] + '\n';
      console.log("Send one email.");
      transporter.sendMail(mailContext);
    });
  }
  filename = filename.split('?')[0];
  var ext = filename.substr(filename.lastIndexOf("."));
  console.log(ext);
  var localPath = __dirname;
  var validExtensions = {
    ".html" : "text/html",
    ".js" : "application/javascript",
    ".php" : "application/php",
    ".css" : "text/css",
    ".txt" : "text/plain",
    ".jpg" : "image/jpeg",
    ".gif" : "image/gif",
    ".png" : "image/png",
    ".woff" : "application/x-font-woff",
    ".ttf" : "application/x-font-ttf",
    ".svg" : "image/svg+xml",
    ".ico" : "image/x-icon"
  };
  var isValidExt = validExtensions[ext];
  if (isValidExt) {
    localPath += "/" + filename;
    fs.exists(localPath, function(exists) {
      if (exists) {
        console.log("Serving file: " + localPath);
        getFile(localPath, response, isValidExt);
      } else {
        console.log("File not found: " + localPath);
        response.writeHead(404);
        response.end();
      }
    });
  } else {
    console.log("Invalid file extension detected: " + ext);
  }
}  

http.createServer(onRequest).listen(port, serverUrl);

function getFile(localPath, response, mimeType) {
  fs.readFile(localPath, function(err, contents) {
    if (!err) {
      response.setHeader("Content-Length", contents.length);
      response.setHeader("Content-Type", mimeType);
      response.statusCode = 200;
      response.end(contents);
    } else {
      response.writeHead(500);
      response.end();
    }
  });
}
