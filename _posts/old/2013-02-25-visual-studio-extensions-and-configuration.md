---
layout: post
title: Visual Studio - Extensions and Configuration
date: 2013-02-25 08:00
author: Michal Franc
comments: true
categories: []
---
In this post, I want to share some details about my Visual Studio 2012 configuration. You can find here a list of plugins, some options and various customization that I am using.

<h2>Some thoughts</h2>

I am not using any GIT integration tool. I don't need it. Console and bash is all, I need.
I am mostly using 2 split window setup. All the tool windows are pinned out if i need them i can use CTRL+TAB.
I am trying to not use mouse at all.

<h2>Extensions</h2>

<h3><a href="http://www.jetbrains.com/resharper/">R#</a></h3>
Tool that you can't live without. Finally i got my personal license thanks to the promotion at the end of the world :). I am mostly using R# to navigation. Ctrl+Shit+T and Alt+Shift+T are the most used shortcut combinations, Unit Test runner is also pretty cool. I am using it with XUnit plugin.

There is one problem with R#. It is very addictive. We have to be carefull to not become too attached to one IDE and one set of tools. I am trying to "fight" some small RoR projects. It is really cool when you are learning new tools ecosystem.

<h3><a href="http://stylecop.codeplex.com/">StyleCop</a></h3>

A set of rules, conventions that that are good practices when creating code. Nicely integrated with Resharper. You really get a lot of feedback and there is even nice explanation of every rule. 

<h3><a href="http://blogs.jetbrains.com/dotnet/2013/01/introducing-fortea-a-t4-templating-plugin-for-resharper/">ForTea - a T4 templating plugin for ReSharper<a/></h3>

If you are using T4 extensively, then you need this plugin. It provides a lot of features available in R# within T4 files.

<h3><a href="http://visualstudiogallery.msdn.microsoft.com/d0265ab0-df51-4100-8e10-1f84403c4cd0">AttachTo</a></h3>

Simplifies the process of attaching debugging to the process. Very Usefull.

<h3><a href="http://visualstudiogallery.msdn.microsoft.com/bdbcffca-32a6-4034-8e89-c31b86ad4813">Hide Main Menu</a></h3>

I hate all the menus, windows and unnecesary stuff, thats why I have the main menu hidden. When i want to use it, I just press alt and navigate with keyboard.

<h3><a href="http://visualstudiogallery.msdn.microsoft.com/4b92b6ad-f563-4705-8f7b-7f85ba3cc6bb">Highlight all occurences of selected word</a></h3>
<img src="http://www.mfranc.com/wp-content/uploads/2013/02/visualstudiosomeoptions.png" alt="Visual Studio Options" />

As you can see on the screen it is a preety usefull extension.

<h3><a href="http://visualstudiogallery.msdn.microsoft.com/e792686d-542b-474a-8c55-630980e72c30">Indent Guides</a></h3>

Previous picture also contains presentation of the Indent Guides. This extension creates really subtle visual "help" that simplifies tracking of the start and end of braces and "scopes" in the code.

<h3><a href="http://visualstudiogallery.msdn.microsoft.com/d0d33361-18e2-46c0-8ff2-4adea1e34fef">Productivity Power Tools</a></h3>

This is a big bundle of different extensions. It is too big, I am only using Enchanced ScrollBar option and Power Commands.
Power Commands are adding nice action - "Open containg folder" It lets you easily navigate to the file on your system.
Scroll Bar shows some useful markers that also help with navigation through bigger files.


<h2>Color Style:</h2>

For the colors I am using 
<a href="http://studiostyl.es/schemes/step-son-of-obsidian">Step Son Of Obsidian</a>

I like the black theme.

<h2>Options</h2>
1. Lines turned on Text Editor -> All Languages
2. On startup show empty enviroment (performance boost) Enviroment -> Startup
3. Source Control Set to None ( I dont need TFS ) Source Control -> Plug-in Selection
4. Package Manager my custom nuget package feed -> http://www.nuget.mfranc.com/nuget/
5. Text Templating -> Show Security set to False i dont need this

<h2>Key Bindings and Remap</h2>

For key Remapping in the system, I am a big fan of <a href="http://webpages.charter.net/krumsick/">KeyTweak</a>

1. CTRL+ALT+J move window to previous split windows
2. CTRL+ALT+K move window to next split windows
3. CAPSLock -> Backspace
   Quite powerfull rebind, but you need to get used to it.
4. Right Ctrl -> Right Mouse Click
   I need this mapping to use VS without the mouse.
