---
layout: post
title: TDD – commit by commit String Calculator Kata (II)
date: 2014-04-02 07:00
author: LaM
comments: true
categories: [TDD, TDD - String Calculator]
---
<p>The previous post in the series - <a href="http://www.mfranc.com/tdd/tdd-commit-by-commit-string-calculator-i/">TDD commit by commit String Calculator (I)</a>. Last part ended with the basic functionality of string calculator. My "class" can parse numbers and sum them up. I have started with an empty project, slowly adding code with features. This post is the 2nd part of the series.</p>

<h3>Step VI - Clean up</h3>

<p>Before I can start adding new stuff, I need to make a little re-factorization. There are a couple of issues in the code.</p>

<pre class="lang:c# decode:true ">public class StringCalculator
{
   public object SumFromString(string input)
   {
      if (string.IsNullOrWhiteSpace(input)) return 0;

      try
      {
         var values = input.Split(',');
         return values.Select(x =&gt; int.Parse(x)).Sum();
      }
      catch (FormatException ex)
      {
        throw new InputStringNotFormatedProperly(string.Format("Unexpected format input - {0}", input), ex);
      }
   }
}</pre>

<h4>R#, var and other fun</h4>

<p>One of the issue, thanks to <a href="http://pawel.sawicz.eu/">Pawel Sawicz</a> for pointing this out, is the type of "object" returned by the main function. There is an "object type" instead of "int". This problem, probably, was caused by R# auto method extraction (that's one of the reasons why I have disabled R# for a while just to check how it affects my work. Blog post about my observations coming soon). Sadly, This issue wasn't caught by the unit tests, I am not asserting the expecting "type" just the "value". This problem is related to the excessive "var" keyword usage. With explicit "int" instead of "var", there would be an error on compilation. This error is also an assertion, that's why I think it is beneficial to use explicit types on the expected "object / value".</p>

<h4>Class name + one file</h4>

<p>I also noticed that the main class name is "Class1.cs". Well, what can I say, not a good file-name, when I started implementing features this wasn't a problem but now when I do know the name of my main class, I don't see a reason to leave it like this. It's time to rename the file to match the "class name". With this change in mind, it would be also great to split up the file into multiple files. One big file with code is a big "NO NO". I don't want to see the Custom exception or other not-relevant code, especially when I know that it won't be modified in the foreseeable future. Little note. I am not introducing a new project for tests 'Yet'.</p>

<h4>Test first - first class citizen</h4>

<p>The quality of the tests could also be slightly better. Right now each test contains code to create "new StringCalculator()". It's not that problematic but it creates an unwanted noise that distorts the readability of code. Unit test has to be clean, readable and easy to follow. I do believe in an idea of treating unit tests as "First Class Citizens".</p>

<blockquote>
  <p>"The bottom line of all this is that we should consider our tests as being first. We already know we should write them first; but we should also clean them first, maintain them first, think of them first, and keep them first. We should give our tests the highest priority. That is what "Test First" really means. The Tests Come First!" <a href="http://blog.8thlight.com/uncle-bob/2013/09/23/Test-first.html">Robert C Martin - http://blog.8thlight.com/uncle-bob/2013/09/23/Test-first.html</a></p>
</blockquote>

<p>This is quite radical, I don't agree with everything said here, but there is one thought that I do like. Take care of your tests, maintain them, clean and re-factor them. They are the description and the best documentation you have. After this "brief" introduction time for some code changes.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/3b7141bac1c533d6cb377a0d3c6388c1f70f4d14">Commit - test cleanup</a><br />
I have changed the "expected" value declaration from var to int and automatically compilation error popped up. Now, I can change the "value type" and check if the error is gone and a test is passing. Also, I have changed the name of the Test Class, but I am not splitting files yet. I don't want to create noise and bloat up the commit diff. I introduced the "SetUp" function that is responsible for creating the instance of "StringCalcualtor".</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/cff5261ddb30c6fbacf3a8d7c8da2e160e536a12">Commit - split file</a><br />
Finally, the split is finished and I am happy ;)</p>

<h3>Step VII - Newline character as deli-meter</h3>

<p>The new requirement, allow the new lines between the number (instead of commas). Treat them as deli-meters. Simple example: for input "1\n2,3\n4", calculator should return "10".</p>

<pre class="lang:c# decode:true">[Test]
public void Newline_character_treated_as_delimeter()
{
    var input = "1\n2,3\n4";
    var expectedSum = 10;

    int actualSum = stringCalculator.SumFromString(input);

    Assert.That(actualSum, Is.EqualTo(expectedSum));
}</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/b8eed2dea2b2f2d3a6f1a2612e18d6df2dd4e753">Commit - Newline character test</a><br />
The test is pretty straightforward, nothing to explain here. This now throws my custom exception, the input is not correct due to the "\n" characters.</p>

<pre class="lang:c# decode:true">var values = input.Split(',','\n');</pre>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/705dc92b91e3c9df4a4eab8c7e2438c73fd68504">Commit - Newline character test</a><br />
Implementation is very simple. Do I need to create fancy code with "sparkles"? Not for this requirement. The split function accepts more separators and it's just "Good Enough". Can I refactor the code and tests? I don't think so. The code is still quite straightforward. In this part, I just implemented one new feature.</p>

<p>Summary: 
-   on expected value use explicit "type" instead of "var", the compilation error is your friend
-   refactor your code and tests, "Test First" and treat your "Tests as First class citizens"
-   create "Good enough" software, don't overcomplicate solutions.</p>

