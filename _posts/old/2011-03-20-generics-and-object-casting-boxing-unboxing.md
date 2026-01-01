---
layout: post
title: Generics and Object Casting– Boxing , Unboxing
date: 2011-03-20 15:23
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
<p align="justify">There are multiple scenarios in which we need to create generic classes for different objects. In this case we have two options. Either we can create generic class and specify the type/types of the object in the code  or ,  we can create a class operating on the System.Object types which are the base for every object / class in the framework.</p>
<p align="justify">If we have two options available then  the question is which one is better ?</p>
<p align="justify">To test both approaches , I created a simple logic which performs assignment and some kind of operation which returns value. This logic is encapsulated in two classes. <strong>ClassGeneric</strong> is built with generics built in .Net .You can see that type is represented by <strong>“U”</strong> letter. <strong>ClassObject</strong> is based on casting to System.Object.</p>
<p align="justify"></p>

<h2 align="justify"><span>Code</span>:</h2>

{% highlight csharp %}
   class ClassGeneric<U> 
    { 
        U test;

        public ClassGeneric(U value) 
        { 
            test = value; 
        }

        public void Operation() 
        { 
            U t = test; 
        } 
    }

    class ClassObject 
    { 
        Object test;

        public ClassObject(Object value) 
        { 
            test = value; 
        }

        public void Operation() 
        { 
            int t = (int)test; 
        } 
    }
{% endhighlight %}

<h2 align="justify"><span>Test </span>:</h2>
<p align="justify">Now lets perform a simple test by creating instances of both classes and performing operation. Stopwatch will be used to check performance.</p>


{% highlight csharp %}
       static Stopwatch sw = new Stopwatch();

        static void Main(string[] args) 
        { 
            sw.Start(); 
            for (int i = 0; i < 10000000; i++) 
            { 
                new Labs.ClassGeneric<int>(1).Operation(); 
            } 
            sw.Stop();

            Console.WriteLine(sw.ElapsedMilliseconds);

            sw.Reset(); 
            sw.Start(); 
            for (int i = 0; i < 10000000; i++) 
            { 
                new Labs.ClassObject((object)1).Operation(); 
            } 
            sw.Stop();

            Console.WriteLine(sw.ElapsedMilliseconds);

            Console.ReadLine(); 
        }
{% endhighlight %}

&nbsp;
<h2 align="justify"><span>Result </span>:</h2>
<p align="justify"><span><strong>Generics 471k</strong> ticks  <strong>-  Objects  710k</strong> ticks</span></p>
<p align="justify"><span><strong>Generics 212</strong> ms  <strong>-</strong>  <strong>Objects 343</strong> ms</span></p>
<p align="justify"></p>

<h2 align="justify"><span>Why there is a difference ?</span></h2>
<p align="justify">Generics are defined on the runtime.  .Net Framework based on the specified type in the code for example  (Queue<int>) creates a class with the type and stores reference to it. This operation is performed once on the start by the JIT-er (Just in time compiler). This operation is performed once so there is a minimal performance loss.</p>
<p align="justify">In case of System.Object class when casting from and to int we are performing <strong>Boxing</strong> and <strong>Unboxing</strong> operation.</p>
<p align="justify">Boxing is performed every time we are casting Value Type to the reference Type. Boxing operation wraps our Value Type in a class deriving from the System.Object. This operation requires some cpu work. Same thing applies for the Unboxing operation which is performed when casting from Reference Type to the Value Type.</p>
<p align="justify">In this example I am casting int to Object type 1000000 times. This is the cause of the difference in time / performance. Generic classes does not require additional operations.</p>

<h2 align="justify"><span>Boxing , Unboxing and generic interfaces</span></h2>
<p align="justify">Understaing when your code perfmors boxing and unboxing is  really important. Check this example. In .Net we can implement various interfaces which are used in the Framework. Some of them are generic. We can define which type will be used.</p>
<p align="justify">Here I am implementing IComparable interface , which is usefull when you want to perform Sort operation on the Collection containing your custom Class.</p>
<p align="justify">First Class uses the Generic Interface.</p>


{% highlight csharp %}
    class ClassSort : IComparable<ClassSort> 
    { 
        public int A {get;set;}

        #region IComparable<int> Members

        public int CompareTo(ClassSort other) 
        { 
          throw new NotImplementedException(); 
        }
        #endregion 
    }
{% endhighlight %}

<p align="justify">Second class uses default Interface.</p>


{% highlight csharp %}
    class ClassSortOne : IComparable 
    { 
        public int A {get;set;}

        #region IComparable Members

        public int CompareTo(object obj) 
        { 
            throw new NotImplementedException(); 
        }

        #endregion 
    }
{% endhighlight %}

<p align="justify">As you can see IComparable without generic type forces boxing when comparing objects beacuase we have to cast the objects. CompareTo() method in example with default interface uses object as a parameter while generic interface implements method with specified class as a parameter. Interface with specified generic type doesn’t need boxing and it is faster.</p>
<p align="justify"></p>

<h2 align="justify"><span>Conclusion:</span></h2>
<p align="justify">Use generic classes as often as you can. Especially when making a lot of operations with them. Simple casting which causes boxing and unboxing process consumes a lot of processor time.</p>
