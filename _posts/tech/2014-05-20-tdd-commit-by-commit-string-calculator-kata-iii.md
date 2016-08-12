---
layout: post
title: TDD – commit by commit String Calculator Kata (III)
date: 2014-05-20 09:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [tdd]
permalink: /tdd/tdd-commit-by-commit-string-calculator-kata/
---
<p><a href="http://www.mfranc.com/tdd/tdd-commit-by-commit-string-calculator-ii/">Previous post in the series – TDD – commit by commit String Calculator Kata (II)</a> In the previous post I did a cleanup phase and added one feature to the String Calculator. The kata is not finished yet.</p>

<h3>Step VIII - Different Delimiters</h3>

<p>String Calculator should support different delimiters. Previous solution was just a hard-coded hack, still it was good enough solution. There wasn't any requirement that would suggest a need for something more sophisticated. Now I need to modify my main function so it accepts input -</p>

<p><strong>//;\n</strong> where the first line char ';' is delimiter. The test</p>


{% highlight csharp %}
var input = "//;\n1;2;3;4";
var expectedSum = 10;

int actualSum = stringCalculator.SumFromString(input);

Assert.That(actualSum, Is.EqualTo(expectedSum));
{% endhighlight %}


<p><a href="https://github.com/michal-franc/BlogStuff/commit/47865834461f63245609f5a6c1aeabb1b8bd2777">Commit - Parametrized Delimeter Test</a><br />
Just an extension to previous tests and simpliest solution below.</p>


{% highlight csharp %}
var delimeterIndex = input.IndexOf("//");

var delimeters = new List<char>();

if (delimeterIndex >= 0)
{
    delimeters.Add(input[delimeterIndex + 2]);
    input = input.Substring(4);
}
else
{
    delimeters.Add(',');
    delimeters.Add('\n');
}
{% endhighlight %}


<p><a href="https://github.com/michal-franc/BlogStuff/commit/a971acec8552436379c6ec3745bb97fc2f1dbc76">Commit - Parametrized Delimeter Implementation</a><br />
IndexOf just checks if the input string does contains sign of parametrisied delimiter. If that's true, code tries to extract delimiter in a very crude way. List of default delimiters is provided in case of missing parametrisied delimiter. This is hard-coded code, not a beautiful solution but I don't have other requirements. I can assume that I don't have to support anything else. I am assuming that data will be provided in one particular format, that's why solution is pretty naive Still it does work and all the existing tests are green, I don't need anything else.</p>

<h3>Step IX - Clean up</h3>

<p>So now I have a very naive solution. It's time for my favorite part 'The Cleanup'. The main method has some complexity, for the first time. It seems that it has two responsibilities: extracting the delimiters and summing up the values. In order to make this cleaner, I am going to extract those two behaviors into separate methods.</p>

<h4>Extract Delimeters</h4>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/2405afa256d3941ea1c375b482330e518a5c6e2b">Commit: Extract Delimeters</a></p>

<h4>Extract Sum</h4>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/bae9ac101b649790f059d42105125d3bf66266e1">Commit: Sum Method</a></p>


{% highlight csharp %}
var delimeters = ExtractDelimeters(ref input);
return this.ParseSumValues(delimeters, input);
{% endhighlight %}


<p>It's not perfect, but this is just one step. I don't like 'ref' keyword, it's a huge code-smell. This needs to be changed in the 'future'. Another problem is that the 'ExtractDelimeters' function is returning 'List' collection. This is also a code smell, especially when I am only using this list to enumerate through its values. Why then provide type of List, if I am not using its functions like Sort, Add ? There is even a better question, shouldn't I restrict the user of code and communicate to him that this collection should only be used to enumerate ?. I am going to change it to IEnumerable.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/63cc1aeacbe64e3e6b60a9479341f42b8ce21895">Refactor: List to IEnumerable</a><br />
So that was the final cleanup, no revolutions here. Still, same creepy code that is haunting my eyes. More changes will come naturally with new requirements.</p>

<h3>Step X - Negative Values</h3>

<p>Next requirement, all the negative values are not supported and I need to throw exception with all the negative values.</p>


{% highlight csharp %}
[Test]
 public void Negative_values_not_supported_throws()
 {
    var calculator = new StringCalculator();
    var value = "1,2,-3,-4";

    var ex = Assert.Throws<ArgumentException>(() => calculator.SumFromString(value));
    Assert.That(ex.Message, Is.EqualTo("values '-3,-4' not supported"));
 }
{% endhighlight %}


<p><a href="https://github.com/michal-franc/BlogStuff/commit/99a89842834d7d1be63e3c5a0e43b6f30ba6b3b3">Commit - Test negative values</a><br />
Another iteration of previous tests. In order to keep the test simple, I am not using the parametrisied delimiters.</p>


{% highlight csharp %}
 int.Parse(x));

 var negativeValues = values.Where(x => x < 0);

 if (negativeValues.Any())
 {
     throw new ArgumentException(string.Format("values '{0}' not supported", string.Join(",", negativeValues)));
 }

 return values.Sum();
{% endhighlight %}


<p><a href="https://github.com/michal-franc/BlogStuff/commit/b825538bb0edef7cdd1588e434b722e3f61199c9">Commit - negative values implementation</a><br />
I had to move 'int.Parse' step so i could enumerate through the parsed values instead of raw strings. With this I can just collect all the negative values and throw an exception if there are any. Little note, I am using 'Any()' instead of 'Count() > 0' with IEnumerables. Count needs to enumerate whole list, any will stop on first matching element. It also looks better.</p>

<p>Question: 
-   Are you a fan of 'Count() > 0' or 'Any()' ?</p>

