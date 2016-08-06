---
layout: post
title: Good unit test - One Assert
date: 2013-01-09 17:00
author: Michal Franc

comments: true
categories: [Unit Test]
---
In <a href="http://www.mfranc.com/unit-testing/unit-test-code-with-static-method-console-write/">previous post</a>, I defined a good unit test as one that:
<ul>
	<li>tests single unit of work</li>
	<li>contains only one assert</li>
	<li>is self contained</li>
</ul>
<p align="justify">Presented sample of code with one unit test, unfortunately had two asserts. Clear violation of the second rule. One of the fellow bloggers <a href="http://macjedrzejewski.wordpress.com/">MJ</a> pointed out this mistake. It is time to "fix" it and talk about "Only one assert per test" rule.</p>

<h2>Why only One Assert</h2>
There are couple of problems with multiple asserts.
<h3>Unit Test Misinformation</h3>
Frameworks like NUnit do notify about failing unit test when one of the asserts is not met. You get the message that some condition failed, but only this one condition. Code, behind the failing assert, is not executed. In a scenario with multiple asserts, when the first one fails, test procedure is lost and potential problem looks like related to the first assertion check. This is a misinformation.

{% highlight csharp %}
[Test]
public void GenerateDocumentNumber_when_new_document_then_contains_string_new_and_id()
{
  // Arrange
  var newString = "new";
  var id = 10;

  // Act
  var documentNumber = generator.GenerateDocumentNumber(id);

  // Assert
  Assert.That(documentNumber, Is.StringContaining(newString));
  Assert.That(documentNumber, Is.StringContaining(id));
}
{% endhighlight %}

Presented example tests GenerateDocumentNumber function. This function creates simple string based on provided ID.

We want to check if :
<ul>
	<li>document number contains 'id' value</li>
	<li>document number contains keyword 'new'</li>
</ul>
If procedure fails on newString assertion we know that one part of the algorithm doesnt work. The problem is that check for ID wasn't done at all. We don't know if ID is set correctly. Test like this, with multiple asserts, can't be trusted.
<h3>Complicated Tests</h3>
There is another problem with the presented unit test sample. It is too complicated. Unit test has to be focused only on one part of the algorithm. First assertion, checks if there is a 'new' keyword. Second, looks for 'ID'. Both of these scenarios are great candidates for separate test.

Also, part of the code responsible for the 'ID', is probably more general and doesnt apply only to 'new' documents scenario. It is misleading, based solely on the unit test code and the name, we can assume that 'ID' is only added to new documents code.

We can split this test in two:
<ul>
	<li>GenerateDocumentNumber_when_new_document_then_contains_string_new</li>
	<li>GenerateDocumentNumber_contains_id_of_the_document</li>
</ul>
With one assert per unit test mindset there is better chance of creating good unit test, concentrated on one particular problem.

Going back to <a href="http://www.mfranc.com/unit-testing/unit-test-code-with-static-method-console-write/">previous post</a> example.

{% highlight csharp %}
[Test]
public void If_two_chars_return_pass_and_output_coded_pass()
{
   // Arrange
   var stub = new ConsoleWrapperStub(new List
   { ConsoleKey.A, ConsoleKey.B, ConsoleKey.Enter });

   var expectedResult = "AB";
   var expectedConsoleOutput = "**";

   // Act
   var actualResult = Program.GetMaskedInput(string.Empty, stub);

   //Assert     
   Assert.That(actualResult, Is.EqualTo(expectedResult));
   Assert.That(stub.Output,Is.EqualTo(expectedConsoleOutput));
}
{% endhighlight %}

There are three behaviours that we have to test.
<ul>
	<li>output '*' char for each char in provided password</li>
	<li>return password</li>
	<li>ConsoleKey.Enter breaks the procedure</li>
</ul>
'Output char' and 'return password' logic should be tested separaterly. The Enter key functionality is unfortunately more complicated beacuse it is mandatory in each test scenario. However still we can test some edge scenarios like "What happens when there is no Enter key ?"
<h2>One test per concept</h2>
There are of course exceptions and unit tests that could use multiple asserts.

Quote by <a href="http://osherove.com/">Roy Osherove</a> from <a href="http://www.owenpellegrin.com/blog/testing/how-do-you-solve-multiple-asserts/">Yeah it's a blog</a>
<blockquote>
<p align="justify">My guideline is usually that you test one logical CONCEPT per test. you can have multiple asserts on the same *object*. they will usually be the same concept being tested.</p>
</blockquote>
This rule allows multiple asserts but they have to be related and linked with simillar CONCEPT. For instance, this is not bad if multiple asserts are testing something like this.

{% highlight csharp %}
[Test]
public void GetDocuments_returns_list_of_documents()
{
   // Act
   var documents = repository.GetDocuments();

   //Assert     
   Assert.That(documents, Is.Not.Null);
   Assert.That(documents, Is.Not.Empty);
   Assert.That(document[0], Is.Not.Null);
}
{% endhighlight %}

We have three asserts but they are basically testing the same thing. If one of them fails then the rest can't be ulfilled. Fail on the first one automaticlly means that whole test failed and something bad happened. Nothing is hidden.
<h2>Good Unit Test - Summary</h2>
<ul>
	<li>try to use one assert per test</li>
	<li>if there is a need for multiple asserts, remember one test per concept rule</li>
</ul>
<h3>Links</h3>
<a href="http://osherove.com/">Roy Osherove Site</a>

<a href="http://www.owenpellegrin.com/blog/testing/how-do-you-solve-multiple-asserts/">Post with solution to "hide" asserts</a>
