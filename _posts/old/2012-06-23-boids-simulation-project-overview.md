---
layout: post
title: Boids Simulation – Project Overview
date: 2012-06-23 19:32
author: Michal Franc
comments: true
categories: []
---
While studying I was doing a lot of different projects. One of them was a simple simulation of bird flock movements. This will be a series of posts about changes in this project. It will contain a lot of code reviews and development information's.

Project is hosted on <strong>GitHub</strong> if you want to follow the code and changes.

<a href="https://github.com/Michal Franc
ik/SilverlightBoids">https://github.com/Michal Franc
ik/SilverlightBoids</a>

I use <a href="https://trello.com/"><strong>Trello</strong></a><strong> </strong>to manage ideas, tasks, bug fixes  etc.
<h4>Project Overview</h4>
This app is simulating movement of bird flocks. Each object that is representing single bird is called <strong>BOID. </strong>Each of them can perform various actions which are influencing behavior and in the end vector, that is responsible for the movement in the next iteration.

More complex description of the algorithms involved in this project.

<a href="http://www.red3d.com/cwr/boids/">http://www.red3d.com/cwr/boids/</a>

&nbsp;

<strong>Boid</strong> is rendered as a simple pixel. There are options like
<ul>
	<li>Add new boid</li>
	<li>Add Random boid</li>
	<li>Options for different behavious</li>
</ul>
It is very simple
<h5>Simulation</h5>
Each Iteration of the simulation world is divided into these actions

<a href="http://www.mfranc.com/wp-content/uploads/2012/06/image5.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/06/image_thumb5.png" alt="image" width="534" height="148" border="0" /></a>

For each <strong>Boid </strong>we perform <strong>Do Actions </strong>function which iterates through <strong>Action </strong>list and create a <strong>Vector </strong>class that is describing current movement and position change of the<strong> Boid. </strong>After caluclation we perform position change and <strong>Rerender</strong> of world. This is just a simple explanation of engine.
<h4>Future Changes</h4>
I want to move core logic to separated project because in the future I want to separate and support presentation layer in form of html 5 and canvas. I want to use <strong>.Net</strong> to calculate complex calculations and web service as a transport layer to the canvas rendering in the browser. I will see how it works and if there will be any performance issues then I will think about moving algorithms calculations to the javascript.

I also have to think about nice and easy <strong>Gui</strong>.
<h4>Future Features</h4>
I want to support couple of nice features in future releases
<ul>
	<li>Ability to modify\ behavioral algorithms</li>
	<li>Simple Game based on the engine</li>
	<li>Html 5 Canvas rendering + web service communication</li>
	<li>Storing state either on <strong>Redis</strong> or <strong>MsSql</strong> with <strong>NHibernate</strong> layer</li>
</ul>
