---
layout: draft
title: Everything you wanted to know about Sorting in .NET part 3
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
permalink: /blog/net-sorting-part3/
---

{% include toc.html %}

Last part ended with a `sneak peak` of a `native` code. This part is going to expand on it. We are entering `C++` code from `managed` code, to do that there has to be a function with `extern` keyword in our managed code.

{% highlight csharp %}
List<T>.Sort()
---> List<T>.Sort(index = 0, count = Count, comparer=null)
------> Array.Sort<T>(_items, index, count, comparer);
---------C++ native world -------
-----------> TrySZSort
{% endhighlight csharp %}

## InternalCall

{% highlight csharp %}
[MethodImplAttribute(MethodImplOptions.InternalCall)]
private static extern bool TrySZSort(Array keys, Array items, int left, int right);
{% endhighlight csharp %}

This declaration is used to tell the runtime that implementation of this function is in a different (external) place. There are `two` ways to call external code. You can use `DLLImport` or `InternalCall`. `DLLImport` is used when you create your own `unmanaged` code while `InternalCall` looks for the implementation in `CLR` itself. `CLR` is not only about runtime - it contains code that is highly optimized and used in many places.

{% highlight csharp %}

// simplified Stack Trace for FileStrea.Read   

StringBuilder.ToString()
-> string.FastAllocateString
-> FrameAllocatedString

[MethodImplAttribute(MethodImplOptions.InternalCall)]
internal extern static String FastAllocatedString(int length);
{% endhighlight %}

To mention more examples. `FastAllocateString` method used in `StringBuilder` (that is one of the reasons why `StringBuilder` is awesome) is part of `CLR`. When you write `ToString`, you are ultimately exeucuting `external clr internal` function.[\[1\][frame-allocated-string]

[frame-allocated-string]:https://github.com/dotnet/coreclr/blob/a38ed985e11b0d56ecd44e3e6d2878cef8ca6052/src/vm/jithelpers.cpp#L2909

It is possible add new `InternalCalls` but it requries changes in `CLR`. You would have to execute your `CLS compliant` language library using custom build `CLR`. Instruction on how to do this are  available on the github.[\[2\]][coreclr-building]. 

[coreclr-building]:https://github.com/dotnet/coreclr/blob/master/Documentation/building/windows-instructions.md

## DLLImport

`FileStream.Read` is a great example of `DLLImport`. When you call the `Read` in the end you are actually calling `Win Api DLL's` and `WIN32.ReadFile`.

{% highlight csharp %}

// simplified Stack Trace for FileStrea.Read   

FileStream.Read 
-> ReadCore
-> BeginReadCode
-> ReadFileNative
-> Win32.ReadFile

[DllImport(KERNEL32, SetLastError=true)]
unsafe internal static extern int Wind32.ReadFile
{% endhighlight csharp %}

[string-builder-internal]:https://referencesource.microsoft.com/#mscorlib/system/text/stringbuilder.cs,399
[filestream-read]:https://referencesource.microsoft.com/#mscorlib/system/io/filestream.cs,1497

I will focus on `InternalCalls` in this blog post.

## Calling CLR from managed code

We discussed how to tell runtime that in `managed` code there is `unmanaged` code waiting to be called. But how is it done actually?

You need to use `ECall` to call into the CLR from managed code.  ECall is a `private native calling interface`. When the managed code wants to access internal code in `CLR` it tells the runtime(`execution engine`) to uses `Ecall` to find the function. When the function is found - `EE` calls this function. As this is `managed` to `unmanaged` code transistion - there are things like marshalling to haappen to make a connection beetwen the two different `worlds`.

> `ECall` is a set of tables to call functions within the EE (Execution Engine) from the classlibs.  First we use the class name & namespace to find an array of function pointers for a class, then use the function name (& sometimes signature) to find the correct function pointer for your method.   
[source][ecall-source]

[ecall-source]: https://github.com/dotnet/coreclr/blob/master/src/vm/ecall.cpp#L350

There are two types of `Ecall` - `QCall` and `FCall`. `FCall`[\[x]][fcall] is more performant but also `risky` and much more difficcult to write. `Qcall` is the prefered option but there is a performance price to pay.

[fcall]:https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h

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

### Using FCall to call TrySZSort in CLR

{% highlight csharp %}
FCIMPL4(FC_BOOL_RET, ArrayHelper::TrySZSort, ArrayBase * keys, ArrayBase * items
, UINT32 left, UINT32 right)
{% endhighlight %}

This piece of code was already displayed in previous post. This is declaration of `TrySZSort` inside the `CLR` code [source](link here). it uses `C++` macro - `FCIMPL4`. `4` is a number of arguments. `FC_BOOL_RET` tell the macro that this function returns `BOOL`. 

`FCIMPL` macro creates implementation of  `FCALL` function. This is a `native` function that is part of `CLR` code. The only way to create `FCALL` is inside CLR. To help the `runtime` differentiate if `FCALL` or `QCALL` is used, inside managed code you need to use. 

For `QCall`

{% highlight csharp %}
[DllImport(JitHelpers.QCall, CharSet = CharSet.Unicode)]
static extern bool Bar(int flags, string inString, StringHandleOnStack retString);
{% endhighlight %}

For `FCall`

{% highlight csharp %}
[MethodImplAttribute(MethodImplOptions.InternalCall)]
private static extern bool TrySZSort(Array keys, Array items, int left, int right);
{% endhighlight %}

I was curious what needs to be done to generate new `FCALL`. This [commit][example-new-fcall] from MS team is a great example.

* register function in a [ECClass table][ecclass] - static table with entry points to `FCALL` functions. This is used by jitter to find the entry points. Example: [TrySZSort entrypoint][ecalllist]  
* add function to the `ECFunc` array for a class that has this function. Example: [TrySZSort][ecfunc-in-class]
* add extern static function with `InternalCall` decorator in managed code
* use FCIMPL macro to generate function - your code needs to be inside this macro

[ecalllist]:https://github.com/dotnet/coreclr/blob/master/src/vm/ecalllist.h#L814
[ecclass]:https://github.com/dotnet/coreclr/blob/master/src/vm/ecall.cpp#L27
[ecfunc-in-class]:https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L335
[example-new-fcall]:https://github.com/dotnet/coreclr/commit/c61525b5883e883621f98d44f479b15d790b0533#diff-3667dffbd11675529c85670ef344242e

### Why FCIMPLL macro is needed?

> Since `FCALLS` have to conform to the `Execution Engine` calling conventions and not to C calling conventions, `FCALLS`, need to be declared using special macros `(FCIMPL*)` that implement the correct calling conventions.

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
