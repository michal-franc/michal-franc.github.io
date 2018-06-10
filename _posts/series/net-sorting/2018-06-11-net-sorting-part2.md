---
layout: post
title: Array.Sort && TrySZSort
date: 2018-06-11 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [.net]
series: net-sorting
image: net-sorting/part2.png
permalink: /blog/net-internals-sorting-part2/
summary: Second part of the series. Getting into Array.Sort details and first look at TrySZSort function.
---
{% include toc.html %}

In the previous part, we have explored the list internals, ending on `Array.Sort` function. This one we will go down the rabbit hole and explore source code of `Array.Sort` with a sneak peek of a mysterious `TrySZSort` function. 

Location in the function call stack. `Array.Sort` is called from within `List.Sort`. `List` is a wrapper around the `array`. Due to this, call to `Sort` is redirected to `Array.Sort<T>` which takes an array as an argument. 

{% highlight csharp %}
List<T>.Sort()
  List<T>.Sort(index = 0, count = Count, comparer=null)
----> Array.Sort<T>(_items, index, count, comparer);
        TrySZSort
{% endhighlight csharp %}

## Array.Sort

Source code. [^array-sort]

{% highlight csharp %}
[System.Security.SecuritySafeCritical]
[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]
public static void Array.Sort<T>(T[] array, int index, int length, IComparer<T> comparer) {
{% endhighlight csharp %}

Parameters:

- `array` -> `_items` from the list
- `index` -> `0` - beginning of the list
- `length` -> count of the list as we want to sort all of it
- `comparer` -> `null`

There are two interesting attributes added to this function.

- SecuritySafeCritical
- ReliabilityContract

### SecuritySafeCritical

{% highlight csharp %}
[System.Security.SecuritySafeCritical]
{% endhighlight %}

`Code Access Security` attribute. Marks function as being callable by transparent code. This is a special section of your code (or you can mark the whole assembly to be transparent) that creates a `sandboxed limited environment` with rules like - cannot call native code, can call only other transparent code or `SecuritySafeCritical` code, cannot elevate privileges or access protected resources. This feature is not really useful for web developers as we use HTTP and API layer to create our own `sandbox` with defined can dos and cannot dos in the `contract`. The situation is different in desktop and library development space. `SecuritySafeCritical` attribute makes it possible for `sandboxed` parts of the code to use `Sorting`.
[^security][^cas][^security-model-slideshare]

[^array-sort]:[Array Sort - source code](https://referencesource.microsoft.com/#mscorlib/system/array.cs,54496ee33e3b155a)
[^security]:[MSDN - Security Transparent Code, Level 2](https://docs.microsoft.com/en-us/dotnet/framework/misc/security-transparent-code-level-2)
[^cas]:[MSDN - Code Access Security Basics](https://docs.microsoft.com/en-us/dotnet/framework/misc/code-access-security-basics)

![Cas Level 2](/images/net-sorting/safe-critical-code.png "Different types of code with limitations and call permissions.")
{: .tofigure }

[^security-model-slideshare]:[Security Model in .NET Framework - SlideShare](https://www.slideshare.net/yu5k3/security-model-dotnext)

> Verifiable code is code that gets compiled to IL and can be proven to not produce any IL that can execute unsafe code, bypass code access security checks or in any way corrupt the state of the CLR. [^verifiable-code]

[^verifiable-code]:[StackOverflow  - verifiable code](https://stackoverflow.com/questions/4533471/what-is-verifiable-managed-assembly)

### ReliabilityContract

{% highlight csharp %}
[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]
{% endhighlight %}

This attribute is part of a feature called `Constrained Execution Region`. It was added to the framework for `CLR` integration with `SQL Server 2005`.

> starting with the SQL Server™ 2005 release, SQL Server is able to host the common language runtime (CLR), allowing stored procedures, functions, and triggers to be written in managed code. Since access to these stored procedures must be fast, SQL Server hosts the CLR in-process. [^cer-msdn].

This feature is really useful when you write processes that have to be `reliable`. And now you might say that hey everything should be reliable, the software I write is also reliable, we have unit tests, defensive coding, it works. Why would I even want to use `CER`. Well, reliability is not a binary value. It is not like software is either reliable or not. It is like a grayscale. It is like with the cloud then you get `SLA`[^sla] which is not mentioning 100% availability but 99.999%. If you look at `AWS S3` even this service is not 100% durable and available. [^s3-sla]

![SLA example](/images/net-sorting/s3-sla.PNG "S3 Durabilty and Availability guarantess.")
{: .tofigure }

[^s3-sla]:[S3 in a Nutshell](https://blog.cloudconformity.com/the-aws-simple-storage-service-s3-in-a-nutshell-fb945408f757)

Google in their great SRE talks series [^google-sre] defines more metrics like SLI, SLO and Error Budget. The world and software we write is more complicated than that.  Writing fully reliable code is probably impossible and reaching each next SLA number costs more and more. 

[^google-sre]:[Youtube - SLIs, SLOs, SLAs, oh my!](https://www.youtube.com/watch?v=tEylFyxbDLE)

> Writing reliable code in the face of everything that go wrong can be a daunting task. The good news is that unless you're writing a framework or a library for use in CLR hosts that require prolonged periods of up time, you probably won't need to think about this stuff too often.[^cer-msdn]

I come from a `simple` web services world where my custom written code execution time is short lived. There is a request and response. Usually, it takes tens of milliseconds, maybe seconds - rarely minutes. Even if there is a failure most of the time it is possible to do a retry. But what if you would like to write a software that is not only reliable for a lifetime of a single request but for `months`? This is where `CER` can help, giving options to write code that is less susceptible to `failures`. There is, of course, a cost associated with that - constrained options and things that you can do in the code.

> Remember that in SQL Server, MTBF(Mean time beetwen failures)[^cer-mtbf] is measured in months not hours and the process restarting because an unhandled exception happened is completely unacceptable.[^cer-so-explanation]

![Cer SQL vs HTTP Handler](/images/net-sorting/cer-recovery.png "Different types of 'code' running - with different characteristics")
{: .tofigure }

[^sla]:[Wikipedia - Service level agreement](https://en.wikipedia.org/wiki/Service-level_agreement)

In order to achieve more reliable code which was a requirement for a code running on `SQL Server`. `CER` provides certain guarantess like:

- runtime delays throwing Thread.Abort exception waiting for `CER` code to execute.
- runtime prepares `CER` code as a priority to make sure there is a space on a stack and in memory. Decreasing  the likelihood of throwing `out of band exceptions` [^out-of-band-exception][^cer-out-of-band] like `StackOverFlow` or `OutOfMemory` exception. This is very useful in a scenario with `finally` block not being able to execute because there is no memory left and `OutOfMemory` exception is thrown by the runtime. In this finally, block you might have an important set of functions that are needed to recover the process from crashing.  This is a `unlikely` scenario, but if your service is running for `months` or `years` this can happen.
  
> the runtime is constrained from throwing certain asynchronous exceptions that would prevent the region from executing in its entirety.[^cer-msdn]

This is not only about the runtime there are the limitations on the developer side of things like code cannot:

[^out-of-band-exception]:These are exceptions that are thrown by the runtime, not the code - StackOverflowException, OutOfMemoryException and ThreadAbortException.

- acquire lock
- explicitly allocate
- call reflection
- use `Monitor.Enter`
- run `Serialization` and more

This is to prevent writing `riskier` code in specifically designated code regions making them more reliable.


> This creates a framework and an enforcement mechanism for authoring reliable managed code [^cer-msdn]

> CERs are a way to move any runtime-induced failure point from your code to a time either before the code runs (in the case of JIT compiling), or after the code completes (for thread aborts). [^cer-msdn]

Ok, but what about `[ReliabilityContract]` on `Sort` method? First, this attribute is only useful in the `CER`. You create `CER` by using `PrepareConstrainedRegions()` function. It is an explicit decision. 

{% highlight csharp %}
PrepareConstrainedRegions();
try 
{
   list.Sort()  // this is not CER and atribute is not used  

} 
catch (Exception e) 
{
   list.Sort()  // this is CER and atribute is used  

} 
finally 
{
   list.Sort()  // this is CER and atribute is used  

}
{% endhighlight %}

[^cer-examples]:[StackOverflow - CER](https://stackoverflow.com/questions/1101147/code-demonstrating-the-importance-of-a-constrained-execution-region)
[^cre]:[MSDN - CER](https://docs.microsoft.com/en-us/dotnet/framework/performance/constrained-execution-regions)
[^cre-so]:[StackOverflow - ReliabilityContractAttribute](https://stackoverflow.com/questions/748319/what-does-reliabilitycontractattribute-do)
[^cre-example]:[MSDN - ReliabilityContractAttribute](https://docs.microsoft.com/en-us/dotnet/api/system.runtime.constrainedexecution.reliabilitycontractattribute.-ctor?view=netframework-4.7.2)
[^cer-practices]:[MSDN - Reliability best practices](https://docs.microsoft.com/en-us/dotnet/framework/performance/reliability-best-practices#protect-critical-operations-with-constrained-execution-regions-and-reliability-contracts)
[^cer-so-explanation]:[StackOverflow - CER](https://stackoverflow.com/a/747680/104135)
[^cer-out-of-band]:[StackOverflow - out of band exception](https://stackoverflow.com/questions/747551/difference-between-critical-section-critical-region-and-constrained-execut#comment3611344_747680)
[^cer-mtbf]:[Wikipedia - Mean time between failures](https://en.wikipedia.org/wiki/Mean_time_between_failures)

[^cer-msdn]:[MSDN - Great CER article](https://web.archive.org/web/20150423173148/https://msdn.microsoft.com/en-us/magazine/cc163716.aspx)

In order to avoid potential `OutOfMemoryException` and `StackOverFlowException`.
Before entering `try` block if you have used `PrepareConstrainedRegion` and your method has attribute `ReliabilityContract`. For this method:

- all the assemblies are loaded
- code is compiled
- there is a check if the stack has (48KB) of space available (apparently 48K is an average method size)

> ... when used from within a constrained execution region a method marked with a ReliabilityContract will be prepared before execution by the JIT to be pre-compiled and the memory for the method will be pre-allocated when entering the PrepareConstrainedRegions. [^cer-so-explanation]


If `CER` got you interested then try this presentation [^cer-presentation] big thanks to Grzegorz Kotfis [^kotfis] for the link.

[^cer-presentation]:[Youtube - Exceptional Exception in .NET](https://youtu.be/U92Ts53win4?t=530)
[^kotfis]:[Grzegorz Kotfis site](https://devsession.pl)

## What is TrySZSort?

{% highlight csharp %}
public static void Sort(Array keys, Array items, int index, int length, IComparer comparer) {
  if (keys==null)
      // Exception   

  if (keys.Rank != 1 || (items != null && items.Rank != 1))
      // Exception   

  if (items != null && keys.GetLowerBound(0) != items.GetLowerBound(0))
      // Exception   

  if (index < keys.GetLowerBound(0) || length < 0)
      // Exception  

  if (keys.Length - (index - keys.GetLowerBound(0)) < length 
      || (items != null && (index - items.GetLowerBound(0)) > items.Length - length))
      // Exception

  Contract.EndContractBlock();
  
  if (length > 1) {
      if (comparer == Comparer.Default || comparer == null) {
          bool r = TrySZSort(keys, items, index, index + length - 1);
          if (r)
              return;
      }}
...
{% endhighlight %}

We have discussed attributes, time to talk about the code. This is the source of `Array.Sort`. Exception throwing logic was replaced with comments to make it more readable. The core of sorting in .NET is an `external native function` called `TrySZSort`. Under the hood `Array.Sort` calls `C++` code that is part of the `CLR` itself. This code is heavily optimized. 

{% highlight csharp %}
  if (length > 1) {
      if (comparer == Comparer.Default || comparer == null) {
          bool r = TrySZSort(keys, items, index, index + length - 1);
          if (r)
              return;
      }}
...
{% endhighlight %}

I want to focus on this code. This is were `managed` code mixes with `unmanaged` one. `TrySZSort` - this is the real underlying function that is not part of `.NET`.

`length > 1` is used to check if array requires sorting. If there is only one element there is no need to sort at all. It is also worth noting that `TrySZSort` is called only for default comparer. If you provide custom `Comparer` it won't be used. For custom `Comparers`, similar sorting algorithm as the one in `TrySZSort` is executed inside `managed` code. This, of course, lacks all the benefits of `unmanaged` code and misses most of the native optimizations. 

`TrySZSort` what does it mean? - There are two parts `SZ` and `Sort`. `Sort` is obvious and `SZ` comes from `S`ingle-dimensioned `Z`ero-based arrays.

### Single-dimensioned zero based arrays

`Single-dimensioned` - It is a typical array with one dimension. `TrySZSort` doesn't support `multi-dimension` arrays.

{% highlight csharp %}

one dimensional
[1, 2, 3, 4 ... n]

two dimensional
[ 1, 2, 3, 4 ... n
  2, 3, 4, 5 ... n
  3, 0, 2, 4 ... n
  4, 0, 2, 4 ... n
  5, 0, 2, 4 ... n
  5, 0, 2, 4 ... n
  m, a, b, c ... n ]

{% endhighlight %}

`Zero-based` - `TrySZSort` supports only arrays starting with index `0`.

{% highlight csharp %}
zero based indexing 
[0, 1, 2, 3 ... n - 1]

one based indexing 
[1, 2, 3, 4 ... n]
{% endhighlight %}

It got me thinking. If `zero based` is explicit, does it mean that arrays could be `one based`? Was there no agreement on that in the past? For me, `zero` was always the first index. I just assumed that this is the standard. It kind of is now ... but it wasn't in the past. Hmm ... can you create a non `zero-based` array in `C#`? 

It is against the `CLS` (Common Language Specification) - which is a set of rules and limitations that you need to follow to be `Compliant`. Which means that your `code` is usable by any `CLR` language - (This is important when building frameworks or librarires). 

> All dimensions of an array must have a lower bound of zero. [^cls-compliance]

[^cls-compliance]:[MSDN - CLS Compliance](https://docs.microsoft.com/en-us/dotnet/standard/language-independence-and-language-independent-components#arrays)

Still `CLR` supports it and in `C#` you can make `one, two, x index based` arrays. By default, indexing is `zero based` but you can force `C#` to show the `hidden` parts. Small warning. Don't use non zero based arrays it in your code as it won't be CLS compliant, it is also a bad and non intuitive practice this days. IL, JIT and CLR is also optimized to operate on `zero-based` arrays.

> since zero-based arrays are by far the most common, Microsoft has spent a lot of time optimizing their performance. However, the CLR does support non-zero-based arrays but they are discouraged.[^zero-based-so]

[^zero-based-so]:[StackOverflow - zero based indexes](https://stackoverflow.com/a/23893504/104135)

I know what you are thinking right now `Show me how to make one based array`. To do it you need to use `Array.CreateInstance`.

{% highlight csharp %}
// Zero Based

var zeroBased = new int[1];
Console.WriteLine(zeroBased.GetValue(0));
Console.WriteLine(zeroBased.GetLowerBound(0));

output:
0
0 <- zero based

// One Based

var oneBased = Array.CreateInstance(typeof(int), new[] { 1 }, new[] { 1 });
Console.WriteLine(oneBased.GetValue(1));
Console.WriteLine(oneBased.GetLowerBound(0));

output:
0
1 <- one based

Console.WriteLine(oneBased.GetValue(0)); // throws Exception
{% endhighlight %}

`CLR` keeps this as a backward compatibility for `Visual Basic` code. `TrySZSort` contains a glimpse of a long and complicated programming history. in `VB` you were able to create arrays starting from index `1`. [^vb-non-zero]
Since `VB .NET 2002` - you were able to create `x based arrays`. VB evolved from different language history than `C#` that took a lot from `C`.

[^vb-non-zero]:[VB and Zero based arrays](http://www.panopticoncentral.net/2004/03/17/non-zero-lower-bounded-arrays-the-other-side-of-the-coin)

The concept of arrays starting from `0` has also an interesting history. It wasn't that obvious which approach was better. Digging around this topic yields interesting discussions about easier `pointer arithmetic` if arrays are `zero-based`. `0` representing a start of the memory address is also more `intuitive` than `1`. Some people point to the `Math` and certain operations that are easier if we assume start of the array as `0`.[^1-based-array-discussion]

[^1-based-array-discussion]:[Why are zero based arrays the norm](https://softwareengineering.stackexchange.com/questions/110804/why-are-zero-based-arrays-the-norm)

### Array.CreateInstance vs new[]

When I used `Array.CreateInstance` for the first time, I wondered how different it is from using `new[]`. Jon Skeet points to some directions in his SO answer[^jon-skeet-array]

{% highlight csharp %}

new int [99]
//Simplified IL code

ldc.i4.s 99
newarr [mscorlib]System.In32

Array.CreateInstance
//Simplified IL code

ldc.i4.s 99
call class [mscorlib]System.Array::CreateInstance

{% endhighlight %}

`newarr` is built into the language while `CreateInstance` is a method call that actually leads to the unmanaged code inside `CLR`[^array-create-instance]. `newarr` is a IL instruction responsible for the creation of a `vector` which is a different name for zero-based single dimensional array. Size of array `99` is pushed to the stack using `ldc.i4.s` instruction. `newarr` uses this value from the stack to create the vector. 

`CreateInstance` is in unmanaged code just like `TrySZSort`, it is time to peek in there. 

[^array-create-instance]:[Github - ArrayCreateInstance source](https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arraynative.cpp#L1162)

[^jon-skeet-array]:[StackOverflow - Jon Skeet on newarr](https://stackoverflow.com/a/43581012/104135)

### First peek at the unmanaged world

As I mentioned earlier `TrySZSort` is a extern function. `extern` is a special keyword used to indicate `external' resources.

> When a method declaration includes an extern modifier, that method is said to be an external method. External methods are implemented externally, typically using a language other than C#. [^extern-google-book]

In this case, `TrySZSort` is a method with implementation in `CLR` - extern is used to make that connection between managed code and the the `CLR`. We are entering `C++` world now. Source code for `TrySZSort` can be found here [^tryszsort-source]. It is great that Microsoft open sourced it, as we can check it. 

[^tryszsort-source]:[Github - TrySZSort source](https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.cpp#L268)
[^extern-google-book]:[The C# - Programming Language - book](https://books.google.co.uk/books?id=s-IH_x6ytuQC&pg=PT642&dq=C%23+10.6.7&hl=en&sa=X&ved=0ahUKEwi8-rWOvf7aAhVBKcAKHUyOC_MQ6AEIKTAA#v=onepage&q=C%23%2010.6.7&f=false)

{% highlight csharp %}
FCIMPL4(FC_BOOL_RET, ArrayHelper::TrySZSort, ArrayBase * keys, ArrayBase * items
, UINT32 left, UINT32 right)

{% endhighlight %}

In next part, we will look into how it is possible to call `TrySZSort` inside `CLR` from `C#` code.
