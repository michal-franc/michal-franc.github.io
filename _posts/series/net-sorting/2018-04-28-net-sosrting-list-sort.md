---
layout: post
title: Everything you wanted to know about Sorting in .NET - part I
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
permalink: /blog/net-sorting-part1/
---

If we want to talk about sorting in `.NET`, then there is no better place to start than `List<T>.Sort()`. We all know what this functions does. As a Junior, I have never bothered to actually check the source code of this function. Back then source was only available to `insiders`, a handfull of special people for `Microsoft`, considered worthy to look behind the curtain. I still remember times of Steve B. and his firm stand against `Open Source`. This days are gone, `Microsoft` did a massive `U-turn` and not only [`Reference Source`][reference-source-link] is available but also [`CLR`][clr-source] code. 

[reference-source-link]:https://referencesource.microsoft.com
[clr-source]:https://github.com/dotnet/coreclr

{% highlight csharp %}
public class List<T> : IList<T>, System.Collections.IList, IReadOnlyList<T>
{
    private const int _defaultCapacity = 4;

    private T[] _items;
    [ContractPublicPropertyName("Count")]
    private int _size;
    private int _version;
    [NonSerialized]
    private Object _syncRoot;
    ...
{% endhighlight %}

This is just just a slice of the `List<T>` implementation. `Reference Source` is a great source of knowledge. You can read it and learn how to write software that is used by millions of people and thousands of `Engineers`. It is full of `good` practices that you can read and use in your own code.

For other communities `open source` is nothing special but for `.NET` that was  a massive change. This move could save `C#` and `.NET` ... but there is no time now for this discussion.

## List\<T\>.Sort()

How do we sort a List? It is quite simple.

{% highlight csharp %}
var list = new List<int> { 3, 4, 10, 5, 6, 1, 9 , 1 };
list.Sort();
Console.WriteLine(list);

output -> [1, 1, 3, 4, 5, 6, 9, 10]
{% endhighlight %}

There is also a function to sort only a slice of the list.

{% highlight csharp %}
var list = new List<int> { 3, 4, 10, 5, 6, 1, 9 , 1 };
list.Sort(0, 5, null);
Console.WriteLine(list);

output -> [3, 4, 5, 6, 10, 1, 9, 1]
{% endhighlight %}

How does it look like in the [source code][source-sort]?

[source-sort]:https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726f

{% highlight csharp %}
public void Sort()
{
    Sort(0, Count, null);
}

public void Sort(int index, int count, IComparer<T> comparer) {
    if (index < 0) {
        // Out Of Range exception  
    }
    
    if (count < 0) {
        // Out Of Range exception  
    }
        
    if (_size - index < count)
        // Out Of Range exception  

    Contract.EndContractBlock();

    Array.Sort<T>(_items, index, count, comparer);
    _version++;
}
{% endhighlight %}

I removed `ThrowHelper` and replaced with commment to explain what it does and increase readability. It is interesting that there is a lack of consistency for`if` statements. First two are using `{}` and the third one is not.

`Contract.EndContractBlock()` is part of `Code Contracts`. This is a framework to generate assertions that are used for instance by static analyzers to verify the correctnes of code. This is a evolution of `Assertions`, contracts are more powerfull and can be used to generate runtime checks, static checks and also to generate tests by using `Test Generation tools`.

Usually just like with `Assertions` you need to add snippets of code like:

{% highlight csharp %}
Contract.Requires(x != null);
{% endhighlight %}

`Contract.EndContractBlock()` is special as it wraps preceeding `if` statements and code conditions into the `Code Contract` semantics. It is very usefull when using legacy code as you just mark `CodeContract Block` that reuses existing code. There is not need to change anything. [more info - `Code Contracts` docs][code-contracts]

[code-contracts]:https://docs.microsoft.com/en-us/dotnet/framework/debug-trace-profile/code-contracts#usage_guidelines

{% highlight csharp %}
Array.Sort<T>(_items, index, count, comparer);
_version++;
{% endhighlight %}

The call is redirected to `Array.Sort<T>` function.

The parameters in this case are:

* `_items` -> `T[]` internal representation of the list
* `index` -> `0` - start from the begining of the list
* `Count` -> `list` count -> sort whole list
* `comparer` -> `null` -> use default comparer

`_items` - Internally `List<T>` uses `array` to store values. `List` enriches f`Array` providing dynamic resizing, sorting, add with resize, remove  and other things.

Another interesting bit here is  `_version++` operation.

## _version++

`_version` is a integer value used to check if internal `State` of the `Array` has changed.

Operations ending with `_version++`: 

* `Add`, `Remove`, `Clear`, `Insert`, `[]` using index to set 
* `Sort`, `Reverse` - changing order of items is considered as state change

Why would this be usefull?

You are probably familiar with code like this:

{% highlight csharp %}
var list = new List<int> { 1, 2, 3, 4, 5, 6, 8};

foreach(var l in list)
{
  list.Insert(0, 10);
  Console.WriteLine(l);
}

output:
1 
InvalidOperationException: Collection was modified; enumeration operation may not execute
{% endhighlight %}

If you ever wondered how does the framework know when to throw that exception. You know the answer now. It uses `_version` to do that.

As `List` is a wrapper of array, if you change the state of array inside foreach there is no exception as there is not support for this `State` change protection during enumeration.

{% highlight csharp %}
var array = new int[]{1, 2, 3, 4, 5, 6};
foreach (int item in array)
{
  array[1] = 3;
  Console.WriteLine(item);
}

output:
1, 3, 3, 4, 5, 6
{% endhighlight %}

No exception here. Exception won't also happen if `for` loop is used instead of `foreach`. 

{% highlight csharp %}
var list = new List<int> { 1, 2, 3, 4, 5, 6, 8};

var once = false;

for(int i = 0; i < list.Count; i++)
{
  Console.WriteLine(list[i]);
  if(!once)
  {
    list.Insert(0, 10);
    once = true;
  }
}

output:
1 1 2 3 4 5 6 8
{% endhighlight %}

There is something special happening when you join bot `foreach` and `List`. This special thing is called `Enumerator`.

`foreach` is just a syntactic sugar, great [blog post][foreach-internals[ about the internal].

We can use great tool called [sharplab.io][sharp-lab] to check how syntactic sugar is resolved by the compiler.

[sharp-lab]:https://sharplab.io/

foreach on array [sharp lab example][sharp-lab-foreach-array]

[sharp-lab-foreach-array]:https://sharplab.io/#v2:D4AQDABCCMDcCwAoEBmKAmK0AcEDeSERUaIALBAMoAuAhgE7UAUAlPocZx50QG4MQG9WgE8IAXggA7AKYB3CAEsp1ANoBdfBGgAaCOj0o9ZPQFY9ANggBfBIh7FuPAGYB7ejNoBjABZN+9EpKUoL0wiIsTpwE9g48AMKuUgDOrgA2MgB0AOr0itQyTIosdnE2TtZI1kA

{% highlight csharp %}

var array = new int[] { 1, 2, 3, 4, 5, 6 };

foreach(var i in array)
{
    Console.Write(i);
}

changes to:

int[] obj = new int[6];
RuntimeHelpers.InitializeArray(obj, (RuntimeFieldHandle)/*OpCode not supported: LdMemberToken*/);
int[] array = obj;
for (int i = 0; i < array.Length; i++)
{
    Console.Write(array[i]);
}

{% endhighlight %}

As you can see this is a simple `for loop`.

Ignore `OpCode not supported: LdMemberToken`. This is limitation of `decompilers` not being able to find `FieldHandle` this is a special object containing `metadata`. `RuntimeHelperss.InitializerArray` is a implementation detail of `new int[] { 1..6 }`

When it comes to the `List` it looks [differently][sharp-lab-list]

[sharp-lab-list]:https://sharplab.io/#v2:D4AQDABCCMDcCwAocVoBYGKSAzFATKgBwQDeSElUeIaEAygC4CGATowBQCUZFV/ffpQBubCABsAlgGdGEALwQAdgFMA7hAAyMxgB5JSxgD4yEaABoI+SzktpLAVksA2CAF9MQqoKEAzAPasKswAxgAWHKKsEJIxShI6XD785IheXgDC/krS/uIqAHQA6qySjCocklye6W4+dYhuQA===

{% highlight csharp %}

var list = new List<int> { 1, 2, 3, 4, 5, 6 };

foreach(var i in list)
{
    Console.Write(i);
}

changes to:

List<int> list = new List<int>();
list.Add(1);
list.Add(2);
list.Add(3);
list.Add(4);
list.Add(5);
list.Add(6);
List<int>.Enumerator enumerator = list.GetEnumerator();
try
{
    while (enumerator.MoveNext())
    {
        Console.Write(enumerator.Current);
    }
}
finally
{
    ((IDisposable)enumerator).Dispose();
}
{% endhighlight %}

For loop is gone and replaced by `while` with `Enumerator`. In this post, I ll skip the `intro` to enumerators and enumeration. You can once again [read more][foreach-internals] in this great article.

[foreach-internals]:https://msdn.microsoft.com/en-us/magazine/mt797654.aspx

I want to focus on `_version` value. When we check `list.GetEnumerator()` function.

{% highlight csharp %}
public Enumerator GetEnumerator() {
    return new Enumerator(this);
}
{% endhighlight %}

We can see that whole list is being used to instantiate a new object - `Enumerator`. In the constructor `Enumerator` keeps the copy of the `_version` value.

{% highlight csharp %}
internal Enumerator(List<T> list) {
    this.list = list;
    index = 0;
    version = list._version;
    current = default(T);
}
{% endhighlight %}

This value is `private` and does not change in the whole life-time of the `Enumerator`. How is it used? If you look at decompiled code for foreach on the List, `MoveNext()` function is used to set `Current` value. Note that reference to the list is also kept.  Source code of this function looks like this.

{% highlight csharp %}
public bool MoveNext() {

  List<T> localList = list;

  if (version == localList._version && ((uint)index < (uint)localList._size)) 
  {                                                     
      current = localList._items[index];                    
      index++;
      return true;
  }
  return MoveNextRare();
}

private bool MoveNextRare()
{                
    if (version != list._version) {
        ThrowHelper.ThrowInvalidOperationException(ExceptionResource.InvalidOperation_EnumFailedVersion);
    }

    index = list._size + 1;
    current = default(T);
    return false;                
}
{% endhighlight %}

And here you go in the `MoveNextRare()` function there is a check if `original  version value` is the same as `current list version`. If list was modified during `Enumerator` life-cycle, exception will be thrown.

Tha part with:

{% highlight csharp %}
(uint)index < (uint)localList._size)
{% endhighlight %}

Is to check if iteration reached the end of the list. In that case `MoveNext` returns false and `while` loop ends. 

## Why state protection is important during enumeration?

The idea of enumeration is to read stable collection of elements. When enumerating we want to vist every element on the collection only once and do some action on it. Alowing enumeration on a changing collection introduces problems like: possibility of visiting elements two times.

We can go back to previous example with `Insert` inside a for loop to the beggingin of the list.

{% highlight csharp %}
var list = new List<int> { 1, 2, 3, 4, 5, 6, 8};

var once = false;

for(int i = 0; i < list.Count; i++)
{
  Console.WriteLine(list[i]);
  if(!once)
  {
    list.Insert(0, 10);
    once = true;
  }
}

output:
1 1 2 3 4 5 6 8
{% endhighlight %}

There is no `10` but `1` twice. When `10` was added, `i` is 0 and will be `1` onext iteration. This means that element on the `0` index moves to `1` and is printed twice when i is `0` and `1`. 

Enumaration using foreach and `List` wrapping loginc of `_version` value is here to protect us from that kind of mistake. When `Enumerating` with `foreach` on a `List` you can assume that `List` won't be changed. This frees you up from implementing more complicated application logic to handle this scenario. It is similar concept to using different types of collections, limiting posibilities and sendind a message to a fellow `developer` `Hey I am returning IEnumerable beacuase, I am expecting you to only enumerate this collection`. 

Next part we will get more into the rabbit hole and explore `Array.Sort()` touching `TrySZSort` magic.
