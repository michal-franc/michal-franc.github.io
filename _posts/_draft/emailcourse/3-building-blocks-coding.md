In this lesson, we will explore microservices basic building blocks.

<image again as a remainder>

#### Core Endpoint

The most important part of microservice is some logic. Something that is 'doing' useful thing. In this example, it won't be super useful, but let's start simple.

Let's add a new controller to our 'micro-web' app.


```
    public class CoreController: Controller
    {
        [HttpGet]
        [Route("core/{id}")]
        public string Core(int id)
        {
            return $"Core-{id}";
        }
    }
```

Of course, this core logic can get complicated. As a rule of thumb, a service should do something 'useful' for your product/process. There is no simple guideline like your core logic should have at most 100 lines of course. Ignore statements like that. Focus on your business and what you are building. It is for you to decide what kind of 'granularity' you want to achieve.

#### Healtheck

In a monolithic app checking stability is 'simpler'. You just initiate action by making a request and check if something is not failing. Somewhere down the line if some part of the system is broken, there will be an exception.

To make it better you add some logging, monitoring and alerting. It is kind of similar in the microservice world, the problem is that due to distribution across multiple machines it is a bit harder to understand all the interaction in the whole system. You can't just throw an exception caught in some generic top layer and be done. It is important to identify how healthy is the overall system and all its components. The first step to do this is to add a way to measure your single service by adding HealthChecks.

It looks like this.

```
[Route("status")]
public class StatusController: Controller
{
    [HttpGet]
    [Route("health")]
    public JsonResult Health()
    {
      var health = new {
        isHealthy = true
      };
      
      return Json(health);
    }
}
```

It is a simple endpoint that lets you know if service is ok. Usually, you do this by assuming that 200 HTTP status means, I am ok and 500 I am not ok. It is also advisable to return some analysis of what could fail.

The top example is simple. You can create more complicated ones.

```
  var health = new {
    isHealthy = IsHealthy(),
    rabbitMQ = CheckRabbit(),
    SQL = CheckSQL(),
    SNS = CheckSNS()
  };
```

This endpoint will be used by your automatic monitoring systems, it is good to keep it fast.

We could add more checks. The health check role is to tell us if service is ok. This might be the first point of contact when debugging problems. If you have an issue on prod and your monitoring has failed then you can query those endpoints and check if services are ok.

It is important to standardise health check around your organisation to enable writing tooling that is able to read our services and how those responsible. Worst case scenario is services implemented with different standard and you either have to change them or create a super generic tool which is a waste of time t is better to establish common patterns and ideas what health check is to avoid this problem altogether

I could write a separate blog post on how to design health check response withing the org.

#### Logging

Every app should have some logging. This is the only way to analyse failures, errors and 'debug' problems that we weren't able to predict. Every software is buggy and 'broken', we are either not seeing it or don't care.

In .NET there are two popular solutions to enable logging. Much older log4net and a bit younger NLog. I prefer NLog and use log4net only if there are some libraries, packages that also require it. There is a subtle difference between those two but in the end, they provide very similar functionality.

Install package in your preferred way. I have used Visual Studio Code Nuget addon. At the time of writing this NLog-5.0.0-beta07 supported dot net core.

Packages to install

```
NLog
NLog.Web.AspNetCore
```

You can also use dotnet cli tool

```
dotnet add package NLog -v 5.0.0-beta07
dotnet add package NLog.Web.AspNetCore
```

With NLog you need to add version explicitly otherwise Nuget responds back with a message that NLog 4.4.0 is not compatible with .NET core.

The first one is a core NLog logic, the other one provides a logger factory extension, a build in provider of loggers for AspNetCore.

This tool adds PackageReferences inside your .cproj file. You could manually 'add' packages by just adding new record to the list.

```
<PackageReference Include="NLog" Version="5.0.0-beta07"/>
<PackageReference Include="NLog.Web.AspNetCore" Version="4.3.1"/>
```

#### Configuring NLog

NLog uses configuration files. We need to create new file NLog.config.

```
touch NLog.config
```

Keep in mind the L is capital :)

NLog.config

```
<?xml version="1.0" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <targets>
    <target name="file" xsi:type="File"
        layout="${longdate} ${logger} ${message}"
        fileName="${basedir}/logs/${shortdate}.txt"
       />
  </targets>

  <rules>
    <logger name="*" minlevel="Info" writeTo="file" />
  </rules>
</nlog>
```

When we build our app all the compiled assemblies and config files are moved to 'bin/Debug/netcoreappx.x'. We need to do the same with NLog.config. In old Visual Studio days, it was done simply by selecting file properties and setting Copy Always. This automatically added a special line in the csproj that was then used by MSBuild to copy the file.

We will have to add this line manually by adding.

*.cspro file

```
  <ItemGroup>
    <Folder Include="wwwroot\"/>
    <None Include="NLog.config">
      <CopyToOutputDirectory>Always</CopyToOutputDirectory>
    </None>
  </ItemGroup>
```

Sadly dotnet cli doesn't provide a tool for that yet. Perfect example for open sources pull request 'anyone?'.

We need to make .NET Core Framework aware of NLog. To do that.

In Startup.cs file

```
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddNLog();

            app.UseMvc();
        }
```

This registers NLog as one of the logging providers. The last thing to do is to inform the Nlog that it should use NLog.config file.


```
public Startup(IHostingEnvironment env, ILogger<Startup> logger)
{
    ... initialization code  ...    

    env.ConfigureNLog("NLog.config");
}

```

Don't forget to inform compiler that we are using NLog by adding usings.

```
using NLog.Extensions.Logging;
using NLog.Web;
```

To test if everything works fine let's just add simple information that the service has started.

```
public Startup(IHostingEnvironment env, ILogger<Startup> logger)
{
    ... initialization code  ...    

    env.ConfigureNLog("NLog.config");
    logger.LogInformation("Service started");
}

```

The ILogger<T> is injected to the Startup constructor by the dotnet core. This is Microsoft internal abstraction. That we bound to using 'loggerFactory.AddNLog()'. NLog is invisible to our application apart from the orchestration layer. To the rest of the system, it is just an implementation detail (We will later break this separation with an implementation of Memory logger :) ). Thanks to that we can easily switch NLog with another provider like log4net and don't have to change the lines of code calling the logger.

Ok, usual procedure.

```
dotnet restore
dotnet run
```

If there is an exception on the runtime, that NLog.config file cannot be found. Check if the 'L' is capital in 'csproj' and 'Startup.cs' file.

Check if you have folder with logs in your 'bin/Debug/netcorex.x/' folder.

So far so good we have logging configured.

One of the good things about NLog is that we can configure a memory target. This is a special buffer, that holds log data in memory. I couldn't find if there is any limitation on how much data it can hold, so be careful as you don't want to flood your machine ram with logs.

We will use this target to create a special endpoint showing real-time logs. We could read the IO and files stored on the file system but that is costly operation.

Adding new target in NLog.config
```
    <target xsi:type="Memory" name="memory" layout="${longdate} ${logger} ${message}" />
```

And new logger 

```
    <logger name="*" minlevel="Info" writeTo="memory" />
``` 

We need something to access the logs now.  Using simple endpoint will be enough.

Inside status controller adds new call.

```
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using NLog.Targets;
using NLog;

namespace micro_web.Controllers
{
    [Route("status/")]
    public class StatusController : Controller
    {
        [HttpGet]
        [Route("logs")]
        public IEnumerable<string> Logs()
        {
            var target = (MemoryTarget)LogManager.Configuration.FindTargetByName("memory");
            return target.Logs;
        }
    }

    ... more code here ...
}
```

All this code does is reads data from a target that is A Memory Target and exposes it to endpoint '/status/logs'

We added logs to one instance of a service. Working with monolithic app having one process, or even multiple ones, it is simple to 'aggregate' logs from different parts of 'one process'. You just put them on the machine. 

With distributed world and multiple services working as a standalone software aggregating logs is a bit more complicated. There is no single machine that you can go to and check all the logs (Out of box). You need external way to do this and collect logs from all the machines. 

One solution is to write your own logging service that will do it for you. Fortunately, there is a better way. There are solutions Out of box that are providing such capabilities. We might explore them later in this course.

#### Summary

Those were the main building blocks next time we will look on how to host our app as using it all the time using dotnet run is well not 'scalable'. We will use docker for that.

You will need to install Docker on your machine. It is supported on Unix, Mac and Windows 10 (if you have PRO version with HyperV). For Windows 10 Home edition it gets tricky as you will need to install VirtualBox. There was a link in the first blog post to the place that shares all the details of installation.
