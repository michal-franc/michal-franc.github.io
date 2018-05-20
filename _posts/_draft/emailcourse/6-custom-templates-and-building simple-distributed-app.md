Today:
- introduction to customized dot net templates
- overview of microservices running jobs

Last lesson before we start building a distributed shop system like Amazon. 

#### Customized templates

It is possible to extend available templates for 'dot net'. 

I have created some for this course - [you can check them here][0]

More info on how to build new templates:
[dotnet/templating][1]
[custom project templates][2]

To install:

```
git clone git@github.com:mfranc-workshop/dotnetcore-templates.git ( or use HTTP if you don't have ssh )

dotnet new -i dotnetcore-templates/micro-basic
dotnet new -i dotnetcore-templates/micro-job
dotnet new -i dotnetcore-templates/micro-job-rabbit
```

**Micro-basic**
Generates microservice using asp.net core with a simple controller. Used as a base for most of the microservices in this course. Similar to ones we have built in previous lessons.

Used in:
- functionality waiting for external requests
- exposing API

**Micro-job**

Extension of Micro-basic - adds Quartz job scheduler. In a typical scenario, with endpoint exposing API, service waits for user input to initiate action. The scheduler can start internal actions based on scheduled jobs.

Used in:
- functionality that can start on its own in a scheduled task
- message queue consumption
- scheduled actions sent to other services

**Micro-job-rabbit**
Micro-job with RabbitMQ preinstalled. RabbitMQ is a message-broker that implements AMQP protocol - used as a message queue to create decoupled communication between services. Build with RawRabbit.NET package. [Great blog post from a friend of mine - Piotr Gankiewicz about RawRabbit][3]

**Using templates**
```
dotnet new micro-basic --name <name> -o <folderOutput>

<name> - service name 
<folderOutput> - where to put the code
```

Templating engine is still unstable and not feature complete. For instance, if you want to remove templates - there is no option to do that. The only way to get 'remove' new templates is to reset dot net templating completely to 'factory' settings.

```
dotnet new --debug:reinit
```

#### Micro - Job - Microservice with the scheduler.

In a typical scenario deployed service exposes its functionality through endpoint and awaits requests. In this scenario, given service that calls external banking system, the request is generated from 'external' source - another service, client app, different system etc.

<image endpoint initiate action>

Not all services are like that. There are requirements where service has to initiate action 'internally' based on a schedule. 

This is useful in:
- service sending requests to other services, eg daily backup
- monitoring service to verify the health of other services
- service that periodically checks message queue and consumes messages performing an action

<image of scheduled service>

**Building a service that pings google.com**
Imagine a scenario - we need to make sure that google.com is available. There are monitoring tools available but let's build one on our own.

```
dotnet new micro-job --name micro-check-google -o micro-check-google
dotnet restore
dotnet run 5000 <- port number
```
Web app with scheduler is running. Every 60 sec job is started that logs information.

An example of the log:

```
    "2017-07-15 22:26:47.7676 CoreJob CoreJob Executing ", 
    "2017-07-15 22:26:47.7676 CoreJob CoreJob doing its magic ", 
    "2017-07-15 22:27:47.6964 CoreJob CoreJob Executing ", 
    "2017-07-15 22:27:47.6964 CoreJob CoreJob doing its magic "
```

Code of the job is inside 'Jobs/CoreJob.cs'.

Code:
```

public class CoreJob : IJob
    {
        private ILogger _logger = LogManager.GetCurrentClassLogger();

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

In Quartz - to create a Job you need to implement IJob interface. IJob contains 'Execute' method invoked by the scheduler in intervals(xx seconds/minutes/hours etc). Interested in Quartz? Check - [Official docs here][4].

I mentioned scheduler, this one is created in 'MainScheduler.cs'. It has 'Start' method used to create Triggers and Schedule Jobs. There is only one job for now.

#### Pinging google

Checking if google is alive should be easy. Simplest solution? Send request and check the status code if it's 200 it's fine.


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
I don't want to add http requests packages. Basic HttpClient is all we need.

Next run should show this in logs.
```
2017-07-15 22:55:50.4569 CoreJob Google is fine, we are saved 
2017-07-15 22:56:50.1304 CoreJob CoreJob Executing 
2017-07-15 22:56:50.1304 CoreJob CoreJob pinging google 
2017-07-15 22:56:50.3248 CoreJob Google is fine, we are saved 
```

We will be building many jobs like that in the future project. Microservices based shop.

[0]: https://github.com/mfranc-workshop/dotnetcore-templates
[1]: https://github.com/dotnet/templating
[2]: https://rehansaeed.com/custom-project-templates-using-dotnet-new/
[3]: http://piotrgankiewicz.com/2016/10/31/net-core-rabbitmq-rawrabbit/
[4]: https://github.com/quartznet/quartznet
