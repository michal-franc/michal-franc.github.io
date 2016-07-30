---
layout: post
title: Simulating microservices using F# and Suave.io
date: 2016-03-15 02:21
author: LaM
comments: true
categories: [Blog]
---
<p>I have this small hobby project called Overseer. It is a tool used to debug and troubleshoot microservices. I was planning to use it in production, but because that is the only prototype. I decided to use it with simulated services. This way it will be a lot easier to create many different 'test' scenarios.</p>

<p>The current solution for spawning those 'tests services' is implemented in Suave.io and F#. Why these technologies? I just like F# and Suave.io seems like a nice decent framework. <a href="https://github.com/michal-franc/OverSeer/blob/master/OverSeer.Servers/Program.fs">Full code</a> If you can, please review this code. I am not a F# expert and would love to learn how to make it better.</p>

<h3>Test service graph definition</h3>

<p>I want to iterate fast and create different networks of services. I need a simple way of defining the structure of the network. At the moment, I am using an array of tuples with a service name and collection of all the services it depends on. It looks like this.</p>

<pre class="lang:js decode:true " >let listOfServices = [ ("GG.Web.Crowdfunding", "ms", 
     [ "GG.Service.IdentityVerification"; "GG.Service.Project"; "GG.Service.Profile"; "GG.Service.Crm"; "GG.Service.User"; "GG.Service.Project.RiskAnalysis";
        "GG.Imaging.Read"; "GG.Imaging.Write"; "GG.Service.Project.Registration"; "GG.Service.AB";    
        "PayPal";  
     ]);
     ("GG.Service.IdentityVerification", "ms", [    
        "VerifyIntegrity"; "Unfido";"CreditCallService";"PayPal";"GG.Service.User"    
     ]);
]</pre>

<p>This array of tuples is changed to Suave web 'servers' with one endpoint.</p>

<pre class="lang:c# decode:true " >let toTaskMicroServers endpoint =
    Task.Run(fun () -&gt; startWebServer (serverConfig endpoint.port) (app endpoint))
    
let taskList = listOfServices     
               |&gt; createEndpoints
               |&gt; List.map toTaskMicroServers  
               |&gt; List.toArray 
               |&gt; Task.WaitAll

</pre>

<p>The result is a list of Tasks running suave exposing one simple endpoint.</p>

<h3>Endpoint list</h3>

<pre class="lang:c# decode:true " >type EndpointResponse = {
    port : uint16;
    url : string;
    name : string;
    serviceType : string;
    status : bool;
    dependancies : EndpointResponse list
}
</pre>

<pre class="lang:c# decode:true " >let createInitialEndpoints list =
    let startPort = 3000
    list
        // fold used here to increment port
        |&gt; List.fold(fun (array, port) (n, t, d) -&gt; (createEndpoint n t d port)::array, port + 1) ([], startPort)
        // discarding port from tuple as it is not needed
        |&gt; fs</pre>

<p>To create a list of the endpoints, I am using fold function with an accumulator to increment port. Fold is a function that I tend to overuse too much. But in this case, it feels ok. Is there any other way to iterate through something with a maintnance of external state?</p>

<h3>Suave config</h3>

<p>It was a bit tricky as the documentation is not that good. After many try and errors and SO searching, I was able to create simple endpoints. All it does is returning JSON metadata describing 'server' (status, dependencies).</p>

<pre class="lang:c# decode:true " >let app endpoint =
    choose [   
        GET &gt;=&gt; choose  
            [ path "/status/health" &gt;=&gt; MimeJSON &gt;=&gt; setHeader "Access-Control-Allow-Origin" "*" &gt;=&gt; OK (JsonConvert.SerializeObject(endpoint));
              path "/" &gt;=&gt; Redirection.redirect "/status/health" ]  
        ]  </pre>

<h3>Result</h3>

<pre class="lang:js decode:true " >{
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
}</pre>

<p>All the dependencies, links to them, ports are here. This data is then used to create a graph app id d3.js, example.</p>

<p><img src="http://www.mfranc.com/wp-content/uploads/2016/03/graph.png" alt="alt text" title="Sneak peek graph" /></p>

<p>This is still in the making. D3.js is really powerful but quite tricky to use. I am mostly experimenting and there are a lot of 'wow' moments. Kind of feels like winapi programming a long time ago.</p>

<p>The first test was done with 11 services and it 'works'. Wonder how it will cope with 100+ services. That is a topic for a different blog post.</p>

