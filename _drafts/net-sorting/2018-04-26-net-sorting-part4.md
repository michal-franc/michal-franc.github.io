---
layout: draft
title: Everything you wanted to know about Sorting in .NET part 4
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
series: net-sorting
permalink: /blog/net-sorting-part4/
---

{% include toc.html %}

In this blog post we will answer the question `What is a calling convention?`.  A calling convention is like a contract that describes how the functions call each other, on the `assembly` level using `cpu` instructions`.

This contract defines things like:

- the way arguments are passed to a function
- how values are returned
- how the function name is decorated
- who: `caller` or `calle` handles `stack` or `registers` cleanup

> It specifies how (at a low level) the compiler will pass input parameters to the function and retrieve its results once it's been executed.[^calling-convs-so]

[^calling-convs-so]:[StackOverflow 'What is the fastcall keyword...'](https://stackoverflow.com/questions/10671281/what-is-the-fastcall-keyword-used-for-in-visual-c)

[calling-conventions]:https://www.codeproject.com/Articles/1388/Calling-Conventions-Demystified

If we go down to the lowest levels of `code`, there is a `machine code`[^machine-code].

[^machine-code]:[https://en.wikipedia.org/wiki/Low-level_programming_language](https://en.wikipedia.org/wiki/Low-level_programming_language)

{% highlight csharp %}
8B542408 83FA0077 06B80000 0000C383
FA027706 B8010000 00C353BB 01000000
B9010000 008D0419 83FA0376 078BD989
C14AEBF1 5BC3
{% endhighlight %}

This btw is a Fibonnaacci number generation code in `machine code`. I wouldn't be able to write it that way, but what is important is that on this `lowest level` it really doesn't matter if this code  comes from `C++`, `Java`, `Python` or `C#`. It would an `impossible` task(almost) to write code that way. That is why we have a higher abstraciton on top of machine code - `assembly` language. 

Example below is the same `fibonacci number` generation code but in `assembly`.

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

On this level which is still very low. We operate very close to the `CPU` using - registers, stacks, and cpu instructions like `mov` or `jmp`. Every cpu supports different `registers` and `instructions`[^instruction-sets].

First micro processor[^first-micro-processor] had `46` instructions[^i4004-instruction-set]. These days you can check this list [^instructions-listings], there are hundreds of them. It all started with simple instructions, which were used to generate more complex operations. As these operations become very common, cpu designer added them as new instructions, often designing cpus to make them more optimized.

Then there is also a difference beetwen `(RISC)ARM` and `(CISC)x86` processors. The former have smaller number of instructions but require fewer transistors making them more power efficient[^arm-vs-x86-so].

You can check the difference down below.

[^instructions-listings]:[CPU instructions listing](https://en.wikipedia.org/wiki/X86_instruction_listings)
[^i4004-instruction-set]:[Intel 4004 instruction set](http://e4004.szyc.org/iset.html)
[^first-micro-processor]:[First Micro Processor](https://en.wikipedia.org/wiki/Intel_4004)
[^arm-vs-x86-so]:[Arm vs x86](https://stackoverflow.com/questions/14794460/how-does-the-arm-architecture-differ-from-x86)
[^instruction-sets]:[Instructions sets](https://en.wikipedia.org/wiki/List_of_instruction_sets)

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

It is the same code but on different cpu families with different instruction sets. Due to this difference you need to compile the code for a specific machine. If you are familliar with linux world, it is pretty standard procedure to download source code of some program and build it itself on your machine for your machine specific context. More popular distributions have packages with already precompiled binaries. Usually when you go to a release page of some software - example (ripgrep [^ripgrep]) you will see different binares, for different operating systems, linux, kernels or families of cpus. (Btw ripgrep is an amazing replacement of grep).

[^ripgrep]:[Ripgrep release](https://github.com/BurntSushi/ripgrep/releases)

This is partially why `virtual machine` was created with platforms like `JAVA` or `.NET`. It helps with portability of software as instead of compiling your code to a specific instruction set. You compile it to intermediary language `IL` or `Java Bytecode` which is then compiled, usually lazilly on the fly, by the vritual machine to this machine specific context. It automates the whole process of building the code for your cpu. 

Ok, all of this is cool but if in the the end all there is is 'assembly' then it should be easy to communicate beetwen different languages. My code from `C#` should be able to talk to `Java` or `C` or `C++`. Well, devil is in the details. The machine doesn't really know which language ultimately generated instructions set that is execcuted by it. But the more we go `one level up` the more differences are there. There are different compilers, different flags, different languages, different architectures, different contexts and different conventions.

This is finally where we can jump on function `calling conventions`. As this is one of the important differences. As I mentioned earlier, `calling convention` is like a contract that tells two function how to communicate with each other.

#TODO HERE

Calling conventions can differ in many ways:

- storage of arguments - registers, stack
- how are the arguments added to the stack - left to right or right to left
- where do you put result of the function call (stack, register, memory)
- who is responsible for stack cleanup - caller or calle ( this makes a difference in assembly code size, if caller is cleaning up the stack - the compiler has to generate cleanup instructions next to the function call)
- who is responsible for `cleaning` up `registers` and bringing them back to previous state (before the function was called)

Analysing few examples, based on `x86 calling conventions`[\[x\]][x86-conventions].

[x86-conventions]:https://en.wikipedia.org/wiki/X86_calling_conventions

If one of the functions expects call using `cdecl` convention. It is expecting:

* arguments to be on the stack
* caller cleaning up the stack

If we then call this function using `fastcall` convention both requirements won't be met:

* for fastcall first `three` (for Microsoft `two`) arguments are kept in the reggisters, and calle expectes this values on the stack when it is empty
* stack won't be cleaned up as fastcall assumes that `callee` is responsible for that.

cdecl example [\[x\]][cdecl-example]

[cdecl-example]:https://godbolt.org/g/qTgVGm

{% highlight c %}

__attribute__((cdecl)) int cdecl(int a, int b) {
      return a * b;
}

int caller() {
    return cdecl(2, 3);
}

{% endhighlight %}

This is a simple function that all it does is `multiply` numbers. We have a `cdecl` which is marked with `cdecl` attribute to force this calling convention (this is actually default and this attribute is not needed).

I am compiling this code with two important flags:

* -m32 - forces 32 bit executable - without this flag calling coventions are ignored (couldn't find why)
* -O0 - I don't want to optimize this code as with such a simple example `-O1` in the caller puts a static value `(2 * 3 = 6)`
* `-fomit-frame-pointer` - one optimization that removes `frame pointers` to make the `asm` code a bit simpler. (At the end of this post there is a example without this optimization explained if you are curious what is the diffference).

> -fomit-frame-pointer   
> Don't keep the frame pointer in a register for functions that don't need one. This avoids the instructions to save, set up and restore frame pointers; it also makes an extra register available in many functions. It also makes debugging impossible on some machines. [\[x\]][fomit-frame-pointer]

It removes instructions

{% highlight c %}
  - push ebp      <- preserve the caller function entry point on the stack
  - mov ebp, esp  <- point ebp to this function stack frame pointer (create stack frame)
...
  - pop ebp       <- restore entry point from the stack of the calling function to be able to go back
{% endhighlight %}

[fomit-frame-pointer]:https://stackoverflow.com/questions/14666665/trying-to-understand-gcc-option-fomit-frame-pointer

So how does the `asm` code looks like with all this flags?

{% highlight c %}
cdecl:
  mov eax, DWORD PTR [ebp+4]  move value 'a' from the stack to the accumulator eax
  imul eax, DWORD PTR [ebp+8] multiply eax by 'b' from the stack
                              -> in cdecl called function expects arguments on the stack
  ret
caller:
  push 3                      push `a` to the stack
  push 2                      push `b` to the stack 
                              -> in cdecl arguments are pushed to the stack
  call cdecl
  add esp, 8                  'clean up' the stack by moving the pointer
                              -> in cdecl caller cleans up the stack
  ret
{% endhighlight %}

We can see all the characteristics of `cdecl` call in this `code`. I am going to compile now fastcall function using similar flags.

Example of fastcall [\[x\]][example-fastcall-asm]

[example-fastcall-asm]: https://godbolt.org/g/VFQQmL

{% highlight c %}

__attribute__((fastcall)) int fastcall(int a, int b, int c) {
      return a * b * c;
}

int caller() {
    return fastcall(2, 3, 4);
}
{% endhighlight %}

I added `third` parameter to show that only first `two` arguments are passed through the registers.  There is one thing, I am going to change in the code to make it more readable - `fastcall` looks like this.

{% highlight c %}
fastcall:
  sub esp, 8                   -> reserve place on the stack
  mov DWORD PTR [esp+4], ecx   -> move `a` to the stack
  mov DWORD PTR [esp], edx     -> move `b` to the stack
  mov eax, DWORD PTR [esp+4]   -> move `a` from stack to eax
  imul eax, DWORD PTR [esp]    -> multiply `a` on eax by `b`
  imul eax, DWORD PTR [esp+12] -> multiply by `c` on the stack
  add esp, 8                   -> clean up the stack
  ret 4                        -> return to the caller and move stack pointer cleaning up `c`
{% endhighlight %}

But it can be simplified to this.

{% highlight c %}
fastcall:
  mov eax, ecx
  imul eax, edx
  imul eax, DWORD PTR [esp]
  ret 4
{% endhighlight %}

There is no need to reserver place on `stack`, move values from registers to the `stack` and then get values from the `stack`. Compiler potentialy does it due to `consistency`.

> Arguments are first saved in stack then fetched from stack, rather than be used directly. This is because the compiler wants a consistent way to use all arguments via stack access, not only one compiler does like that.[\[x\]][fastcall-diss]

[fastcall-diss]: https://en.wikibooks.org/wiki/X86_Disassembly/Calling_Convention_Examples

In the end we will analyse this code.

{% highlight c %}
fastcall:
  mov eax, ecx              move `a` to eax 
  imul eax, edx             multiply `a` in the eax by `b` in edx
                            -> in fastcall called function expects arguments in the registers
  imul eax, DWORD PTR [esp] multiply by `a*b` by `c` on the stack, esp is pointing at the top of stack
                            -> in fastcall third parameters is on the stack
  ret 4                     return to the caller and cleanup stack from `c`
                            -> in fastcall called function is cleaning up the stack
fastcall:
  ret
caller:
  push 4          move `c` to the stack
                  -> in fastcall third argument is passed using stack
  mov edx, 3      move `a` to edx
  mov ecx, 2      move `b` to ecx
                  -> in fastcall first 2 arguments are passed by registers
  call fastcall   
  ret
{% endhighlight %}

We just discussed differences beetwen `fastcall` and `cdecl` but what if `caller` function used different convention than `calle` funciton ? Assuming for a while this scenario - the code will look like this.

{% highlight c %}
fastcall:
  mov eax, ecx    -> `fastcall` expects arguments on the registers
  imul eax, edx   
  ret
caller:
  push 3          -> but caller pushed arguments on the stack
  push 2         
  call fastcall
  add esp, 8 
  ret
{% endhighlight %}

In this example `fastcall` function will use `somekind` of data on the registers. It wouldn't get the data it was expecting `3` and `2` but something. This would generate an unexpected and hard to debug behaviour. That is why `calling conventions` are important. There is a long history behind them [^cc-history1][^cc-history2][^cc-history3][^cc-history4]

Next post in the series will expand on it and describe the link beetwen `JIT`, `CLR`, `calling conventions` and `FCall`.

[^cc-history1]:[The history of calling conventions, part1](https://blogs.msdn.microsoft.com/oldnewthing/20040102-00/?p=41213)
[^cc-history2]:[The history of calling conventions, part2](https://blogs.msdn.microsoft.com/oldnewthing/20040107-00/?p=41183)
[^cc-history3]:[The history of calling conventions, part3](https://blogs.msdn.microsoft.com/oldnewthing/20040108-00/?p=41163)
[^cc-history4]:[The history of calling conventions, part4](https://blogs.msdn.microsoft.com/oldnewthing/20040113-00/?p=41073)

https://msdn.microsoft.com/en-us/library/6xa169sk.aspx
https://msdn.microsoft.com/en-us/library/984x0h58.aspx

https://gcc.gnu.org/onlinedocs/gcc/x86-Function-Attributes.html

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
