---
layout: post
title: Akka.NET simple example with Github Api
date: 2015-04-27 09:00
author: Michal Franc 
comments: true
categories: [Tech]
tags: [akka, .net]
permalink: /uncategorized/akka-net-simple-example-with-github-api/
---
<p>In this post I want to a simple introduction to Akka.NET using an example app based on Github API. I have been diving into Akka.NET lately. My first encounter with this technology was on <a href="https://vaughnvernon.co/">Vaughn Vernon</a> workshop in Krakow. The main event had a couple of side presentation and one of them was about <a href="http://akka.io/">Akka project in Java world</a>. It was a magic to me. Couple years later, I accidentally found ( probably on twitter ) <a href="http://bartoszsypytkowski.com/blog/2014/07/09/fsharp-akka-map-reduce/">Bartosz Sypytkowski</a> blog and decided that now is the time to learn something about it.</p>

<blockquote>
  <p><a href="http://akka.io/">Akka is a toolkit and runtime for building highly concurrent, distributed, and resilient message-driven applications on the JVM. The power of Akka is also available on the.NET Framework and Mono via the Akka.Net project.</a> It is achieved thanks to actor model pattern. 
  <a href="http://en.wikipedia.org/wiki/Actor_model">The actor model in computer science is a mathematical model of concurrent computation that treats "actors" as the universal primitives of concurrent computation: in response to a message that it receives, an actor can make local decisions, create more actors, send more messages, and determine how to respond to the next message received. The actor model originated in 1973.</a><a href="http://www.slideshare.net/drorbr/the-actor-model-towards-better-concurrency">More info on actor model.</a></p>
</blockquote>

<p>Where, I have started with Akka : 
*   http://akka.io/
*   http://getakka.net/
*   Akka.NET BootCamp - https://petabridge.com/bootcamp/ ( highly recommended )
*   Github - https://github.com/akkadotnet/akka.net</p>

<h4>Example - Github commit counter</h4>

<p>As with all the technical learning, the best way to do it is through example projects. I had couple of ideas and have decided to got with a simple app for counting commits in all the repos on Github. It's straightforward, simple and I can use a non-complicated hierarchy of actors to achieve that. There are many examples on how to use Github Api, I won't go into details here. I am gonna use</p>

<p><a href="https://github.com/octokit/octokit.net">Octokit - nuget package</a> which is a official SDK for Github in .NET. This package provides nice and easy to use GitHub client.</p>


{% highlight csharp %}
var login = "michal-franc";
var github = new GitHubClient(new ProductHeaderValue("AkkaCounter"), new InMemoryCredentialStore
             (new Credentials("hidden_number")));
{% endhighlight %}


<p>hidden_number - has to be generated on your GitHub profile config page, there is also a possibility to call GitHub using anonymous user. However, with the latter option, keep in mind that this is only for testing and there is very small request limit of</p>

<p><a href="https://developer.github.com/v3/#rate-limiting">60 per hour compared to 5000 per hour for authenticated user</a>. Using Octokit I can create a github-client what can be used to easily get all the commits for the public repos.</p>


{% highlight csharp %}
public class GithubApi
{
   [Test]
   public async void CountCommitsSimpleTest()
   {
     var sw = new Stopwatch();

     var github = new GitHubClient(new ProductHeaderValue("AkkaCounter"), new InMemoryCredentialStore
     (new Credentials("hidden_number")));

     var repos = await github.Repository.GetAllForUser("michal-franc");

     var countCommits = 0;

     foreach (var repository in repos)
     {
        var commits = await github.Repository.Commits.GetAll(repository.Owner.Login, repository.Name);
        countCommits = countCommits + commits.Count;
     }

     sw.Stop();

     Console.WriteLine("Time it took to get the data - " + sw.ElapsedMilliseconds);

      Console.WriteLine(countCommits);
     }
}
{% endhighlight %}


<ul>
<li>line 11 - getting all the public repos using GitHub client for my user.</li>
<li>line 15 - getting through all the repos and getting the commits count</li>
<li>line 25 - displaying the final number of commits Full procedure takes around </li>
</ul>

<p><strong>100458 ms ~ 1.66 minute</strong>. Quite long, considering it's somehow a simple task + all the hard work is done on the Github side. How to make it faster then? The main problem here is the server response time. I am sequentially asking the server to get all the commits for single repo. Because the 'number crunching' happens on the server side, the github client is waiting for the response. This wait time is wasted. Instead of this approach, I could make multiple requests. That for sure will speed things up. It could be done with threads but this blog post is about Akka so lets do this using actor. The pseudo code for the new solution. 
*   Create one actor that does a request for all the public repos associated to my user.
*   For each repo create a child actor that will do request getting all the commits.
*   All the child actors will inform the parent actor about the number of commits in the repo.
*   Count the number of commits received by the main Actor.</p>

<p><img src="http://www.mfranc.com/wp-content/uploads/2015/04/Actors-graph.png" alt="Graph of Actors" /></p>

<h4>The Code</h4>


{% highlight csharp %}
public static void Main(string[] args)
{
   var actorSystem = ActorSystem.Create("main");

   var githubRepoActor = actorSystem.ActorOf(Props.Create(() => new MainGithubRepoActor()), "ReporeadingActor");

   githubRepoActor.Tell(null);

   actorSystem.AwaitTermination();
}
{% endhighlight %}


<ul>
<li>line 3 - <a href="http://getakka.net/wiki/ActorSystem">ActorSystem</a> is a root for all the stuff related to actors. It does a lot of different tricks behind the scenes and its something like a base actor for all the other actors.</li>
<li><p>line 5 - Creation of MainGithubRepo. Never ever create actors using 'new', always use ActorSystem or Context ( from withing the other actor ). Props object is a concept of a blueprint with instructions on how to create actors. In this scenario, it is just a boilerplate code but Props can be used to share actor specification across different ActorSystems, this system can even be on some other machine. It's a concept similar to DockerFile or VagrantFile. 'ReporeadingActor' parameter is a name for my main Actor. Always name your actors accordingly.</p>

<ul>
<li>line 7 - To start actor, I need to send a message to him. I am sending null because this actor doesn't support any customized command. You can image here a list of commands like 'start', 'stop' that could be used to control the actor.</li>
<li>line 9 - Await Termination will block main thread until all the actors have terminated.</ul> </li>
</ul>

<h4>Repo Reader</h4>


{% highlight csharp %}
public class MainGithubRepoActor : ReceiveActor
{
public MainGithubRepoActor()
{
    ActorRef notifyActor = Context.ActorOf(Props.Create(() => new WritetToConsoleActor()));

    ActorRef comitCounterActors = Context.ActorOf(Props.Create(() => new CountCommitsActor())
                                  .WithRouter(new RoundRobinPool(20)), "CommitCounters");

    var github = new GitHubClient(new ProductHeaderValue("AkkaCounter"), new InMemoryCredentialStore(new Credentials("hidden_number")));

    var repos = github.Repository.GetAllForUser("michal-franc").Result;

    notifyActor.Tell(new NotifyUserMessage(string.Format("Found {0} repos.", repos.Count)));

    foreach (var repository in repos)
    {
        comitCounterActors.Tell(new CountCommitsForRepo(repository.Name));
    }

    var countedCommits = 0;

    this.Receive(x =>
    {
        countedCommits += x;
        notifyActor.Tell(new NotifyUserMessage(string.Format("Received {0} commits count.\r\n CurrentCount : {1}", 
                            x, countedCommits)));
    });
}
}
{% endhighlight %}


<ul>
<li>line 1 - This Actor inherits from ReceiveActor. This is a special kind of actor that has a nice 'this.Receive' convention to write its logic. There are of course all the different types of actors.<a href="http://getakka.net/wiki/ReceiveActor">More info on Receive Actor</a></li>
<li><p>line 3 - for ReceiveActor, all the logic is implemented in constructor.</p>

<ul>
<li>line 5 - The first thing to do is to define child actors. One of them is 'WriteToConsoleActor'. This a special actor that just writes the messages to the console. It is potentially unnecessary logic but just to show some general idea I have it here. I could create a list of different actors that write messages to different places.</li>
<li>line 7 - Then I create commit reading actors. I want to create one actor per repo. My Github account currently has 31 public repos. In here, instead of creating one Actor, I am creating a collection of 20 Actors.</li>
<li>I used ActorRef in the code instead var to show what is ActorRef and what is created when creating Actors. No matter of what type of actor you create and it doesn't matter if its a single actor or a collection the result is always ActorRef. This is an object that is close to the concept of 'pointer'. The main Actor parent doesn't have to know what is behind the ActorRef he is just sending messages and awaits a response, from something behind 'pointer'. This is a very awesome way to handle this. This ActorRef can also point to different machine / server. A neat abstraction.</li>
<li>line 18 - I am getting all the rep then seosnd a message to ActorRef. As you can see the parent doesn't care what will happen with the message and what's behind it.</li>
<li>line 26 - At the end I am awaiting responses of type int. My commit reading actors will notify this parent back with a number. Those numbers are then counted and there is the result.</ul> </li>
</ul>

<h4>WriteToConsoleActor</h4>


{% highlight csharp %}
public class WritetToConsoleActor : ReceiveActor
{
public WritetToConsoleActor()
{
Receive(x => Console.WriteLine(x.Message));
}
}
{% endhighlight %}


<p>This is a simple actor that just writes the received messages to console. NotifyUserMessage is just a dto with Message property.</p>

<h4>Commit Counter</h4>


{% highlight csharp %}
public class CountCommitsActor : ReceiveActor
{
public CountCommitsActor()
{
var login = "michal-franc";
var github = new GitHubClient(new ProductHeaderValue("AkkaCounter"), 
           new InMemoryCredentialStore(new Credentials("hidden_number")));

this.Receive(x =>
{
 var commits = github.Repository.Commits.GetAll(login, x.RepoName).Result;
 this.Sender.Tell(commits.Count);
});
}
}
{% endhighlight %}


<p>Commit counter just gets the list of comments, then sends the parent the number of commits. Using Akka counting commits took -</p>

<p><strong>0&#46;72 minutes</strong>. This example is simple and there are all the different problems and quirks with it. For instance: - What will happen if there is a connection issue? - What will happen if I will use my request limit in github api? - How to handle some orchestration? Those and other problems I will describe in another post. For now, this is a simple example that I used to start exploring the Akka world. This technology is quite promising and I am happy that awesome team lead by created it. Thanks to that I don't have to learn Scala to use it.</p></li>
</ul></li>
</ul>

