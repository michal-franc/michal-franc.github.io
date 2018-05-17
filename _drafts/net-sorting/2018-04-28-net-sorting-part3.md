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

Last part ended with a `sneak peak` of a `native` code. This part is going to expand on it. We are entering `C++` world inside `CLR`. First things first, why doing all this complicated stuff and not have `TrySZSort` in managed code?

## Why is part of the Sort in the native code?

Actually `TrySZSort` uses `IntroSort` internaly. As we have discovered in the beginning of this serie when a custom `IComparer` is provided a managed version of `IntroSort` is used instead. Shall we check what would be the difference?

I am going to use `BenchmarkDotNet` for that. A very good library that gives you a lot of data about your code, allocations, timing etc.

{% highlight csharp %}
internal class CustomIntComparer : IComparer<int>
{
  public int Compare(int x, int y)
  {
      return x < y ? -1 : (x == y ? 0 : 1);
  }
}

[MemoryDiagnoser]
public class SortTest
{
  [Params(10, 100, 1000, 10000)]
  public int ListSize;

  private List<int> ToSort;
  private List<int> ToSort1;

  [GlobalSetup]
  public void Setup() 
  {
      var rnd = new Random();
      ToSort = new List<int>();
      ToSort1 = new List<int>();

      foreach(var i in Enumerable.Range(0, ListSize))
      {
          var val = rnd.Next(0, 100);

          ToSort.Add(val);
          ToSort1.Add(val);
      };
  }

  private void NativeSortCall()
  {
      ToSort.Sort();
  }
  
  private void ManagedSortCall()
  {
      ToSort1.Sort(new CustomIntComparer());
  }

  [Benchmark]
  public void NativeSort() => NativeSortCall();
  [Benchmark]
  public void ManagedSort() => ManagedSortCall();
}

public class Program
{
  public static void Main(string[] args)
  {
      BenchmarkRunner.Run<SortTest>();
  }
}
{% endhighlight %}

Results:

{% highlight csharp %}

      Method | ListSize |          Mean 
------------ |--------- |--------------:
  NativeSort |       10 |      27.16 ns 
 ManagedSort |       10 |     116.47 ns 
  NativeSort |      100 |     326.75 ns 
 ManagedSort |      100 |   1,431.44 ns 
  NativeSort |     1000 |   5,450.18 ns 
 ManagedSort |     1000 |  27,412.47 ns 
  NativeSort |    10000 |  87,920.78 ns 
 ManagedSort |    10000 | 305,439.37 ns 
{% endhighlight %}

Looks like there is a 4-5x difference. In a nutshell like with every `complex` system you take it as it is. When you use `managed` code it gives you a lot of `security` and gets rid of many `problems`, but there is a price to pay. You have to give control and lose flexibility to `optimize`, plus all the things that give you other nice things do cost time and cpu power. You cannot do certain optimization in managed code. If you ask a `question` is `native` code always faster than `managed` code? It is difficult as it is based on too many variables. Running native code faster also costs - time and require knowledge and expertise. Also managed `JIT` compilers are getting more interesting optimizations that are making the code run faster.

In example of `Sorting`, `TrySZSort` in native code is clearly optimized and leverages native code, but it is a code that is harder to maintain and reason about. Ok then lets go down the rabbit hole and discuss how to establish connection beetwen `native` and `managed` code.

## Calling unmanaged code

To connect `managed` and `unmanaged` code you need to use `extern` keyword. It is used to tell the runtime that implementation of this function is in a different (external) place. There are `two` ways to call external code. 

* `P/Invoke` 
* `InternalCall`

### P/Invoke (Platform Invocation)

> Platform invocation is the mechanims provided by the `Common language runtime` to facilitate the calls from managed code to unmanaged code functions. Behind the sceneeess the runtime construcrs the so-called stub, or thunk, which allows the addressing of the unmanaged functon and conversion of managed argument types to the appropiate unmanaged types back. This conversion is known as parameter marshalling.[\[x\]][net-il-assembler]

To call unmanaged code using `P/Invoke`, function has to be `extern` and have `DLLImport` attribute. This attribute takes `DLL file library` name as a parameters. `DLL` files are `Dynamically-linked-libraries` containing compiled code. This files expose `Export Address table` that hold `entry points` to functions. Entry points used by runtime to call functions.

{% highlight csharp %}
[DllImport("nonexistinglib.dll")]
static extern bool Function(int i);

{% endhighlight csharp %}

In this simple example, I am telling the compiler that `Function` is in `nonexistinglib.dll`. This generates `IL` code with `pinvokeimpl` keyword.

{% highlight csharp %}
IL
.method private hidebysig static pinvokeimpl("nonexistingLib.dll" winapi) 
    bool Function (
        int32 i
    ) cil managed preservesig 
{
}
{% endhighlight csharp %}

`pinvokeimpl` tells the runtime that this is unmanaged method called using `P/Invoke`. This method is available in library `nonexistinglib.dll` and has the calling convention `winapi`. More on calling conventions later in this post, but in a nutshell - calling convention describes how to call function, something like contract. `unmanaged` dll expects certain `contract` to be met in order to accept the call to function. `winapi` convention is an alias of `__stdcall`.

What is happening here is CLR:

* JIT's the code
* finds pinvokeimpl
* find the entrypoint to the unmanaged function
* prepares the `contract` using winap calling convention and `marshalls` parameter int32 i
* calls the function
* getting `bool` value back
* uses `winapi` calling convention to `unmarshall` the value

It is actually a bit more complicated as there are things like `execution context` or `sentinel` item put on stack frame to mark the boundary beetwen managed and unmanaged code. but this blog post tries to draw a `big picture`. 

[expert-net-programming-book]:https://books.google.co.uk/books?id=IiB0FpGdCJ0C

[net-il-assembler]:https://books.google.co.uk/books?id=Xv_0AwAAQBAJ&pg=PA15&lpg=PA15&dq=IL+pinvokeimpl&source=bl&ots=YlZ6ZsEFLm&sig=5RSk1mnSNiMVBVQ11yCZRaqZjSw&hl=en&sa=X&ved=0ahUKEwiCrNTUgYPbAhWCbMAKHfKdDt4Q6AEIPzAD#v=onepage&q=IL%20pinvokeimpl&f=false

A good real life example of `P/Invoke` is `FileStream.Read`  When you call the `Read` in the end you are actually calling `Win Api DLL's KERNEL32` and `WIN32.ReadFile`. It uses this platform invocation to call `OS` api and read a file.

{% highlight csharp %}

FileStream.Read 
-> ReadCore
-> BeginReadCode
-> ReadFileNative
-> Win32.ReadFile

[DllImport(KERNEL32, SetLastError=true)]
unsafe internal static extern int Win32.ReadFile
{% endhighlight csharp %}

[filestream-read]:https://referencesource.microsoft.com/#mscorlib/system/io/filestream.cs,1497

### InternalCall

`InternallCall` is a different way to call unmanaged function. It is a bit more efficent (due to it being in CLR close environment giving possibility to relax some time consuming operations around security, exception handling etc.)  but you cannot create `InternalCalls` in `asemblies`. This call can be only used when calling functions implemented in `CLR`. `CLR` is not only about runtime, it also contains optimized code used in many places like `StringBuilder.ToString()`. This is main reason why using `StringBuilder` is faster and a good prctice. 


This is a good example of `InternalCall`. When `ToString` on `StringBuilder` [\[x\]][string-builder-internal] is called it is actually calling `FrameAllocatedString` down stack. Code that is in `CLR` and uses internallcall to do that.[\[x\][frame-allocated-string]]

[frame-allocated-string]:https://github.com/dotnet/coreclr/blob/a38ed985e11b0d56ecd44e3e6d2878cef8ca6052/src/vm/jithelpers.cpp#L2909
[string-builder-internal]:https://referencesource.microsoft.com/#mscorlib/system/text/stringbuilder.cs,399

{% highlight csharp %}
StringBuilder.ToString()
-> string.FastAllocateString
-> FrameAllocatedString

[MethodImplAttribute(MethodImplOptions.InternalCall)]
internal extern static String FastAllocatedString(int length);
{% endhighlight %}

From the IL point of view code looks a bit different and uses `internalcall` keyword.

{% highlight csharp %}
[MethodImpl(MethodImplOptions.InternalCall)]
static extern bool Function(int i);

IL
.method private hidebysig static 
    bool CallFunction (
        int32 i
    ) cil managed internalcall 
{
}
{% endhighlight csharp %}

`internalcall` - tells the runtime to look for the implementation of the code inside `CLR` itself. `CLR` maintains its own `Function entrypoint address table`(there will be example with one function mention lated in the post) used to find the entrypoint. It also uses special calling convention  `__fastcall` that is not visible in `IL` code as this is the only convention used. With `P/Invoke` examplke, based on the `unmanaged` code you are calling IL will have diffrent calling convention.

It is possible add new `InternalCalls` but it requries changes in `CLR`. You would have to execute your `CLS compliant` language library using custom build `CLR`. Instruction on how to do this are  available on the github.[\[2\]][coreclr-building]. 

[coreclr-building]:https://github.com/dotnet/coreclr/blob/master/Documentation/building/windows-instructions.md

## Calling CLR from managed code

We discussed two ways to call unmanaged code. I want to focus now on calling `CLR` code as this is part of our `Sorting` journey and how `TrySZSort` is called.  Discussed methods above `InternalCall` and `P/Invoke` are translated to something sligthly different within the `CLR`, this this is called `ECall`. 
 
ECall is a `private native calling interface`. This interface is inside `CLR`.  When the managed code wants to access internal code in `CLR` it tells the runtime(`execution engine`) to use `ECall` to find the function and its entry point. Runtime then calls this function. As with previous examples there is also calling convention and marshalling done.

> `ECall` is a set of tables to call functions within the EE (Execution Engine) from the classlibs.  First we use the class name & namespace to find an array of function pointers for a class, then use the function name (& sometimes signature) to find the correct function pointer for your method.   
[source][ecall-source]

[ecall-source]: https://github.com/dotnet/coreclr/blob/master/src/vm/ecall.cpp#L350

There are two types of `ECall` - `QCall` and `FCall`. `FCall`[\[x]][fcall] is more performant but also more `risky, much more difficcult to write correctly and uses `InterrnalCall`. `QCall` is less performant but much more safe and uses `P/Invoke`. It is mentioned as default and  prefered option when calling code in `CLR`. `FCall` should only be used when there really a good reason for using it. 

[fcall]:https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h

> `QCalls` are the preferred mechanism going forward. You should only use `FCalls` when you are "forced" to. This happens when there is common "short path" through the code that is important to optimize. This short path should not be more than a few hundred instructions, cannot allocate GC memory, take locks or throw exceptions 
[\[x\]]][qcall-preffered]

Microsoft is moving more code from FCall to managed code.

> We have ported some parts of the CLR that were heavily reliant on FCalls to managed code in the past (such as Reflection and some Encoding & String operations), and we want to continue this momentum. We may port our number formatting & String comparison code to managed in the future.
[source][fcall-deprecation]

[fcall-depreccation]:https://github.com/dotnet/coreclr/blob/master/Documentation/botr/mscorlib.md#choosing-between-fcall-qcall-pinvoke-and-writing-in-managed-code

[qcall-preffered]:https://github.com/dotnet/coreclr/blob/master/Documentation/botr/mscorlib.md#choosing-between-fcall-qcall-pinvoke-and-writing-in-managed-code

[qcall-vs-fcall]:https://github.com/dotnet/coreclr/blob/master/Documentation/botr/mscorlib.md#calling-from-managed-to-native-code

`QCall`[\[x\]][qcall-source]  

- is more safe but less performant
- uses `P/Invoke`
- default and preferred choice

Example of `QCall` declaration on managed side.

{% highlight csharp %}
[DllImport(JitHelpers.QCall, CharSet = CharSet.Unicode)]
static extern bool Bar(int flags, string inString, StringHandleOnStack retString);
{% endhighlight %}

`FCall`[\[x\]][fcall-source]

- uses `InternalCall`
- should only be used when it is possible to make performance gains by using it
- are more performant when `Frames` (HelperMethodFrame) are not used
- you need to create `Frame` to handle Exceptions or `GC`
- susceptible to `GC holes`[\[x\]][gc-hole] and `GC starvation`
- more error prone due to manual control of `GC` and `Frames`

Example of `FCall` declaration on managed side.

{% highlight csharp %}
[MethodImplAttribute(MethodImplOptions.InternalCall)]
private static extern bool TrySZSort(Array keys, Array items, int left, int right);
{% endhighlight %}

[fcall-source]:https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h
[qcall-source]:https://github.com/dotnet/coreclr/blob/master/src/vm/qcall.h
[gc-hole]:https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md#2.1

I was curious what needs to be done to generate new `FCALL`. This [commit][example-new-fcall] from MS team is a great example.

* register function in a [ECClass table][ecclass] - static table with entry points to `FCALL` functions. This is used by jitter to find the entry points. Example: [TrySZSort entrypoint][ecalllist]  
* add function to the `ECFunc` array for a class that has this function. Example: [TrySZSort][ecfunc-in-class]
* add extern static function with `InternalCall` decorator in managed code
* use FCIMPL macro to generate function - your code needs to be inside this macro

[ecalllist]:https://github.com/dotnet/coreclr/blob/master/src/vm/ecalllist.h#L814
[ecclass]:https://github.com/dotnet/coreclr/blob/master/src/vm/ecall.cpp#L27
[ecfunc-in-class]:https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L335
[example-new-fcall]:https://github.com/dotnet/coreclr/commit/c61525b5883e883621f98d44f479b15d790b0533#diff-3667dffbd11675529c85670ef344242e

### FCall and TrySZSort

{% highlight csharp %}
List<T>.Sort()
---> List<T>.Sort(index = 0, count = Count, comparer=null)
------> Array.Sort<T>(_items, index, count, comparer);
---------C++ native world -------
-----------> TrySZSort
{% endhighlight csharp %}

`TrySZSort` is exposed to managed code using `InternalCall`, it is using `FCall`.On the `CLR` side it uses `FCIMPL4` macro to generate the function.[\[x\]][try-sz-sort-impl].

{% highlight csharp %}
FCIMPL4(FC_BOOL_RET, ArrayHelper::TrySZSort, ArrayBase * keys, ArrayBase * items
, UINT32 left, UINT32 right)
{% endhighlight %}

`4` is a number of arguments, `FC_BOOL_RET` tells the macro that this function returns `BOOL`. Why FCIMPL macro is needed?

> Since `FCALLS` have to conform to the `Execution Engine` calling conventions and not to C calling conventions, `FCALLS`, need to be declared using special macros `(FCIMPL*)` that implement the correct calling conventions.

It is all to do with `calling conventions`. It was mentiioned before that `calling convention` is like a contract but how does it work? As it is not a `small` topic I created a separate blog post for it. This will be our next part.

[calling-conventions-mfranc]: /blog/net-sorting-part4/
