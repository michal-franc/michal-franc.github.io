In this lesson, we will explore micro services basic building blocks.

<image again as a remainder>

#### Core Logic

We are building service to do 'something', this is the core logic. Invoked by either external or internal call.

* external call - request from 'user' eg. HTTP GET, POST
* internal call - long running worker, with calls through some scheduler

In this example the call is from the external source through an Endpoint.

New controller in micro-web app.

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

As a rule of thumb, a service should do something 'useful' for your product/process. There is no simple guideline like your core logic should have at most 100 lines of course. Ignore statements like that. Focus on your business and what you are building. It is for you to decide what kind of 'granularity' you want to achieve.

If the code becomes too complicated or does too many things. That is a good signal to 'split up' the code. The problem is how to identify those scenarios. TDD can be useful here. 

It is important to strike a balance between having a lot of small services or small number of big ones. The truth is always somewhere in the middle. This discussion hints and ideas we will cover in the future.

#### HealthCheck

As the name suggest this is a piece of functionality that enables you to check if your service is healthy or not. In distributed world, finding out where the problem is can be difficult. In a monolithic app checking stability is 'simpler' as everything is in 'one place'. Logging, exceptions, errors - from various components available in one place. 

With distribution across many machines it is a bit more complicated to find out where the problem is. Especially when the problem could be related to the network layer. Something that is less problematic in monolithic approach.

Basic HealthCheck one looks like this.

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
Simple endpoint providing information if service is ok. Usually healthcheck can be based on HTTP Status Code:.

* 200 - means, I am OK
* 500 - oops there is some problem

Body contains more details with useful information that could help identify the problem. Example: information about availability or problems of all the external dependencies like databases, queues etc.

More complex example

```
  var health = new {
    isHealthy = IsHealthy(),
    rabbitMQ = CheckRabbit(),
    SQL = CheckSQL(),
    SNS = CheckSNS()
  };
```

We could add more checks. The health check role is to tell us if service is ok. This might be the first point of contact when debugging problems. This is plugged in to some monitoring software that can alert you if something 'went mad' in your system.

Standardising health check structure is important. Supporting similar behaviour, messages and status codes is needed. This saves a lot of time with future integrations. Some frameworks provide ability to plug in middleware. Perfect place for logic like that.

#### Logging

Every app should have some logging. This is the only way to analyse failures, errors and 'debug' problems that we weren't able to predict. Every software is buggy and 'broken' somehow. It is critical to find out all the problems that could affect the stability of our product.

In .NET there are two popular solutions to enable logging. Much older log4net and a bit younger NLog. I prefer NLog and use log4net only if there are some libraries, packages that also need it. There is a subtle difference between those two, but in the end, there is similar functionality.

Install packages in your preferred way. I have used Visual Studio Code Nuget addon. At the time of writing this dotnet core plays nicely with NLog-5.0.0-beta07.

Packages to install

```
NLog
NLog.Web.AspNetCore
```

 The first one is a core NLog logic, the other one provides a logger factory extension - a build in provider of loggers for AspNetCore. 

dotnet cli provide ability to add packages

```
dotnet add package NLog -v 5.0.0-beta07
dotnet add package NLog.Web.AspNetCore
```

Explicit version is needed to download correct package. Beta07 is still in beta and by default NLog 4.4.0  is installed. This one is not compatible with .NET Core.

To check if this operation was successful. Open your .csproj file and look for  PackageReference. This is also the wait to add packages manually. 

```
<PackageReference Include="NLog" Version="5.0.0-beta07"/>
<PackageReference Include="NLog.Web.AspNetCore" Version="4.3.1"/>
```

#### Configuring NLog

NLog uses configuration files. We need to create new file NLog.config.

```
touch NLog.config
```

PS: Keep in mind the L is capital :)

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

dotnet cli doesn't provide a tool for that yet. 

We need to make .NET Core Framework aware of NLog. To do that.

In Startup.cs file

```
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddNLog();

            app.UseMvc();
        }
```

This register NLog as one of the logging providers. 

The last thing to do is to mark NLog.config as the config file.

```
public Startup(IHostingEnvironment env, ILogger<Startup> logger)
{
    ... initialization code  ...    

    env.ConfigureNLog("NLog.config");
}

```

Don't forget to add usings.

```
using NLog.Extensions.Logging;
using NLog.Web;
```
Time to add simple information that service has just started. This will server as a test message.

```
public Startup(IHostingEnvironment env, ILogger<Startup> logger)
{
    ... initialization code  ...    

    env.ConfigureNLog("NLog.config");
    logger.LogInformation("Service started");
}

```

logger is injected to the Startup constructor by the framework. This is Microsoft internal abstraction. 

We bound NLog to it with the.

```
 loggerFactory.AddNLog()
```

This keeps the NLog as a implementation detail. Thanks to that we can easilly switch NLog with another provider like log4net.

Let's test it.

```
dotnet restore
dotnet run
```

If there is an exception on the runtime, NLog.config file cannot be found. Check if the 'L' is capital in 'csproj' and 'Startup.cs' file.

Check if you have folder with logs in your 'bin/Debug/netcorex.x/' folder. If there is a file with logs then it works fine.

Using NLog we can configure a memory target. This is a special buffer, that holds log data in memory. I couldn't find if there is any limitation on how much data it can hold, so be careful as you don't want to flood your machine memory with logs.

We will use this target to create a special endpoint showing real-time logs.

Adding new target in NLog.config
```
    <target xsi:type="Memory" name="memory" layout="${longdate} ${logger} ${message}" />
```

And new logger 

```
    <logger name="*" minlevel="Info" writeTo="memory" />
``` 

Logs are stored now in memory target. We need something to retrieve them from target and display. Using simple endpoint will be enough.

Inside status controller add new call.

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

All this code does is reads data from a target  and exposes it to endpoint '/status/logs'. Go ahead and test it.

We added logs to one instance of a service. Working with monolithic app having one process, or even ones, it is simple to 'aggregate' logs from different parts of 'one process'. 

With distributed aggregating logs is a bit more complicated. There is no single machine that you can go to and check all the logs (Out of box). You need external way to do this and collect logs from all the machines. 

There are solutions Out of box that are providing such capabilities. We might explore them later in this course.

#### Summary

Those were the main building blocks next time we will look on how to host our app as using it all the time using dotnet run is well not 'scalable'. We will use docker for that.

You will need to install Docker on your machine. It works well on Unix, Mac and Windows 10 (if you have PRO version with HyperV). For Windows 10 Home edition it gets tricky as you will need to install VirtualBox.
