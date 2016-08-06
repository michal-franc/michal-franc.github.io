---
layout: post
title: RegExp Fun–Match/Replace in lines without specific word
date: 2012-04-02 18:31
author: Michal Franc

comments: true
categories: [regexp, Uncategorized]
---
<h2>Problem</h2>
Today in work I got a nice task.

For given  <a href="http://www.mfranc.com/wp-content/uploads/2012/04/image.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/04/image_thumb.png" alt="image" width="629" height="72" border="0" /></a>

Make a <strong>RegExp</strong> to transform each line and <strong>Path</strong> value, In a way that not minified <strong>javascript</strong> files (without <strong>min.js</strong> extension) should point to <strong>/min/</strong> folder.
<h3>For Example:</h3>
<a href="http://www.mfranc.com/wp-content/uploads/2012/04/image1.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/04/image_thumb1.png" alt="image" width="597" height="41" border="0" /></a>
<h3>Should Transform to:</h3>
<a href="http://www.mfranc.com/wp-content/uploads/2012/04/image2.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/04/image_thumb2.png" alt="image" width="596" height="29" border="0" /></a>

Because I love experimenting with Regular Expressions. I happily dropped everything and started looking for solution . This seemed pretty simple ... but ... i had to spent like 30 min to find it.
<h2>Solution</h2>
<h3>Expression</h3>
<a href="http://www.mfranc.com/wp-content/uploads/2012/04/image3.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/04/image_thumb3.png" alt="image" width="482" height="26" border="0" /></a>

Most important part of this solution is <strong>(?!.*min) . </strong>This expression will try to look for <strong>min</strong> word in matched data and if it wont find it there whole match is discarded.

For further replacement procedure, I m specifying two matched groups that will be used to construct new <strong>Path</strong>. <strong>(?<path>.*)/(?<end>.*) </strong>This will match everything to last possible<strong> “/”</strong> and make group named <strong>path,</strong> then every character after <strong>“/”</strong> is put into <strong>end </strong>group.
<h3>Replace Expression</h3>
<a href="http://www.mfranc.com/wp-content/uploads/2012/04/image4.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/04/image_thumb4.png" alt="image" width="390" height="30" border="0" /></a>

Replace expression uses matched groups like simple variables to construct new <strong>Path.</strong>
<h3>The end result is</h3>
<a href="http://www.mfranc.com/wp-content/uploads/2012/04/image5.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/04/image_thumb5.png" alt="image" width="623" height="79" border="0" /></a>

Making <strong>RegExp</strong> is like scientific discovery or complex mathematic problem. You have to really think a lot to find a nice solution.

For experiments I recommend

<strong><a href="http://www.radsoftware.com.au/regexdesigner/"><span style="font-size: x-small;">Rad Software Regular Expression Designer</span></a></strong>
