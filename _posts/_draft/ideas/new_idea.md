Building distributed systems wiht .NET, Docker and Microservices

This post is part of series about building.

Today we will build a simple microservice and explore the meaning of what really microservice is. Next blog post will be about hosting.

#### Microservice

What is a microservice?
This will be in previous post.

#### First simple Microservice using Asp.NET Core server

Ok lets do this!

Beacuse I do encourage everyone to use console. That is what we will do today. Use the console and cli tools to work with .NET Core and create projects, build, run, test etc.


#### WIndows 

If you are on Mac just ignore two next sections. Mac, Unix should be a lot simpler to use, and I assume you are already able to brew or apt-get Node :D

##### Installing command line replacement

Default cmd.exe in Windows is ok but it is not great. I always advise to install a better replacement there are many different options.

* [cmder (my choice)][3]
* [ConEmu][4]
* [babun][5]

##### Installing Node on Windows using chocolatey

* [Getting chocolatey][1]
* [Node with chocolatey][2]
* [.NET Core SDK][6] - this one is important, there were a lot of changes, I had old version that was incopatible with 'new-old' csproj files. <3 Microsot.

##### Installing yeoman and Bower and Generator

Yeoman is a templating engine erator.

```
npm install -g yo
```

Bower - a tool ""

```
npm install -g bower
```

Generator - then we need to install generator - [Omnisharp team is manintaing][0]. This one is maintaned by Omnisharp team.
```
npm install -g generator-aspnet
```

Testing the generator

```
yo aspnet console NetMicro
```

This generates basic Console App in NetMicro folder with Program.cs file and csproj and other cool stuff. Main function does contain a Console.WriteLine so we can easilly test it.

Dotnet cli provides nice tooling.

```
dotnet restore
dotnet build
dotner run
```

<gif with basic commands>

#### First simple Microservice using Asp.net Core

#### First simple Microservice using Nancy

#### Yeoman generators for both examples

While doing this I also created new yeoman generators.

* micro-core

to use it just do

```
yo microcore nancy
```

or

```
yo microcore aspnet
```

Those will evolved while doing this course.

TODO:
- links to repo and code with commits explaining the whoel process
- webinar

[0]: https://github.com/OmniSharp/generator-aspnet
[1]: https://chocolatey.org/install
[2]: https://chocolatey.org/packages/nodejs.install
[3]: http://cmder.net/
[4]: https://conemu.github.io/
[5]: http://babun.github.io/
[6]: https://www.microsoft.com/net/download/core#/sdk
[8]: .NET core cli
