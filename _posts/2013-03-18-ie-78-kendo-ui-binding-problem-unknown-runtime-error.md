---
layout: post
title: IE 7,8 kendo ui binding problem - unknown runtime error
date: 2013-03-18 08:00
author: LaM
comments: true
categories: [Javascript]
---
<strong>TL;DR; If you are getting unknown runtime error in the kendo javascript code. Check if you are using correct binding methods as per the demo on telerik site.</strong>

You've got to love IE with all the "special behaviors" in it. I have spent recently 10h trying to fix little problem found only in IE. My project have to support version 7, 8 ( you know - "enterprise IT" ). New version number 10 seems to be working really ok, no problems with it ( apart from that it looks almost like chrome ). Thanks to Microsoft and their abandoment effort, I don't have to worry about revolutionary IE 6.

<h2>Problem:</h2>

Project uses kendo ui framework to create elements on the View. There is a support for MVVM pattern with multiple different bindings, just like knockout.js with similar syntax and behavior. One of the bindings is supposed to be changing text value. This binding is normally used with textboxes but we have used it with "label" and "anchor". It worked fine on Chrome, Firefox, IE 10 but then the fun began. Tests on other IE's version caused "runtime error". Indeed very informative message, thanks IE just like "unknown error" on Sharepoint.

This "runtime error" was raied on this line of code.

<pre class="lang:c# decode:true">this.element[innerText] = text;</pre>

After some research, I discovered that earlier versions of microsoft's browser are very restrictive about certain changes performed on DOM elements. In this scenario you can't change 'innerText'.

I tried to create a workaround which removed and added new element, but this instead caused other problem. It seems that here IE is also very restrictive here.

<h2>Solution:</h2>

Fortunately solution is quite simple, instead of 'text' binding use 'value' binding. This one uses code that works fine in IE.

<pre class="lang:c# decode:true">this.element.value = value ;</pre>

