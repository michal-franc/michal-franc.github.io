---
layout: post
title: List.Sort internals
date: 2018-05-28 08:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [.net]
series: net-sorting
permalink: /blog/net-internals-sorting-part1/
image: net-sorting/part1.png
---
{% include toc.html %}

If we want to discover sorting in .NET, then there is no better place to start than `List<T>.Sort()`. We all know what this function. As a Junior, I have never bothered to actually check the source code behind it. Back then source was only available to `insiders`, a handful of people and partners, considered worthy to look behind the curtain. I still remember times of Steve Ballmer and his firm stand against Open Source. It was actually lack of understanding from Microsoft CEO and a bit of a Goliath telling David that he is not ready yet. These days are gone, Microsoft did a massive U-turn, changed busines model and realised that open source can be a great 'marketing tool' to bring people onto services they sell. Nowadays both `Reference Source`[^reference-source-link] and `CLR`[^clr-source] code are available. For other communities like Java it is nothing special but  for .NET that was  a massive change. Time to look behind the scenes and analyse the code - if you are curious, follow this [link][list-source].

[^reference-source-link]:[Reference Source Microsoft](https://referencesource.microsoft.com)
[^clr-source]:[Github - coreclr](https://github.com/dotnet/coreclr)
[list-source]:https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,36

## A slice of List source code

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

    static readonly T[]  _emptyArray = new T[0];       
    ...
{% endhighlight %}

This is just a slice of the `List<T>` implementation. Couple of things to note here.

`_items` - Internally `List<T>` uses `array` to store values. List is a wrapper that adds new functionalities to array like: dynamic resizing, sorting, add, remove and more.

`_size` - integer value with current List size. `List.Count` returns this one. If new item is added `_size` increments by one. This makes `List.Count` a bit faster as it doesn't have to count the elements in array which would take O(n) operations. An interesting question here is - why keeping _size if array already has a property Length? This is due to the array having different size than the list most of the time. Array size is always multiplication of 2 while list can grow by +1. Matt Warren made a great blog post about it [^array-length]. I think length is encoded in the memory representation of array [^array-lengt-encoding]. Max number of items is 2.146.435.071 [^array-max-cap].

`_syncRoot` - used for thread synchronization. There is a great stack overflow answer explaining `SyncRoot` pattern [^sync-root].

`_emptyArray` - static array used for empty array creation - this makes it possible to reference the same array if there are two arrays of type 'T'. There is no need to allocated new empty arrays all the time new empty one is created.

`_defaultCapacity` - initialy empty array has capacity '0' but when adding first items this is the initial capacity. After 4 arrays grow by the multiplication of 2 - 4, 8, 16, 32, 64. This is done automatically [^ensure-capacity].

`_version` - used to check if List state has changed -  we will discuss this one later

[^sync-root]:[StackOverflow - Sync Root Pattern](https://stackoverflow.com/questions/728896/whats-the-use-of-the-syncroot-pattern)
[^array-max-cap]:[ReferenceSource - Array](https://referencesource.microsoft.com/#mscorlib/system/array.cs,624)
[^array-length]:[Arrays and CLR a Very Special Relationship - Matt Warren](http://mattwarren.org/2017/05/08/Arrays-and-the-CLR-a-Very-Special-Relationship)
[^array-length-encoding]:[github/coreclr - bitvector.h](https://github.com/dotnet/coreclr/blob/master/src/inc/bitvector.h#L335)
[^ensure-capacity]:[ReferenceSource - List](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,405)

## List\<T\>.Sort()

Sorting list is simple. All you need to do is to call `Sort` function.

{% highlight csharp %}
var list = new List<int> { 3, 4, 10, 5, 6, 1, 9 , 1 };
list.Sort();
Console.WriteLine(list);

output -> [1, 1, 3, 4, 5, 6, 9, 10]
{% endhighlight %}

If you want you can sort only a slice of the list.

{% highlight csharp %}
var list = new List<int> { 3, 4, 10, 5, 6, 1, 9 , 1 };
list.Sort(0, 5, null);
Console.WriteLine(list);

output -> [3, 4, 5, 6, 10, 1, 9, 1]
{% endhighlight %}

Analysing source code we can see that `Sort` calls `Array.Sort<T>` [^source-sort]. It is not a surprise as we already know that internally List is an array.

[^source-sort]:[ReferenceSource - List.Sort](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726f)

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

I removed some code (throw instructions) to make it more readable. It is interesting that there is a lack of consistency for `if` statements. First, two are using `{}` and the third one is not.
  
`Contract.EndContractBlock()` is part of `Code Contracts`[^code-contracts]. It is an assertion like a framework used by static analyzers to verify the correctness of code. For C++ developers it is not new as assertions are used extensively in C++. Contracts are more powerful and can be used to generate runtime checks, static checks and also tests by using test Generation tools.

[^code-contracts]:[Code Contracts](https://docs.microsoft.com/en-us/dotnet/framework/debug-trace-profile/code-contracts#usage_guidelines)

Simple contract check can look like this:

{% highlight csharp %}
Contract.Requires(x != null);
{% endhighlight %}

`List.Sort` uses a different mechanism to generate contracts using `Contract.EndContractBlock()`. It is a special construct that wraps preceding `if` statements and code into the code contract semantics. It is useful with legacy code and pre-exisitng defensive code as most of it can be reused without changes.

{% highlight csharp %}
Array.Sort<T>(_items, index, count, comparer);
_version++;
{% endhighlight %}

Array.Sort is called with these parameters:

* `_items` -> `T[]` internal representation of the list
* `index` -> `0` - start from the beginning of the list
* `Count` -> `list` count -> sort whole list
* `comparer` -> `null` -> if it is null use default comparer

Apart from calling `Array.Sort` there is also operation `_version++`.

## _version++

`_version` is an integer value incremented every time state of the list is changes. State here means the items of the list.  Operations ending with `_version++`: 

* `Add`, `Remove`, `Clear`, `Insert`, `[]` using an index to set 
* `Sort`, `Reverse` - changing the order of items is considered a state change

Why would this be useful? You are probably familiar with code like this:

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

If you ever wondered how does .NET knows when to throw that exception here is your answer. It uses `_version` number to do that. But first, we need to go to basics and not use the `List`. 

If there is a state change in the array inside foreach there is no exception. So it is not foreach responsible for that.

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

Is it the List? It is easy to check that. If you use List inside for loop and change its state there is also no exception.

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

You need both `foreach` and `List` for this exception to happen. So there is something special happening when you combine both `foreach` and `List`. As `foreach` is just a syntactic sugar [^foreach-internals], a code transformed by the compiler to a different form. We can use a tool like [sharplab.io][sharp-lab] to check how it is resolved. [Code to this example][sharp-lab-foreach-array].

[sharp-lab]:https://sharplab.io/

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

In the end foreach using array is a for loop. Ignore `OpCode not supported: LdMemberToken`[^decompiler-limitation]. 

[^decompiler-limitation]:This is limitation of `decompilers` not being able to find `FieldHandle` this is a special object containing `metadata`. `RuntimeHelpers.InitializerArray` is a implementation detail of `new int[] { 1..6 }`.

Now when it comes to using both `List` and `foreach` there is a big change - [code example][sharp-lab-list].

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

`foreach` using `List` is not resolved to loop. It uses `while` loop with the `Enumerator`. I will skip `intro` to enumerators and enumeration. You can check this great article [^foreach-internals] if you want to learn more. 

In a nutshell, `Enumerator` is a wrapper on top of `enumeration` - a process of  stepping through the items.  In a simple for loop, this process is not complicated, take one element and do something with it. You can expand it by adding more logic: validation, checks etc, but there is one limitation. Each next value doesn't know anything about the previous one. There is no shared context or state.`Enumerator` adds this shared context by being a stateful `intermediary` betwen the collection and the code. This enables us to add new logic whenever there is a movement to a next item or current item is obtained. The beauty of it is that `foreach` understands `Enumerator`.

[^foreach-internals]:[MSDN - Essential .NET Understanding C# foreach ... ](https://msdn.microsoft.com/en-us/magazine/mt797654.aspx)

One example which shows the beauty of `Enumerator` is list state protection during enumeration. It uses `_version` value to do that.

If we simplify the previous example we get a simple code that gets enumerator, uses `while` loop to call `MoveNext` function and then uses `Current` to obtain the element.

{% highlight csharp %}
List<int>.Enumerator enumerator = list.GetEnumerator();
try
{
    while (enumerator.MoveNext())
    {
        Console.Write(enumerator.Current);
    }
}
{% endhighlight %}

If we look inside `list.GetEnumerator()`. We can see that all it does is creates a new `Enumerator` using itself (the list) as a input parameter.

{% highlight csharp %}
public Enumerator GetEnumerator() {
    return new Enumerator(this);
}
{% endhighlight %}

We need to go deeper to the constructor of `Enumerator` to see how it is used.  

{% highlight csharp %}
internal Enumerator(List<T> list) {
    this.list = list;
    index = 0;
    version = list._version;
    current = default(T);
}
{% endhighlight %}

First, it takes the reference to the list itself. Then sets up an index to `0` - which means that it starts with the first element and current value is set to the default one. But the most important piece here is saving the current `_version` value. This value is `private` and does not change in the whole lifetime of the `Enumerator`. How is it used? 

We discussed already how `Enumerator` wraps operation to move to next element and get the current element. If we look at `MoveNext` source code we can clearly see how `_version` is used.

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

And here you go in the `MoveNextRare()` function there is a check if the saved initial `version` value is the same as the current list `version`. It basically checks if a list was modified during the `Enumeration`. If it was then an exception is being thrown.

Tha part with:

{% highlight csharp %}
(uint)index < (uint)localList._size)
{% endhighlight %}

Is to check if iteration reached the end of the list. In that case `MoveNext` returns false and `while` loop ends. 

## Why is state protection important during enumeration?

The idea of enumeration is to read a stable collection of elements. When enumerating we want to visit every element on the collection only once and do some action on it. Allowing the collection to change during enumeration  introduces problems like - possibility of visiting elements two times.

We can go back to the previous example with the `Insert` inside a for loop

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

This code adds `10` to the beginning of the list only once. If you look a the output due to this number `1` is displayed twice and there is no `10`. When `10` is added, `i` is 0 and will be `1` on next iteration. Due to `10` added at the front, the element on the `0` index moves to `1` and is printed twice when i is `0` and `1`. 

`Enumeration` using foreach and `List` with `_version` value is here to protect us from that kind of mistake. Thanks to it we can you assume that when using foreach List won't change. This frees you up from implementing more complicated application logic. It is a similar concept to using different types of collections, limiting possibilities and sending a message to a fellow `developer` `Hey I am returning IEnumerable because I am expecting you to only enumerate this collection`. In this example it says - `Hey I am using foreach on purpose and making sure that nothing is gonna change that list during enumeration`.


## Ending notes

The Journey has started. There is, of course, more things about `List` that we can write about, but I leave that to you dear reader. In next part, we will move down the rabbit hole and discuss `Array.Sort()` also touching `TrySZSort` magic.

**Btw** If `_version` value is int and it increases every time we change the state of the list. Then does it mean that you can do a limited amount of operations on the list? I am curious about the answers :)
