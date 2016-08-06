---
layout: post
title: Modifying Templates in Visual Studio
date: 2009-11-22 12:12
author: Michal Franc

comments: true
categories: [.net, Uncategorized, visual studio]
---
<p>I am making a lot of regions while creating classes. It helps me with the management of fields methods. </p>  <p><a href="http://lammichalfranc.files.wordpress.com/2009/11/klasa.jpg"><font color="#555555"></font><img class="aligncenter size-full wp-image-69" title="klasa" alt="" src="http://lammichalfranc.files.wordpress.com/2009/11/klasa.jpg" width="304" height="387" /></a></p>  <p>I am always creating regions. So why no to automate this process ?</p>  <p>We can make our own Visual Studio template which will be used when creating new VS item like class.</p>  <p>&#160;</p>  <h3>How to ?</h3>  <p>&#160;</p>  <p><strong><em></em></strong><strong><em>Go to the folder :       <br />&quot;~InstallDirMicrosoft Visual Studio 9.0Common7IDE&quot;</em></strong></p>  <p>There you will find two catalogs : ItemTemplates and ItemTemplatesCache.</p>  <p>Those catalogs store all the default templates of Visual Studio. In ItemTemplates everything is stored in zip files. </p>  <p>In order to change the template just get the file from the zip package , modify it and put it in the zip. Modified file should be also moved to the ItemTemplatesCache.</p>
