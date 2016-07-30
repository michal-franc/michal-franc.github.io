---
layout: post
title: TDD - commit by commit String Calculator (I)
date: 2014-03-10 08:00
author: LaM
comments: true
categories: [TDD, TDD - String Calculator]
---
<p>In this series I want to share my approach to TDD. I will do a simple TDD kata, sharing with you all my decisions and thoughts. It's called commit by commit beacuse you will find here links to github with each step. There will be a commentary to each one of these. I encourage you to comment and show me the flaws in my "style" of TDD coding. I also want to learn from you. I do know that my approach has its problems and there is allways a way to do something better.</p>

<h3>String Calculator Kata First Kata is quite simple. You can find all the details on the</h3>

<p><a href="http://osherove.com/tdd-kata-1/">Roy Oshevore's site</a>. Just to be brief, I am going to implement string calculator that parses values from the string and sums all of them. For example for an input of "1,2,3" the end result will be "6". This simple kata is a good problem, to present you the way I do approach the coding with TDD. If you don't know the concept of "Coding Kata", no worries, have fun reading this <a href="http://codekata.com/kata/codekata-how-it-started/">blog post by Dave Thomas</a> the guy who coined the term.</p>

<h4>Step I - Empty Project</h4>

<p>Let's start simple with an empty project containing one test class. Yes test class with a default name Class1. Why Class1 ? Right now, I don't want to decide on the naming of the class under test. Also just to start, first lines of code are going to be inside the Test Method. I am not creating class or method, just a code inside the Test Method. Thats one of the approaches, I've learned recently. Start as soon as possible with anything and check all the assumptions about the problem you are trying to solve. Don't waste time over-thinking stuff not related to the problem at hand. I know that as engineers we do have a tendency to be mad about code quality from the start. But let's forget about it for a while and this time do it differently ;) Approach like this is ok for not so overcomplicated and self-contained problems. With more complex stuf, I tend to think about design for a while before I write the code.</p>

<p><a href="http://codemanship.co.uk/parlezuml/blog/?postid=987">You can read more about classic and london school approach to TDD here.</a> Here is a <a href="https://github.com/michal-franc/BlogStuff/commit/32bef5ef7416bd337bf2cce9d20588be0639e1a8">link to the commit</a> with my first step. I will post links like this at the end of the steps.</p>

<h4>Step II - The most obvious string</h4>

<p>First requirement : for input string with numbers separated by ',' return sum of these numbers. I approached TDD previously with tendency to start with tests for edge cases, null checks, exceptions. It is a very tempting approach. You can allways write something fast and make some easy "red/green/refactor happy" points. No, no, no. Start with a solution to The most basic requirement, that way you can check the requirements and the context of the problem before even touching edge cases.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/0ad433b022b131f056c67336881f15a71b314fb4">Simple solution to the first requirement.</a></p>

<pre class="lang:c# decode:true">[Test]
public void ICanParseString_AndSumUpValues()
{
   var input = "1,2,3,4,5";
   var expectedSum = 15;

   var values = input.Split(',');

   var actualSum = values.Select(x =&gt; int.Parse(x)).Sum();

   Assert.That(actualSum, Is.EqualTo(expectedSum));
}</pre>

<p>The code uses Split method on string to get all the values. Values are then parsed and summed up. Beacuse, at this moment I don't care about the edge cases, the "Parse" method is used instead of "TryParse". This is just a start, a first step that will influence next steps. Right now I want to start as simple as possible and prove that solution like this works and I do have a meaningfull result.</p>

<h4>Step III - Introduce Class and Method</h4>

<p>With a simple solution that fullfills the first simple case. I can now create a class with a method.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/8341b36964b192214c246c3189cbc2ee0017b189">Commit</a></p>

<pre class="lang:c# decode:true">public class StringCalculator
{
    public object SumFromString(string input)
    {
       var values = input.Split(',');
       return values.Select(x =&gt; int.Parse(x)).Sum();
    }
}</pre>

<p>This is a start. With class in place I can think of some simple edge cases.</p>

<h4>Step IV - Edge Cases</h4>

<p>The time has come for some edge cases. I can define at least two of these now: - What happens if input is empty or null ? - What to do when input is not formatted correctly ? How to check it ? Lets try to do the first one with empty, null, whitespace input scenario. What to do ? I can treat it as a wrong input throwing an exception ? or just return a zero value hiding the problem. Answer to this hard question is hidden inside the context around your problem. I have to ask a question, How is this code going to be used ? Who is going to call it ?. To keep things simple, I will stick with the return 0 option.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/c1c173a5c1a7aeb3c95f9bf2e2cfe4d717289efb">Commit</a></p>

<pre class="lang:c# decode:true">[Test]
        public void IfInputNullEmptyWhiteSpace_Return_0()
        {
            var input = string.Empty;
            var expectedSum = 0;

            var actualSum = new StringCalculator().SumFromString(input);

            Assert.That(actualSum, Is.EqualTo(expectedSum));
        }</pre>

<p>These is the test. Right now it is failing, to make it green I just added simple if clause. Due to simplicity no code in here</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/3563df620a9edd6f353f1641505c6bfa777ae7d2">just commit link</a>.</p>

<h4>Step V - Next edge case</h4>

<p>What to do when input is not formatted correctly ? How to check it ? I am using split, in this simple form, the code does expect string in a correct format. I am assuming that if I can't parse the string with the split function, then the input string is not correctly formated.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/6233dc9a063bb6b31318e9c0a80f2cc5d776946b">Commit</a></p>

<pre class="lang:c# decode:true">[Test]
public void IfInputNotFormatted_throws()
{
    var input = "1,2,3,4,,,5";

    Assert.Throws&lt;InputStringNotFormatedProperly&gt;(
         () =&gt; new StringCalculator().SumFromString(input));
}</pre>

<p>As you can see the test is expecting custom exception. To be honest. I don't know if the CustomException is needed here, maybe it would be better to just have a FormatException throwed here.</p>

<p><a href="https://github.com/michal-franc/BlogStuff/commit/ee3ebc827ed9ce8a61acc02bfaef4a25a5635ae2">Commit</a></p>

<pre class="lang:c# decode:true">try
{
     var values = input.Split(',');
     return values.Select(x =&gt; int.Parse(x)).Sum();
}
catch (FormatException ex)
{
      throw new InputStringNotFormatedProperly(
         string.Format("Unexpected format input - {0}", input), ex);
}</pre>

<h4>Things To note</h4>

<ul>
<li>all of the code is in one file, there is no need to separate anything, at least right now </li>
<li>my file still has a name of Class1.cs, I don't want to rename it in this early stage. Of course, I have to make sure that this mess won't leak into codebase later.</li>
</ul>

<h4>Summary</h4>

<ul>
<li>don't create class and methods on the start, write stuff inside the test method </li>
<li>start simple with code fulfilling the most basic requirmenet, don't focus on edge cases</li>
</ul>

