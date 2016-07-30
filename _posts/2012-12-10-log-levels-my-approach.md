---
layout: post
title: Log levels - my approach
date: 2012-12-10 20:46
author: LaM
comments: true
categories: [nlog, Programming]
---
<p align="justify">There are some options available when it comes to logging mechanisms on .Net platform. Fortunately we have standarized log levels.</p>
<p align="justify">Currently i am using mostly <a href="http://nlog-project.org/">NLog</a>,this library is very popular and at the moment has all the options i need. There is also <a href="https://nuget.org/packages/log4net">Log4Net</a> lib, bit out dated but still good, we are using it at my company mostly because it is used in open source projects integrated into our product. In this post i don’t want to go into details, I just want to talk about logging levels.</p>

<h2>Log levels</h2>
<h3 align="justify">Trace</h3>
<p align="justify">Used to log all the details of the function. Parameters, all the actions etc. I am just using it in a more complex debugging process. There is really no need to mess the log files with too much of information.</p>

<h3 align="justify">Debug</h3>
<p align="justify">Turned off by default.</p>
<p align="justify">When i am done with debugging, I am converting some of the Trace messages. Just in case I need them and part of the “fixed” code is still not stable enough. Also with some complex algorithms, I am often leaving some Debug log level messages that contain data about transformations and steps performed by the code. This is often very useful, but I am just turning this level when I need additional data.</p>

<h3 align="justify">Info</h3>
<p align="justify">Only some “big” notifications like new module activated, services started / stopped, or information that user performed some significant action like: logged out. This log should be mainly used to track the big picture and the flow of application. For more detailed information, I am using other type of messages.</p>

<h3 align="justify">Warning</h3>
<p align="justify">First of all, Expected exceptions and some weird behavior that should be noted and there is still possibility to run application. For instance there is a timed job that performs some action that is not affecting overall</p>

<h3 align="justify">Error</h3>
<p align="justify">Mostly Unhandled exceptions. Errors that are not recoverable and you can’t run the app or perform user action again.</p>

<h3 align="justify">Fatal</h3>
<p align="justify">This should be logged when some error causes destabilization of whole app and we know that this will affect all the users.</p>
<p align="justify">It can be for instance:</p>
<p align="justify">     - problem with connecting to the database.</p>
<p align="justify">     - some important config variable missing that can’t be replaced by default value.</p>
<p align="justify">Those are serious errors that should be noted as soon as possible. In one of the project i was sending this kind of errors to my mail so, I can fix them as soon as possible.</p>
<p align="justify"></p>

<h2>Important tips:</h2>
<p align="justify">- Logging everything is not the way to go. In order to create log you need to write code. Code is our enemy. More code means more maintenance and more bugs. That’s why, I am always defining my logging “strategy” eg. what i need to log, when and why. Most of the time Exception logging is all you need. That's why you have to treat log levels strategy seriously.</p>
<p align="justify">- Debugger is your friend but in some of the projects you don’t have access to production server and you won’t be able to reproduce some failure scenarios. In this situation your only source of information is the logfile</p>
<p align="justify">- Even if log file is only a text and you can open it in simple Notepad, I encourage you to use specialized tools like <a href="http://log2console.codeplex.com/">Log2Console</a>.</p>
