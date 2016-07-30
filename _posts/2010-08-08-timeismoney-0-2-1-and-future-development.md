---
layout: post
title: TimeIsMoney 0.2.1 and future development
date: 2010-08-08 09:07
author: LaM
comments: true
categories: [NUnit, Uncategorized]
---
<span style="font-size:xx-small;"><strong> </strong></span>

<span style="font-size:xx-small;"><strong>What’s New</strong></span>
<ul>
	<li><span style="font-size:small;"><strong>0.2.1</strong> </span>
<ul>
	<li><span style="font-size:small;">More advanced <strong>AddItemBox</strong> with option “more”.</span>
<ul>
	<li><span style="font-size:small;">three additional properties : </span>
<ul>
	<li><span style="font-size:small;">priority </span></li>
	<li><span style="font-size:small;">due date </span></li>
	<li><span style="font-size:small;">estimated time </span></li>
</ul>
</li>
</ul>
</li>
	<li><span style="font-size:small;">Changed the way settings panel is displayed </span></li>
	<li><span style="font-size:small;">Lots of stability fixes …. </span>
<ul>
	<li><span style="font-size:small;">fixed the problem with <strong>GlobalKeyHook </strong>and garbage collected element crash</span></li>
	<li><span style="font-size:small;">various problems with list</span></li>
</ul>
</li>
</ul>
</li>
</ul>
<a href="http://lammichalfranc.files.wordpress.com/2010/08/additemadv.jpg"><img class="aligncenter size-full wp-image-528" title="additemadv" src="http://lammichalfranc.files.wordpress.com/2010/08/additemadv.jpg" alt="" width="212" height="165" /></a>

This week i am starting <strong>unit testing</strong>. Small standalone project based on the <strong><a href="http://www.nunit.org/">NUnit</a> </strong>platform with various unit tests. Idea of unit test is really simple:
<ol>
	<li>
<div>Make assumption about how your code should behave.</div></li>
	<li>
<div>Write a test to check if you are right or wrong.</div></li>
</ol>
<span style="font-size:small;">I know that for some of you it looks like a waste of time but this process accelerates the development time and what’s also important it promotes good coding practices.</span>

<span style="font-size:small;">The next big Things which I want to start is Report Module this will be a  standalone application communicating with main software. It is responsible for various analyses of  the TODO lists. Right now I m planning to write UI inn WPF. In the beginning, I want to create simple engine.  Unit testing will be heavily used in this module. </span>

<span style="font-size:small;">Some major re-factorization will be necessary in the future. Isolation of the UI from the logic is really important, it's commonly used pattern.
</span>

<span style="font-size:small;">
</span>

<strong><span style="font-size:small;">Next Week</span></strong>
<ul>
	<li><span style="font-size:small;"><strong>0.2.2</strong> </span>
<ul>
	<li><span style="font-size:small;">Ability to set up notification lists </span></li>
	<li><span style="font-size:small;">Fix  priority display </span></li>
	<li><span style="font-size:small;">Display estimated time and priority on the unsorted tasks lists view </span></li>
	<li><span style="font-size:small;">Create <strong>NUnit</strong> testing project</span></li>
</ul>
</li>
</ul>
<span style="font-size:xx-small;"> </span>
<ul>
	<li><span style="font-size:small;"><strong>0.2.3</strong> </span>
<ul>
	<li><span style="font-size:small;"><span style="font-size:xx-small;">Ability </span>to set up <strong>next learning</strong> and <strong>next action </strong>lists with notifications options </span></li>
</ul>
</li>
</ul>
<span style="font-size:small;"> </span>
<ul>
	<li><span style="font-size:small;"><strong>0.2.4</strong> </span>
<ul>
	<li><span style="font-size:small;"><strong>Report</strong> Module Engine</span></li>
</ul>
</li>
</ul>
<span style="font-size:small;"> </span>

<span style="font-size:small;"> </span>

<span style="font-size:small;"> <span style="font-size:small;"> </span></span>

<strong><span style="font-size:small;">What’s Planned?</span></strong>
<ul>
	<li><span style="font-size:small;"><strong>0.3.0</strong> </span>
<ul>
	<li><span style="font-size:small;">Notification mechanism based on the “<strong>IronPython”</strong> </span></li>
</ul>
</li>
</ul>
<span style="font-size:small;">.</span><a href="http://lammichalfranc.files.wordpress.com/2010/08/image1.png"><span style="color:#555555;font-size:xx-small;"><img style="display:block;float:none;margin-left:auto;margin-right:auto;border-width:0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb1.png" border="0" alt="image" width="409" height="285" /></span></a>
<ul>
	<li><span style="font-size:small;"><strong>0.3.5</strong> </span>
<ul>
	<li><span style="font-size:small;">More advanced report module. , statistics , daily weekly reports .</span></li>
	<li><span style="font-size:small;">Progress and efficiency of time management</span></li>
</ul>
</li>
	<li><span style="font-size:small;"><strong>0.5.0</strong> </span>
<ul>
	<li><span style="font-size:small;">Task trees.</span></li>
	<li><span style="font-size:small;"><span style="font-size:xx-small;">Adding item to specific tree node</span></span></li>
</ul>
</li>
</ul>
<span style="font-size:xx-small;"> </span>
<ul>
	<li><span style="font-size:small;"><strong>0.6.0</strong> </span>
<ul>
	<li><span style="font-size:small;">Activity Tracker</span>
<ul>
	<li><span style="font-size:small;">Created from scratch or integrated with Activity Tracker Gadget</span></li>
</ul>
</li>
</ul>
</li>
	<li><span style="font-size:small;"><strong>0.7.0</strong> </span>
<ul>
	<li><span style="font-size:small;">Desk Notes</span></li>
</ul>
</li>
	<li><span style="font-size:small;"><strong>0.8.0</strong> </span>
<ul>
	<li><span style="font-size:small;">Calendar</span></li>
</ul>
</li>
</ul>
Far Far Away …… web application.

<strong>What i have learned this week !</strong>

The biggest enemy of the open source projects is … <strong>TIME.</strong>

Don’t love your code and be ready to throw away a good idea just because it is too complicated . Remember ….. <strong>KiSS – Keep It Simple Stupid</strong>
