---
layout: post
title: F# where to start
date: 2014-06-10 08:00
author: Michal Franc

comments: true
categories: [Blog]
---
<p>I have started learning F# again, thanks to @isaac_abraham and his great presentation in my company. This time hopefully, I will move past the "WTF", barrier and move to "AHA" moment. I am ready to finally start serious F# learning with couple of milestones like: project euler, tool, web-app, complex project. I will try to document whole process on the blog. I want to force myself and learn new functional paradigm. Hopefully it will give me a new way to look at problems and solutions for them. To this day I have spent most of the time in OO world, meh, it gets boring, really. I might also get a chance to do something cool with F# for my company. Me and 3 of my coworkers, we are trying to explore together DDD with F# and find a better way to model our code/ To start somewhere, I was given a link to a great site with a list of advices <a href="http://fsharpforfunandprofit.com/learning-fsharp/">http://fsharpforfunandprofit.com/learning-fsharp/</a> Do's and Don'ts section is very helpful. You can consider this as "House rules" constraining you with a form of "force yourself to think differently".</p>

<h3>Project Eueler 1 As usual, when I don't know where to start with new language I go to</h3>

<p><a href="https://projecteuler.net/">Project Euler site</a>. I am thinking about doing 10 problems just to get a hold on the syntax and features.</p>

<blockquote>
  <p>If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9. The sum of these multiples is 23. Find the sum of all the multiples of 3 or 5 below 1000. The first problem it's not that hard. You can do it by a brute force loop. there is also a better solutions that has lower complexity. My solution is just a loop.</p>
</blockquote>


{% highlight csharp %}
let ismultiplier div x = (x % div) = 0

let numbers = seq { for n in 0 .. 999 do if (ismultiplier 5 n || ismultiplier 3 n) then yield n  }

let euler1 = Seq.sum numbers
{% endhighlight %}


<p>I like the syntax, it looks really nice. 1st : I am declaring new function 'ismultiplier'. 2nd : I am creating a sequence with filter in form of if. From my understating sequence is similar concept to a loop over some elements but its being lazy loaded. The data is created on the fly, while code iterates through it. 3rd : I am using Seq method to sum up the yielded values. This is a simple algorithm, it won't be enough to learn F# properly. That's when some practical project will come in. It's still planned, I have couple of ideas. It has to be something useful and complex enough project so can I learn how to structure code properly and how to use OOP inside F# world.</p>

<h4>Twitter</h4>

<p><a href="https://twitter.com/ScottWlaschin">@ScottWlaschin</a> - his great presentation convinced me even more that F# is the language I WANT to learn. <a href="https://twitter.com/isaac_abraham">@isaac_abraham</a> - F# MVP, Issac's presentation create first ripple that forced me to consider F# again. <a href="https://twitter.com/eulerfx">@eulerfx</a></p>

<h4>Blogs</h4>

<p><a href="http://gorodinski.com/">http://gorodinski.com/</a> <a href="http://fsharpforfunandprofit.com">http://fsharpforfunandprofit.com/</a> <a href="http://cockneycoder.wordpress.com/">http://cockneycoder.wordpress.com/</a></p>

<h4>Talks</h4>

<p><a href="http://vimeo.com/channels/ndc2014/page:9">Railway Oriented Programming</a> - unfortunately there is no direct link <a href="https://skillsmatter.com/skillscasts/4971-domain-driven-design-with-scott-wlaschin">Domain Driven Design, F# and Types</a> - Beautifully explained how you can leverage F# to model your domain. <a href="https://www.youtube.com/watch?v=MHvr71T_LZw">Domain-Driven Design, Event Sourcing and CQRS with F# and EventStore</a></p>

<h4>Last Minute @ScottWlaschin created a nice list of all the talks from NDC Oslo 2014 that are touching the functional programming paradigm. Thanks Scott</h4>

<p><a href="https://gist.github.com/swlaschin/269faaf27c405a808064">NDC Fp Track</a></p>

<h4>Questions - Have you tried any functional language before ? What do you think about them ? - I need some advice's on how to approach this language and paradigm, any tips ?</h4>

