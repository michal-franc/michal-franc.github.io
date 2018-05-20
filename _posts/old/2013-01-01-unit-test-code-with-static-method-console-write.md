---
layout: post
title: Unit Test code with static method Console.Write
date: 2013-01-01 16:47
author: Michal Franc
comments: true
categories: [Tech]
tags: [tdd]
permalink: /unit-testing/unit-test-code-with-static-method-console-write/
---
<strong>tl;dr : Wrap theses methods inside the layer of abstraction. Then create a stub and use it to create test scenarios.</strong>
<p>This post is based on my <a href="http://stackoverflow.com/a/13967995/104135">answer on the Stack Overflow - "How to unit test this function?"</a></p>
<p>The original question is about writing unit test for a code that uses Console methods inside its body. This problem is more general and in this post, I want to show one of the ways to unit test code with static method.</p>

<h2>Example of code with static methods</h2>
<p>This example is from the Stack Overflow question.</p>


{% highlight csharp %}
public static string GetMaskedInput()
{
    string pwd = "";
    ConsoleKeyInfo key;
    do
    {
        key = Console.ReadKey(true);
        if (key.Key != ConsoleKey.Backspace &amp;&amp; key.Key != ConsoleKey.Enter)
        {
            pwd += key.KeyChar;
            Console.Write("*");
        }
        else
        {
            if (key.Key == ConsoleKey.Backspace &amp;&amp; pwd.Length > 0)
            {
                pwd = pwd.Substring(0, pwd.Length - 1);
                Console.Write("\b \b");
            }
        }
    }
    while (key.Key != ConsoleKey.Enter);
    return pwd;
}
{% endhighlight %}

<h3>Little Explanation</h3>
Method GetMaskedInput() does two things. 

<ul>
	<li>Whenever your press a key it shows you a '*' char</li>
	<li>All the keys are also appended to the string and returned</li>
</ul>

<p>It's a simple implementation of the hidden input. Something like a password text box on login screens.</p>

<h2>Whats wrong with static method ?</h2>

<p>This sample method is highly dependant on the Console.ReadKey and Console.Write methods. Code like this is only usable when we have access to console. Running it in for instance web.app enviroment would be problematic. This is one of the reasons that static methods are evil. Not like famous "goto", beacuse there are scenarios in which statics are ok.</p>

<ul>
	<li>extension methods</li>
	<li>simple helpers with input, output contained in the scope of the function (no globals, external dependancies )</li>
</ul>

<p>Use of static methods seems like an easier solution, but in the long run, code written like this becomes problematic. It's simple, clear and easy, but when you want to write unit test there is a problem. You are not able to write correct unit test for it.</p>
<h3>What's the correct unit test ?</h3>
<ul>
	<li>it has to test unit of work</li>
	<li>contains only one assert</li>
	<li>most important it is self contained</li>
</ul>
<p>With static methods like Console.ReadKey and Console.Write you can't do it. These methods are dependant on the Windows Console implementation. We can't control this behaviour, we don't know exactly how it works inside. What we can do is to get rid of them.</p>

<h2>Getting rid of static method</h2>
<p>In this approach, I will show you how to hide "static" methods behind a layer of abstraction. Instead of using Console methods directly, let us inject some class that uses Console.</p>

<h3>New Method</h3>

{% highlight csharp %}
public static string GetMaskedInput(IConsoleWrapper consoleWrapper)
{
    string pwd = "";
    ConsoleKeyInfo key;
    do
    {
        key = consoleWrapper.ReadKey(true);
        if (key.Key != ConsoleKey.Backspace &amp;&amp; key.Key != ConsoleKey.Enter)
        {
            pwd += key.KeyChar;
            consoleWrapper.Write("*");
        }
        else
        {
            if (key.Key == ConsoleKey.Backspace &amp;&amp; pwd.Length > 0)
            {
                pwd = pwd.Substring(0, pwd.Length - 1);
                consoleWrapper.Write("\b \b");
            }
        }
    }
    while (key.Key != ConsoleKey.Enter);
    return pwd;
}
{% endhighlight %}

<h3>Interface definition</h3>

{% highlight csharp %}
public interface IConsoleWrapper
{
    ConsoleKeyInfo ReadKey();
    void Write(string data);
}
{% endhighlight %}

<p>The sample method now have one parameter. This parameter is an interface IConsoleWrapper that has two methods. Their name is similar to the methods provided by the console Class. New code now calls the IConsoleWrapper interface. It doesn't need to know implementation details.</p>

<h3>Interface implementation</h3>

{% highlight csharp %}
public class ConsoleWrapper : IConsoleWrapper
{
    public ConsoleKeyInfo ReadKey()
    {
        return Console.ReadKey(true);
    }

    public void Write(string data)
    {
        Console.Write(data);
    }
}
{% endhighlight %}


<p>The implementation of Console is now hidden. It was done by wrapping the static methods inside a class that can now be injected to the GetMaskedInput method.</p>

<p>We are able now to write unit test for the code.</p>

<h2>Unit Test Example with Stub</h2>
<p>In order to test this code, we can create a stub that implements the IConsoleWrapper interface. This stub will just simulate Console. We can control it's behaviour and thus create a stable test scenarios.</p>

<h3>Test Stub</h3>

{% highlight csharp %}
public class ConsoleWrapperStub : IConsoleWrapper
{
    private IList keyCollection;
    private int keyIndex = 0;

    public ConsoleWrapperStub(IList keyCollection)
    {
        this.keyCollection = keyCollection;
    }

    public string Output = string.Empty;

    public ConsoleKeyInfo ReadKey()
    {
        var result = keyCollection[this.keyIndex];
        keyIndex++;
        return new ConsoleKeyInfo( (char)result ,result ,false ,false ,false);
    }

    public void Write(string data)
    {	
        Output += data;
    }
}
{% endhighlight %}


<p>
This stub simulates Write method by maintaing the Output variable. It's a string  and calling Write now appends this Output. We can now check the Output easily in the unit test. 
</p>
<p>
ReadKey method is simulated by returning predefined data provided through a stub constructor. This behaviour is similar to replaying a recorded message. For each test a new stub is created with predefined key collection. Each call to ReadKey returns next key from the collection.
</p>


<h3>Test</h3>

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
        Assert.That(stub.Output, Is.EqualTo(expectedConsoleOutput));
    }
{% endhighlight %}



<p>
This test will simulate a scenario with user clicking A,B,Enter keys. Enter should finish the procedure. We are expecting to see two "*" chars in the output and "AB" should be returned. Test has two asserts so it's not a perfect example, but this particular logic required us to do this.
</p>


<h2>Summary</h2>

<ul>
 <li>static methods are evil get rid of them if you want to write unit test</li>
 <li>do this by hiding them behind a layer of abstraction</li>
 <li>write unit tests by mocking this layer or create a stub that simulates behaviour needed for the test</li>
</ul>
