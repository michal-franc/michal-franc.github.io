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

It is all to do with `calling conventions`. It was mentiioned before that `calling convention` is like a contract but how does it work?  

### What is a calling convention?

> A calling convention describes how the arguments are passed and values returned by functions. It also specifies how the function names are decorated.
[\[x\]]][calling-conventions]

> It specifies how (at a low level) the compiler will pass input parameters to the function and retrieve its results once it's been executed.
[\[x\]][calling-convs-so]

If we go down to the lowest levels of `code`, there is a `machine code`. It looks like this.[\[x\]][machine-code]

[machine-code]:https://en.wikipedia.org/wiki/Low-level_programming_language

{% highlight csharp %}
8B542408 83FA0077 06B80000 0000C383
FA027706 B8010000 00C353BB 01000000
B9010000 008D0419 83FA0376 078BD989
C14AEBF1 5BC3
{% endhighlight %}

This is btw a Fibonnaacci number generation code in `machine code`. I wouldn't be able to write it that way, but what is important is that on this `lowest level` it really doesn't matter if this code  was `created` from `C++`, `Java`, `Python` or `C#`.

It would an `impossible` task(almost) to write code that way and that is why new abstractions were invented like `assembly` language. Example below is the same `fibonacci number` generation code but in `assembly`.

{% highlight asm %}
fib:
    mov edx, [esp+8]
    cmp edx, 0
    ja @f
    mov eax, 0
    ret
    
    @@:
    cmp edx, 2
    ja @f
    mov eax, 1
    ret
    
    @@:
    push ebx
    mov ebx, 1
    mov ecx, 1
    
    @@:
        lea eax, [ebx+ecx]
        cmp edx, 3
        jbe @f
        mov ebx, ecx
        mov ecx, eax
        dec edx
    jmp @b
    
    @@:
    pop ebx
    ret
{% endhighlight %}

On this level which is still very low. We operate very close to `CPU` using - registers, stacks, various operations like `mov`, `jmp`. Every machine supports different `registers` and `instructions`[\[x\]][instruction-sets]. Some operate on very primitive instructions and some have more complicated ones. Example [\[x\]][arm-vs-x86-so].

[arm-vs-x86-so]:https://stackoverflow.com/questions/14794460/how-does-the-arm-architecture-differ-from-x86
[instruction-sets]:https://en.wikipedia.org/wiki/List_of_instruction_sets

{% highlight asm %}
x86
-----

repe cmpsb         /* repeat while equal compare string bytewise */

ARM
-----

top:
ldrb r2, [r0, #1]! /* load a byte from address in r0 into r2, increment r0 after */
ldrb r3, [r1, #1]! /* load a byte from address in r1 into r3, increment r1 after */
subs r2, r3, r2    /* subtract r2 from r3 and put result into r2      */
beq  top           /* branch(/jump) if result is zero                 */

{% endhighlight %}

It is the same code but on different architecture with different instruction sets. It is just like diffeences on the `high` level beetwen languages like `C#` and `Java`. Due to this differences you need to compile the code for specific machine. If you are int linux world, it is pretty standard procedure to download source code of some program, tool and build by your own on your machine for your machine specific architecture and instructions sets. More popular distributions have packages with already precompiled binaries. That is why things like `java virtual machine` and `clr` were created. They server as a intermidiary beetwen code and machine using `byte code` and `JIT` compilation, compiling code on the fly to match the machine.

If in the the end all there is 'assembly' then it should be easy to communicate beetwen different languages. Devil is in the details. The machine doesn't really know which language ultimately generated instructions set that is execcuted by it. But the more we go `one level up` the more differences are there. There are different compilers, different flags, different languages, different architecture, different contexts and different conventions.

One of the important difference, I want to talk aobut is `calling convention`. AS mentioned earlier it is like a contract exposed by one function to other to tell it how to communicate with it. If function `A` uses different convention than function `B` they won't be able to call each other.

Calling conventions can differ in many ways:

- storage of arguments - registers, stack
- how are the arguments added to the stack - left to right or right to left
- where do you put result of the function call (stack, register, memory)
- who is responsible for stack cleanup - caller or calle ( this makes a difference in assembly code size, if caller is cleaning up the stack - the compiler has to generate cleaning logic every time a function is called)
- who is responsible for `cleaning` up `registers` and bringing them back to previous state (before the function was called)

Analysing few examples, based on `x86 calling conventions`[\[x\]][x86-conventions].

[x86-conventions]:https://en.wikipedia.org/wiki/X86_calling_conventions

If one of the functions expects call using `cdecl` convention. It is expecting:

* arguments to be on the stack
* caller cleaning up the stack

If we then call this function using `fastcall` convention both requirements won't be met:

* for fastcall first `three` (for Microsoft `two`) arguments are kept in the reggisters, and calle expectes this values on the stack when it is empty
* stack won't be cleaned up as fastcall assumes that `callee` is responsible for that.

Examples in asm [\[x\]][examples-cc]

[examples-cc]:https://godbolt.org/g/Zp5tAA

{% highlight c %}

__attribute__((cdecl)) int cdecl(int a, int b) {
      return a * b;
}

__attribute__((fastcall)) int fastcall(int a, int b) {
      return a * b;
}

int caller() {
    int a = cdecl(2, 3);
    int b = fastcall(2, 3);
    return a + b;
}

{% endhighlight %}


// Change this listings show maybe individual functions 
// simplify the fastcall to directly use ecx, edx
// explain why potentialy compiler hasnt used registers directly 

> rguments are first saved in stack then fetched from stack, rather than be used directly. This is because the compiler wants a consistent way to use all arguments via stack access, not only one compiler does like that.[\[x\]][fastcall-diss]

// show what is the equivalent of leave and enter and replace it
// simplify the code removing the uneccessary parts to make the point
// and make the point only with the proper code?

[fastcall-diss]

{% highlight c %}

This code is using no opitmizations -O0 
Other flags used:
-m32 - to force 32 bits as on 64 calling conventions are ignored

cdecl:
  push ebp                    <- preserve the caller function entry point on the stack
  mov ebp, esp                <- point ebp to this function stack frame pointer (create stack frame)
  mov eax, DWORD PTR [ebp+8]  <- move value 'a' from the stack frame to the accumulator eax
  imul eax, DWORD PTR [ebp+12]<- multiply eax by 'b' from the stack frame
  pop ebp                     <- restore entry point from the stack of the calling function to be able to go back
  ret                         <- return to the entry point of the calling function
fastcall:                     
  push ebp                    <- preserve caller function entry point on the stack
  mov ebp, esp                <- point ebp to this function stack pointer (create stack frame)
  sub esp, 8                  <- allocate space for 2 items on the stack frame (using substraction) 
  mov DWORD PTR [ebp-4], ecx  <- put the `a` from ecx register on the stack
  mov DWORD PTR [ebp-8], edx  <- put the `b` from edx register on the stack
  mov eax, DWORD PTR [ebp-4]  <- move `a` to accumulator eax
  imul eax, DWORD PTR [ebp-8] <- multiply by `b`
  mov esp, ebp                <- `destroy` the stack
  pop ebp                     <- restore entry point of the caller
  ret                         <- return to the entry point of the calling function
caller:
  push ebp                    
  mov ebp, esp
  sub esp, 24                 <- make space on the stack
  sub esp, 8
  push 3                      <- push `a` to the stack
  push 2                      <- push `b` to the stack 
  call cdecl
  add esp, 16                 <- 'clean up' the stack
  mov DWORD PTR [ebp-12], eax <- after cdecl call eax contains a*b result of cdecl function, put it on the stack
  mov edx, 3                  <- move `a` to edx register
  mov ecx, 2                  <- move `b` to ecx register
  call fastcall
  mov DWORD PTR [ebp-16], eax <- eax contains result of a*b from fastcall function put it on the stack
  mov edx, DWORD PTR [ebp-12] <- put result of cdecl on the register
  mov eax, DWORD PTR [ebp-16] <- put result of fastcall on the register
  add eax, edx                <- add and leave the value on eax for the caller to use
  mov esp, ebp                <- `destroy` stack
  pop ebp
  ret

With level 1 optimziation -01 this looks even more clear

{% endhighlight %}

Diffs: (in the simplified code example)

- fastcall uses edx and ecx registers
- cdecl uses stack
- fastcall using mov esp, ebp cleans up the stack
- cdeccl doesnt do this the caller is ussing add esp, 16 to clea up the stack



I replaced leave instructions with 
mov esp, ebp
pop ebp

sub esp
add esp
instructions are nicely explained here stack operations[\[x\]][stack]

[stack]: https://en.wikibooks.org/wiki/X86_Disassembly/The_Stack
[leave-enter]: https://stackoverflow.com/questions/5858996/enter-and-leave-in-assembly

it is not that easy to communicate between different langusges. Haz this is where we get into the the minefield of different approqches, consteucts and conventions. That I why one of the steps to be able to make this communication I calling conventions a contract defining the way functions should interpret its context (register, stsck) told be able to communicate with each other.

(shoe two different conventions and what happens if they don't match correclty - like one code expecting argument for method in this register but there is some random memory and some random stuff) 

Right to left on different registers, or cleanup.

Different language also represent types differently in the memory that I why you need marshaling stub to translate between two worlds  
jjjj
What is the IL calling convention. how does it's look like in the visual studio dism. That is why fcimpl and fcall is great, it matches convention to the one's use by il and that I generate by jitter to remove intermediary step like marshaling stub. 

(frame has to provide something with GC and exceptions asm code in cpp exception looks different than the exception in il, runtime wouldnt be able to understand exception thrown in cpp without this translational step) frame I encoding state in one context it is then use im different context to rebuild it. Stack frame is like a meta data conteact. 

wczoraj siedzialem i czytalem o asmie i roznicach miedzy roznimy convencjami wolania funkcji
dla mnie to fajnie zrozumiec jak na machine code levelu trzeba dopasowac 'kontrakt' i to jak sa reprezentowane typy w pamiec albo jak odkladane atrybuty na stos tudziez jakie rejestry sa uzywane
zeby sparowac 2 rozne jezyki i komunikacje miedzy nimi na poziomie asm-a (edited)
tak samo jak np wyjatek w c++ jest zrozumialy w c#
albo jak wywolac garbage collector z niezarzadzanego kodu ( uzywa sie stosu i specjalnym ramek ktore koduja informacje ze hej wywolaj garbage collector :smile: ) (edited)
ja wiem ze tej wiedzy nigdzie nie uzyje
ale czasem czuje ze problemy ktore ja rozwiazuje na poziomie weba i serwisow budujac systemy rozproszone
sa juz dawno rozwiazane na poziomie jednego procesu i kodu

TODO:
- definitely identify parts that require verification from .net internals expert - konrad kokosa
- propose to konrad book advertisement if he has some landing page
- normally in ASM there is a call instruction (what is it?)

Machine Learning based search
https://arxiv.org/pdf/1805.04272.pdf

Profile somehow - Sort with comparere and TrySZSort? show calls?


`winapi` convention  was mentioned in `P/Invoke` explanation. There are many other conventions [\[x\]]][calling-conventions].

[calling-conventions]:https://www.codeproject.com/Articles/1388/Calling-Conventions-Demystified
[calling-convs-so]:https://stackoverflow.com/questions/10671281/what-is-the-fastcall-keyword-used-for-in-visual-c

### __fastcall calling convention

>  An `FCall` target uses `__fastcall` or some other calling convention to match the IL calling convention exactly. Thus, a call to FCall is a direct call to the target without no intervening stub or frames.

We need to explains `stubs` and `frames` - a bit.

`Stub` is something generated byc `CLR`. It is used to handle marshalling and call/invocation of a target method. When we have a `managed` function, it cannot call the `unmanaged` function just like that. There has to be a intermediary that helps these too to connect. This thing is called `marshalling stub`(I think stub has a lot of meaning but in this example it is something in the middle).

`marshalling stub` handles things like:

* initialization
* marshaling of input parameters
* invocation of the method
* marshaling back of the return value
* cleanup 

`frames` - stack is filled with `frames`. When a method is called a new frame is erected and it contains informations about `params`, `variables` and many other thingss. 

Beacuse bby default there is no need for `frames` or `stubs` and `FCall` entry pint is directly calledd this method is faster. You have to create frames for scenarios like `throwing exception` or calling `garbage collection` in `FCall`.

In `QCall` and `P/Invoke` frames and marshalling stubs are generetade automatically.

### __fastcall vs cdcell vs __stdcall

I am not gonna bore about more detail but `__fastcall` is a convention that is `supposed to be faster` as it uses `registers` for first 2 arguments when `standard` convention uses stack. This is oversimplified description and for more details check this links.

If you want to see examples on how conventions are translated to dism
https://en.wikibooks.org/wiki/X86_Disassembly/Calling_Conventions#FASTCALL


More calling conventions links:

https://blogs.msdn.microsoft.com/oldnewthing/20040102-00/?p=41213
https://blogs.msdn.microsoft.com/oldnewthing/20040107-00/?p=41183
https://blogs.msdn.microsoft.com/oldnewthing/20040108-00/?p=41163
https://blogs.msdn.microsoft.com/oldnewthing/20040113-00/?p=41073
https://msdn.microsoft.com/en-us/library/6xa169sk.aspx
https://msdn.microsoft.com/en-us/library/984x0h58.aspx
https://gcc.gnu.org/onlinedocs/gcc/x86-Function-Attributes.html
