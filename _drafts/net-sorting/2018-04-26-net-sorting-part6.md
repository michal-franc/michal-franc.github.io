---
layout: draft
title: Everything you wanted to know about Sorting in .NET part 6
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
permalink: /blog/net-sorting-part6/
---

{% include toc.html %}

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