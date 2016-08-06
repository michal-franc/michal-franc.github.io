---
layout: post
title: Game programming with F#, C# and SFML - GameLoop
date: 2014-06-24 08:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [f#]
---
I am a F# apprentice. The best way to learn new language is to do some project. That's why I have started to code one game idea that was following me for some time. 

Core concept: 
<ul>
	<li>sci-fi setting</li>
	<li>roguelike</li>
	<li>inspired by:
		<ul>
			<li>dwarf fortress</li>
			<li>prison architect</li>
			<li>cataclysm dda</li>
		</ul>
	</li>
</ul>

Because I don't care about the graphics but the game-play, the graphic I am going to use will be an ASCII styles tile set. You know symbols, characters, letters and some simple graphic, just like in old MUD games.

For graphic layer, I am going to use SFML and it's .NET wrapper. It's quite good and I know a bit about it. In the past I have been using SDL wrapper which was also fine. At the beginning I am mostly going to focus on 2D tile rendering and some ray casting to calculate field of view. I really like the way it's done in Cataclysm DDA, so I ll try to emulate it.

Apart from coding the game and its logic, the most difficult part will be to use F#. I am a little worried about its stateless world. I have heard about monads and how you can manage state with them, but still its going to be difficult for apprentice like me.

To start with something, I have decided to do my first simple game loop and render window.

{% highlight csharp %}
[<EntryPoint>]
let main argv = 

    let mainWindow = new RenderWindow(new VideoMode(600ul, 600ul), "EmptySpace")
    mainWindow.SetFramerateLimit(40ul);
    mainWindow.Closed.AddHandler(fun sender args -> (sender :?> RenderWindow).Close())

    let rec mainLoop() = 
        mainWindow.Clear()
        mainWindow.DispatchEvents()
        mainWindow.Display()

        match mainWindow.IsOpen() with
        | true ->  mainLoop() |> ignore
        | false ->  ()
    
    mainLoop()

    0
{% endhighlight %}
 

Couple of interesting things in this code.

<h4> ":?>" operator </h4>

If I have some class that inherits the System.Object ( Default behavior in .NET ).

":?>" downcast - it will cast Object to Something. This operation is performed on run time.

<blockquote>
The ":?>" operator performs a dynamic cast, which means that the success of the cast is determined at run time. A cast that uses the ":?>" operator is not checked at compile time; but at run time, an attempt is made to cast to the specified type.
</blockquote>

":>" upcast - it will cast Something to Object. This operation is performed on compile time.

<blockquote>
The ":>" operator performs a static cast, which means that the success of the cast is determined at compile time. If a cast that uses ":>" compiles successfully, it is a valid cast and has no chance of failure at run time.
</blockquote>

<a href="http://msdn.microsoft.com/pl-pl/library/dd233220.aspx">More about casting in F# world</a>

<h4>Pattern matching ( F# switch )</h4>
 

{% highlight csharp %}
 
  match mainWindow.IsOpen() with
     | true ->  mainLoop() |> ignore
     | false -> ()

{% endhighlight %}
 

From my understating it's something like a switch but with more powerful options and possibilities. My example is a simple true, false switch.

() is an empty method just to do nothing and stop recurrence.

|> is a pipe lining operator, concept i know from the unix world, ignore is just information that i want to ignore the value that mainLoop() is returning. 

<a href="http://msdn.microsoft.com/pl-pl/library/dd547125.aspx">More about pattern matching</a>

<h4>Recurrent loop - rec keyword</h4>

The Game Loop has to be infinite. In functional approach you don't use loops, like while(true), instead you have to use recurrence. In C# you can just call function from within the function. In F# you can do the same, however you need to mark function with rec keyword ? Why ? The answer is complex and if you want to know it check this <a href="http://stackoverflow.com/questions/3739628/whats-the-reason-of-marking-a-recursive-function-as-rec-in-f">link</a> and this <a href="http://stackoverflow.com/questions/900585/why-are-functions-in-ocaml-f-not-recursive-by-default">one</a>

