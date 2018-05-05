---
layout: post
title: Everything you wanted to know about Sorting in .NET
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [alkgorithms]
permalink: /algorithms/everything-you-wanted-to-know-about-sorting-net/
---


TODO:
- Matt Warren consult with this blog post
- coreclr - docs ask for addng this post to the list

#### TL;DR;

> Not a brief journey into .NET internals and sorting algorithms in the real-world

You might ask question. Why do you need to know sorting algorithms at all. There are frameworks. You call .Sort() function, some magic happens - data is sorted - time to go home. There is a lot of truth in that but ... 

* You might encounter problems that simple calls to framework functions won't be enough
* You need to know what is stable nad unstable sorting algorithm, it can influence your design decisions
* Sorting algorithms are a great introduction to the world of 'trade-offs'
* This is also example of multiple 'tools' doing same thing in different ways
* It is a good way to learn about 'divide and conquer', 'asympthotic complexity' and recurssion

W takim podejsciu jest wiele racji i nie jest ono zle. Framework to narzedzie do rozwiazywania naszych problemow biznesowych ktore w wiekszosci przypadkow sa wwanziejsze niz rozwazania nad tym jak dzialaja dokladnie algorytmy sortujace. Moj szef baardziej bedzie zadowolony jak dowioze nowy ficzer na produkcje zamiast ekscytujacego opowiaadania o tym ze .NET uzywa algorytmu IntroSort ktory dziala tak i tak. Wiedza ta tez nie zaimponuje moim znajomym.

Po co wiec inwestowac czas I budowac takie powiazania w sieci Neuronowej. Po pierwsze czytajac ten post dostajesz juz gotowa wydystylowana wersje i wiedze. Wiec nie musisz spedzac tyle czasu co ja (autor) na przeszukiwaniu i googlowaniu internetow oraz czytaniu White Paperow.

Po drugie drugie - Algorytmy sortujace i to jak sa skontsutrowane oraz jakie 'tradeoffs' sie w nich podejmuje jest bardzo ciekawe i wbrew pozorom moze sie przydac w przyszlej pracy. Na pewno przyda sie w pracy w ktorej wychodzimy poza framework i zderzamy sie z problemami dla ktorych framework nie jest wystarczajacy. 

<przyklad takich problemow? -> np sortowanie duzych ilosci danych albo sortowanie danych external, albo ficzer wymagajacy sortowania stabilnego>

Po trzecie - Na poziomie tak niskiego kodu jak sczegoly implementacyjne algorytmow sortujacych - sa to lata badan naukowcow - jest tam tona wiedzy ktora moze sie przydac w innych systemach. Czytajac o algorytmach sortuajcych mozna czerpac z tej wiedzy.

Po czwarte, i ostatnie - jako Architekt-Inzynier na codzien w pracu musze lawirowac w niedoskonalych rozwiazaniach przy ktorych ciagle musze podejmowac decyzje 'tradeoff' - te decyzje czessto sa saa suma mniejszych calosci - i rzeczy na niskim poziomie.

- Why is it usefull to have this kind of knowledge?
-- Where sorting is important?
-- What kind of things you need:
--- to know
--- could be usefull to know


1. We will go deep down to .NET and start getting deep inside the framework starting with List.Sort() operation discussing what is happening
  - Stack Trace road to the Algorithm
  - IEnumerable version and state management
2. C++ native World
3. We will discuss IntroSosrt .NET Sorting implementation
  - introduction to QuickSort
  - brief characteristis and description of other algorithms
  - why quicksort?
  - Problem with Quickosrt?
    - pivot
    - wors case
  - ways to deal with quickSort problems - introsort
  - CS course vs Real World
4. We will discuss Sort algorithms tradeoffs and design decision chosen by the .NET creators
5. Discussion around other frameworks and what sorting algorithms they have and why this idea
  - python Java timsort?
  - go quicksort?
  - javascript - weirdness and quicksort?
  - scala,| clojure ?
  - C++? C?
  - django?
  - ta java od JetBrainsa
  - why developers didnt standarised sorting algorithm across the industry and platform

- Gdzie sorotwanie jest wazne
- Czego mozna sie z sortowania naauczyc zauwazyc
- Real world vs theory

[sort_source]: https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726
[array_source]: https://referencesource.microsoft.com/#mscorlib/system/array.cs,54496ee33e3b155a
[trysz_source]: https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.cpp#L268
[intro_sort_source]: https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L128

#### 'StackTrace'

* `System.Collections.Generic.List<T>.Sort()` [source][sort_source]
  * `_version++` - keeping enumaration save from 
* `Array.Sort<T>()` [source][array_source]
  * what happens if comparer is provided or not?
  * What is `FEATURE_LEGACYNETCF` and `MangoArraySortHelper?` why this thing (in the making)
* `TrySZSort()`
  * what is SZSort?
  * Visual Basic and the world of non one based arrays
* `TrySZ` and native function [source][trysz_source]
  * `FCIMPL4` - extern calling
  * ValidateObject? Asserte?
  * Why VB is Sad with this implementation
  * Which types are supported and how they are expressed and checked?
  * Why ddifferent implementation per type?
  * What is NanPrepass and Why NanPrepass for Float and Double?
  * What happens if TrySZSort 'fails'?
  * IntrospectiveSort [source][intro_sort_source] 
```

### It all started in List.Sort

{% highlight csharp %}
var list = new List<int> { 3, 4, 10, 5, 6, 1, 9 , 1 };
list.Sort();
Console.WriteLine(list);
output -> [1, 1, 3, 4, 5, 6, 9, 10]
{% endhighlight %}

We are used to this code. Nothing special here. Simple list, sort invocation and magic happens. But what hidden behind the curtain?

Simple `.Sort()` call is not the only call that sorts the List.

{% highlight csharp %}
1. list.Sort()
2. list.Sort(IComparer<T> comparer)
3. list.Sort(Comparison<T> comparison)
4. list.Sort(int index, int count, IComparer<T> comparer))
{% endhighlight %}

Which means there is a way to sort only part of the array.

{% highlight csharp %}
var list = new List<int> { 3, 4, 10, 5, 6, 1, 9 , 1 };
list.Sort(0, 5, null);
Console.WriteLine(list);
output -> [3, 4, 5, 6, 10, 1, 9, 1]
{% endhighlight %}

`.Sort()` is overloaded function with this parameteres `.Sort(0, count, null)`

{% highlight csharp %}
public void Sort()
{
    Sort(0, Count, null);
}
{% endhighlight %}
[source](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726f)

Going down the 'rabbit hole' ultimately we get to the `Array.Sort<T>` function.

{% highlight csharp %}
Array.Sort<T>(_items, index, count, comparer);
_version++;
{% endhighlight %}

The parameters in this case are:

* `_items` -> `T[]` internal representation of the list
* `index` -> `0` - start from the begining of the list
* `Count` -> `list` count -> reach the end of the list
* `comparer` -> `null` -> use default comparer

`_items` - Internally `List<T>` uses `Array` to store its values. It serves as an abscration, enabling dynamic resizing, sorting, convinient add, remove and other things.

`_version++` - integer value that is increased everytime there is operation that changes `State` of the list. Used to check if `State` was changed. 

Operations ending with `_version++`: 

* `Add`, `Remove`, `Clear`, `Insert`, `[]` using index to set 
* `Sort`, `Reverse` - changing order of items is considered as state change

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
And exception
{% endhighlight %}
<span style="color:red">**InvalidOperationException: Collection was modified; enumeration operation may not execute**</span>

This was one of the exceptions that haunted me a lot as a Junior Dvv. It is thrown to protect the `enumeration`. The idea of enumeration is to read static and stable collection of elements. When enumerating we want to vist every element on the collection only once. If we would allow enumerating on a collection that is changing, there is a possibility to `enumerate` element twice.

With `for` loop there is no protection and we can do whatever we want.

{% highlight csharp %}
var list = new List<int> { 1, 2, 3, 4, 5, 6, 8};

for(int i = 0; i < list.Count; i++)
{
  Console.WriteLine(list[i]);
  list.Clear();
}

output:
1
{% endhighlight %}

Something we potentialy expected but what if code looks like this.

{% highlight csharp %}
var list = new List<int> { 1, 2, 3, 4, 5, 6, 8};

var once = false;

for(int i = 0; i < list.Count; i++)
{
  Console.WriteLine(list[i]);
  if(!once)
  {
    list.Insert(0, 10); //<- inserting 10 at the begginging

    once = true;
  }
}

output:
1 1 2 3 4 5 6 8
{% endhighlight %}

There is no `10` but `1` twice. That is beacuse when `10` was added `i` is 0 and will be `1` next iteration. This means that element on the `0` index moves to `1` and is printed twice when i is `0` and `1`. 

Enumeration is here to protect us from that kind of mistakes.

Sometimes we need to have a collection that is being enumerated and changed in the same time. Consumers - Producers - collection of some `Items` used by competing consumers to do thing. There is a writer creating new Items and readers reading it. But in that scenario it is generally better to use `Concurrect Collections` that are thread-safe and provide both lock or lock-free synchronization. Instead of writing your of `synchronization` using locks. As an example - ConcurrentBag that for multiple producers and consumers maintains `local queue` per thread and sometimes enables this thread to have `lock-free` access to data. Concurrent Collections are not as `scallable` your own implementation but they provide `safety` which in `multi-threading` apps can be more problematic thant a bit of loss in performance.  This is area where `Data Structure` knowledge gets usefull.

`_version` is used in operations like:

* [`ForEAch`](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,0e5a9cf0a310b9e5)
* [`Enumerator`](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,d3661cf752ff3f44)

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

#### Getting into Native World - TrySZSort

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

QCall` and `FCall` function. This is still a very simplified description - `TrySZSort` is part of `mscorlib` (which was a successor to `COM` and is resolved as `Microsoft Common Object Runtime Library`). `Mscorlib` contains definitions of basic types you get to use in .NET like: Object, Int32, String. It gets complicated as `mscorlib` types are used in both `managed` as `unmanaged` code. That is why you will find `C++` native code here (With .NET Core it gets even more complicated as there is now coreclr)
 
There are two ways to call into the CLR from managed code - `QCall` and `FCall`.

This function decralation looks a bit weird, due to being a `C++` macro - `FCIMPL4`. It is a function generating macro - `4` is a number of arguments. `FC_BOOL_RET` tell the macro that this function returns `BOOL`. The big question here is - what is `FCIMPL`. Uhh this will be tricky.

`FCIMPL` - is used to create `FCALL` function. This is a `native` function that is part of `CLR` code. The only way to create `FCALL` is inside CLR, there is no way to create this in user created assembly. 
This functions are used to enable call from `managed` to `native` code. To mark function as the one calling `FCALL` in `CLR` you need to have declaration of extern function with attribute `MethodImplOptions.InternalCall`.

{% highlight csharp %}
[MethodImplAttribute(MethodImplOptions.InternalCall)]
private static extern bool TrySZSort(Array keys, Array items, int left, int right);
{% endhighlight %}

In order to create `FCALL`:

* registers function in a [ECClass table][ecclass] - static table with entry points to `FCALL` functions. This is used by jitter to find the entry points. Example: [TrySZSort entrypoint][ecalllist]  
* add function to the `ECFunc` array for a class that has this function. Example: [TrySZSort][ecfunc-in-class]
* add extern static function with `InternalCall` decorator in managed code
* use FCIMPL macro to generate function - your code needs to be inside this macro

[Example Commit][example-new-fcall] from MS team when adding new function.

[ecalllist]:https://github.com/dotnet/coreclr/blob/master/src/vm/ecalllist.h#L814
[ecclass]:https://github.com/dotnet/coreclr/blob/master/src/vm/ecall.cpp#L27
[ecfunc-in-class]:https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L335
[example-new-fcall]:https://github.com/dotnet/coreclr/commit/c61525b5883e883621f98d44f479b15d790b0533#diff-3667dffbd11675529c85670ef344242e

What is `FCALL`?
Based on [code][fcall]

[fcall]:https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h

> FCall is a high-performance 'alternative' to ECall

There are two types of `ECall` - `QCall` and `FCall`

ECall is a `private native calling interface`. When the managed code wants to acces a `native` function it goes to `execution engine` and `EE` uses `Ecall` to find the particular function (that is why entry point needs to be registered). When the function is found - `EE` calls this function.

> `ECall` is a set of tables to call functions within the EE (Execution Engine) from the classlibs.  First we use the class name & namespace to find an array of function pointers for a class, then use the function name (& sometimes signature) to find the correct function pointer for your method.   
[source][ecall-source]

[ecall-source]: https://github.com/dotnet/coreclr/blob/master/src/vm/ecall.cpp#L350

> `QCalls` are the preferred mechanism going forward. You should only use `FCalls` when you are "forced" to. This happens when there is common "short path" through the code that is important to optimize. This short path should not be more than a few hundred instructions, cannot allocate GC memory, take locks or throw exceptions    
[source][qcall-preffered]

[qcall-preffered]:https://github.com/dotnet/coreclr/blob/master/Documentation/botr/mscorlib.md#choosing-between-fcall-qcall-pinvoke-and-writing-in-managed-code

> We have two techniques for calling into the CLR from managed code. FCall allows you to call directly into the CLR code, and provides a lot of flexibility in terms of manipulating objects, though it is easy to cause GC holes by not tracking object references correctly. QCall allows you to call into the CLR via the P/Invoke, and is much harder to accidentally mis-use than FCall. 
[source][qcall-vs-fcall]

[qcall-vs-fcall]:https://github.com/dotnet/coreclr/blob/master/Documentation/botr/mscorlib.md#calling-from-managed-to-native-code

`QCALL`  

- is more safe but less performant

`FCALL` - [docs][fcall-source]  

- are more performant when `Frames` (HelperMethodFrame) are not used
- you need to create `Frame` to handle Exceptions or `GC`
- susceptible to `GC holes` and `GC starvation`
- more error prone due to manual control of `GC` and `Frames`

[fcall-source]:(https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h)

Actually microsoft is movng more code from FCall to managed code - link to twweet from the Jan Guy. There has to be a trade off and balance beetwen 'raw performance' - 'memory leaks'

> We have ported some parts of the CLR that were heavily reliant on FCalls to managed code in the past (such as Reflection and some Encoding & String operations), and we want to continue this momentum. We may port our number formatting & String comparison code to managed in the future.
[source][fcall-deprecation]

[fcall-depreccation]:https://github.com/dotnet/coreclr/blob/master/Documentation/botr/mscorlib.md#choosing-between-fcall-qcall-pinvoke-and-writing-in-managed-code

Why doing all this complicated stuff and not have `TrySZSort` in managed code?

Example of optimizations as FCalls in String.
http://mattwarren.org/2016/05/31/Strings-and-the-CLR-a-Special-Relationship/
TL;DR; String are embeded directly into CLR - you cant emulate their code as CLR provides a lot of benefits.

How is FCall optimizing TrySZSort - why not using QCall here?

What is HelperMethodFrame?
It is a special frame that allows `stackwalking` inside `FCalls`.

Ohh well this is a huge topic and there is no space to actually discuss it all here. I can only refer to [stackwalking][stackwalking-source] and [frames][frames-source].

[sackwalking-source]:https://github.com/dotnet/coreclr/blob/master/Documentation/botr/stackwalking.md

[frames-source]:https://github.com/dotnet/coreclr/blob/master/src/vm/frames.h

`FCIMPL` - why this macro?

> Since `FCALLS` have to conform to the `EE` calling conventions and not to C calling conventions, `FCALLS`, need to be declared using special macros `(FCIMPL*)` that implement the correct calling conventions.

> A calling convention describes how the arguments are passed and values returned by functions. It also specifies how the function names are decorated.
[source][calling-conventions]

> It specifies how (at a low level) the compiler will pass input parameters to the function and retrieve its results once it's been executed.
[source][calling-convs-so]

There are many [conventions][calling-conventions]. They differ in things like.

- where are arguments stored - registers - stack - other places
- how are the arguments added - left to right or right to left
- where do you put result of the function call (stack, register, memory)
- who is responsible for stack cleanup - caller or caller ( this make huge difference if caller is cleaning up stack - the compiled code need to generate cleaning logic every time a function is called increasing the size of code )
- who is responsible for `cleaning` up `registers` and bringing them back to previous state

If you want to seee examples on how conventions are translated to dism
https://en.wikibooks.org/wiki/X86_Disassembly/Calling_Convention_Examples
https://en.wikibooks.org/wiki/X86_Disassembly/Calling_Conventions#FASTCALL

[calling-conventions]:https://www.codeproject.com/Articles/1388/Calling-Conventions-Demystified
[calling-convs-so]:https://stackoverflow.com/questions/10671281/what-is-the-fastcall-keyword-used-for-in-visual-c

>  An `FCall` target uses `__fastcall` or some other calling convention to match the IL calling convention exactly

I am not gonna bore about more detail but `__fastcall` is a convention that is `supposed to be faster` as it uses `registers` for first 2 arguments when `standard` convention uses stack. This is oversimplified description and for more details check this links.

{% highlight csharp %}
https://blogs.msdn.microsoft.com/oldnewthing/20040102-00/?p=41213
https://blogs.msdn.microsoft.com/oldnewthing/20040107-00/?p=41183
https://blogs.msdn.microsoft.com/oldnewthing/20040108-00/?p=41163
https://blogs.msdn.microsoft.com/oldnewthing/20040113-00/?p=41073
https://msdn.microsoft.com/en-us/library/6xa169sk.aspx
https://msdn.microsoft.com/en-us/library/984x0h58.aspx
https://gcc.gnu.org/onlinedocs/gcc/x86-Function-Attributes.html
{% endhighlight %}

{% highlight csharp %}
`FCALL_CONTRACT`
{% endhighlight %}

This contract tells the compiler and macro certaing `properties` of the code it is applied to.

<< NEED EXPERT HERE >>


- STATIC_CONTRACT_SO_TOLERANT
  It means that the function can cope with Stack Overflow exception. When the function is SO_TOLERANT 
  SO_TOLERANT disables stack guard and stack probing this function doesnt generate any global state and can just die + we cant actually check if SO will be violated?

There are couple of cases when you code cannot tollerate stack overflow:
- your code updates global state that neesd to be cleaned up 

If you want to have a function that is SO Intollerant you need to use SO Probe to propely clean up resources generated by this function. SO probe is generated by using macto SO_INTOLERANT_XXX

SO probe - is a tool to identify if there is enough space on SO to do the operation.  For instance during object allocation Stack Probe is used to determine if tthere is more than enough  space on the Stack.
 
IF SO probing is disabled all the code is considere SO Intolerant.
IF there is SO in intolerant code the proces is killed
IF there is so in tolertant code and GC mode is preemptive the proces is killed 
If there is a SO in Cooperative mode the domain is unloaded (by GC) or the process is killed if this is a default domain

https://github.com/dotnet/coreclr/blob/1c8c59387cb5989b5494f346c8127feb9dff27bc/src/vm/eepolicy.cpp#L851

https://github.com/dotnet/coreclr/blob/master/src/vm/stackprobe.h

There are two types of SO - hard and soft (soft is when Stack Probe is acctive)
https://github.com/dotnet/coreclr/blob/35da2c8a07d7aef8bd4c874b81241bab52af83ce/src/inc/ex.h#L132

INTOLLERANT is the default state

- STATIC_CONTRACT_GC_NOTRIGGER - this function cannot trigger `Garbage Collection` if this is also coop mode

https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md#2110-how-to-know-if-a-function-can-trigger-a-gc

Why you need to block GC?
- STATIC_CONTRACT_THROWS - this function can throw Exception
Why would you block exception throws?


- STATIC_CONTRACT_MODE_COOPERATIVE 

https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md#2.1.8

GC MODE on Entry?
https://github.com/dotnet/coreclr/blob/32f0f9721afb584b4a14d69135bea7ddc129f755/src/inc/contract.h#L33

https://github.com/dotnet/coreclr/blob/master/src/vm/perfinfo.cpp#L31

https://github.com/dotnet/coreclr/blob/master/src/vm/fastserializer.cpp#L83

[source][fcall-contract]

[More on flags and basic CLR guidelines][clr-code-guide]

[clr-code-guide]:https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md


[fcall-contract]:https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h#L1384

{% highlight csharp %}
    VALIDATEOBJECT(keys);
    VALIDATEOBJECT(items);
    _ASSERTE(keys != NULL);
{% endhighlight %}

`VALIDATEOBJECT` is a diffferent `FCALL`  - not sure what it does but I would assume that it is just a check if args and params are Valid somehow - maybe null check etc  <<EXPERT ADVICE NEEDED HERE>>

`_ASSERTE` -> https://msdn.microsoft.com/en-us/library/ezb1wyez.aspx


{% highlight csharp %}
   // <TODO>@TODO: Eventually, consider adding support for single dimension arrays with
    // non-zero lower bounds.  VB might care.  </TODO>
    if (keys->GetRank() != 1 || keys->GetLowerBoundsPtr()[0] != 0)
        FC_RETURN_BOOL(FALSE);
{% endhighlight %}

All right, now we are getting to something meaty. 
First thing to spot here - TODO mentioning that VB non zero based array support was not added and is not supported. If this is non zero based array we just return with False

{% highlight csharp %}
TypeHandle keysTH = keys->GetArrayElementTypeHandle();
const CorElementType keysElType = keysTH.GetVerifierCorElementType();
if (!CorTypeInfo::IsPrimitiveType_NoThrow(keysElType))
    FC_RETURN_BOOL(FALSE);
if (items != NULL) {
    TypeHandle itemsTH = items->GetArrayElementTypeHandle();
    if (keysTH != itemsTH)
        FC_RETURN_BOOL(FALSE);  
}
{% endhighlight %}

Another two preconditions which may force the code to end prematurely.

- first checkin if the sorted array contain only primitive types
- second type of key is verified if has the same type as the items... wait what? arent't we sorting array? Sure we are and that is why `items` in this scenario is null thus we dont check the other preconditions. TrySZSort not only supports arrays with only items but also by SortedList that is implementation of IDictionary - has both keys and items. Entry point for this function is here

> https://referencesource.microsoft.com/#mscorlib/system/array.cs,1855

{% highlight csharp %}
public static void Sort<TKey, TValue>(TKey[] keys, TValue[] items, int index, int length
{% endhighlight %}


{% highlight csharp %}
public SortedList(IDictionary d, IComparer comparer) 
    : this(comparer, (d != null ? d.Count : 0)) {
    if (d==null)
        throw new ArgumentNullException("d", Environment.GetResourceString("ArgumentNull_Dictionary"));
    Contract.EndContractBlock();
    d.Keys.CopyTo(keys, 0);
    d.Values.CopyTo(values, 0);
    Array.Sort(keys, values, comparer);
    _size = d.Count;
}
{% endhighlight %}

https://referencesource.microsoft.com/#mscorlib/system/collections/sortedlist.cs,173

You cannot sort SortedList but when it is created it Uses `Array.Sort` to generate initial sorted state. When new items are inserted Binary Serach is used to idenfity the index and place to insert new item.

{% highlight csharp %}
// Handle special case of a 0 element range to sort.
// Consider both Sort(array, x, x) and Sort(zeroLen, 0, zeroLen.Length-1);
if (left == right || right == 0xffffffff)
    FC_RETURN_BOOL(TRUE);
{% endhighlight %}

`left == right` - cover scenario when slice of arrays is being sorted that has a length of `0`. `left` and `right` have the same value in that case.

But what is `0xfffffffff`? and why right is checked for it?

`0xfffffffff` is a represantion of `-1` in [Two complement system][wiki-two-comp]. How is `0xffffffff` -> `-1`.

To create value in two complement:

- take one complement value
- add + 1 
if we take 32 bits values
then 1 in Binary will be -> 0x00000001 = 00000000 00000000 00000000 00000001
`-1` in the one complement is the opposite = 0xFFFFFFFE -> 11111111 11111111 11111111 1111110

to make it two complement we need to add +1 so 

0xFFFFFFFE + 1 = 0xFFFFFFFF

To check if that is the correct value we do arithmetic

`1` + `-1` = 0

{% highlight csharp %}
unchecked
{
  var minus_one =  (int)0xFFFFFFFF;
  var one =  (int)0x00000001;
  
  Console.WriteLine($"0xFFFFFFFF is '{minus_one}'");
  Console.WriteLine($"0x00000001 is '{one}'");
  Console.WriteLine($"0xFFFFFFFF + 0x00000001 is '{minus_one + one}'");
}
result:
0xFFFFFFFF is '-1'
0x00000001 is '1'
0xFFFFFFFF + 0x00000001 is '0'

{% endhighlight %}

[wiki-two-comp]:https://en.wikipedia.org/wiki/Two%27s_complement 

Why then use `0xfffffffff` instead of `-1`. I got help from a friend [krzaq][krzaq-website] with this one. `right` argument is of type `UINT32`. It is a unsiged value for which `-1` doesn't exist. But in order to still be able to check if it is `-1` you have to use `0xfffffffff`. Using `-1` might work it would be depend on the compiler implementation how situation like that is handled. With `0xfffffffff` you can be sure that code works correclty. [more-details][so-answer-more-details]

I also checked how will compiler behave in scenario with 0xFFFFFFFF using Compiler Explorer 

{% highlight csharp %}
unsigned int test() {
    return 0xFFFFFFFF;
}

gives
Gcc 7.3
test():
  push rbp
  mov rbp, rsp
  mov eax, -1 <---- weee
  pop rbp
  ret

clang 6.0.0
test(): # @test()
  push rbp
  mov rbp, rsp
  mov eax, 4294967295 <----- nooooo
  pop rbp
  ret

{% endhighlight %}

[krzaq-website]:https://dev.krzaq.cc/
[so-answer-more-details]:https://stackoverflow.com/a/1863219/104135
[compiler-explorer]:https://godbolt.org/

{% highlight csharp %}
switch(keysElType) {
{% endhighlight %}

This switch statement is used to check which generic implementation of IntrospectiveSort will be used.

To find what does ELEMENT_TYPE_I1 there are two resources.

First ENUM to hex - [source][element-hex] then map [decimal(hex) to type][hex-decimal-name]

[element-hex]:https://docs.microsoft.com/en-us/dotnet/framework/unmanaged-api/metadata/corelementtype-enumeration

[hex-decimal-name]:https://docs.microsoft.com/en-us/dotnet/api/microsoft.visualstudio.cordebuginterop.corelementtype?view=visualstudiosdk-2017

Based on that we get this nice mapping

{% highlight csharp %}
    ELEMENT_TYPE_BOOLEAN        = 0x2, = Bool
    ELEMENT_TYPE_CHAR           = 0x3, = Char
    ELEMENT_TYPE_I1             = 0x4, = SByte
    ELEMENT_TYPE_U1             = 0x5, = Byte
    ELEMENT_TYPE_I2             = 0x6, = Short
    ELEMENT_TYPE_U2             = 0x7, = UShort
    ELEMENT_TYPE_I4             = 0x8, = Int
    ELEMENT_TYPE_U4             = 0x9, = UInt
    ELEMENT_TYPE_I8             = 0xa, = Long
    ELEMENT_TYPE_U8             = 0xb, = ULong
    ELEMENT_TYPE_R4             = 0xc, = Float
    ELEMENT_TYPE_R8             = 0xd, = Double
    ELEMENT_TYPE_I              = 0x18, = IntPtr
    ELEMENT_TYPE_U              = 0x19, = UIntPtr
{% endhighlight %}


IntPTR and UINTPTr is not supported.

For Float and Double there is a special case.

{% highlight csharp %}
    case ELEMENT_TYPE_R4:
    {
        R4 * R4Keys = (R4*) keys->GetDataPtr();
        R4 * R4Items = (R4*) (items == NULL ? NULL : items->GetDataPtr());

        // Comparison to NaN is always false, so do a linear pass 
        // and swap all NaNs to the front of the array
        left = ArrayHelpers<R4>::NaNPrepass(R4Keys, R4Items, left, right);
        if(left != right) ArrayHelpers<R4>::IntrospectiveSort(R4Keys, R4Items, left, right);
        break;
    };
{% endhighlight %}

Before doing any sorting there is a Function `NanPrepass`

{% highlight csharp %}
    // For sorting, move all NaN instances to front of the input array
    template <class REAL>
    static unsigned int NaNPrepass(REAL keys[], REAL items[], unsigned int left, unsigned int right) {
        for (unsigned int i = left; i <= right; i++) {
            if (_isnan(keys[i])) {
                REAL temp = keys[left];
                keys[left] = keys[i];
                keys[i] = temp;
                if (items != NULL) {
                    temp = items[left];
                    items[left] = items[i];
                    items[i] = temp;
                }
                left++;
            }
        }
        return left;
    }
{% endhighlight %}

This function in O(n) iterates through the list and moves all the `NULL` values to the left changing list start position to be the first element that is not `NULL`. Why not treating `NULL` as a value < 0 and just sort it with the rest of values? There is a crucial note for that.

{% highlight csharp %}
Comparison to NaN is always false
{% endhighlight %}

`Prepass` is required to get rid of unspecified behaviour. If comparison to NaN always yields false then `1 >= Nan = false` and `Nan >= 1 = false`. It makes it imossible to make 'deterministic' comparisons.

{% highlight csharp %}
[1, NaN] -> Sort -> [1, NaN] or [Nan, 1]
{% endhighlight %}

This operation is O(n). Later on `IntroSort` (more on it soon) algorithm is used to sort. It has oworst and average O(nlogn) so the complexity of doing `NaNPrepass` and `Sorting` is `O(nlogn) + O(n)`. nlogn is bigger than O(n) so the overall complexity is O(nlogn) as with Big O notation the most significant component is taking over.

We have covered special scenario of Double types.

When the `primitive` type is simple integer, IntrospectiveSort function is called without any other logic.

{% highlight csharp %}
   case ELEMENT_TYPE_I1:
    ArrayHelpers<I1>::IntrospectiveSort((I1*) keys->GetDataPtr(), (I1*) (items == NULL ? NULL : items->GetDataPtr()), left, right);
    break;
{% endhighlight %}

Is it time to get to the sorting algorithm itself - yes it is.

#### From Quick Sort To IntroSort

First of all, as it was mentioned before. .NET uses [IntroSort][intro-sort-wiki] algorithm. It is a enchanced [Quicksort][quick-sort-wiki]. Before we get there we need to discuss `QuickSort` a bit. 

[intro-sort-wiki]:https://en.wikipecia.org/wiki/Introsort
[quick-sort-wiki]:https://en.wikipedia.org/wiki/Quicksort

You might have implemented `QuickSort` on the university or other hobby projects. It was a standard algorithm in the past used in many frameworks. The basic idea is simple and uses `divide and conquer` to split `big` task into `smaller` tasks.  It is also great example of using recurrence. You might have to one day implement `Quicksort on some interview`. 

{% highlight csharp %}
function quicksort(array)
    less, equal, greater := three empty arrays
    if length(array) > 1  
        pivot := select any element of array

        #O(n) operation of moving items on the left or right side of pivot
        for each x in array
            if x < pivot then add x to less
            if x = pivot then add x to equal
            if x > pivot then add x to greater

        quicksort(less)
        quicksort(greater)
        array := concatenate(less, equal, greater)
{% endhighlight %}

This is a very simplified pseudo code of the `easiest` implementaion (using allocated arrays)  of `QuickSort`. The average sorting case is handled by `O(nlogn)` but `Quicksort` worst case scenario (when array is already sorted) will take `O(n^2)`. A lot depends on the pivot selection strategy - as it can potentialy identify already sorted array and adjust worst case scenario to the average one ( we will talk about it later).

{% highlight python %}
quicksort(array):
     if len(array) <= 1:
         return array
     else:
         pivot = random.choice(array)
         less = [x for x in array if x < pivot]
         equal = [x for x in array if x == pivot]
         greater = [x for x in array if x > pivot]
         return quicksort(less) + equal + quicksort(greater))
{% endhighlight %}

This is a simple code in python. Pivot selection strategy is `random`. This is good enough strategy. This example uses array allocation that can `be` deadly and can lead to `StackOverflow`. There are other implementations that avoid using `arrays` and operate on the same `array` using `indexes` to generate `sub arrays`.

{% highlight python %}
def quicksort(array):
    __quicksort(array, 0, len(array) -1)

def __quicksort(array, start, stop):
    if stop - start > 0:
        pivot = array[start]
        left = start
        right = stop

        while left <= right:
            while array[left] < pivot:
                left += 1
            while array[right] > pivot:
                right -= 1

            if left <= right:
                array[left], array[right] = array[right], array[left]
                left += 1
                right -= 1

        __quicksort(array, start, right)
        __quicksort(array, left, stop)

{% endhighlight %}

I had to show this code as later on in the .NET - IntroSort implementation there is also `right` and `left` being used with manipulation of `one` array.

So what is `IntroSort`? It starts with `QuickSort` then switches to `HeapSort`. Why is it done like that? In a quick summary - this makes `QuickSort` average and worst case scenarios to be `O(nlogn)`. `IntroSort` takes the pros of `QuickSort` adn removes the `cons`. We will discuss how `HeapSort` makes it possible that worst case complexity of O(n^2) can be averted.

{% highlight python %}
procedure sort(array):
    let maxdepth = ⌊log(length(A))⌋ × 2
    introsort(array, maxdepth)

procedure introsort(array, maxdepth):
    n ← length(array)
    if n ≤ 1:
        return 
    else if maxdepth = 0:
        heapsort(array)
    else:
        p ← partition(array) 
        introsort(array[0:p], maxdepth - 1)
        introsort(array[p+1:n], maxdepth - 1)
{% endhighlight %}

As you can see here. There is a special parameter introduced - maxdepth. It is used to find when to start using `HeapSort`.


Wiec co jest nie tak z QuickSortem? PRoblemem jest tutaj zachowanie w najgorszym przypadku gdy tablica na ktorej operujemy jest juz calkowicie badz w wiekszosci posrotowania. Wtedy mamy czas zlozonoscy na poziomie O(n^2). Badania empiryczzne wykazaly ze pomimo tej cechy Quick Sort i tak dziala szybciej niz inne znane nam algorytmu stortuajce. Nie zmienia to oczywiscie tego ze mozna dalej ten algorytm usprawniac i mozliwe ze da sie pozbyc tego O(n^2). Do akcji wkracza tutaj heapsort ktory ma zarowno sredni jak i najmniej korzysty scenariusz O(nlogn). Spostrzegawcza osoba moglaby teraz powiedizec, hallo halloo, skoro HeapSort ma takie cechy ktore sa lepsze niz Quicksort to dlaczego nie uzyc odrazu HeapSorta. Po co bawic sie z QuickSortem. Ano wlasnie z powodu tego ze analiza O jest wielka abstrakcja ktora moze ukryc 'realny swiat'. Intuicja podpowiadaa nam ze HeapSort powinien byc lepszy a jednak okazuje sie ze w swiecie realnych danych to QuickSort okazuje sie najlepszy, ma tylko pewnie minusy ktore statystycznie nawet jak wystepuja to i tak powoduja ze algorytm ten dziala szzybciej niz inne (przy zalozeniu ze dane nie sa zawsze posorotwane wtedy to w zasadzie mozna uzyc Bubble Sort :D tlko po co sortowac posorotwane dane).

Mala dygresja - bardzo duzo w algorytmach sortuajcych zalezy od wejsciowych danych i tego jakie maja charakterystyki. Jezeli to reczywiscie jest pelny random dane to quick sort wypada najlepiej. JEzeli natomiast mozna znalezc w tych danych pewne cechy wspolne ktore np ukladaja sie w 'rozklad normalny' to wtedy algorytmy z rodziny 'bucket sort' (czemu) robia dobra robote. Istneiej tez cala rodzina problemow 'external sorting algorithms' tzn takich w ktorych dane nie mieszcza sie w pamieci i trzeba tez je dociagac. MErge Sort <tutaj dopisz ze on jest good external i dlaczego>  Tutaj tez pojawia sie kwestia tego jak te dane otrzymujemy i czy mamy ich calosc odrazu. Zalozmy np sytuacje w ktorej otrzymuje dane w paczkach (jakis stream). By te dane moc posorotwac quicksortem bedziemy potrzebowac zebrac caly strumien, poczekac na niego i dopiero wtedy odpalic quick sorta. Z pomoca moze nam przyjsc heap sort ktory pozwala odpalic sortowanie na pofrafmentowanych zbiorach danych ktore przychodza z czasem, nie potrzebujemy calego zbiory juz gotowego - wystarczy miec cokolwiek by zaczac. Jest tez kwestia czy algorytm jest stabilny czy nie ...

<dlaczego max depth to log2() * 2>
<dlaczego insertion sort -> https://rosettacode.org/wiki/Sorting_algorithms/Insertion_sort -> chyba chodzi o locality of data>a

Dlaczego przelaczac sie na heapsorta przez depth limit? Zachowanie QuickSorta O(n^2) wystepuje w momencie gdy algorytm tworzy duzo malycch podzialow poniewaz nie moze dobrac dobrze pivota przy posortowanej liscie.  PRzejscie na heapsorta likwiduje ten problem i do podzialu nei chodzi.   Jest to swego rodzaju wentyl bezpieczenstwa. FloorLog2 * 2 zapewnia przestrzen gdy podzialy sa nadal dobre i nie ma potrzeby przejsci an heapsorta bo pivot jest wybierany 'dobrze' < pokazac przyklad>   Naatomiast gdy jest prawdopodobienstwo ze cos dzieje sie nei tak i weszlismy w petrle O(n^2) algorytm zauwaza to i dostosowywuej sie przerywajac to zachowanie i operujac na innym algorytmie. 

Wartosc depth Limit nie moze byc za mala - bo bedzie to wywolywac heap sorta za czesto - nie moze tez byc za duza by spedzic za duzo czasu w Quadratic time sortowaniu. Wartosc FloorLotg 2 * 2 empirytcznie przez [paper] zostala wyliczona  jako 'optymalna' i dajaca najlepsze rezultaty.

W przypadku gdy podzialy sa nierowne to miast glebokosc rosnac logarytmicznie rosnie linearnie. Najgorszy scenariusz to possortowania tablica i ilosc podzialow rowna n

Depth of quicksort in ideals scenario is approx log2n


Jak to wyglada w kodzie?

{% highlight csharp %}
static void IntrospectiveSort(KIND keys[], KIND items[], int left, int right) {
    WRAPPER_NO_CONTRACT;

    // Make sure left != right in your own code.   

    _ASSERTE(keys != NULL && left < right);

    int length = right - left + 1;

    if (length < 2)
        return;

    IntroSort(keys, items, left, right, 2 * FloorLog2(length));
}
{% endhighlight %}

Mamy tu kolejne sprawdzenia parametrow wejsciowych. Sprawwdzenie  czy jest w ogole sens cokolwiek sprawdzac, jezeli right - left + 1 = <2 to jest to albo 1 albo 0 elementowa tablica wiec nie ma sensu z nia nic robic.

NAstepnie mamy wywolanie algorytmu IntroSort. Tyle bylo mowione o QuickSorcie a tu prosze cos innego, IntroSort. Czemu tak?a

https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L155

```
    static void IntroSort(KIND keys[], KIND items[], int lo, int hi, int depthLimit)
    {
        while (hi > lo)
        {
            int partitionSize = hi - lo + 1;
            if(partitionSize <= introsortSizeThreshold)
            {
                if (partitionSize == 1)
                {
                    return;
                }
                if (partitionSize == 2)
                {
                    SwapIfGreaterWithItems(keys, items, lo, hi);
                    return;
                }
                if (partitionSize == 3)
                {
                    SwapIfGreaterWithItems(keys, items, lo, hi-1);
                    SwapIfGreaterWithItems(keys, items, lo, hi);
                    SwapIfGreaterWithItems(keys, items, hi-1, hi);
                    return;
                }
                
                InsertionSort(keys, items, lo, hi);
                return;
            }

            if (depthLimit == 0)
            {
                Heapsort(keys, items, lo, hi);
                return;
            }
            depthLimit--;

            int p = PickPivotAndPartition(keys, items, lo, hi);
            IntroSort(keys, items, p + 1, hi, depthLimit);
            hi = p - 1;            
        }
        return;
    }
```

Funkcja jest jeddnym duzym whilem ktorego waarunkiem stopu jest roznica hi > lo. Hi to nic innego jak nasz poprzedni 'right' index a lo 'left' index. Nie dzieje sie tutaj nic innego jak iterowanie po tablicy in place. W calym tym algorytmie ciezko znalezc quick sort. 

IntroSort Paper David R. Musser
http://liacs.leidenuniv.nl/~stefanovtp/courses/StudentenSeminarium/Papers/CO/ISSA.pdf

Zanim to jednak omowmy przedstawny podstawowy zarys algorytmu.

 jesli wielkosc partycji <3 
   - zrob swapa
 jestli wielkosc partycjji <16
   - uzyj insertionsorta
 jessli depthlimit == 0
   - uzyj heapsorta
 w innym przypadku wybierz nowy pivot i partycje i wywolal funkcje jeszce raz zmniejszaac limit zagniezdzenia.

```
   inline static void SwapIfGreaterWithItems(KIND keys[], KIND items[], int a, int b) {
        if (a != b) {
            if (keys[a] > keys[b]) {
                KIND key = keys[a];
                keys[a] = keys[b];
                keys[b] = key;
                if (items != NULL) {
                    KIND item = items[a];
                    items[a] = items[b];
                    items[b] = item;
                }
            }
        }
    }
}
```
Swapowanie jest dosyc prosta funkcja. Po prostu sortuje waaartosci jesli jedna jest wieksza od drugiej. Jest to standardowa operacja wykonywana w quicksorcie. Co tutaj jest ciekawe to wywolywanie tez etej funkcji w przypadku partycji 3 elementowej. Z pewnoscia jest to optymalizacja ktora ma za zadanie zmniejszych ilosc wywolan glownego algorytmu.

<sprawdzic jaka zmiane empiryczna to tworzy gdyby usunac partitionSize == 3 albo dodac partitionSize == 4, 5, 6, 7, 8, 9, 10>

TAka operacja ma czas uruchomienia O(1) i w calym rozrachunku nie ma zadnego znaczenia.

< czemu introsortSizeThreshold jest 16 a nie inna liczba? jak zostala ona wybrana? >

Przy depth 0 
Odaplany jest heap sort - nie bedziemy w tym artykule omawiam heap sorta omowimy tylko jego cechy i przedyskutujemy dlaczego warto przy zagniezdzeniu takim a nie innym wykonac heapsorta.

Wiecej o heapsorcie - <link do jakiegos algorytmu>

Quick sort

```
            int p = PickPivotAndPartition(keys, items, lo, hi);
            IntroSort(keys, items, p + 1, hi, depthLimit);
            hi = p - 1;            
```

https://en.wikipedia.org/wiki/Quicksort

lo + (hi - lo)/2 is to avoid integer overflow

It uses median of 3 algorithm for pivot 
https://stackoverflow.com/questions/7559608/median-of-three-values-strategy

teen fragment jest tak naprawde quick sortem. Mamy wybranie pivota pomiedzy lo i hi i wywolanie IntroSorta na innym segmencie tablicy. W tym przypadku od pivota do prawa.


[     p      ]
[p      ]



Why picking pivot is soo important?

Dlaczego wybor pivota nie mozna wyliczac po prostu? idealnie? a trzeba estymowac?

Chodzi o koszt wyliczenia idealnego pivota jest on za duzy i tak naprawde idealny pivot nie daje taakich benefitow -> pokazac przyklady.

- Qucik sort would be without weaknessess if its worst case scenario when it can hit O(n^2)
- when does this worst case happens? when the divide and conquer is not equal and created smaller and bigger arrays -> worst worst case is when the sub arrays are single index based. 
< explanation here >
Mostly worst case is -> sorted array

Pivot picking strategy is used to manage risk of hitting worst case - there is a price of course.
Another strategy is to change the algorithm to use different one and limit the risk of O(n^2).

- the runtime of quick sort is heavilly dependent on correct array splitting. If splitting results in one big array and one small array O can become O(n^2).
The more equal the splitting the close the O comes to O(nlogn)

The more balanced the split the less recursive calls required -> show example

- why changing to insertion sort
for small relatively small splits use insertion sorts that performs in linear time for almost ordered sub arrays

- pivot strategies
All this techniques want to avoid worst case scenario as much as possible

-> left-most | right-most -> susceptibility to O(N^2) when sorted array
-> random -> sligthly better, reduces risk of O(n^2) -> but random generation costly and unpredictable
-> Mo3 -> first | (first + last) / 2 | last -> better than random but still not perfect (example on when it will still hit worst case) ( decreases worst case, increases average case)
-> Mo5 -> Mo3 + 2 random values -> better than Mo3 but random generation is costly
-> Mo5 -> without random first | (first + last / 4) | (first + last /2 ) | (3 *(first + last ) / 4 ) | last -> but takes time to pick 5 items
-> Mo7, Mo9 -> increases more balanced split - but the time to pick a pivot increases -> it is interesting challenge to find a balance
-> there is albo Dynamic Pivot -> takes right-most then does a scan O(n) and and counts less or bigger items than pivot - then uses this values to generate next pivots increasing chance of balanced split 
(https://www.researchgate.net/publication/235351491_Enhancing_QuickSort_Algorithm_using_a_Dynamic_Pivot_Selection_Technique)
-> problem with this technique is Extreme - values in the array

In  his paper ISSA.pdf

http://liacs.leidenuniv.nl/~stefanovtp/courses/StudentenSeminarium/Papers/CO/ISSA.pdf

You can find MEdiaan 3 killer so it is still possible to change median algorithms to be quadratic

-> What would happen if I would implement Dynamic Pivot Selection Technique in QuickSort in .NET? or GO?

Why it is always first and last? 
- it is due to a plan to figth with ordered or almost ordered arrays
-> can i show some graph with probability of hitting worst case, average case? calculated in python with different techniques?

Dlaczego HeapSort a nie inny algorytm wiec?

Czy mozemy zamiast heaposorta na tym levelu uzyc insertion sorta albo merge sorta? Dlaczego HeapSort?

https://cs.stackexchange.com/questions/24446/why-does-introsort-use-heapsort-rather-than-mergesort

Heapsort's O(1)O(1) extra space requirement makes it a better choice to mergsort's O(n)O(n) where for a contrived array that nn could still be large.

The reason heapsort isn't used for the full sort is because it is slower than quicksort (due in part to the hidden constants in the big O expression and in part to the cache behavior)


Dlaczego Insertion Sort skoro jest juz HeapSort?

To stop generating subproblems after certain treshdold that is small enough to use Insertion Sort (Locality of data?)  we swithc to InsertionSort as it is more optimal. 

Although it is one of the elementary sorting algorithms with O(n2) worst-case time, insertion sort is the algorithm of choice either when the data is nearly sorted (because it is adaptive) or when the problem size is small (because it has low overhead).  For these reasons, and because it is also stable, insertion sort is often used as the recursive base case (when the problem size is small) for higher overhead divide-and-conquer sorting algorithms, such as merge sort or quick sort.

+1. Insertion sort's inner loop just happens to be a good fit for modern CPUs and caches -- it's a very tight loop that accesses memory in increasing order only. 

Insertion sort is also good because it's useful in online situation, when you get one element at a time. 

https://stackoverflow.com/questions/736920/is-there-ever-a-good-reason-to-use-insertion-sort

Insertion sort is faster for small n because Quick Sort has extra overhead from the recursive function calls. Insertion sort is also more stable than Quick sort and requires less memory.

For the curious, the O(N^2) one will be faster than the O(N Log N) one until about N=9000 entries or so. 

However, the constant factor and overhead are still important. If your application ensures that N never gets very large, the asymptotic behavior of O(N^2) vs. O(N log N) doesn't come into play.
Insertion sort is simple and, for small lists, it is generally faster than a comparably implemented quicksort or mergesort. That is why a practical sort implementation will generally fall back on something like insertion sort for the "base case", instead of recursing all the way down to single elements.

https://algs4.cs.princeton.edu/23quicksort/

Cutoff to insertion sort. As with mergesort, it pays to switch to insertion sort for tiny arrays. The optimum value of the cutoff is system-dependent, but any value between 5 and 15 is likely to work well in most situations.

https://cs.stackexchange.com/questions/37956/why-is-the-optimal-cut-off-for-switching-from-quicksort-to-insertion-sort-machin

Because the actual running time (in seconds) of real code on a real computer depends on how fast that computer runs the instructions and how fast it retrieves the relevant data from memory, how well it caches it and so on. Insertion sort and quicksort use different instructions and hava different memory access patterns. So the running time of quicksort versus insertion sort for any particular dataset on any particular system will depend both on the instructions used to implement those two sorting routines and the memory access patterns of the data. Given the different mixes of instructions, it's perfectly possible that insertion sort is faster for lists of up to ten items on one system, but only for lists up to six items on some other system.

https://www.quora.com/Among-quick-sort-insertion-sort-and-heap-sort-which-is-the-best-to-sort-data-and-why






Dual Pivot QuickSort Algorithm
http://codeblab.com/wp-content/uploads/2009/09/DualPivotQuicksort.pdf
https://www.geeksforgeeks.org/dual-pivot-quicksort/
https://stackoverflow.com/questions/20917617/whats-the-difference-of-dual-pivot-quick-sort-and-quick-sort

Jaava python vs .NET?
https://stackoverflow.com/questions/7770230/comparison-between-timsort-and-quicksort
https://en.wikipedia.org/wiki/Timsort

What are the internals of quicksort in Go?
https://golang.org/src/sort/sort.go

Different pivot -> https://www.johndcook.com/blog/2009/06/23/tukey-median-ninther/

Javascsript -
https://stackoverflow.com/questions/6640347/javascript-native-sort-method-code
Ecma script doesnt no standardize it

Chrome - v8
https://github.com/v8/v8/blob/master/src/js/array.js

Source:
https://bytes.com/topic/c-sharp/answers/817547-what-sz-array#post3257964
https://stackoverflow.com/questions/21818889/why-is-my-c-sharp-quicksort-implementation-significantly-slower-than-listt-sor
https://en.wikipedia.org/wiki/Introsort
https://rosettacode.org/wiki/Sorting_algorithms/Quicksort#C.23
https://referencesource.microsoft.com/#mscorlib/system/array.cs
https://stackoverflow.com/questions/1863153/why-unsigned-int-0xffffffff-is-equal-to-int-1
https://en.wikipedia.org/wiki/Two%27s_complement
http://www.cs.utexas.edu/users/EWD/transcriptions/EWD08xx/EWD831.html
https://softwareengineering.stackexchange.com/questions/110804/why-are-zero-based-arrays-the-norm
http://me.dt.in.th/page/Quicksort/
https://en.wikipedia.org/wiki/Introsort
https://www.geeksforgeeks.org/external-sorting/
https://www.geeksforgeeks.org/know-your-sorting-algorithm-set-2-introsort-cs-sorting-weapon/
https://medium.com/basecs/pivoting-to-understand-quicksort-part-1-75178dfb9313
https://medium.com/basecs/pivoting-to-understand-quicksort-part-2-30161aefe1d3
https://www.cs.auckland.ac.nz/software/AlgAnim/qsort_perf.html
https://www.cs.auckland.ac.nz/software/AlgAnim/qsort3.html

