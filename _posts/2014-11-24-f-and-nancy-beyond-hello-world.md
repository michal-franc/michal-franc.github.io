---
layout: post
title: F# and Nancy - beyond Hello World
date: 2014-11-24 08:00
author: LaM
comments: true
categories: [Blog]
---
<p lang="pl">
  I have been trying to find some examples on how to create a web app using F# with Nancy. Most of the tutorials on the web cover simple "Hello World!" app, only the basics. In this post, I want to go beyond "Hello World" and show real life examples.
</p>

<h3>F# and Nancy - Where to start ?</h3>

<p>Most basic app "Hello World", is simple.</p>

<pre class="lang:c# decode:true">type App() as this =
    inherit NancyModule()
    do
        this.Get.["/"] &lt;- fun _ -&gt; "Hello World!" :&gt; obj</pre>

<pre class="lang:c# decode:true">[&lt;EntryPoint&gt;]
let main args =

    let nancy = new Nancy.Hosting.Self.NancyHost(new Uri("http://localhost:" + "8100"))
    nancy.Start()
    while true do Console.ReadLine() |&gt; ignore
    0</pre>

<p>Nancy will automatically load up the App class. To those familiar with Nancy on C# it looks almost the same. The only noticeable difference is the lambda function declaration, plus different syntax for inheritance. Also there is this weird smile face ':>' at the end. This is just a up-casting operator. For some reason Get function has to return object. In F# you also use different syntax for list / array indexing. Instead of Get["/"], you need to use Get.["/"]</p>

<h3>GET Examples</h3>

<pre class="lang:c# decode:true">this.Get.["/Fsharp"] &lt;- fun _ -&gt; "I can into F#" :&gt; obj
this.Get.["/Json"] &lt;- fun _ -&gt; this.Response.AsJson([ "Test" ]) :&gt; obj
this.Get.["/Complex"] &lt;- fun _ -&gt; 
     let response = this.Response.AsJson(["This is my Response"])
     response.ContentType &lt;- "application/json"
     response.Headers.Add("Funky-Header", "Funky-Header-Value")
     response :&gt; obj</pre>

<h3>POST</h3>

<pre class="lang:c# decode:true ">this.Post.["/Post/{test}"] &lt;- fun parameters -&gt; 
      let value = (parameters :?&gt; Nancy.DynamicDictionary).["test"]
      let response = this.Response.AsJson([ sprintf "test %O" value ])
      response :&gt; obj</pre>

<p>To extract the parameters I had to cast the input param, which is of obj type, to Nancy.DynamicDictonary. It doesn't look great but there is other way.</p>

<pre class="lang:c# decode:true " >this.Post.["/Post/{name}"] &lt;- fun parameters -&gt; 
      let response = this.Response.AsJson([ sprintf "name %O" parameters?name ])
      response :&gt; obj</pre>

<p>How to achieve syntax like that - parameters?name ?</p>

<pre class="lang:c# decode:true " >let (?) (parameters:obj) param =
    (parameters :?&gt; Nancy.DynamicDictionary).[param]
</pre>

<p>This part of code is creating new "let-bound operator". It hides the casting logic and makes the code look cleaner.</p>

<h3>Error Codes</h3>

<pre class="lang:c# decode:true " >this.Get.["/500"] &lt;- fun _ -&gt; 500 :&gt; obj
this.Get.["/404"] &lt;- fun _ -&gt; 500 :&gt; obj</pre>

<h3>Views</h3>

<pre class="lang:c# decode:true " >this.Get.["/View"] &lt;- fun _ -&gt;
    this.View.["View.html"] :&gt; obj
</pre>

<p>Syntax is simple and looks basically the same as in C#. There is only one little detail. By default Nancy looks for views in /Views folder. Currently in VS F# project there is no way to create folders from within VS. In order to do this I had to manually, create folder, add file and edit *.fsproj file. Hopefully this will be fixed in the future.</p>

<pre class="lang:c# decode:true " >&lt;None Include="Views/View.html"&gt;
  &lt;CopyToOutputDirectory&gt;Always&lt;/CopyToOutputDirectory&gt;
&lt;/None&gt;
</pre>

<p><a href="https://web.archive.org/web/20120116085906/http://cultivatingcode.com/2010/02/12/folders-in-f-projects/">More details</a></p>

<h3>ModelBinding</h3>

<p>In C# syntax, you would normally use the base method Bind<T> to perform the binding. This method is an extension method and in order to have an access to it, I had to include ModelBinding.</p>

<pre class="lang:c# decode:true " >open Nancy.ModelBinding</pre>

<p>The type to bind</p>

<pre class="lang:c# decode:true " >type TestModel = { TestValue1:string }</pre>

<p>And the code to bind to the model.</p>

<pre class="lang:c# decode:true " >this.Post.["/Model"] &lt;- fun parameters -&gt;
   let model = this.Bind&lt;TestModel&gt;()
   this.Response.AsJson(model) :&gt; obj
</pre>

<p>Unfortunately, it won't work like that. My "TestModel" type is missing default parameter-less constructor and Nancy is throwing "No parameter less constructor defined for this object" Exception.</p>

<pre class="lang:c# decode:true " >type TestModel = 
   val TestValue1:string
   new () = {
      TestValue1 = ""
   }</pre>

<p>There is a constructor, no Exception, but the value is not bound and is always empty. To fix this, I had to go and look through</p>

<p><a href="https://github.com/NancyFx/Nancy/blob/6ceb54daec2dc230ab6fe55b367d3837e262c1db/src/Nancy/ModelBinding/DefaultBinder.cs">Nancy code</a>. By default Nancy is binding to property. My val declaration is not a property.</p>

<pre class="lang:c# decode:true " >type TestModel() =

   let mutable testValue = ""

   member this.Testvalue1
      with get () = testValue
      and set (value) = testValue &lt;- value
</pre>

<p>Syntax for properties is a little different, but nothing serious here. I need to make my value mutable so I can modify the state.</p>

<h3>The Application OnError pipeline</h3>

<p>To modify the Pipeline I had to add include Nancy.Bootstrapper it has IApplicationStartup interface which can be used to hook into OnError pipeline</p>

<pre class="lang:c# decode:true " >type AppStartup =
    interface IApplicationStartup with 
            member this.Initialize pipelines = 
                pipelines.OnError.AddItemToStartOfPipeline(new Func&lt;NancyContext, exn, Response&gt;(fun ctx _ -&gt; new Response()))
</pre>

<p>Nancy will automatically pick-up this class. The syntax for interface implementation is different, a lot. There is no += operator when working with Events and I had to use ADD method. With this example I got an exception "unable to resolve type AppStartup". It was a problem of missing parameter less constructor.</p>

<pre class="lang:c# decode:true " >type AppStartup() =
    interface IApplicationStartup with 
            member this.Initialize pipelines = 
                pipelines.OnError.AddItemToStartOfPipeline(new Func&lt;NancyContext, exn, Response&gt;(fun ctx _ -&gt; new Response()))
</pre>

<h3>The End</h3>

<p>Those examples are not really showing the power of F#. This power lays in domain-business logic, not in simple endpoint declaration. It is also the OOP approach with F# syntax. There are other web frameworks that have more functional approach. You can check</p>

<p><a href="https://github.com/simonhdickson/Fancy">Fancy</a> which is a nice wrapper around Nancy. In a future, I might do a comparison with some purely functional web framework.</p>

