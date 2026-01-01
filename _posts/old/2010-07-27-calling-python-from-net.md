---
layout: post
title: Calling Python from .Net
date: 2010-07-27 16:04
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
<p style="text-align:justify;">In one of the projects i want to use scripting language featuers to easily change the behaviour of my application on the runtime. I choosed Python and its .Net implementation IronPython beacuase it is a solid and popular language.</p>
<strong>Before we can start we need :</strong>

- <a href="http://ironpython.net/">IronPython Site</a>.

There is also a nice Visual Studio 2010 integration tool which adds new project templates and interactive command prompt to Visual Studio <span style="white-space:pre;"> </span>IDE.

<strong>In our code we have to add assembly references :</strong>

- IronPython

- IronPython.Modules

- Microsoft.Dynamic

- Microsoft.Scripting

- Microsoft.Scripting.Debbuging

You can find these files in the IronPython installation folder.

<strong>Create simple testing script with just one function declaration</strong>

{% highlight csharp %}
def Simple():

	print "Hello from Python Interpreter"

test.py - filename
{% endhighlight %}

This script will print a "marvellous" Hello World style text :D

<strong>In .Net code we have to:</strong>

1. Initialize Python Runtime

2. Load File with the script to dynamic object

3. Use dynamic [this keyword is a new addition to the .Net 4.0] object as class , referencing method in script file.

{% highlight csharp %}
var ipy = Python.CreateRuntime();

dynamic test = ipy.UseFile("Test.py");

test.Sample();
{% endhighlight %}

<p style="text-align:justify;">This code will execute function Simple which is defined in the python script file.Test is a dynamic object , we dont know on the compile time what kind of object it is. The dynamic object will be defined on the runtime. Dynamic keyword is a new addition in the .Net 4.0 Framework. It is simmilar to the var keyword but , it has a different behaviour. Var is defined on the compile time [while the dynamic on the runtime] . Compilator while creating byte code  gueses object from the application cntext.DLR [Dynamic Language Runtime] is a link beetwen CLR and dynamicly typed languages like Python (IronPython) or Ruby (IronRuby). It is build on top of the CLR.</p>
<strong>Where could we use a scripting language integration ?</strong>
<p style="text-align:justify;">The game called "Civilization 4" is a great example of a architecture with core engine created in c++ and almost everything else , from the ai logic , scenarios , map generatior to the ui mechanics is created based on the python code. This architecture creates a great enviroment for end users. By using Python gamers created lot of great mods for the game.</p>
