---
layout: post
title: From Dwarf Fortress to Vim - evolution of .Net programmer
date: 2013-07-03 18:05
author: LaM
comments: true
categories: [Tools, vim]
---
In this post, I want to write about my conversion to Vim, a complex but powerful text editor. It's learning curve is quite step but once grasped, it can increase your productivity.

You can use it almost everywhere, Linux, Windows, Mac, you name it. It is an OSS software, easily moddable and open. You can write your own plugins and change almost every aspect of it. This process is very natural and easier than Visual Studio's extensions and configuration hell.

You won't replace Visual Studio with VIM, that's not the case, you can however enhance your productivity with it. Instead of using new editor you can use Vim inside Visual Studio. Think of it as a new tool in your programming tool belt.

<h3>"My First Time"</h3>

My first "fun time" with Vim was in "git commit" command. This was an awful experience. Vim felt too weird for me. It was confusing and I had to spend a significant amount of time to commit something. 

Steps are like:
<ul>
<li>enter insert mode</li>
<li>write some text</li>
<li>go to command mode</li>
<li>send command :w to save the file</li>
<li>send command :q to finish the process</li>
</ul>

A lot of stuff to remember for such a simple task. Back then "git gui" and "commit -m" saved my day. I wasn't ready for such a shift. I was too attached to tools like Tortoise Svn, Visual Studio and Notepad++. I thought about Vim as another weird editor for all those uber geeks. It doesn't felt powerful, my user experience was bad. 

I wasn't ready then, but now I am writing this blog post in VIM.

<h3>So What happened ?</h3>

Two things changed the game, "Git" and "Dwarf Fortress" (this hardcore game for weirdos). Learning Git and it's command line interface was like a revelation. I felt more productive and done stuff faster without the mouse. I really think about this as a evolution of the programmer. Suddenly you just realize that there is this weird world that looks so different but also feels right. Git was just the begining of the end of my usual mouse and point/click approach. 

Then, I discovered "Dwarf Fortress", weird but awesome and complex strategy game. I hated it's interface and UI. It is a perfect example of unfriendly design. Unfortunately, I am a maniac of all the complex strategy games (War In the Pacific is a perfect example of such a game). In order to play "Dwarf Fortress", I had to force myself into learning it's interface. This was a painful process, but with time I started to get it and was able to play the game normally. Poorly designed UI stopped being the problem.

This got me thinking. If I can learn to play "Dwarf Fortress" then maybe, I am able to grasp this weird  editor "Vim". Prior to this revelation, I approached Vim 4 times, all of them with moserable outcome. After "Dwarf Fortress" experience, I finnaly got it. I don't know why but after the 5th launch and try, I finaly started to se the benefits of Vim and "hjkl" approach. 

<h3>Vim Everywhere</h3>

Now, I am using Vim almost everywhere. Fortunately I didn't have to ditch Visual Studio, there is a nice extension <a href="http://visualstudiogallery.msdn.microsoft.com/59ca71b3-a4a3-46ca-8fe1-0e90e3f79329">VsVim</a> that runs on top of VS editor. It works well, it is somehow limited, but has the most important features like "imap" command. It is a great extension that gives you more possibilities. 

There is even a nice extension to Chrome <a href="https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb">Vimium</a>. I am still researching it's possibilities, but it is nice to navigate website with "hjkl" keys. I like the keyboard only navigation that comes with this extension. You really should try it.

Sublime also supports "vintage mode" but it is very limited. The only thing that encouraged me to work with Sublime was "command + p" feature. Fortunately there are plugins that enabled simillar functionality in Vim. So I switched my Node.js development to it.

<h3>Summary</h3>

Don't give up on Vim, even when you think it's not for you. Someday, sometime there will come a moment that you will get "Vim addiction".

Several Links to help me encourage you to Vim.

<a href="http://yehudakatz.com/2010/07/29/everyone-who-tried-to-convince-me-to-use-vim-was-wrong/">Everyone Who Tried to Convince Me to use Vim was Wrong</a>

<a href="http://www.viemu.com/a-why-vi-vim.html">Why, oh WHY, do those #?@! nutheads use vi?</a>

<a href="http://joelhooks.com/blog/2013/04/23/5-essential-vim-plugins/">5 essential Vim plugins</a>
