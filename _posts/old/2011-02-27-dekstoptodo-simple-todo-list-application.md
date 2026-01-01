---
layout: post
title: DekstopTodo – Simple Todo list application
date: 2011-02-27 00:42
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
I am a time management freak. That’s why I was creating application TimeIsMoney. Currently, I m not working on this app. Instead I had another idea based on an earlier project, I m creating a new simpler app. “Desktop Todo”.

&nbsp;

<a href="http://lammichalfranc.files.wordpress.com/2011/02/image.png"><img style="background-image:none;padding-left:0;padding-right:0;display:block;float:none;padding-top:0;border-width:0;margin:0 auto 5px;" title="image" src="http://lammichalfranc.files.wordpress.com/2011/02/image_thumb.png" border="0" alt="image" width="362" height="211" /></a>

&nbsp;

It is a simple app which let you create Todo lists displayed on the desktop. Currently, it supports only task showing and ability to mark the task as a completed. It supports "*.tdl" files from Todo List program. In future releases, it is gonna support its own, simpler format.

Application stays in tray. There isn’t any Main Window. To do this in WPF , I m using the <a href="http://www.hardcodet.net/projects/wpf-notifyicon">WPF NotifyIcon by Philip Sumi</a> check out this great control. You can do a lot of things with it.

&nbsp;

If you want to add new list right click on the Todo List Notify Icon in the tray and select “*.tdl” formatted xml file.

<span style="color:#ff0000;">This is an early version. Make a  copy of your “*.tdl. file before trying it out !!.</span>

<a href="http://lammichalfranc.files.wordpress.com/2011/02/image1.png"><img style="background-image:none;padding-left:0;padding-right:0;display:block;float:none;padding-top:0;border-width:0;margin:0 auto 5px;" title="image" src="http://lammichalfranc.files.wordpress.com/2011/02/image_thumb1.png" border="0" alt="image" width="223" height="105" /></a>

&nbsp;

Features in this early release:

- You can open <strong>“*.tdl”</strong> files. Check out the <a href="http://www.codeproject.com/KB/applications/todolist2.aspx">Todo List</a>.

- You can Complete Tasks.

- You can Filter out tasks which are due in this : Day , Week (DWA) panel

- You can add multiple projects.

- You can hide list by clicking on the project name.

- You can delete list.

&nbsp;

Future features :

- integration with visual studio

- special color of task if it is over due

- time tracking

- complex filtering

- ability to attach files to the tasks (eg. on click you can open a pdf file like ebook)

&nbsp;

&nbsp;

<a href="https://github.com/Michal Franc
ik/TimeIsMoney/tree/master/TimeIsMoney/DekstopTodo">Source Code</a>

Download (Soon :P)

If you have any ideas feel free to share them with me. Mail me or post a comment.
