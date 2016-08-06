---
layout: post
title: Regular expression attribute Testing–DateTime validation problem
date: 2011-06-04 13:30
author: Michal Franc

comments: true
categories: []
---
<p align="justify">When developing simple validation logic in Asp.Net <a href="http://www.asp.net/mvc">Mvc</a> you can use the built in validators. One of them is the <a href="http://msdn.microsoft.com/en-us/library/system.web.ui.webcontrols.regularexpressionvalidator.aspx">RegularExpression Validator</a>. I had a simple scenario with a property of  <strong>DateTime</strong> type called <strong>StartDate</strong>. Validation format <strong>(yyyy-mm-dd).</strong> It should be a simple task , but details are always messy.</p>
<p align="justify">I created a simple pattern and tested it with various examples in one of the Regex Editors.</p>

<h2>DateTime regular expression problem</h2>

{% highlight csharp %}
 [RegularExpression(@"^(19|20)dd([- /.])(0[1-9]|1[012])2(0[1-9]|[12][0-9]|3[01])$")]
 public DateTime StartDate { get; set; }
{% endhighlight %}

<p align="justify">To check if this solution works , two unit tests were created. First implementation of tests used the <strong>Regex </strong>class , but then I found out that you can use  <strong>Attribute </strong>classes inside your code. I changed tests and used the <strong>RegularExpressionAttribute </strong>class inside test<strong>. </strong>Those tests are better because , with <strong>Regex </strong>our , we are checking if regex pattern is correct. With <strong>Attribute </strong>class used inside the test , we are testing actual scenario that is happening inside our app .</p>
<h3>Problematic Tests</h3>
Result - SUCCESS

{% highlight csharp %}
[TestFixture]
 class CalendarEventRegExpTests
 {
    private string regex = @"^(19|20)(dd)[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$";

    [Test]
     public void Should_match()
     {
        var dateTime = "2011-10-1";
        var attribute = new RegularExpressionAttribute(regex);
        Assert.IsTrue(attribute.IsValid(dateTime));
     }
{% endhighlight %}


Result - SUCCESS


{% highlight csharp %}
[Test]
 public void Should_not_match()
 {
  var dateTime = "01-10-2001";
  var attribute = new RegularExpressionAttribute(regex);
  Assert.IsFalse(attribute.IsValid(dateTime));
  }
}
{% endhighlight %}


<p align="justify">Yey green light, They passed so it’s working ! I tested the app and … validation was always incorrect . First thought , my pattern is incorrect. But , it is working inside <strong>RegEx Editor</strong> so I it has to be correct.</p>

<h3>Whats Wrong</h3>
<p align="justify">It seems that when <strong>DateTime </strong>object is passed to the <strong>RegExpAttribute </strong>, something weird is happening and validation fails. I have simulated this scenario with simple test.</p>

Result - FAIL

{% highlight csharp %}
[Test]
public void Should_match()
{
    var dateTime = new DateTime(2011,11,10);
    var attribute = new RegularExpressionAttribute(regex);
    Assert.IsTrue(attribute.IsValid(dateTime));
}
{% endhighlight %}



<p align="justify"></p>
<p align="justify">Maybe it’s the problem with the type of the object. This test converts <strong>DateTime </strong>object to string fail.</p>

Result - FAIL

{% highlight csharp %}
[Test]
public void Should_match()
{
   var dateTime = new DateTime(2011,10,10);
   var attribute = new RegularExpressionAttribute(regex);
   Assert.IsTrue(attribute.IsValid(dateTime.ToString()));
}
{% endhighlight %}


<p align="justify"></p>
<p align="justify">Then I realized that <strong>.ToString() ,</strong> method by default creates string including the <strong>hh-mm-ss. </strong>In my scenario those parameters were initialized with zeros<strong> </strong>My simple regex pattern wont match this string. Correctly formatted string passes the Test.</p>

Result - SUCCESS

{% highlight csharp %}
[Test]
public void Should_match()
{
    var dateTime = new DateTime(2011,10,10);
    var attribute = new RegularExpressionAttribute(regex);
    Assert.IsTrue(attribute.IsValid(dateTime.ToString("yyyy-MM-dd")));
}
{% endhighlight %}


<p align="justify">It’s time to look inside the <strong>RegularExpressionAttribute.  </strong>Let me “Reflect” or “<a href="http://www.jetbrains.com/decompiler/">DotPeek</a>”  that for you.</p>
<p align="justify">Here is the code inside the class.</p>

<div align="justify">

{% highlight csharp %}
public override bool IsValid(object value)
{
   this.SetupRegex();
   string input = Convert.ToString(value, (IFormatProvider) CultureInfo.CurrentCulture);
   if (string.IsNullOrEmpty(input))
   {
      return true;
   }
   else
   {
       Match match = this.Regex.Match(input);
       if (match.Success &amp;&amp; match.Index == 0)
          return match.Length == input.Length;
       else
          return false;
    }
}
{% endhighlight %}

</div>
<p align="justify">The Highlighted part is the problem. <strong>.IsValid()</strong> method uses default.<strong>ToString()</strong>. <strong>DateTime </strong>is parsed to the string with <strong>hh-mm-ss </strong>and that’s the root of the problem.</p>

<h2>Conclusion</h2>
<p align="justify">There is a simple solution to this problem. You just need to attach <strong>DisplayFormat.</strong></p>

<div align="justify">

</div>
<h3 align="justify"><strong>Lessons Learned</strong></h3>
<p align="justify">- “green light” in test doesn’t mean that your code is working .</p>
<p align="justify">- create tests on “real” data</p>
<p align="justify">- try simulate environment and context as much as possible. To many assumptions and your test isn’t testing real scenario. In my case , I  used the <strong>string</strong> inside test when my app used <strong>DateTime </strong>object.</p>
