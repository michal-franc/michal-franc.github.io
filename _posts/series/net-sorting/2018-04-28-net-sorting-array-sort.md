---
layout: post
title: Everything you wanted to know about Sorting in .NET part 2
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
permalink: /blog/net-sorting-part2/
---
#### Array.Sort - [source](https://referencesource.microsoft.com/#mscorlib/system/array.cs,54496ee33e3b155a)

We enter next function leaving List behind 

{% highlight csharp %}
[System.Security.SecuritySafeCritical]
[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]
public static void Sort<T>(T[] array, int index, int length,
 System.Collections.Generic.IComparer<T> comparer) {
{% endhighlight csharp %}

Parameters:

- `array` -> `_items` from the list
- `index` -> `0` - begginging of the list
- `length` -> List count of the list as we are sro
- `comparer` -> `null` use default one

What are the attributes here?  
`[System.Security.SecuritySafeCritical]`   
Part of `Code Access Security`. Marks function as being callable by tansparent code (part of app with limitations like - cannot call native code, can call only other transparent of `SecuritySafeCritical` code. You can mark assembly to be transparent - code in this assembly cannot elevate privileges or access protected resources). Without this attribute code marked as `transparent` wouldn't be able to use Sort function.
[\[6\]][securitytransparentcode][\[7\]][security][\[8\]][cas]

[security]:(https://docs.microsoft.com/en-us/dotnet/framework/misc/security-transparent-code-level-2)
[cas]:(https://docs.microsoft.com/en-us/dotnet/framework/misc/code-access-security-basics)
[securitytransparentcode]:(https://docs.microsoft.com/en-us/dotnet/framework/misc/code-access-security-basics)

`[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]`  
Marks code as `Constrained Execution Region` - this region of code limits developers on the type of code you can write. Protected by CLR. [\[9\]][cre][\[10\]][cre-so].

[cre]:(https://docs.microsoft.com/en-us/dotnet/framework/performance/constrained-execution-regions)
[cre-so]:(https://stackoverflow.com/questions/748319/what-does-reliabilitycontractattribute-do)

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

##### What is TrySZSort?

TrySZSort is a `external native function`. Under the hood it calls `C++` code, which is heavily optimized. If you provide custom `Comparer` this code won't be hit and benefits of native code won't occur. What is this name btw - There are two parts `SZ` and `Sort`. `Sort` is obvious. `SZ` comes from `S`ingle-dimensioned `Z`ero-based arrays.

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

#### First Look at TrySZSort

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
