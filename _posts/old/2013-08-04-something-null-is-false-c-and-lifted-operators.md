---
layout: post
title: Why Something > null is false - C# and Lifted Operators
date: 2013-08-04 10:35
author: Michal Franc
comments: true
categories: []
tags: [.net]
---
In the project, I am working with, there is a simple feature that imports data from external source. Import is only interested in new records. This condition is fulfilled with 'DateTime' comparision.


{% highlight csharp %}
if (data.CreateDate => this.LastUpdateDate)
{
     DoSomething();
}

{% endhighlight %}


Looks simple, Unfortunately I have encountered a nice 'bug' :). On the first run, import got 0 records and I was sure that this number should be around couple of thousands. It seemed like the if clause returned false. In this scenario, on the first run, LastUpdateDate value is undefined.

The comparision looks like.

Weird, especially when you know that 'DateTime' is a struct and can't be null. It's default value is '0001-01-01 00:00:00'. This comparision should evaluate to true right ? Sadly there is one catch. LastUpdateDate is a 'DateTime?' type. I assumed that both operands are of 'DateTime' type. Nullable DateTime is whole different story.

The comparision changes to

Default value of DateTime? is null, It is then.

Let's see what the result of this comparision.


{% highlight csharp %}
public class DateTimeTest
{
        public DateTime Date { get; set; }
}

void Main()
{
     var result = DateTime.Now > new DateTimeTest().Date;
       Console.WriteLine(result);
}
{% endhighlight %}


Simple class, with only one property a 'DateTime' struct. Result is <strong>'True'</strong>, because DateTime.Now > default(DateTime).

Now let's check what happens if there is a DateTime? property.


{% highlight csharp %}
public class NullableDateTimeTest
{
        public DateTime? Date { get; set;}
}

void Main()
{
     var result = DateTime.Now > new NullableDateTimeTest().Date;
       Console.WriteLine(result);
}
{% endhighlight %}


Default Date value is null and the result is <strong>'False'</strong>.

<h3>What is happening when we want to compare Non-nullable type with Nullable type ?</h3>

There is a special kind of behaviour for this case. <a href="http://en.csharp-online.net/ECMA-334%3A_14.2.7_Lifted_operators">In C# specification 14.2.7 Lifted Operators</a>

<blockquote>Lifted operators permit predefined and user-defined operators that operate on non-nullable value types to also be used with nullable forms of those types.</blockquote>

Check out this excellent description of lifted operators <a href='http://stackoverflow.com/a/3370150'>by Jon Skeet</a>.

<h3>Why something > null is false</h3>

It seems like this is a design choice. In the <a href="http://en.csharp-online.net/ECMA-334%3A_14.2.7_Lifted_operators">specification</a> you can find this:

<blockquote> The lifted operator produces the value false if one or both operands are null.</blockquote>
