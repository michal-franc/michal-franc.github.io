---
layout: post
title: Remote deployment - Sharepoint
date: 2010-07-28 19:10
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
In software development job we are doing lots of repetitive tasks. Like recycling iis , copying files , connecting to remote server etc etc. On Sharepoint there are lots of „boring” things to do. One of those "things " is deploying dll to a remote server. I hate this . You have to log in to a server,  copy the file , open the gac and manually drag n drop it to a folder. You can't just copy it by  „Total Commander”.
Ok i aggree it is not a problem with 1 - 2 deploys in an hour but if you are testing something it can get to 10 - 20 times per hour.

I was looking for a tool to do the deploy phase faster and remotely without alt-tabing and Yey  there is such a tool <a href="//remotegacutil.codeplex.com/”">RemoteGcUtil</a>. You can insert server address . Load the gac , explrore it and with just 2 simple clicks install new file to Gac.

<a href="http://lammichalfranc.files.wordpress.com/2010/07/rg1.png"><img class="aligncenter size-full wp-image-456" title="rg" src="http://lammichalfranc.files.wordpress.com/2010/07/rg1.png" alt="" width="632" height="396" /></a>

Its gets better , if you want to reload the assembly file you don’t have to browse again to find the file the path to recent file is and you just need to click open again .It's really great and it's working flawless . I was using it today multiple times and it worked great.

After deploying the assembly we have to recycle the application pool. At the beginning i was using mouse clicking through the menus of iis manager. Later i discovered the  command<em><span style="color:#ff0000;"> </span></em><strong><em><span style="color:#ff0000;">iisapp /a Poll Name  /r</span></em></strong>. I created a bat file and this process became faster , but If I am remotely deploying files to gac there have to be a possibility to run this command remotely. This would cut the time to do the “boring” stuff significantly.

There is a Power Shell script to do this.
http://gallery.technet.microsoft.com/ScriptCenter/en-us/56962f03-0243-4c83-8cdd-88c37898ccc4

It looks promising, I have to test it soon.

Power Shell definitely next thing to learn.
