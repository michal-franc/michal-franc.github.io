---
layout: draft
title: Everything you wanted to know about Sorting in .NET part 5
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
series: net-sorting
permalink: /blog/net-sorting-part5/
---

{% include toc.html %}

In the last post we have discovered what are `calling conventions` and how does code operate on the machine code level. With this knowledge we can finally wrap up and finish discussing `FCall`.

## Why FCall is special

The answer to that question can be found in `CoreClr` [^fcall-coreclr]

[^fcall-coreclr]:[fcall.h dotnet/coreclr](https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h#L176)

>  An `FCall` target uses `__fastcall` or some other calling convention to match the IL calling convention exactly. Thus, a call to FCall is a direct call to the target without no intervening stub or frames.

We already discussed `__fastcall` which uses registers to pass arguments (first 2). It is a bit faster compared to other conventions like `JIT calling convention`. This one uses stack to pass arguments and return values. Stack operations use precious `cpu cycles` for setup and cleanup. It is a `micro-optimisation` and I don't have any benchmarks but `__fastcall` should faster.  [^sscli-book][^ssess-book]

`FCall` is a direct call and no `stubs` or `frames` are interviening with it. When it comes to optimization and cpu cycles `the less is more`, but we need to discuss `stubs` and `frames` briefly.

### What is a stub

The first thing that comes to my mind in relation to `stub` is `Unit Test`. Simple objects used to control the context of `Unit` under test. `Stubs` in the `CLR` are completetly different. In `CLR` world stub is a small helper code. There are many stubs used for different reasons.

For instance `prestub` is used in `Just in time compilation` process. When `C#` code is compiled, every method changes to `IL` and is kept in `DLL` or `EXE` file. You can't run `IL` straight away, it is not machine code. It has to be compiled once again by the `runtime`. When you start your program it starts main `Thread` and loads up `Execution Engine`. The first function to run is your `Main` function. It is kept along with other functions in your `EXE` file in a big table containing functions names, functions descriptions, metadatada, IL code and prestub. Il code cannot be the entrypoint as it is not yet a machine code - but `prestub` is and it serves as a main entrypoint.

`prestub` contains machine code that calls runtime and orders it to `compile` it. Runtime takes the IL code compiles it and cleverly injects into the same memory address, replacing `prestub` with actual machine code. This process repeats itself and when Main function calls another function it again calls a `prestub` which tells the runtime to `compile it`. Proceess is repeated all the time and that is how `Just In Time` compilation is achieved. This is a very basic description of whole process as there is a JIT caching layer which helps to overcome some `JIT` overhead as it uses cpu cycles obviously. There are tools like NGEN that lets up compile aall the stubs and generate machine code for all the methods (use it only when you know what to do - JIT should be used in most of the scenarions)  [^pre-stub-book]

There are more stubs in the CLR and this are used in different scenarions like:
 
- implementation of generics and dynamic code
- marshalling in `P/Invoke`
- security checks
- exception handling
- support for multiple calling conventions
- `legacy` code adapters

[^pre-stub-book]:[.NET Components by Juval Lowy](https://books.google.co.uk/books?id=Rh2cAgAAQBAJ&pg=PA16&lpg=PA16&dq=machine+code+stub&source=bl&ots=wlcIrlaI0J&sig=H31EUvLkUX3_UHkh2DhjxghnB8w&hl=en&sa=X&ved=0ahUKEwiY99PLv5LbAhVLJMAKHdu_DEYQ6AEIUDAE#v=onepage&q=machine%20code%20stub&f=false)

### What is a frame

There are many usages of word `frame` the one I am mostly used to is `OSI model` frame. It is a data structure that holds sender/receiver information and the `packet` - payload.

![Network frame image](/images/network-frame.png "OSI network frame")
{: .tofigure }

When reading `CLR` code and documentations you can encounter multiple references to `frame`. It gets confusing as this word is used for many different things. There is a `stack frame`, a region on the stack that holds the context of method call: arguments, local variables, return values.

![Stack frame](/images/stack-frame.PNG "Simple stack frame for a + b + c function")
{: .tofigure }

UThere is a `exception handler frame` used in exception handling and `execution engine frame`, this one is interesting as it is used as a structure to hold various metadata used by the runtime to generate exection context. There are many EE frames [^frames-list]. 

[^frames-list]:[github/coreclr frames.h](https://github.com/dotnet/coreclr/blob/master/src/vm/frames.h#L24)

## Benefits of FCall

FCall is faster beacuse it limits number of frames and stubs it requires to operate thus saving cpu cycles:

- there is no `pre stub` jitted code calls directly FCall entry point
- as FCall is inside execution engine and matches IL calling convention not requiring `marshalling stub` to help with the communcation
- number of frames used with FCall is smaller, you need to manually create frames in order to throw exception or call garbage collection [^fcall-frames] (but when you do this QCall is faster and preferred choice [^qcall-faster])

[^fcall-frames]:[github/coreclr fcall.h](https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h#L14)
[^qcall-faster]:[github/coreclr qcall.h](https://github.com/dotnet/coreclr/blob/master/src/vm/qcall.h#L24)

[^sscli-book]:[Share Source CLI 2.0 Internals](http://www.newardassociates.com/files/SSCLI2.pdf)
[^ssess-book]:[Shared Sources CLI Essentials](https://books.google.co.uk/books?id=XibbpjWeRlMC&pg=PA156&lpg=PA156&dq=JIT+calling+convention&source=bl&ots=33wM50sGqh&sig=k3NQH4yu763HtT9gicujX3Xu_6s&hl=en&sa=X&ved=0ahUKEwiL9J_Q2JLbAhVKKcAKHcWXB-gQ6AEINTAC#v=onepage&q=JIT%20calling%20convention&f=false)


*[CLR]:Common Language Runtime
*[NGEN]:Native Image Generator
