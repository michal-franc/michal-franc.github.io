Today:
- introduction to customized dotnet templates
- overview of microservices running jobs

Last lesson before we start building a (simplified) distributed shop system like amazon. 

#### Custoimzed templates

After using 'dotnet new' you might have wondered if it is possible to add your own templates to speed up the work. Yes it is possible. 

I have created my own templates - [you can check them here][0]
These are going to be used in the upcomming lesson.

More info on how to build new templates:
[dotnet/templating][1]
[custom project templates][2]

To install:

```
git clone git@github.com:mfranc-workshop/dotnetcore-templates.git ( or use http if you dont have ssh set up)

dotnet new -i dotnetcore-templates/micro-basic
dotnet new -i dotnetcore-templates/micro-job
dotnet new -i dotnetcore-templates/micro-job-rabbit
```

**Micro-basic**
It is a template to generate a simple microservice using asp.net core that exposes a controller. This one is used as a main base for most of the microservices. Very similar to the one we have built in previous lessons.

**Micro-job**

Similar to Micro-basic - adds Quartz job scheduler. Typical micro-service requires some action from the external source to start working. Job schedules enables to do it from the inside of micro-service. Used in services that are initiating action, like sending requests to other services or consuming messages form queues etc.

**Micro-job-rabbit**
Adds RabbitMQ binding. RabbitMQ is a message-broker that implements AMQP - used as a message queue to create decoupled communication beetwen services. Build with RawRabbit .NET package, simple rabbit-mq client.

[Great blog post from a friend of mine - Piotr Gankiewicz about RawRabbit][3]

**Using new template**
```
dotnet new micro-basic --name <name> -o <folderOutput>

<name> - service name 
<folderOutput> - where to put the code
```

Templating engine is quite unstable and not feature complete. For instance if you want to remove templates. You can't. The only way to get rid of them is to reset dotnet templating completetly, using.

```
dotnet new --debug:reinit
```


#### Micro - Job - Microservice with scheduler.

In a typical scenario service waits for external calls to start working. If we have a service that for instance calls external banking system. This services waits for the user to do something related to external banking system. User(could be other service, system or client app) sents a request to 'do something', this makes service to 'do something'.

<image endpoint initiate action>

There is another scenario. Service can initiate action on its own. This is usefull in many cases:

- service sends a request once a day to other service, eg take backup
- monitoring service that verifies if other services are online
- service that periodically checks external message queue and waits for asynchoronosu operation to do

<image of scheduled service>

**Building a service that pings google.com**

Imagine a scenario where we need to make sure that google.com is available. I know unlikely, oh that would be a historical event. Of course there are various monitoring tools that will do it for us but lets build one on our own.

```
dotnet new micro-job --name micro-check-google -o micro-check-google
dotnet restore
dotnet run 5000 <- port number
```

This starts web app that in the hood has a scheduler with a job running every 60 sec. All this job does is add logs.

Example of log:

```
    "2017-07-15 22:26:47.7676 CoreJob CoreJob Executing ", 
    "2017-07-15 22:26:47.7676 CoreJob CoreJob doing its magic ", 
    "2017-07-15 22:27:47.6964 CoreJob CoreJob Executing ", 
    "2017-07-15 22:27:47.6964 CoreJob CoreJob doing its magic "
```

Code of the job is inside 'Jobs/CoreJob.cs'.

Code:

```

publicc class CoreJob : IJob
    {
        private ILogger _logger = LogManager.GetCurrentClassLogger();

        public CoreJob()
        {
        }

        public Task Execute(IJobExecutionContext jobContext)
        {
            _logger.Info("CoreJob Executing");
            try
            {
                _logger.Info("CoreJob doing its magic");
                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error when executing job");
                return Task.FromResult(false);
            }
        }
    }
```

Every job has to inherit froj IJob interface and expose Execute method. Quartz scheduler runs this method in specified time interval( example here 60s).

There are more details on how to properly add Quartz to the app, we are not going into those in this course. [Official docs here][4].

Some hints around the code:
- MainSscheduler.cs - code used to create a scheduler and bind Jobs with Start and Stop Method. Start is used in Startup.cs.
- Basic IOC using SimpleInjector package. Container is added to SchedulerFactory addint DI capabilities inside Jobs.
- Scheduler is disposed using container dispose, on app stopping event - IApplicationLifetime

#### Pinging google

Checking if google is alive should be easy. Sending simple get request and checking StatusCode 200 is the perfect solution. This code will replace basic CoreJob.cs.


Full CoreJob.cs code

```
using System;
using System.Linq;
using NLog;
using Quartz;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net;

namespace micro_check_google.Jobs
{
    public class CoreJob : IJob
    {
        private ILogger _logger = LogManager.GetCurrentClassLogger();

        public async Task Execute(IJobExecutionContext jobContext)
        {
            _logger.Info("CoreJob Executing");
            try
            {
                _logger.Info("CoreJob pinnging google");

                using(var client = new HttpClient())
                {
                    var message = new HttpRequestMessage(new HttpMethod("GET"), "http://google.com");
                    using(var response = await client.SendAsync(message))
                    {
                        if(response.StatusCode == HttpStatusCode.OK)
                            _logger.Info("Google is fine, we are saved");
                        else
                            _logger.Info("Google is not ok, but this step shouldnt happen");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Either our code is broken or whole internet collapsed.");
            }
        }
    }
}
```

Sending GET request .NET barebones libraries looks complicated, but we don't want to add other packages here etc


On next run logs should have.


```
2017-07-15 22:55:50.4569 CoreJob Google is fine, we are saved 
2017-07-15 22:56:50.1304 CoreJob CoreJob Executing 
2017-07-15 22:56:50.1304 CoreJob CoreJob pinnging google 
2017-07-15 22:56:50.3248 CoreJob Google is fine, we are saved 
```

Simple job runner that executes actions without external input, finished.


[0]: https://github.com/mfranc-workshop/dotnetcore-templates
[1]: https://github.com/dotnet/templating
[2]: https://rehansaeed.com/custom-project-templates-using-dotnet-new/
[3]: http://piotrgankiewicz.com/2016/10/31/net-core-rabbitmq-rawrabbit/
[4]: https://github.com/quartznet/quartznet
