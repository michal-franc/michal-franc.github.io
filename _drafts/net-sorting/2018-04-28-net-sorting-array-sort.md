---
layout: draft
title: Everything you wanted to know about Sorting in .NET part 2
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
permalink: /blog/net-sorting-part2/
---
{% include toc.html %}

In the previous part we haven't yet touched the sorting part of `Sort`. This was just a first step into the world of `.NET` source code. Time to make another one and go down the rabbit hole into the world of ...

## Array.Sort

{% highlight csharp %}
List<T>.Sort()
---> List<T>.Sort(index = 0, count = Count, comparer=null)
------> Array.Sort<T>(_items, index, count, comparer);
{% endhighlight csharp %}

`List` is just a wrapper around `array`. Due to this, call to `Sort` is redirected to `Array.Sort<T>` which takes array as an argument. 

Parameters:

- `array` -> `_items` from the list
- `index` -> `0` - begginging of the list
- `length` -> count of the list as we want to sort all of it
- `comparer` -> `null`

{% highlight csharp %}
[System.Security.SecuritySafeCritical]
[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]
public static void Array.Sort<T>(T[] array, int index, int length, IComparer<T> comparer) {
{% endhighlight csharp %}

There are two interesting attributes added to this function.


### SecuritySafeCritical
`Code Access Security` attribute. Marks function as being callable by tansparent code. This is a special section of your code (or you can mark whole assembly to be transparent) that creates a `sandboxed limited environment` with rules like - cannot call native code, can call only other transparent code or `SecuritySafeCritical` code, cannot elevate priviledges or access protected resources. This feature is not really useful for web developers as we use HTTP and API layer to create our own `sandbox` with defined can dos and cannot dos in the `contract`. Situation is different in desktop and library development space. `SecuritySafeCritical` attribute makes it possible for `sandboxed` parts of the code to use `Sorting`.
[\[1\]][securitytransparentcode][\[2\]][security][\[3\]][cas]

[array-sort]:https://referencesource.microsoft.com/#mscorlib/system/array.cs,54496ee33e3b155a
[security]:https://docs.microsoft.com/en-us/dotnet/framework/misc/security-transparent-code-level-2
[cas]:https://docs.microsoft.com/en-us/dotnet/framework/misc/code-access-security-basics
[securitytransparentcode]:https://docs.microsoft.com/en-us/dotnet/framework/misc/code-access-security-basics

### ReliabilityContract

{% highlight csharp %}
[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]
{% endhighlight %}

This attribute is used in a feature called `Constrained Execution Region`. It was added to the framework for `CLR` integration with `SQL Server 2005`.

> starting with the SQL Server™ 2005 release, SQL Server is able to host the common language runtime (CLR), allowing stored procedures, functions, and triggers to be written in managed code. Since access to these stored procedures must be fast, SQL Server hosts the CLR in-process. [\[4\]][cer-msdn].

This feature is really usefull when you write processes that have to be `reliable` and long running and you want to limit amount of `failures`. This is not your usual web service that just die as most of the work is done in `request / response` manner. User can just repeat request, right? Then why bother. Well the case is different in `SQL Server` example

> Remember that in SQL Server, MTBF(Mean time beetwen failures)[\[6\]][cer-mtbf] is measured in months not hours and the process restarting because an unhandled exception happened is completely unacceptable.[\[5\]][cer-so-explanation]

In order to achieve more reliable code which was requirement for a code running in `SQL Server`. `CER` provides certain guarantess like:

- runtime delays throwing Thread.Abort exception waiting for `CER` code to execute.
- runtime prepares `CER` code as a priority to make sure there is a space on stack and in memory limiting the likelyhood of throwing `StackOverFlow` and `OutOfMemory` exception. This is very usefull in a scenario with `finally` block not being able to execute beacuse there is no memory lefet and `OutOfMemory` exception is thrown by the runtime. This is `unlinkely` scenario, but if your service is running for `months` or `years` this can happen.

> the runtime is constrained from throwing certain asynchronous exceptions that would prevent the region from executing in its entirety.[\[4\]][cer-msdn]

This is not only about the runtime there are limitation on the developer side that are checked by the CLR like code cannot:

- acquire lock
- explicitly allocate
- call reflection
- use `Monitor.Enter`
- run `Serialization` and more

This is to prevent writing code that can `break` in constrained blocks of code making the `likelyhood` of it being `more reliable`.

> This creates a framework and an enforcement mechanism for authoring reliable managed code [\[4\]][cer-msdn]

> CERs are a way to move any runtime-induced failure point from your code to a time either before the code runs (in the case of JIT compiling), or after the code completes (for thread aborts). [\[4\]][cer-msdn]

Ok, but what about `[ReliabilityContract]` on `Sort` method? First, this attribute is only usefull in the `CER`. You create `CER` by using `PrepareConstrainedRegions()` function. It is a explicit decision. 

Peter Oehlert posted on SO nice example - `list.Sort` was added to make it more visible where `ReliabilityContract` attribute would be used. [\[5\]][cer-so-explanation]
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

>  when used from within a constrained execution region a method marked with a ReliabilityContract will be prepared before execution by the JIT to be pre-compiled and the memory for the method will be pre-allocated when entering the PrepareConstrainedRegions. [\[5\]][cer-so-explanation]

Reading about `CER`, I also stumbled upon concept called `out-of-band exception`. These are exceptions that are thrown by the runtime not the code - StackOverflowException, OutOfMemoryException and ThreadAbortException.[\[9\]][cer-out-of-band]

[cer-msdn]:https://web.archive.org/web/20150423173148/https://msdn.microsoft.com/en-us/magazine/cc163716.aspx
[cer-examples]:https://stackoverflow.com/questions/1101147/code-demonstrating-the-importance-of-a-constrained-execution-region
[cre]:https://docs.microsoft.com/en-us/dotnet/framework/performance/constrained-execution-regions
[cre-so]:https://stackoverflow.com/questions/748319/what-does-reliabilitycontractattribute-do
[cre-example]:https://docs.microsoft.com/en-us/dotnet/api/system.runtime.constrainedexecution.reliabilitycontractattribute.-ctor?view=netframework-4.7.2
[cer-practices]:https://docs.microsoft.com/en-us/dotnet/framework/performance/reliability-best-practices#protect-critical-operations-with-constrained-execution-regions-and-reliability-contracts
[cer-so-explanation]: https://stackoverflow.com/a/747680/104135
[cer-out-of-band]: https://stackoverflow.com/questions/747551/difference-between-critical-section-critical-region-and-constrained-execut#comment3611344_747680
[cer-mtbf]:https://en.wikipedia.org/wiki/Mean_time_between_failures

> Writing reliable code in the face of everything that go wrong can be a daunting task. The good news is that unless you're writing a framework or a library for use in CLR hosts that require prolonged periods of up time, you probably won't need to think about this stuff too often.[\[4\]][cer-msdn]

In order to avoid potential `OutOfMemoryException` and `StackOverFlowException`.
Before entering `try` block if you have used `PrepareConstrainedRegion` and your method has attribute `ReliabilityContract`. For this method:

- all the assemblies are loaded
- code is compiled
- there is a check if stack has (48KB) of space available (apparently 48K is an average method size)

If `CER` got you interested then try this presentation[\[10\]](https://youtu.be/U92Ts53win4?t=530) (big thanks to Grzegorz Kotfis[\[11\]](https://devsession.pl/) for the link)

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

We have discussed attributes, time to talk about the code. This is source of `Array.Sort`. Exception throwing logic was replaced with comments to make it more readable.

I want to focus on this code. This is were `managed` code mixes with `unamanged` one. `TrySZSort` - this is the real underlaying function that is not part of `.NET`.

{% highlight csharp %}
  if (length > 1) {
      if (comparer == Comparer.Default || comparer == null) {
          bool r = TrySZSort(keys, items, index, index + length - 1);
          if (r)
              return;
      }}
...
{% endhighlight %}

Before we event hit this function `length > 1` is used to check if array requires sorting. If there is only one element there is no need to sort at all. It is also worht noting that `TrySZSort` is called only for default comparer. It is a `external native function`. Under the hood it calls `C++` code that is part of `CLR`. This code is heavily optimized. If you provide custom `Comparer` it won't be used. For custom `Comparers` similar sorting algorithm as the one in `TrySZSort` is executed inside `managed` code. This of course lacks all the benefits of `unmanaged` code and misses most of the native optimizations. 

`TrySZSort` what does it mean? - There are two parts `SZ` and `Sort`. `Sort` is obvious. `SZ` comes from `S`ingle-dimensioned `Z`ero-based arrays.

### Single-dimensioned zero based arrays

`Single-dimensioned` - It is your typical arrays with one dimension. `TrySZSort` doesn't support `multi-dimension` arrays.

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

`Zero-based` - `TrySZSort` supports only arrays starting with `0` index.

{% highlight csharp %}
zero based indexing 
[0, 1, 2, 3 ... n - 1]

one based indexing 
[1, 2, 3, 4 ... n]
{% endhighlight %}

It got me thinking. If `zero based` is explicit, does it mean that arrays could be `one based`? Was there no consensus in the past?. For me `zero` was always the first index. I just assumed that this is the standard. It kind of is now ... but it was'nt in the past. Can you create `non zero based` array in `C#`? 

Based on `CLS` (Common Language Specification) - which is a set of rules and limitations that you need to follow to be `Compliant`. Which means that your `code` is usable by any `CLR` language - (This is important when building frameworks or librarires).

> All dimensions of an array must have a lower bound of zero.[\[10\]][cls-compliance]

[cls-compliance]:(https://docs.microsoft.com/en-us/dotnet/standard/language-independence-and-language-independent-components#arrays)

It looks like it is against the rules but still `CLR` supports it and in `C#` you can make `one, two, ... x index based` arrays. By default, indexing is `zero based` but you can force `C#` to show `its` hidden parts (don't use it in your code as it won`t be CLS compliant, it it is a bad and non intuitive practice this days). Code is also optimized to operate on `zero-based` arrays.

> since zero-based arrays are by far the most common, Microsoft has spent a lot of time optimizing their performance. However, the CLR does support non-zero-based arrays but they are discouraged.[\[11\]][zero-based-so]

[zero-based-so]:https://stackoverflow.com/a/23893504/104135

I know what you are thinking right not `Show me how to make one based array` ^^.You need to use `Array.CreateInstance`. Brace for impact here it goes 

{% highlight csharp %}
public static Array CreateInstance(Type elementType, int[] lengths, int[] lowerBounds)
{% endhighlight %}

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

`CLR` keeps this as a backward compatibility for `Visual Basic` code. `TrySZSort` contains a glimpse of long and complicated programming history. in `VB` you were able to create arrays starting from index `1`. [\[12\]][vb-non-zero]
Since `VB .NET 2002` - you were able to create `x based arrays`. VB evolved from different language history than `C#` took a lot from `C` and `Java`.

[vb-non-zero]:(http://www.panopticoncentral.net/2004/03/17/non-zero-lower-bounded-arrays-the-other-side-of-the-coin)

The concept of arrays starting from `0` has also interesting history. It wasn't that obvious which approach was `better`. Diging around this topic yields interesting discussions about easier `pointer arithmetic` if arrays are `zero based`.  `0` representing start of memory address is more `intuitive` than `1`. Some peope point to the `Math` and certain operations that are easier if we assume start of the array as `0`.[\[13\]][1-based-array-discussion]

[1-based-array-discussion]:(https://softwareengineering.stackexchange.com/questions/110804/why-are-zero-based-arrays-the-norm)

### Array.CreateInstance vs new[]

When I used `Array.CreateInstance` for the first time, I wondered ... how different it is from using `new[]`. Jon Skeet points to some dirrections in his SO answer[\[14\]][jon-skeet-array]

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

`newarr` is built into the language while `CreateInstance` is a method call that actually leads to the unmanaged code inside `CLR`[\[x\]][array-create-instance]. `newarr` is a IL instructions responsible for creation of `vector` - vector is a different name for zero based single dimensional array. Size of array `99` is pushed to the stack using `ldc.i4.s` instruction. `newarr` uses this value from the stack to create the vector. 

Just like `CreateInstance` is in unmanaged code We are actually going to the unmanaged world with `TrySZSort`.

[array-create-instance]:https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arraynative.cpp#L1162

[jon-skeet-array]:https://stackoverflow.com/a/43581012/104135

### First peek at unmanaged world

As I mentioned earlier `TrySZSort` is extern function. `extern` is a special keyword used to indicate `external' resources.

{% highlight csharp %}
[System.Security.SecurityCritical]
[ResourceExposure(ResourceScope.None)]
[MethodImplAttribute(MethodImplOptions.InternalCall)]
[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]
private static extern bool TrySZSort(Array keys, Array items, int left, int right);
{% endhighlight %}

> When a method declaration includes an extern modifier, that method is said to be an external method. External methods are implemented externally, typically using a language other than C#.[\[x\]][extern-google-book]

In this case `TrySZSort` is a method with implementation in `CLR` - extern is used to make that connection beetwen managed code and the `CLR` one. We are entering `C++` world now. Source code for `TrySZSort` can be found here[[x][tryszsort-source]]. It is great that microsoft open sourced, as we can check its code and analyse it. This will be covered in next post of the serie. We are going to cover this function `FCIMPL4` and how `managed` code calls the `unmanaged one'.

[tryszsort-source]:(https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.cpp#L268)
[resource-ex-so]:https://stackoverflow.com/questions/3254308/how-to-use-resourceexposureattribute-and-resourceconsumptionattribute
[extern-google-book]:https://books.google.co.uk/books?id=s-IH_x6ytuQC&pg=PT642&dq=C%23+10.6.7&hl=en&sa=X&ved=0ahUKEwi8-rWOvf7aAhVBKcAKHUyOC_MQ6AEIKTAA#v=onepage&q=C%23%2010.6.7&f=false

{% highlight csharp %}
FCIMPL4(FC_BOOL_RET, ArrayHelper::TrySZSort, ArrayBase * keys, ArrayBase * items
, UINT32 left, UINT32 right)
{% endhighlight %}
