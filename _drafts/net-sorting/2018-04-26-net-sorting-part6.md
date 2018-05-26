---
layout: draft
title: Everything you wanted to know about Sorting in .NET part 6
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
series: net-sorting
permalink: /blog/net-sorting-part6/
---

{% include toc.html %}

Wow so many posts just to describe `FCIMPL4` macro used within CoreCLR. In this post we are back to CLR code. As a reminder we are still in the CLR code inside `TrySZSort` method. 

{% highlight csharp %}
List<T>.Sort()
---> List<T>.Sort(index = 0, count = Count, comparer=null)
------> Array.Sort<T>(_items, index, count, comparer);
---------C++ native world -------
-----------> TrySZSort
{% endhighlight csharp %}

We are finally going to talk about code inside this method [^sort-source].

[^sort-source]:[TrySZSort source code ](https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.cpp#L268)

## FCALL_CONTRACT

As implementation of FCall is complicated and difficult, you have to add a special code that makes sure your code follows special contract. I think this one is used on compile time (but I am not sure).

`FCALL_CONTRACT` is a shorthand to multiple flags: [^fcall-contract]

[^fcall-contract]:[FCALL_CONTRACT](https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h#L1384)

### STATIC_CONTRACT_SO_TOLERANT

Marks function as one that is able to Tolerate Stack Overflow. Tolerate doesn't mean that `SO` won't happen in this code - it still can but it won't be the end of the world whole system / process can still operate and recover. On the other spectrum there are functions that cannot tolerate SO - `SO_INTOLERANT` this are additionaly proceted from SO - by protected it means that there are special mechanims to limit number of scenarios that this can happen. 

Ffor SO_TOLERANR stack guard and stack probe is disabled. SO prode is a special piece of code that enhaances the function ( that is why you need to use special macro SO_INTOLERANT_XXX to generate probe code ). Probe adds checks that before function is executed it checks if there is enough space on the stack - this way it limits possibility of SO. [^stack-probe]

There are two types of SO - hard and soft (soft is when Stack Probe is acctive)

[^soft-so]:[Soft and Hard SO](https://github.com/dotnet/coreclr/blob/master/src/inc/ex.h#L131)

Stack guard on the other hand is a small piece of code that tries to force SO to happen at `convinient` time which potentialy means not inside `SO_INTOLERANT` function.

By default a function is SO_INTOLERANT. SO that happens in that piece if code terminates proceess.

SO is handled in many different ways based on policies [^so-handling].

[^so-handling]:[How is stack overflow handled](https://github.com/dotnet/coreclr/blob/1c8c59387cb5989b5494f346c8127feb9dff27bc/src/vm/eepolicy.cpp#L851)

[^stack-probe]:[Stack probe source code](https://github.com/dotnet/coreclr/blob/master/src/vm/stackprobe.h)

### STATIC_CONTRACT_GC_NOTRIGGER 
 
> A GC_NOTRIGGER function cannot: [^gc-no-trigger] 
> 
> * Allocate managed memory
> * Call managed code
> * Enter a GC-safe point
> * Toggle the GC mode
> * Block for long periods of time
> * Synchronize with the GC
> * Explicitly trigger a GC (duh)
> * Call any other function marked GC_TRIGGERS
> * Call any other code that does these things

This safeguards are used to protect the code from introducting `GC holes`.

> A GC hole occurs when code inside the CLR creates a reference to a GC object, neglects to tell the GC about that reference, performs some operation that directly or indirectly triggers a GC, then tries to use the original reference. At this point, the reference points to garbage memory and the CLR will either read out a wrong value or corrupt whatever that reference is pointing to. [^gc-hole]

By putting all these limitations on the code you can get help from the runtime and protection to not introduce problems.

[^gc-hole]:[GC Hole](https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md#211-how-gc-holes-are-created)

[^gc-no-trigger]:[GC triggering](https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md#2110-how-to-know-if-a-function-can-trigger-a-gc)

### STATIC_CONTRACT_MODE_COOPERATIVE 

Sets GC modee on the function.

> Consider two possible ways to schedule GC: 
> 
> * Preemptive: Any thread that needs to do a GC can do one without regard for the state of other threads. The other threads run concurrently with the GC.
> * Cooperative: A thread can only start a GC once all other threads agree to allow the GC. The thread attempting the GC is blocked until all other threads reach a state of agreement.[^gc-modes]

[^gc-modes]:[GC Modes](https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md#2.1.8)

### STATIC_CONTRACT_THROWS 

> Declares whether an exception can be thrown out of this function. Declaring NOTHROW puts the thread in a NOTHROW state for the duration of the function call. You will get an assert if you throw an exception or call a function declared THROWS. An EX_TRY/EX_CATCH construct however will lift the NOTHROW state for the duration of the TRY body. [^throws]

[^throws]:[STATIC_CONTRACT_THROWS](https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md#21011-throwsnothrow)

{% highlight csharp %}
    VALIDATEOBJECT(keys);
    VALIDATEOBJECT(items);
    _ASSERTE(keys != NULL);
{% endhighlight %}

Next on the list we have defensive coding mechanisms. It is a good practice to ensure that arguments are correct before we go next.

`VALIDATEOBJECT` uses another FCall 

[^validate-object]:[VALIDATEOBJECT](https://github.com/dotnet/coreclr/blob/master/src/vm/stubhelpers.cpp)

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
