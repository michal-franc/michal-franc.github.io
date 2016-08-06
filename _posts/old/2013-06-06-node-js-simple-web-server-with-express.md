---
layout: post
title: Node.js - simple web server with 'express'
date: 2013-06-06 08:00
author: Michal Franc
comments: true
categories: []
tags: [node]
---
I have been playing with Node.js recently. Mostly doing some small hobby projects. One of them needed server side badly, some of the cool features were not possible with the client side only web app. 

I was thinking about using RoR, Asp.Net Mvc or NancyFX all of these frameworks suitable for the task. Then why Node ? Well, the answer is simple, FUN. There is a lot of hype around it. Community is very dynamic, lots of modules and extensions created on the daily basis. As a Passionate Developer, I also wanted to try something new. I can do .Net stuff at work and it is allways good to try something new and fresh.

<h3>Basic Node.js server</h3>

Let's start with a very basic example, just to see the bare Node without the modules.


{% highlight csharp %}
var http = require("http");
http.createServer(function (request, response) {
      response.writeHead(200, {
         'Content-Type': 'text/plain'
      });
      response.write('Simple Simple Fun')
      response.end();
}).listen(5002);

{% endhighlight %}


Node is basically a javascript, but this time on the server side ( weeee best language in the world on the server side, how can you not love it ? ). This code is a implementation of a very simple server responding to each get request, with some funky message and code 200. The require statement is the implementation of a internal module system.

<h3>Node.js with express module</h3>

This was a really simple example. Sure you can write whole app like this, but there are modules that provide a nice layer of abstraction with all the the nasty details hidden. I have been using the <a href="http://expressjs.com/">express module</a>. It is a nice web application framework. 

It provides 
<ul>
	<li>better wrappers to the  request and response</li>
	<li>support for view-engines</li>
	<li>routing mechanism</li>
	<li>cookies manipulation</li>
	<li>basic authentication</li>
	<li>more ...</li>
</ul>


{% highlight csharp %}

 var express = require("express");
 var app = express();

 /* serves main page */
 app.get("/", function(req, res) {
    res.sendfile('index.htm')
 });

  app.post("/user/add", function(req, res) { 
	/* some server side logic */
	res.send("OK");
  });

 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     res.sendfile( __dirname + req.params[0]); 
 });

 var port = process.env.PORT || 5000;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });
{% endhighlight %}
 

The express module is loaded into app object. It is then used to define the routings, accepting POST and GET verb. The syntax is quite simple. You provide the regexp which matches the route and a function that is executed when the request is matched. Function gives the access to the request and response wrappers. 

Some Notes:
<ul>
	<li>(/^(.+)$/ regexp is not the best one, it matches almost everything and has to be defined as the last route. Still it works ok 	and  all the js, css files are being sent.</li>
	<li>__dirname is a global value containing the name of the main directory with the node script.</li>
</ul>

