---
layout: post
title: Journey through the .NET internals - Sorting
date: 2018-05-28 07:00
author: Michal Franc
comments: true
categories: [Article]
tags: [.net]
series: net-sorting
image: net-sorting/part0.png
permalink: /blog/net-internals-journey-sort/
---

Welcome to my new series about Sorting and .NET Internals. It has started as a simple question `Hey, I wonder how sorting implementation looks like in .NET?`. This was planned as one one blog post, quick wrap up and another topic. But when I started reading, I just couldn't stop asking question `Why?`. This series is a journey through the code starting with `List.Sort()` and ending at `IntroSort` algorithm.

To make it more manageable, I divided this work to two chapters:

- `Chapter I` - .NET internals - from `List<T>.Sort()` to `TrySZSort`  
  - A journey through the code. Starting with `List<T>.Sort()` and ending on assembly code level. If you are interested in how .NET and CLR work internally or what `FCall`, `QCall`, `P/Invoke`, `marshalling` is. This is must have chapter for you. If you are not interested in .NET internals, you can jump straight ahead to `Chapter II`.  

- `Chapter II` - Sorting in the real world - IntroSort
  - Going to the details of sorting in the real world. Focusing on Quicksort but also discussing other algorithms pros/cons and trade-offs. This will serve as a great introduciton to explanation why .NET uses `IntroSort`. We are also going to discuss .NET implementation of `IntroSort`.

Today there is only first part available. Next parts publication is planned to happen in 1-2 weeks time.
 
### Chapter I - .NET Internals:    

* [`System.Collections.Generic.List<T>.Sort()`] [part1]
  * `_version++` - keeping enumaration save from unwanted change
* [`Array.Sort<T>()`] (in the making)
  * `[System.Security.SecuritySafeCritical]` and `[ReliabilityContract]`
  * `Array.CreateInstance` vs `new[]`
  * Visual Basic and the world of non one based arrays
* [`TrySZSort`] (in the making)
  * why part of the sorting is in unmanaged code?
  * P/Invoke vs InternallCall
  * Calling CLR from managed code
  * FCall and QCall
* [`How functions communicate on the assemlby level`] (in the making)
  * calling conventions
  * fastcall vs cdecl
* [`FCall and __fastcall`] (in the making)
  * stubs and frames
  * `garbage collection` and `exception` in `native CLR code`
* [`FCALL_CONTRACT`] (in the making)
  * `NanPrePass`
  * Why `0xffffffff` = -1

[part1]:/blog/net-internals-sorting-part1

### Chapter II - Sorting in the real world - IntoSort:  

* Basics Of Quicksort
* Overview of search algorithms - strength and weaknesses
* IntroSort
* CLR implementation
