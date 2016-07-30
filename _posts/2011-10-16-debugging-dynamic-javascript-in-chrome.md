---
layout: post
title: Debugging dynamic javascript in Chrome
date: 2011-10-16 10:58
author: LaM
comments: true
categories: [Uncategorized]
---
When developing web apps, I am using <strong>Chrome </strong>it has a great <strong>JS</strong> debugger unfortunately there is a small problem. Modern Web Applications contain a lot of dynamically loaded <strong>Javascript</strong> on the page. One common scenario is to load a modal with asynchronously loaded content. If this content would be a normal page with some<strong> Javascript</strong>. Well we have a problem, we are not able to examine the scrpts and set breakpoints on this page. It wont work on default.

Fortunately there is a solution. Chrome provides simple parser command which can tag dynamically loaded <strong>JS.</strong>
<pre class="lang:default decode:true">&lt;script type="text/javascript"&gt;
....
//@ sourceURL=createOrder.js 
&lt;/script&gt;</pre>
This line tells the chrome debugger that this whole script inside the script tag should be interpreted as a <strong>createOrder.js </strong>file. You can find the file on the debugger list and easily set up breakpoints or check the code.

If you are working with <strong>Asp.Net </strong><a href="http://www.asp.net/mvc"><strong>MVC</strong></a> and <strong>Razor Engine </strong>use <strong>Write</strong> function

&nbsp;
<pre class="lang:default decode:true ">&lt;script type="text/javascript"&gt;
....
@{Write("//@ sourceURL=createOrder.js");}
&lt;/script&gt;</pre>
&nbsp;
