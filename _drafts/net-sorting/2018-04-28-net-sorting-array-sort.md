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

Marks code for documentation purposes as specific `Constrained Execution Region`. `CER` provides certain guarantess that are enforced by the CLR by limiting `options` like - you cannot `box`, acquire lock, explicitly allocate, call reflection, use `Enter` or `Lock` or do `Serialization`, there are more of these. You mark your code with `Cer` to let `CLR` remind you that you can't use functionalities that might break it's guarantess.This is a risk-management mechanism. As with `SecuritySafeCritical`, this is mostly used in frameworks or libraries for `auditing` purposes (there are companies requiring standards and `gurantess` from library or framework). [\[4\]][cre][\[5\]][cre-so][\[6\]][cre-example]

> When performing a complex operation that updates a shared status or that needs to deterministically either fully succeed or fully fail, be sure that it is protected by a constrained execution region (CER). [\[7\]][cer-practices]

> This is a way to make a piece of code more or less atomic by guarding against interruption by exceptions. The example on this page uses it to make sure that the allocation and storing of a handle are both executed. Note that there is no roll-back, it's more of a preventive system.[\[8\]][cer-so-explanation]

Reading about `CER`, I also stumbled about concept called `out-of-band exception`. 

> An out-of-band exception is an exception that isn't thrown by the code that is currently directly being executed, but by part of the framework. This term encompasses the following exceptions: StackOverflowException, OutOfMemoryException and ThreadAbortException.[\[9\]][cer-out-of-band]

[cre]:https://docs.microsoft.com/en-us/dotnet/framework/performance/constrained-execution-regions
[cre-so]:https://stackoverflow.com/questions/748319/what-does-reliabilitycontractattribute-do
[cre-example]:https://docs.microsoft.com/en-us/dotnet/api/system.runtime.constrainedexecution.reliabilitycontractattribute.-ctor?view=netframework-4.7.2
[cer-practices]:https://docs.microsoft.com/en-us/dotnet/framework/performance/reliability-best-practices#protect-critical-operations-with-constrained-execution-regions-and-reliability-contracts
[cer-so-explanation]: https://stackoverflow.com/a/747680/104135
[cer-out-of-band]: https://stackoverflow.com/questions/747551/difference-between-critical-section-critical-region-and-constrained-execut#comment3611344_747680

## What is TrySZSort?

{% highlight csharp %}
if (length > 1) {
    if ( comparer == null || comparer == Comparer<T>.Default ) {
        if(TrySZSort(array, null, index, index + length - 1)) {
            return;
        }
    }
...
{% endhighlight %}

And now it gets interesting, this is where sorting starts. 

`length > 1` - it is kind of obvious that if array has one element it's already sorted. There is nothing to do here.

`TrySZSort` is called when comparer is default or not provided. I won't cover customized comparer in this blog post (it is similar code without native call part).


TrySZSort is a `external native function`. Under the hood it calls `C++` code, which is heavily optimized. If you provide custom `Comparer` this code won't be hit and benefits of native code won't occur. What is this name btw - There are two parts `SZ` and `Sort`. `Sort` is obvious. `SZ` comes from `S`ingle-dimensioned `Z`ero-based arrays.

### Single-dimensioned arrays

`Single-dimensioned` - arrays that have only one dimension. Simple arrays that you index by using one dimension `[1]` when in two dimensional you have two `[1][0]`. `Zero-based` - arrays that start from `0` index. `[0, 1, 2, 3, 4 .... n]`. This begs a question - are there arrays that are not `Zero-based`? Apparrently it was not that obvious some time ago as it is now. I tend to assume this as a default option and never thought about having arrays starting from `1`. Is this even possible in .NET
? Looking at CLS Compliance '`All dimensions of an array must have a lower bound of zero.`' What is interesting - even if Array starting from index `0` is not `CLS compliant`, it is still possible to make one and use it. CLR supports it -  '`CLR does support non-zero-based arrays but they are discouraged.`'. They are also not optimized.

[cls-compliance]:(https://docs.microsoft.com/en-us/dotnet/standard/language-independence-and-language-independent-components#arrays)

It is possible to create Non `zero-based` arrays using `CreateInstance` function

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

CLR keeps this as a backward compatibility for Visual Basic code. `TrySZSort` contains a glimpse of long and complicated programming history. in `VB` you were able to create arrays starting from index `1`. [More about VB history][vb-non-zero]
`TL;DR;` till `VB .NET 2002` - you were able to start arrays from one. VB evolved from different language history than `C#` that was `C` based and `zero-index based` was default <Rozwinac TL;DR; na bazie bog posta?>

[vb-non-zero]:(http://www.panopticoncentral.net/2004/03/17/non-zero-lower-bounded-arrays-the-other-side-of-the-coin)

Whole concept of arrays starting from `0` has also long history. Question why it is like that returns interesting examples like `pointer arithmetic` that is easier to be done with `0` as we can then mark start of memory address as `0`, with `1` it would a bit not intuitive. There are also hints to the way `Math` works, and certain operations are easier if we assume start of the array as `0`. [Interesting discussion on SO][1-based-array-discussion] <przydaloby sie rozwinieccie>

[1-based-array-discussion]:(https://softwareengineering.stackexchange.com/questions/110804/why-are-zero-based-arrays-the-norm)

### First peek at unmanaged world

Entering `C++` world now. Source code for `TrySZSort` can be [found here][tryszsort-source]

[tryszsort-source]:(https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.cpp#L268)

{% highlight csharp %}
FCIMPL4(FC_BOOL_RET, ArrayHelper::TrySZSort, ArrayBase * keys, ArrayBase * items
, UINT32 left, UINT32 right)
{% endhighlight %}

Parameters:

* keys = list -> array
* items = null
* left = 0
* right = length - 1

`left and right` represent left-most and right-most index of the array

TrySZSort is a `native C++` function, it is not [managed][managed-code]. `List.Sort` is a managed code. There has to be a bridge beetwen this two spaces. This bridge is provided by `

[managed-code]:(https://docs.microsoft.com/en-us/dotnet/standard/managed-code)
