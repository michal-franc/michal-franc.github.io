---
layout: post
title: F# and Nancy - beyond Hello World
date: 2014-11-24 08:00
author: Michal Franc

comments: true
categories: [Blog]
---
<p lang="pl">
  I have been trying to find some examples on how to create a web app using F# with Nancy. Most of the tutorials on the web cover simple "Hello World!" app, only the basics. In this post, I want to go beyond "Hello World" and show real life examples.
</p>

<h3>F# and Nancy - Where to start ?</h3>

<p>Most basic app "Hello World", is simple.</p>

{% highlight csharp %}
type App() as this =
    inherit NancyModule()
    do
        this.Get.["/"] <- fun _ -> "Hello World!" :> obj
{% endhighlight %}

{% highlight csharp %}
[<EntryPoint>]
let main args =

    let nancy = new Nancy.Hosting.Self.NancyHost(new Uri("http://localhost:" + "8100"))
    nancy.Start()
    while true do Console.ReadLine() |> ignore
    0
{% endhighlight %}


<p>Nancy will automatically load up the App class. To those familiar with Nancy on C# it looks almost the same. The only noticeable difference is the lambda function declaration, plus different syntax for inheritance. Also there is this weird smile face ':>' at the end. This is just a up-casting operator. For some reason Get function has to return object. In F# you also use different syntax for list / array indexing. Instead of Get["/"], you need to use Get.["/"]</p>

<h3>GET Examples</h3>

{% highlight csharp %}
this.Get.["/Fsharp"] <- fun _ -> "I can into F#" :> obj
this.Get.["/Json"] <- fun _ -> this.Response.AsJson([ "Test" ]) :> obj
this.Get.["/Complex"] <- fun _ -> 
     let response = this.Response.AsJson(["This is my Response"])
     response.ContentType <- "application/json"
     response.Headers.Add("Funky-Header", "Funky-Header-Value")
     response :> obj
{% endhighlight %}

<h3>POST</h3>

{% highlight csharp %}
this.Post.["/Post/{test}"] <- fun parameters -> 
      let value = (parameters :?> Nancy.DynamicDictionary).["test"]
      let response = this.Response.AsJson([ sprintf "test %O" value ])
      response :> obj
{% endhighlight %}


<p>To extract the parameters I had to cast the input param, which is of obj type, to Nancy.DynamicDictonary. It doesn't look great but there is other way.</p>

{% highlight csharp %}
this.Post.["/Post/{name}"] <- fun parameters -> 
      let response = this.Response.AsJson([ sprintf "name %O" parameters?name ])
      response :> obj
{% endhighlight %}

<p>How to achieve syntax like that - parameters?name ?</p>

{% highlight csharp %}
let (?) (parameters:obj) param =
    (parameters :?> Nancy.DynamicDictionary).[param]
{% endhighlight %}

<p>This part of code is creating new "let-bound operator". It hides the casting logic and makes the code look cleaner.</p>

<h3>Error Codes</h3>

{% highlight csharp %}
this.Get.["/500"] <- fun _ -> 500 :> obj
this.Get.["/404"] <- fun _ -> 500 :> obj
{% endhighlight %}

<h3>Views</h3>

{% highlight csharp %}
this.Get.["/View"] <- fun _ ->
    this.View.["View.html"] :> obj

{% endhighlight %}


<p>Syntax is simple and looks basically the same as in C#. There is only one little detail. By default Nancy looks for views in /Views folder. Currently in VS F# project there is no way to create folders from within VS. In order to do this I had to manually, create folder, add file and edit *.fsproj file. Hopefully this will be fixed in the future.</p>


{% highlight csharp %}
<None Include="Views/View.html">
  <CopyToOutputDirectory>Always</CopyToOutputDirectory>
</None>

{% endhighlight %}


<p><a href="https://web.archive.org/web/20120116085906/http://cultivatingcode.com/2010/02/12/folders-in-f-projects/">More details</a></p>

<h3>ModelBinding</h3>

<p>In C# syntax, you would normally use the base method Bind<T> to perform the binding. This method is an extension method and in order to have an access to it, I had to include ModelBinding.</p>

<p>The type to bind</p>

<p>And the code to bind to the model.</p>

{% highlight csharp %}
this.Post.["/Model"] <- fun parameters ->
   let model = this.Bind<TestModel>()
   this.Response.AsJson(model) :> obj

{% endhighlight %}

<p>Unfortunately, it won't work like that. My "TestModel" type is missing default parameter-less constructor and Nancy is throwing "No parameter less constructor defined for this object" Exception.</p>

{% highlight csharp %}
type TestModel = 
   val TestValue1:string
   new () = {
      TestValue1 = ""
   }
{% endhighlight %}


<p>There is a constructor, no Exception, but the value is not bound and is always empty. To fix this, I had to go and look through</p>

<p><a href="https://github.com/NancyFx/Nancy/blob/6ceb54daec2dc230ab6fe55b367d3837e262c1db/src/Nancy/ModelBinding/DefaultBinder.cs">Nancy code</a>. By default Nancy is binding to property. My val declaration is not a property.</p>


{% highlight csharp %}
type TestModel() =

   let mutable testValue = ""

   member this.Testvalue1
      with get () = testValue
      and set (value) = testValue <- value

{% endhighlight %}


<p>Syntax for properties is a little different, but nothing serious here. I need to make my value mutable so I can modify the state.</p>

<h3>The Application OnError pipeline</h3>

<p>To modify the Pipeline I had to add include Nancy.Bootstrapper it has IApplicationStartup interface which can be used to hook into OnError pipeline</p>


{% highlight csharp %}
type AppStartup =
    interface IApplicationStartup with 
            member this.Initialize pipelines = 
                pipelines.OnError.AddItemToStartOfPipeline(new Func<NancyContext, exn, Response>(fun ctx _ -> new Response()))
{% endhighlight %}

<p>Nancy will automatically pick-up this class. The syntax for interface implementation is different, a lot. There is no += operator when working with Events and I had to use ADD method. With this example I got an exception "unable to resolve type AppStartup". It was a problem of missing parameter less constructor.</p>

{% highlight csharp %}
type AppStartup() =
    interface IApplicationStartup with 
            member this.Initialize pipelines = 
                pipelines.OnError.AddItemToStartOfPipeline(new Func<NancyContext, exn, Response>(fun ctx _ -> new Response()))

{% endhighlight %}

<h3>The End</h3>

<p>Those examples are not really showing the power of F#. This power lays in domain-business logic, not in simple endpoint declaration. It is also the OOP approach with F# syntax. There are other web frameworks that have more functional approach. You can check</p>

<p><a href="https://github.com/simonhdickson/Fancy">Fancy</a> which is a nice wrapper around Nancy. In a future, I might do a comparison with some purely functional web framework.</p>

