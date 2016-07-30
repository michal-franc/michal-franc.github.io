---
layout: post
title: Extending git with custom command
date: 2013-01-14 10:00
author: LaM
comments: true
categories: [Tools]
---
I am really happy that I can use git for my every day job. Earlier I was only using it in hobby projects. Now I can learn and experience git in real projects, with real people and problems. So far, I love it :)

There is one nice 'feature' of git that i found recently : creating git custom commands. It is useful, when I want to automate some repetetive tasks.

<h2>Repetitive Task</h2>
<pre class="lang:sh decode:true">
git add -A
git commit -m '@Projectname'
</pre>
Whenever I want to commit changes to the branch, I have to execute add command and then perform a commit. 'Projectname' is one of the conventions in my company. Each commit needs this variable beacuse we are using it in internal mail service.

One of my practices with source control systems, is to commit a lot, so doing this 'repetition' all the time is a waste of time. 

<h2>Git Custom Command - git c</h2>

Custom command specification :

<ul>
	<li>execute git add</li>
	<li>execute git commit</li>
	<li>commit message with project name</li>
</ul>

All this is simple except the project name variable. Fortunately our projects folders are named after the project. In the Script, I just have to get its name.

<h3>Script</h3>
<pre class="lang:sh decode:true">#!/bin/sh
#
# git-c
#
# Michal Franc
# quick add + commit

git add -A
git commit --message="@${PWD##*/} $1"
</pre>
<h3>Installation process</h3>

<ol>
	<li>go to libexec/git-core folder (@Windows 'C:\Program Files (x86)\Git\libexec\git-core')</li>
	<li>create new file in this folder called 'git-c' (no extension)</li>
	<li>copy paste the script code</li>
</ol>

<h3>Usage</h3>

<pre class="lang:sh decode:true">
git c 'test commit'
</pre>
