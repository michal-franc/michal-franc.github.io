---
layout: post
title: Simulating microservices using F# and Suave.io
date: 2016-03-15 02:21
author: Michal Franc
comments: true
summary: Brief overview of a way to deploy simple services on local machine.
categories: [Tech]
tags: [f#, microservices]
---

<p>I have this small hobby project called Overseer. It is a tool used to debug and troubleshoot microservices. I was planning to use it in production, but because that is the only prototype. I decided to use it with simulated services. This way it will be a lot easier to create many different 'test' scenarios.</p>

<p>The current solution for spawning those 'tests services' is implemented in Suave.io and F#. Why these technologies? I just like F# and Suave.io seems like a nice decent framework. <a href="https://github.com/michal-franc/OverSeer/blob/master/OverSeer.Servers/Program.fs">Full code</a> If you can, please review this code. I am not a F# expert and would love to learn how to make it better.</p>

## Test service graph definition

<p>I want to iterate fast and create different networks of services. I need a simple way of defining the structure of the network. At the moment, I am using an array of tuples with a service name and collection of all the services it depends on. It looks like this.</p>

{% highlight csharp %}
let listOfServices = [ ("GG.Web.Crowdfunding", "ms", 
     [ "GG.Service.IdentityVerification"; "GG.Service.Project"; 
       "GG.Service.Profile"; "GG.Service.Crm"; "GG.Service.Project.RiskAnalysis";
       "GG.Imaging.Read"; "GG.Imaging.Write"; "GG.Service.Project.Registration"; 
       "GG.Service.AB"; "PayPal"; "GG.Service.User"
     ]);

     ("GG.Service.IdentityVerification", "ms", [    
        "VerifyIntegrity"; "Unfido";"CreditCallService";"PayPal";"GG.Service.User"    
     ]);
]
{% endhighlight %}

<p>This array of tuples is changed to Suave web 'servers' with one endpoint.</p>

{% highlight csharp %}
let toTaskMicroServers endpoint =
    Task.Run(fun () -> startWebServer (serverConfig endpoint.port) (app endpoint))
    
let taskList = listOfServices     
               |> createEndpoints
               |> List.map toTaskMicroServers  
               |> List.toArray 
               |> Task.WaitAll

{% endhighlight %}

<p>The result is a list of Tasks running suave exposing one simple endpoint.</p>

## Endpoint list

{% highlight csharp %}
type EndpointResponse = {
    port : uint16;
    url : string;
    name : string;
    serviceType : string;
    status : bool;
    dependancies : EndpointResponse list
}
{% endhighlight %}

{% highlight csharp %}
let createInitialEndpoints list =
    let startPort = 3000
    list
        // fold used here to increment port

        |> List.fold(fun (array, port) (n, t, d) ->
           (createEndpoint n t d port)::array, port + 1) ([], startPort)
        // discarding port from tuple as it is not needed

        |> fs
{% endhighlight %}

<p>To create a list of the endpoints, I am using fold function with an accumulator to increment port. Fold is a function that I tend to overuse too much. But in this case, it feels ok. Is there any other way to iterate through something with a maintnance of external state?</p>

## Suave config

<p>It was a bit tricky as the documentation is not that good. After many try and errors and SO searching, I was able to create simple endpoints. All it does is returning JSON metadata describing 'server' (status, dependencies).</p>

{% highlight csharp %}
let app endpoint =
    choose [   
        GET >=> choose
            [ path "/status/health" >=> MimeJSON
                                    >=> setHeader "Access-Control-Allow-Origin" "*"
                                    >=> OK (JsonConvert.SerializeObject(endpoint));
              path "/" >=> Redirection.redirect "/status/health" ]
        ]

{% endhighlight %}
## Result

{% highlight js %}
{
  "port": 3000,
  "url": "http://localhost:3000/status/health",
  "name": "GG.Web.Crowdfunding",
  "serviceType": "ms",
  "status": true,
  "dependancies": [
  {
    "port": 3001,
    "url": "http://localhost:3001/status/health",
    "name": "GG.Service.IdentityVerification",
    "serviceType": "ms",
    "status": false,
    "dependancies": []
    }]
}
{% endhighlight %}

<p>All the dependencies, links to them, ports are here. This data is then used to create a graph app id d3.js, example.</p>

<p><img src="http://www.mfranc.com/wp-content/uploads/2016/03/graph.png" alt="alt text" title="Sneak peek graph" /></p>

<p>This is still in the making. D3.js is really powerful but quite tricky to use. I am mostly experimenting and there are a lot of 'wow' moments. Kind of feels like winapi programming a long time ago.</p>

<p>The first test was done with 11 services and it 'works'. Wonder how it will cope with 100+ services. That is a topic for a different blog post.</p>
