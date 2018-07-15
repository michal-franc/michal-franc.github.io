---
layout: draft
title: Everything you wanted to know about Sorting in .NET part 3
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
series: net-sorting
permalink: /blog/net-sorting-part3/
---
{% include toc.html %}

Last part ended with a `sneak peak` of a `native` code. This part is going to expand on it. We are entering `CLR` world. But, first things first. Why doing all this complicated stuff and not have `TrySZSort` in managed code ? The answer is of course speed, lets look into that.

## Why part of the Sort is in the native code?

We can easilly check how this code works in managed code. It was mentioned before but if you use custom `IComparer` a managed verions of the code is used. I am going to use `BenchmarkDotNet` to check the difference. This library is excellent and beats `Stopwatch` based mentod.

![BenchmarkDotNet](/images/net-sorting/benchmark-dotnet-logo.png "BenchmarkDotNet logo.")
{: .tofigure }

Code below defines custom comparer as we need it to force managed version of the sort. Then `BenchmarkDotNet` is used to generate a benchmar. There are four different runs: unamanged and managed with size of the list from ten to ten thousand. Each list contains radnom integers (0-100 range).

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

This test is definitelly not perfect but it still shows 4-5x difference in favour on native unamanged code. Perfectly written and manually tuned native code will be faster, that is the case with `TrySZSort`. Managed code hides manual memory handling, providing simplicity and security. It helps comoditiaze our work as it is cheaper to write software. But like every abstraction there is a price to pay. We give up some control and flexibility to `optimize` the code by ourselves. The impact of that choice depends on the workloads, as in typical line of business app you might not have to worry about performance price. Even if you have to, you optimize the bottlenecks, not the whole system. `Sorting` is a specialized problem to solve and gains a lot from native code optimizations.

## Calling unmanaged code

There is a special keyword `extern` that is used to create connection beetwen `managed` and `native` code. It is used to tell the runtime that implementation of a function is in a different (external) place. There are `two` ways to call external code. 

* `P/Invoke` 
* `InternalCall`

### P/Invoke (Platform Invocation)

> Platform invocation is the mechanims provided by the `Common language runtime` to facilitate the calls from managed code to unmanaged code functions. Behind the sceneeess the runtime construcrs the so-called stub, or thunk, which allows the addressing of the unmanaged functon and conversion of managed argument types to the appropiate unmanaged types back. This conversion is known as parameter marshalling.[^net-il-assembler]

To call unmanaged code using `P/Invoke`, function has to be `extern` and have `DLLImport` attribute. This attribute takes DLL file library name as a parameters. DLL files are `Dynamically-linked-libraries` containing compiled code and metadata about it. One of the metadata is aaddress table holding memory addreses to all exported functions - entry points. 

![DllExport](/images/net-sorting/dll-export.png "Dll export viewer - http://www.nirsoft.net/utils/dll_export_viewer.html")
{: .tofigure }

{% highlight csharp %}
[DllImport("nonexistinglib.dll")]
static extern bool Function(int i);
{% endhighlight csharp %}

In this example, Function is in a external DLL, it is generate to a IL code with `pinvokeimpl` keyword.

{% highlight csharp %}
IL
.method private hidebysig static pinvokeimpl("nonexistingLib.dll" winapi) 
    bool Function (
        int32 i
    ) cil managed preservesig 
{
}
{% endhighlight csharp %}

`Pinvokeimpl` tells the runtime that this is unmanaged method called using `P/Invoke`. It is available in library `nonexistinglib.dll` and has the calling convention `winapi`. More on calling conventions later in this post, but in a nutshell - calling convention describes how to call this particular function, something like contract beetwen HTTP services. `unmanaged` dll expects certain `contract` to be met in order to accept the call to a function. `winapi` convention is an alias of `__stdcall`.

![Calling Conventions](/images/net-sorting/calling_conventions.png "Calling convention is like a 'contract' or OSI frame. It describes how functions can communicate. In this example we have cdecl and stdcall with 'red' color showing differences. More on calling conventions in next post.")
{: .tofigure }

What is happening in this example with boolean function, is CLR:

* JIT's the code (Just in time compilation)
* finds pinvokeimpl
* finds the entrypoint to the unmanaged function
* prepares the `contract` using winapi calling convention and `marshalls` parameter int32 i (marshalling -> serialization)
* calls the function
* gets `bool` value back
* uses `winapi` calling convention to `unmarshall` the bool value

It is actually a bit more complicated as there are things like `execution context` or `sentinel` item put on the stack frame to mark the boundary beetwen managed and unmanaged code, but we are not going to get into these details.

[^net-il-assembler]:[NET IL Assembler Book](https://books.google.co.uk/books?id=Xv_0AwAAQBAJ&pg=PA15&lpg=PA15&dq=IL+pinvokeimpl&source=bl&ots=YlZ6ZsEFLm&sig=5RSk1mnSNiMVBVQ11yCZRaqZjSw&hl=en&sa=X&ved=0ahUKEwiCrNTUgYPbAhWCbMAKHfKdDt4Q6AEIPzAD#v=onepage&q=IL%20pinvokeimpl&f=false)

A good real life example of `P/Invoke` is `FileStream.Read`[^filestream-read]. When `Read` is called in the end `Win Api DLL's KERNEL32` and `WIN32.ReadFile` is used. This dll is part of Windows kernel.

{% highlight csharp %}

// Stack trace of FileStream.Read
FileStream.Read 
-> ReadCore
-> BeginReadCode
-> ReadFileNative
-> Win32.ReadFile

[DllImport(KERNEL32, SetLastError=true)]
unsafe internal static extern int Win32.ReadFile
{% endhighlight csharp %}

[^filestream-read]:[FileStream.Read source code](https://referencesource.microsoft.com/#mscorlib/system/io/filestream.cs,1497)

### InternalCall

`InternallCall` is a different way to call unmanaged function. It is more efficent due to InternallCalls being in the CLR context, giving possibility to relax some time consuming rules and save on operations around security, exception handling etc. . Unfortunately you it is not possible to create `InternalCalls` in `asemblies`. This call can be only be used when calling functions implemented in `CLR`. `CLR` is not only about runtime, it contains optimized code used in many places like `StringBuilder.ToString()`. This is one of the reasons why using `StringBuilder` is a good practice.


`StringBuilder` provides good example of `InternalCall`. When `ToString` on `StringBuilder` [^string-builder-internal] is called it is actually calling `FrameAllocatedString` down the stack. This function is inside `CLR` and uses.[^frame-allocated-string]

[^frame-allocated-string]:[Github - jithelpers.cpp](https://github.com/dotnet/coreclr/blob/master/src/vm/jithelpers.cpp#L2909)
[^string-builder-internal]:[Github - stringbuilder.cs](https://referencesource.microsoft.com/#mscorlib/system/text/stringbuilder.cs,399)

{% highlight csharp %}
StringBuilder.ToString()
-> string.FastAllocateString
-> FrameAllocatedString

[MethodImplAttribute(MethodImplOptions.InternalCall)]
internal extern static String FastAllocatedString(int length);
{% endhighlight %}

From the IL point of view the code looks a bit different than in `P\Invoke` and uses `internalcall` keyword.

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

`internalcall` - tells the runtime to look for the implementation of the code inside `CLR` itself. `CLR` maintains its own function entrypoint `address table`(example late in the post) used to find the address with the entrypoint. It also uses special calling convention  `__fastcall` (more on this in next post). 

It is possible to add new `InternalCalls` but it requires changes in `CLR`. You would then have to complie your customized CLR and run your code using this new runtime. Instruction on how to do this are available on the github - building[^coreclr-building] - running[^running-custom-clr]. 

[^coreclr-building]:[Core CLR building instructions](https://github.com/dotnet/coreclr/blob/master/Documentation/building/windows-instructions.md)
[^running-custom-clr]:[Using custom CLR Runtime](https://github.com/dotnet/coreclr/blob/master/Documentation/workflow/UsingYourBuild.md)

![Managed Unmanaged Calls](/images/net-sorting/managed-unmanaged.png "Types of calling unmanaged code from managed ones. IJW and COM interop are not discussed in this blog post.")
{: .tofigure }

## Calling CLR from managed code

We have discussed two ways of calling unmanaged code. I want to focus now on how actually `CLR` called. Both `P/Invoke` and `InternalCall` are translated to something sligthly different within the `CLR` context - `ECall`. 
 
ECall is a `private native calling interface`. This interface is inside `CLR`.  When the managed code wants to access internal code in `CLR` it tells the runtime (`execution engine`) to use `ECall` to find the function and its entry point. As with previous examples there is also calling convention and marshalling done along the way.

> `ECall` is a set of tables to call functions within the EE (Execution Engine) from the classlibs.  First we use the class name & namespace to find an array of function pointers for a class, then use the function name (& sometimes signature) to find the correct function pointer for your method. [^ecall-source]

[^ecall-source]:[Github - Ecall](https://github.com/dotnet/coreclr/blob/master/src/vm/ecall.cpp#L350)

There are two types of `ECalls` - `QCall` and `FCall`. `FCall`[^fcall] is more performant but more `risky, much more difficult to write correctly and uses `InterrnalCall`. `QCall` is less performant but much more safe and uses `P/Invoke`. `Qcall`t is mentioned as prefered option when calling code in `CLR`. `FCall` should only be used when there really a good reason for it.

[^fcall]:[Github - FCall](https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h)

> `QCalls` are the preferred mechanism going forward. You should only use `FCalls` when you are "forced" to. This happens when there is common "short path" through the code that is important to optimize. This short path should not be more than a few hundred instructions, cannot allocate GC memory, take locks or throw exceptions [^qcall-preffered]

Microsoft is moving more code from FCall to managed code.

> We have ported some parts of the CLR that were heavily reliant on FCalls to managed code in the past (such as Reflection and some Encoding & String operations), and we want to continue this momentum. We may port our number formatting & String comparison code to managed in the future.  [^fcall-deprecation]

[^fcall-depreccation]:[Github - FCall is being deprecated](https://github.com/dotnet/coreclr/blob/master/Documentation/botr/mscorlib.md#choosing-between-fcall-qcall-pinvoke-and-writing-in-managed-code)

[^qcall-preffered]:[QCall - as preffered choide](https://github.com/dotnet/coreclr/blob/master/Documentation/botr/mscorlib.md#choosing-between-fcall-qcall-pinvoke-and-writing-in-managed-code)

`QCall`[^qcall-source]  

- is more safe but less performant
- uses `P/Invoke`
- default and preferred choice

Example of `QCall` declaration on managed side.

{% highlight csharp %}
[DllImport(JitHelpers.QCall, CharSet = CharSet.Unicode)]
static extern bool Bar(int flags, string inString, StringHandleOnStack retString);
{% endhighlight %}

`FCall`[^fcall-source]

- uses `InternalCall`
- should only be used when it is possible to make performance gains by using it
- are more performant when `Frames` (HelperMethodFrame) are not used
- you need to create `Frame` to handle Exceptions or `GC`
- susceptible to `GC holes`[^gc-hole] and `GC starvation`
- more error prone due to manual control of `GC` and `Frames`

![FCAll QCall - calling CLR](/images/net-sorting/calling-clr.png "Two ways to call CLR. QCall and FCall.")
{: .tofigure }

Example of `FCall` declaration on managed side.

{% highlight csharp %}
[MethodImplAttribute(MethodImplOptions.InternalCall)]
private static extern bool TrySZSort(Array keys, Array items, int left, int right);
{% endhighlight %}

[^fcall-source]:[FCall source](https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h)
[^qcall-source]:[QCall source](https://github.com/dotnet/coreclr/blob/master/src/vm/qcall.h)
[^gc-hole]:[GC Hole](https://github.com/dotnet/coreclr/blob/master/Documentation/coding-guidelines/clr-code-guide.md#2.1)

I was curious what needs to be done to generate new `FCALL`. This [commit][example-new-fcall] from MS team is a great example.

* register function in a [ECClass table][ecclass] - static table with entry points to `FCALL` functions. This is used by jitter to find the entry points. Example: [TrySZSort entrypoint][ecalllist]  
* add function to the `ECFunc` array for a class that has this function. Example: [TrySZSort][ecfunc-in-class]
* add extern static function with `InternalCall` decorator in managed code
* use FCIMPL macro to generate function - your code needs to be inside this macro

[ecalllist]:https://github.com/dotnet/coreclr/blob/master/src/vm/ecalllist.h#L814
[ecclass]:https://github.com/dotnet/coreclr/blob/master/src/vm/ecall.cpp#L27
[ecfunc-in-class]:https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L335
[example-new-fcall]:https://github.com/dotnet/coreclr/commit/c61525b5883e883621f98d44f479b15d790b0533#diff-3667dffbd11675529c85670ef344242e

### .NET Sort -> TrySZSort uses FCall

{% highlight csharp %}
List<T>.Sort()
---> List<T>.Sort(index = 0, count = Count, comparer=null)
------> Array.Sort<T>(_items, index, count, comparer);
---------C++ native world -------
-----------> TrySZSort
{% endhighlight csharp %}

`TrySZSort` is exposed to managed code using `InternalCall`, it is using `FCall`. On the `CLR` side it uses `FCIMPL4` macro for function generation.

{% highlight csharp %}
FCIMPL4(FC_BOOL_RET, ArrayHelper::TrySZSort, ArrayBase * keys, ArrayBase * items
, UINT32 left, UINT32 right)
{% endhighlight %}

`4` is a number of arguments, `FC_BOOL_RET` tells the macro that this function returns `BOOL`. Why `FCIMPL` macro is needed?

> Since `FCALLS` have to conform to the `Execution Engine` calling conventions and not to C calling conventions, `FCALLS`, need to be declared using special macros `(FCIMPL*)` that implement the correct calling conventions.

It is all to do with `calling conventions`. It was mentioned before that `calling convention` is like a contract describing the way functions communicate using stack and registers  but how does it work? This will be covered in next post with a journey to the assembly code.
