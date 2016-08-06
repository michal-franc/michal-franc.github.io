---
layout: post
title: Docker here docker there docker everywhere - Getting started with docker in .NET with F#
date: 2015-02-07 09:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [docker, f#]
---
<p><span style="line-height: 1.5;">If you are in IT world, you surely heard or read about docker. There was / is a huge hype about this technology. It looks like this one might actually survive the initial 'It's awesome phase'. I was looking for some info about docker. It was confusing to get to know what docker really is. Too much marketing buzz words everywhere. In this post I will sum up all my notes about how to start with docker in .NET and F#. It will be like learning journey that might end as a simple tutorial on where to start.</span></p>

<h3>Docker ?<span style="font-size: 1.5em; font-weight: 300; line-height: 1.5;"> </span> My first encounter with docker was through simple</h3>

<p><a href="https://www.docker.com/tryit">tutorial </a>. It's a online interactive shell emulation that lets you execute some of the commands and get the basics of docker. Sadly, after finishing it you are left out with more questions than answers. You can start by reading <a href="https://www.docker.com/whatisdocker/">official site docs</a>. The most important thing to note is that docker is a kind of a runtime that enables you to create images that you can run on top of it.<span style="line-height: 1.5;">This concept is just like Virtual Machines, there are however differences. Docker is not creating full complete OS instance, instead it is creating lightweight containers that do share the kernel but are still isolated and separated from each other </span><a style="line-height: 1.5;" href="http://stackoverflow.com/questions/16047306/how-is-docker-io-different-from-a-normal-virtual-machine">more</a><span style="line-height: 1.5;">. This process is more efficient both in time and memory space. It is easier and faster to create smaller containers instead of full VM's. There are however some cons, you won't get full isolation but who really needs that ? Other problem is ... Windows is currently not supporting those small containers, we can only run Unix beacuse docker is using '<a href="https://linuxcontainers.org/">Linux Containers</a>'. You can still run docker on Windows, but you can't create windows images. Microsoft promised to provide this support in new Win version.</span></p>

<h3>Running Docker on Windows</h3>

<p>To start using docker on windows go to - <a href="https://docs.docker.com/installation/windows">https://docs.docker.com/installation/windows/</a>. Boot2Docker is all you need to get started. This tool will install VirtualBox, configure small Unix VM that you will use docker from and there is also a nice utility tool that will connect you to your virtual machine. Boot2Docker is a little unstable, while testing I encountered one issue with never ending docker loading. It looks like there are some with issues - https://forums.docker.com/t/boot2docker-hangs-then-crashes/401 . I had to reinstall Boot2Docker multiple times to get it working.</p>

<h3>F# + docker</h3>

<p>I want to create my first simple image that I will be able to use and write some F# code, compile and run it.There are existing images with F# that you can just download and start using, but in order to learn I want to create my own image. In order to do this I will define a docker file with set of instructions that define how to construct an image.</p>

<p><span style="line-height: 1.5;">Those instructions are stored in </span><a style="line-height: 1.5;" href="https://docs.docker.com/reference/builder/">DockerFile</a><span style="line-height: 1.5;"> without extensions or dots. Thankfully Boot2Docker does have vi on board so I can use it to create this file.</span></p>

<p><strong>1&#46; touch DockerFile</strong> will create me a file First instruction would be to get me a Unix distro that I will run everything on top off.</p>


{% highlight csharp %}
DockerFile
FROM debian
{% endhighlight %}


<p><strong>2&#46; To build image</strong></p>

<p>Yey it works, behind the scenes it gets the debian DockerFile and goes from instruction to instruction creating a debian runtime. I could possibly write my own 'debian' image, but that would involve me learning about how to build Unix distro. Instead of that I can just point to external image and build on top of it. That is one of the beautiful things about docker. You can mix / match different images and build more complex ones using the basic ones.</p>

<p><strong>3&#46; In order to compile F# app i will need mono and fsharp compiler</strong></p>


{% highlight csharp %}
DockerFile
FROM debian
RUN apt-get -y -q install mono-complete
RUN apt-get -y -q install fsharp
{% endhighlight %}


<p>-y - "Always Yes" so if there is any prompt in 'apt-get' installer just say yes -q - Quiet - makes the log less verbose</p>

<p><strong>4&#46; Building image</strong><br />
I got some errors from apt-get missing packages and the logs says to add - 'apt-get update'. This is supposed to update the 'apt-get' list of packages.</p>


{% highlight csharp %}
DockerFile
FROM debian
RUN apt-get update
RUN apt-get -y -q mono-complete
RUN apt-get -y -q fsharp
{% endhighlight %}


<p>'sudo docker build' - and couple minutes later you should have a nice image with debian + mono + fsharp.</p>

<p><strong>5&#46; Switching to more specialized image</strong><br />
Sadly in my case I got lot of errors while downloading 'mono-complete'. Instead of building mono on my own, I have decided to change the base image and use some Unix distro with mono on board. Running 'docker search mono'. Gave me a list of all the potential images, I decided to use 'mono'.</p>


{% highlight csharp %}
DockerFile
FROM mono
RUN apt-get update
RUN apt-get -y -q install fsharp
RUN apt-get -y -q install vim
{% endhighlight %}


<p>Notice that I installing vim, I need some basic text editor to create first F# hello world app.</p>

<p><strong>6&#46; What now ? -Starting container</strong> I have base image, there is no container yet. What is a container you may ask ? <a href="http://stackoverflow.com/questions/23735149/docker-image-vs-container">Container is a running instance of image</a>. <span style="line-height: 1.5;">To start interacting with container, you need to start some app on it. Most basic one is interactive shell, that will also enable me to work on top of container</span></p>

<p><strong>7&#46; Testing out F#</strong> Lets see if fsharp is here fsharpi should start F# interactive.</p>

<p>Yey, it's here. To exit just type quit#;;</p>

<p><strong>8</strong><span style="line-height: 1.5;"><strong>. Creating folder + hello world source file</strong></span> <span style="line-height: 1.5;"><strong></strong> I need folder and hello.fsx file</span></p>

{% highlight csharp %}
mkdir fsharp-hello
touch hello.fsx
{% endhighlight %}

<p><strong>9&#46; Hello World App</strong></p>

{% highlight csharp %}
open System

[<EntryPoint>]
let main argv =
   printfn "Hello World"
   0
{% endhighlight %}


<p><strong>10&#46; Compiling app</strong></p>


{% highlight csharp %}
fsharpc hello.fsx
{% endhighlight %}

<p><strong>11&#46; Running Hello World App</strong></p>

{% highlight csharp %}
mono hello.exe
{% endhighlight %}


<p>Uff, done. That wasn't that hard. Now, you might ask so what ? You just compiled Hello World app ... I can do this on my local machine, yep but this</p>

<p><span style="line-height: 1.5;">brief tutorial is just a starting point, I have started exploring docker, because, I want to play with akka.net and F#. In next posts I will post more things about how to use docker to create multiple akka actors and how to write some simple distributed app. That will be fun, cause it is a new world for me. Docker is more complicated than that. It is quite </span>sophisticated<span style="line-height: 1.5;"> and you can create complex images with many </span>dependencies<span style="line-height: 1.5;">. </span> edit: <a href="https://www.vagrantup.com/blog/feature-preview-vagrant-1-6-docker-dev-environments.html">You can use vagrant with docker</a> <a href="https://devopsu.com/blog/docker-misconceptions/">Docker Misconceptions</a> <a style="line-height: 1.5;" href="http://pawel.sawicz.eu/">Pawel Sawicz</a><span style="line-height: 1.5;"> just send me a nice link with </span><a style="line-height: 1.5;" href="http://iops.io/blog/docker-hype/">some anty-hype opinion about docker</a> Another nice link <a href="http://phusion.github.io/baseimage-docker/">with some docker problems + a solution </a></p>

<p>Interesting links:
<a href="https://www.toptal.com/devops/getting-started-with-docker-simplifying-devops">Getting Started with Docker: Simplifying Devops</a></p>

