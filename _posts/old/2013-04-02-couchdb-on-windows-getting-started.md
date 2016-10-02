---
layout: post
title: CouchDb - getting started on Windows
date: 2013-04-02 08:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [nosql]
permalink: /nosql/couchdb-on-windows-getting-started/
---
This post will be a little note with steps needed to setup a working CouchDb instance on windows machine.

<h3>NoSql</h3>

RDBSM rules the world, it is still a "standard" in the industry. My first Database was used inside a simple rss client written in C. This was the weird world of C programming with weak documentation and Segmentation fault errors everywhere. Now, I am mostly using MSSQL with ORM support ( NHibernate ), but there is another world of databases on the horizon, NoSql movement.

There have been a lot of buzz about NoSql for quite some time, but I had no time to learn and use it for some real thing. Sure, There was a small project with <a href="http://redis.io/">Redis</a> and <a href="http://ravendb.net/">RavenDb</a>, but this was just fun and little playground. I created simple fun projects just to start somewhere, but now the time has come to make the move and start the journey to the NoSql world.

I am going to start with CouchDb. A nice database engine that stores data in JSON format and is accesible through REST based HTTP interface. If you want more info on NoSql check <a href="http://nosql.mypopescu.com/kb/nosql">this</a> site. You can find a lot more detailed explanation here with answers to some important questions like "Why I should consider NoSql ?" or "When is it a better choice ?". Also <a href="http://en.wikipedia.org/wiki/NoSQL">Wikipedia is allways helpfull</a>. 

If you want to check how many different implementations of NoSql philosophy are out there, check this site : <a href="http://nosql-database.org">Big list of NoSql databases.</a>

<h3>Installation</h3>

<h4>Where to download it ?</h4>

Ok so let's start with the most simple step : The download.
You can find all the needed files ( actually there is only one file ) <a href="http://couchdb.apache.org/"> CouchDB here</a>. Installation process is straigthforward ( just click Next ). There is one step that asks you if you want to run the database as a windows service, feel free to do this, I selected 'No', I want to control when and how it is running. 

<h4>How to run it ?</h4>

Go to start menu and look for <b>"Start CouchDB.bat"</b> or go to <b>"-InstallDir-\CouchDB\bin\couchdb.bat"</b>. This is the main bat file that performs all the necessary steps to run database. CouchDB is written in the Erlang so the bat is starting the Erlang emulator. Don't worry if you don't have this 'emulator', it seems that it is installed automaticlly.

Watch the startup process. My first try, ended with "Abnormal termination" error, but if everything went fine you should be able to access the configuration site. <a href="http://127.0.0.1:5984/_utils/">http://127.0.0.1:5984/_utils/</a>

<h4>Errors, Help !!</h4>

If there was an error in the Erlang Emulator Console. Check the <a href="http://wiki.apache.org/couchdb/Error_messages">error messages page</a>.

I had an error <b>"Failure to start Mochiweb: eaddrinuse"</b>. This one is quite simple to fix and was caused by port being closed due to some application already using it. 

To change the port :

<ul>
  <li>Open "-Instal Dir-"\CouchDB\etc\couchdb\local.ini</li>
  <li>Look for [httpd] bookmar</li>
  <li>Uncomment the port section and change it to some free / open port. (8001)</li>
</ul>

Side Note: By default port is set to '5984'. If you have installed CouchDB as a Windows Service you won't be able to start a new instance beacuse the port is already taken. In this case you don't have to run CouchDB manually.

