---
layout: post
title: Boost your dev productivity with cmder + ConEmu
date: 2015-03-09 08:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [tools, archive]
permalink: /uncategorized/boost-your-dev-productivity-with-cmder-conemu/
---
<h3>Unix world and awesome tmux</h3>

<p>In unix world there is a nice 'tool'</p>

<p><a href="http://tmux.sourceforge.net/">'tmux'</a> - terminal multiplexer.</p>

<p style="text-align: center;">
  <img class="aligncenter" src="http://www.mfranc.com/wp-content/uploads/2015/02/tmux3.png" alt="" width="463" height="287" />
</p>

<p>With 'Terminal Multiplexer', you can nicely split up screen and have multiple terminals visible in front of your eyes. While working with python, on one of the screens I had vim running, then there was a screen for interactive Python plus small terminal to issue git commands. I could easily jump between 'screens' and also have different work spaces hidden behind the tabs. This setup can be then stored in the file and loaded up on demand. It provides a similar functionality to *.sln and *.csproj files in Visual Studio, but without big IDE that tends to crash and have a painful start up speed.</p>

<p><span style="line-height: 1.5;">It's a pretty neat tool to work with. The user experience is something you need to get used to, but if you are spending some time in command line world, the learning curve won't be that big.</span></p>

<h3>Windows world with cmder / ConEmu</h3>

<p>In windows world, a single window with cmd.exe / msysgit running is mostly all you need. There is a powerful Visual Studio ( with</p>

<p><a href="https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx">Community</a> edition we don't even have to worry about complex MS licensing ). Using VS and it's extension you can just use GUI like interface to do many different tasks. I was surprised that some of my colleagues, for git management, do use either VS extension or <a href="http://www.sourcetreeapp.com/">SourceTree</a> (recommended). I am using mostly cmd line + git gui. At <a href="https://home.justgiving.com/">JustGiving</a> we are using <a href="https://www.chef.io/chef/">chef</a> to maintain our infrastructure code, I also need to modify <a href="https://www.varnish-cache.org/">varnish</a> files from time to time. I could do all of that in Notepad++ or even Visual Studio, but in my drive to become 'friends' with cmd line i really got used to the 'gui-less' world. I don't want to say that this approach is a must have for productive work, because it would be a lie. Gui interfaces are fine and great, it is just a matter of preference. Tmux on Unix made a great impression on me and I wanted similar experience in the MS world. First stop, running tmux on Windows. It is doable, <a href="https://www.cygwin.com/">cygwin</a> environment gives you that, but colleagues at work showed me a better tool - <a href="http://bliker.github.io/cmder/">cmder</a>. Cmder is an extension for <a href="http://sourceforge.net/projects/conemu/">ConEmu</a> which is a console emulator. After some configuration it looks like this. <span style="line-height: 1.5;">Pretty neat eh ?</span></p>

<p style="text-align: center;">
  <img class="aligncenter" src="http://www.mfranc.com/wp-content/uploads/2015/02/cmder.jpg" alt="" width="691" height="389" />
</p>

<p>My current config has 2 tabs.</p>

<ul>
<li><span style="line-height: 1.5;">1st with </span><span style="line-height: 1.5;">vim instance running, to edit notes stored on dropbox </span></li>
<li><span style="line-height: 1.5;">2nd with </span><span style="line-height: 1.5;">vim for editing files and coding + 2 msysgit instances and 1 cmd line running</span></li>
</ul>

<p><span style="line-height: 1.5;">This setup gives me a nice environment for editing files not related to Visual Studio and .NET. Another neat functionality are </span>customized<span style="line-height: 1.5;"> Tasks. I am using those to store different project workspaces. One task equals one workspace. Thanks to that I can </span>easily<span style="line-height: 1.5;"> start another 'project' and initialize it by opening specific folders and specific files in Vim. It is a lot faster than doing everything manually.</span> To get this setup: * <span style="line-height: 1.5;">Settings -> Startup -> Tasks</span> * <span style="line-height: 1.5;">create new predefined task with + sign</span> * <span style="line-height: 1.5;">And add this code</span></p>


{% highlight csharp %}
-new_console:d:C:\Users\mfranc\Dropbox "%ProgramFiles(x86)%\Vim\vim74\vim.exe" /k 
-new_console:d:D:\ "%ProgramFiles(x86)%\Vim\vim74\vim.exe" /k -cur_console:n
-cur_console:d:D:\ "%ProgramFiles(x86)%\Git\bin\sh.exe" --login -i -cur_console:n:sT25V
-cur_console:d:D:\ "%ProgramFiles(x86)%\Git\bin\sh.exe" --login -i -cur_console:n:sT66H
cmd.exe -new_console:d:D:\ -i -cur_console:n:sT50H
{% endhighlight %}


<p>What does those commands do ? 1. Creates new screen and opens Vim in my Dropbox folder context 2. Creates new screen with Vim pointing to D:\ 3. Initializes shell in new window and splits current screen into 75%/25% Horizontaly</p>

<p style="text-align: center;">
  <img class="aligncenter" src="http://www.mfranc.com/wp-content/uploads/2015/03/75_25.jpg" alt="" width="300" height="225" />
</p>

<p>Initializes shell in new window and splits up the existing window into 33.3%/66.6% Vertically</p>

<p style="text-align: center;">
  <img class="aligncenter" src="http://www.mfranc.com/wp-content/uploads/2015/03/75_25_66.jpg" alt="" width="300" height="225" />
</p>

<p>Initializes shell in new window and splits up the existing window into 50%/50% Vertically</p>

<p><img class="aligncenter" style="margin-top: 30.3551120758057px; margin-bottom: 30.3551120758057px; line-height: 21.8181819915772px;" src="http://www.mfranc.com/wp-content/uploads/2015/03/75_25_66_50.jpg" alt="" width="300" height="225" /> � I have barely scratched the surface of the ConEmu and cmder awesomeness. Its functionality is more powerful than just split screen functionality.</p>

<h3>EDIT:</h3>

<p><a href="http://jj09.net/">Jakub Jedryszek</a> asked a couple of good questions: <strong>How to install cmder as an extension to ConEmu ?</strong> It is simple. Standalone version of cmder already contains ConEmu. Installation is simple, download, unpack run -> <a href="http://bliker.github.io/cmder/">http://bliker.github.io/cmder/</a> <strong>How to configure vim with plugins on windows and which version to use ?</strong> You can install <a href="http://www.vim.org/download.php#pc">GVim</a> which is vim with Gui-like interface for Windows. One of the plugins in the screen is <a href="https://github.com/scrooloose/nerdtree">NerdTree</a>. To install it you just need to copy paste this file <a href="https://github.com/scrooloose/nerdtree/tree/master/plugin">NERD_tree.vim</a> to C:\Program Files (x86)\Vim\vimfiles\plugin. If you have multiple plugins then pathogen.vim is also recommended. For starters with vim, it is better to start with <a href="http://www.openvim.com/">vim-tutorial</a> then move to vim as a Notepad replacement. Another step is <a href="https://visualstudiogallery.msdn.microsoft.com/59ca71b3-a4a3-46ca-8fe1-0e90e3f79329">VsVim</a>. It is really a great, stable extension for Visual Studio that plays nicely with R#. I have been using VsVim for past 3 years and it was always great. I am also using <a href="https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb">Vimium</a> which adds vim like feel to Chrome. <strong>Are you using vim to amend / create commits description in git ?</strong> If you have msysgit installed and you use cmd line then by default you will use vim, and yes I am using it 85% of the time, around 15% is done with git gui and rarely tortoise-git. Tortoise is mostly handy for git history checkup or blame, but lately it has been replaced by github :)</p>

<h3>EDIT 2: It is recommended by</h3>

<p><a href="https://conemu.github.io/">Maximus5</a> to update ConEmu to new version. Current cmder contains ConEmu version 140707(preview) while the newest ConEmu is 150309. List of <a href="https://conemu.github.io/en/Whats_New.html">changes is massive.</a>. To update ConEmu, get the new package from <a href="https://conemu.github.io/">https://conemu.github.io</a> and copy its content to 'your cmder installation'/vendor/conemu-maximus5 folder.</p>

