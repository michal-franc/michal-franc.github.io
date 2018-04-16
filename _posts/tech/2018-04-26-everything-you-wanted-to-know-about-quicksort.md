---
layout: post
title: Everything you wanted to know about Sorting in .NET
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [alkgorithms]
permalink: /algorithms/everything-you-wanted-to-know-about-sorting-net/
---

#### TL;DR;

> Not a brief journey into .NET internals and sorting algorithms in the real-world

You might ask question. Why do you need to know sorting algorithms at all. There are frameworks. You call .Sort() function, some magic happens - data is sorted - time to go home. There is a lot of truth in that but ... 

* You might encounter problems that simple calls to framework functions won't be enough
* You need to know what is stable nad unstable sorting algorithm, it can influence your design decisions
* Sorting algorithms are a great introduction to the world of 'trade-offs'
* This is also example of multiple 'tools' doing same thing in different ways
* It is a good way to learn about 'divide and conquer', 'asympthotic complexity' and recurssion

W takim podejsciu jest wiele racji i nie jest ono zle. Framework to narzedzie do rozwiazywania naszych problemow biznesowych ktore w wiekszosci przypadkow sa wwanziejsze niz rozwazania nad tym jak dzialaja dokladnie algorytmy sortujace. Moj szef baardziej bedzie zadowolony jak dowioze nowy ficzer na produkcje zamiast ekscytujacego opowiaadania o tym ze .NET uzywa algorytmu IntroSort ktory dziala tak i tak. Wiedza ta tez nie zaimponuje moim znajomym.

Po co wiec inwestowac czas I budowac takie powiazania w sieci Neuronowej. Po pierwsze czytajac ten post dostajesz juz gotowa wydystylowana wersje i wiedze. Wiec nie musisz spedzac tyle czasu co ja (autor) na przeszukiwaniu i googlowaniu internetow oraz czytaniu White Paperow.

Po drugie drugie - Algorytmy sortujace i to jak sa skontsutrowane oraz jakie 'tradeoffs' sie w nich podejmuje jest bardzo ciekawe i wbrew pozorom moze sie przydac w przyszlej pracy. Na pewno przyda sie w pracy w ktorej wychodzimy poza framework i zderzamy sie z problemami dla ktorych framework nie jest wystarczajacy. 

<przyklad takich problemow? -> np sortowanie duzych ilosci danych albo sortowanie danych external, albo ficzer wymagajacy sortowania stabilnego>

Po trzecie - Na poziomie tak niskiego kodu jak sczegoly implementacyjne algorytmow sortujacych - sa to lata badan naukowcow - jest tam tona wiedzy ktora moze sie przydac w innych systemach. Czytajac o algorytmach sortuajcych mozna czerpac z tej wiedzy.

Po czwarte, i ostatnie - jako Architekt-Inzynier na codzien w pracu musze lawirowac w niedoskonalych rozwiazaniach przy ktorych ciagle musze podejmowac decyzje 'tradeoff' - te decyzje czessto sa saa suma mniejszych calosci - i rzeczy na niskim poziomie.

- Why is it usefull to have this kind of knowledge?
-- Where sorting is important?
-- What kind of things you need:
--- to know
--- could be usefull to know


1. We will go deep down to .NET and start getting deep inside the framework starting with List.Sort() operation discussing what is happening
  - Stack Trace road to the Algorithm
  - IEnumerable version and state management
2. C++ native World
3. We will discuss IntroSosrt .NET Sorting implementation
  - introduction to QuickSort
  - brief characteristis and description of other algorithms
  - why quicksort?
  - Problem with Quickosrt?
    - pivot
    - wors case
  - ways to deal with quickSort problems - introsort
  - CS course vs Real World
4. We will discuss Sort algorithms tradeoffs and design decision chosen by the .NET creators
5. Discussion around other frameworks and what sorting algorithms they have and why this idea
  - python Java timsort?
  - go quicksort?
  - javascript - weirdness and quicksort?
  - scala,| clojure ?
  - C++? C?
  - django?
  - ta java od JetBrainsa
  - why developers didnt standarised sorting algorithm across the industry and platform

- Gdzie sorotwanie jest wazne
- Czego mozna sie z sortowania naauczyc zauwazyc
- Real world vs theory

[sort_source]: https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726
[array_source]: https://referencesource.microsoft.com/#mscorlib/system/array.cs,54496ee33e3b155a
[trysz_source]: https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.cpp#L268
[intro_sort_source]: https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L128

#### 'StackTrace'

* `System.Collections.Generic.List<T>.Sort()` [source][sort_source]
  * `_version++` - keeping enumaration save from 
* `Array.Sort<T>()` [source][array_source]
  * what happens if comparer is provided or not?
  * What is `FEATURE_LEGACYNETCF` and `MangoArraySortHelper?` why this thing (in the making)
* `TrySZSort()`
  * what is SZSort?
  * Visual Basic and the world of non one based arrays
* `TrySZ` and native function [source][trysz_source]
  * `FCIMPL4` - extern calling
  * ValidateObject? Asserte?
  * Why VB is Sad with this implementation
  * Which types are supported and how they are expressed and checked?
  * Why ddifferent implementation per type?
  * What is NanPrepass and Why NanPrepass for Float and Double?
  * What happens if TrySZSort 'fails'?
  * IntrospectiveSort [source][intro_sort_source] 
```

### It all started in List.Sort

{% highlight csharp %}
var list = new List<int> { 3, 4, 10, 5, 6, 1, 9 , 1 };
list.Sort();
Console.WriteLine(list);
output -> [1, 1, 3, 4, 5, 6, 9, 10]
{% endhighlight %}

We are used to this code. Nothing special here. Simple list, sort invocation and magic happens. But what hidden behind the curtain?

Simple `.Sort()` call is not the only call that sorts the List.

{% highlight csharp %}
1. list.Sort()
2. list.Sort(IComparer<T> comparer)
3. list.Sort(Comparison<T> comparison)
4. list.Sort(int index, int count, IComparer<T> comparer))
{% endhighlight %}

Which means there is a way to sort only part of the array.

{% highlight csharp %}
var list = new List<int> { 3, 4, 10, 5, 6, 1, 9 , 1 };
list.Sort(0, 5, null);
Console.WriteLine(list);
output -> [3, 4, 5, 6, 10, 1, 9, 1]
{% endhighlight %}

`.Sort()` is overloaded function with this parameteres `.Sort(0, count, null)`

{% highlight csharp %}
public void Sort()
{
    Sort(0, Count, null);
}
{% endhighlight %}
[source](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726f)

Going down the 'rabbit hole' ultimately we get to the `Array.Sort<T>` function.

{% highlight csharp %}
Array.Sort<T>(_items, index, count, comparer);
_version++;
{% endhighlight %}

The parameters in this case are:

* `_items` -> `T[]` internal representation of the list
* `index` -> `0` - start from the begining of the list
* `Count` -> `list` count -> reach the end of the list
* `comparer` -> `null` -> use default comparer

`_items` - Internally `List<T>` uses `Array` to store its values. It serves as an abscration, enabling dynamic resizing, sorting, convinient add, remove and other things.

`_version++` - integer value that is increased everytime there is operation that changes `State` of the list. Used to check if `State` was changed. 

Operations ending with `_version++`: 

* `Add`, `Remove`, `Clear`, `Insert`, `[]` using index to set 
* `Sort`, `Reverse` - changing order of items is considered as state change

You are probably familiar with code like this:
{% highlight csharp %}
var list = new List<int> { 1, 2, 3, 4, 5, 6, 8};

foreach(var l in list)
{
  list.Insert(0, 10);
  Console.WriteLine(l);
}

output:
1 
And exception
{% endhighlight %}
<span style="color:red">**InvalidOperationException: Collection was modified; enumeration operation may not execute**</span>

This was one of the exceptions that haunted me a lot as a Junior Dvv. It is thrown to protect the `enumeration`. The idea of enumeration is to read static and stable collection of elements. When enumerating we want to vist every element on the collection only once. If we would allow enumerating on a collection that is changing, there is a possibility to `enumerate` element twice.

With `for` loop there is no protection and we can do whatever we want.

{% highlight csharp %}
var list = new List<int> { 1, 2, 3, 4, 5, 6, 8};

for(int i = 0; i < list.Count; i++)
{
  Console.WriteLine(list[i]);
  list.Clear();
}

output:
1
{% endhighlight %}

Something we potentialy expected but what if code looks like this.

{% highlight csharp %}
var list = new List<int> { 1, 2, 3, 4, 5, 6, 8};

var once = false;

for(int i = 0; i < list.Count; i++)
{
  Console.WriteLine(list[i]);
  if(!once)
  {
    list.Insert(0, 10); //<- inserting 10 at the begginging

    once = true;
  }
}

output:
1 1 2 3 4 5 6 8
{% endhighlight %}

There is no `10` but `1` twice. That is beacuse when `10` was added `i` is 0 and will be `1` next iteration. This means that element on the `0` index moves to `1` and is printed twice when i is `0` and `1`. 

Enumeration is here to protect us from that kind of mistakes.

Sometimes we need to have a collection that is being enumerated and changed in the same time. Consumers - Producers - collection of some `Items` used by competing consumers to do thing. There is a writer creating new Items and readers reading it. But in that scenario it is generally better to use `Concurrect Collections` that are thread-safe and provide both lock or lock-free synchronization. Instead of writing your of `synchronization` using locks. As an example - ConcurrentBag that for multiple producers and consumers maintains `local queue` per thread and sometimes enables this thread to have `lock-free` access to data. Concurrent Collections are not as `scallable` your own implementation but they provide `safety` which in `multi-threading` apps can be more problematic thant a bit of loss in performance.  This is area where `Data Structure` knowledge gets usefull.

`_version` is used in operations like:

* [`ForEAch`](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,0e5a9cf0a310b9e5)
* [`Enumerator`](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,d3661cf752ff3f44)

#### Array.Sort - [source](https://referencesource.microsoft.com/#mscorlib/system/array.cs,54496ee33e3b155a)

We enter next function leaving List behind 

{% highlight csharp %}
[System.Security.SecuritySafeCritical]
[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]
public static void Sort<T>(T[] array, int index, int length,
 System.Collections.Generic.IComparer<T> comparer) {
{% endhighlight csharp %}

Parameters:

- `array` -> `_items` from the list
- `index` -> `0` - begginging of the list
- `length` -> List count of the list as we are sro
- `comparer` -> `null` use default one

What are the attributes here?  
`[System.Security.SecuritySafeCritical]`   
Part of `Code Access Security`. Marks function as being callable by tansparent code (part of app with limitations like - cannot call native code, can call only other transparent of `SecuritySafeCritical` code. You can mark assembly to be transparent - code in this assembly cannot elevate privileges or access protected resources). Without this attribute code marked as `transparent` wouldn't be able to use Sort function.
[\[6\]][securitytransparentcode][\[7\]][security][\[8\]][cas]

[security]:(https://docs.microsoft.com/en-us/dotnet/framework/misc/security-transparent-code-level-2)
[cas]:(https://docs.microsoft.com/en-us/dotnet/framework/misc/code-access-security-basics)
[securitytransparentcode]:(https://docs.microsoft.com/en-us/dotnet/framework/misc/code-access-security-basics)

`[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]`  
Marks code as `Constrained Execution Region` - this region of code limits developers on the type of code you can write. Protected by CLR. [\[9\]][cre][\[10\]][cre-so].

[cre]:(https://docs.microsoft.com/en-us/dotnet/framework/performance/constrained-execution-regions)
[cre-so]:(https://stackoverflow.com/questions/748319/what-does-reliabilitycontractattribute-do)

{% highlight csharp %}
if (length > 1) {
    if ( comparer == null || comparer == Comparer<T>.Default ) {
        if(TrySZSort(array, null, index, index + length - 1)) {
            return;
        }
    }
...
{% endhighlight %}

And now it gets interesting, this is where sorting starts. 

`length > 1` - it is kind of obvious that if array has one element it's already sorted. There is nothing to do here.

`TrySZSort` is called when comparer is default or not provided. I won't cover customized comparer in this blog post (it is similar code without native call part).

##### What is TrySZSort?

TrySZSort is a `external native function`. Under the hood it calls `C++` code, which is heavily optimized. If you provide custom `Comparer` this code won't be hit and benefits of native code won't occur. What is this name btw - There are two parts `SZ` and `Sort`. `Sort` is obvious. `SZ` comes from `S`ingle-dimensioned `Z`ero-based arrays.

`Single-dimensioned` - arrays that have only one dimension. Simple arrays that you index by using one dimension `[1]` when in two dimensional you have two `[1][0]`. `Zero-based` - arrays that start from `0` index. `[0, 1, 2, 3, 4 .... n]`. This begs a question - are there arrays that are not `Zero-based`? Apparrently it was not that obvious some time ago as it is now. I tend to assume this as a default option and never thought about having arrays starting from `1`. Is this even possible in .NET
? Looking at CLS Compliance '`All dimensions of an array must have a lower bound of zero.`' What is interesting - even if Array starting from index `0` is not `CLS compliant`, it is still possible to make one and use it. CLR supports it -  '`CLR does support non-zero-based arrays but they are discouraged.`'. They are also not optimized.

[cls-compliance]:(https://docs.microsoft.com/en-us/dotnet/standard/language-independence-and-language-independent-components#arrays)

{% highlight csharp %}
{% endhighlight %}

CLR keeps this ability as a backward compatibility for Visual Basic code. `TrySZSort` contains a glimpse to our long and complicated programming history. in `VB` you were able to create arrays starting from index 1. 

[More about VB history][vb-non-zero]
`TL;DR;` till `VB .NET 2002` - you were able to start arrays from one. VB evolved from different language history than `C#` that was `C` based and `zero-index based` was default <Rozwinac TL;DR; na bazie bog posta?>

[vb-non-zero]:(http://www.panopticoncentral.net/2004/03/17/non-zero-lower-bounded-arrays-the-other-side-of-the-coin)

Z jezykiem C i tym dlaczego generalnie tablice sa numerowane od Zera jset tez dluga historia i byly rowniez ciekawe dyskusje. Najczesciej przytaczanym przykladem dlaczego zaczynamy od zera sa operacje na wskaznikach. Rozumowanie ze start naszej tablicy w pamieci jest '0' jest latwiejsze do przelkniecia niz '1'. 0 oznacza nic - 1 jest juz czyms. Czesc zwraca uwage ze operacje matematyczne sa latwiejsze przy zalozeniu 0 jako index a czesc nawert uwaza ze nasze przyzwyczajenia numeracji 1,2,3 w swiecie rzeczywistym nijak sie ma do matematyki. Wieksza dyskusja dla zainteresowanych [https://softwareengineering.stackexchange.com/questions/110804/why-are-zero-based-arrays-the-norm]

Wracajac jednak do funkcji TrySZSortm przekonajmy sie czym ona tak naprawde jest.
Kod znajdziemy tutaj [https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.cpp#L268].

Wchodzimy do swiata C++.

```
FCIMPL4(FC_BOOL_RET, ArrayHelper::TrySZSort, ArrayBase * keys, ArrayBase * items, UINT32 left, UINT32 right)
    FCALL_CONTRACT;
```
keys = lista -> array
items = null
left = 0 and 
right = length - 1

left and right are just leftmost index and rightmost index of the array 

Na starcie deklaracja funkcji jest jakas inna, nie spotkalem sie z tym lata temu a to przez to ze nie mialem przyjemnosci uzywac makr.. FCIMPL4 - jest wywolaniem makr ktore przydatne sa do tworzenia generycznego kodu.  Wiecej o tym makrrze mozna poczytac na 
- https://github.com/dotnet/coreclr/blob/0c88c2e67260ddcb1d400eb6adda19de627998f5/Documentation/mscorlib.md#calling-from-managed-to-native-code
badz
- [https://github.com/dotnet/coreclr/blob/master/src/vm/fcall.h]

TL;DR; FCIMPL4 - FC - oznacza FCall IMPL - implementacja a 4 ilosc argumentow. W dokumentacji zalecane jest uzywanie FCIMPL by 'poprawnie' wygenerowac funkcje ktore sa zgodne. FCall jest metoda sluzaca do <Wiecej researchu i doczytac>

Nastepnie mamy jakies tam validacje obiektow i assercje by sprwadzicz czy wejsciowy stan ma sens.

```
    VALIDATEOBJECT(keys);
    VALIDATEOBJECT(items);
    _ASSERTE(keys != NULL);
```

```
   // <TODO>@TODO: Eventually, consider adding support for single dimension arrays with
    // non-zero lower bounds.  VB might care.  </TODO>
    if (keys->GetRank() != 1 || keys->GetLowerBoundsPtr()[0] != 0)
        FC_RETURN_BOOL(FALSE);
```
I zaczynamy powoli wchodzic w miecho. Pierwsza rzecz ktora wrzuca sie w oczy to wyrazny brak wsparcia dla tablic nie zero indexowych. W tym miejscu jest nawet TODO wspominajacy o Visual Basicu i jego specyficznego traktowania tablic. Jak widac wspaarcia  ciagle nie ma i zapewne nie bedzie nigdy :)

Mamy tez pierwszy przypadek kiedy zwrocona jest wartosc false. Czyli mozemy zalozyc ze dla tablicy z z indexem startujacym wiekszym niz 0. Wychodzimy z tej metody i cofamy sie do sortowania ktore oparte jest o CLR - z  nie domyslnym comparerer.

```
    TypeHandle keysTH = keys->GetArrayElementTypeHandle();
    const CorElementType keysElType = keysTH.GetVerifierCorElementType();
    if (!CorTypeInfo::IsPrimitiveType_NoThrow(keysElType))
        FC_RETURN_BOOL(FALSE);
    if (items != NULL) {
        TypeHandle itemsTH = items->GetArrayElementTypeHandle();
        if (keysTH != itemsTH)
            FC_RETURN_BOOL(FALSE);   // Can't currently handle sorting different types of arrays.
    }
```

Kolejne dwa przypadki w ktorych wycofujemy sie z natywnego kodu i uderzamy donnie domyslnego sortowania. Pierwszy przypadek sprawwdza czy nasza tablica ma typy primitive jak nie to cofamy sie do metody fererenccyjne. Drugi przypadek sprawdza czy Typ klucza zgodny jest z typem itemow. W naszym przypadku i wywolania listy nie mamy tak naprawde wskaznika do items bo w wywolaniu w kodzieSort przekazalismy parametr Null. Jest to wykorzystywane przy wywolaniu funkcji Aarray.Sort<Tkey, TValue>. Gdzie ta funkcja jest uzywania? Jaka kolekcja ma klucze i itemy? Slownik. Dokladnie tak ta funkcja i ta metoda uzywania jest w przypadku sorotwania slownika ale nie byle jakiego slownika. Tylko SortedList. Jesli slownik ma ten samy typ klucza i wartosci to bedzie to sortowane przez metode TrySZSort :) W Innym przypadku uderzamy do CLRowego sorta nie natywnego.

```
// Handle special case of a 0 element range to sort.
// Consider both Sort(array, x, x) and Sort(zeroLen, 0, zeroLen.Length-1);
if (left == right || right == 0xffffffff)
    FC_RETURN_BOOL(TRUE);
```

Sprawdzenie czy left == right jest na wypadek przypadku w ktorym ktos chce sprwadzic 'wycinek tablicy' ktory ma dlugosc zero. Wtedy nasz left i right beda w tym samym miejscu. 

But what is 0xfffffffff?? and why right is checked for it?

Pierwsza sprawa - 0xfffffffff jest tak naprawde reprezentacja wartosci -1 w systeme Two complement. Dawno dawno temu systemy uzywaly systemu one complement gdzie reprezetnacja wartosci binarncyh wygladala zupelnie inaczej wspolczesne systmeu uzywaja systmeu two complement.  Wiecej info tutaj [https://en.wikipedia.org/wiki/Two%27s_complement] 

Dlaczego wiec uzywac 0xfffffffff a nie -1? w tym porownaniu?
Tutaj z pomoba przybyl mi kolega @krzaq (link do blogaska) ktory zauwazyl ze w naglowki funkcji parametr right jest zadeklarowany jako UINT32. Jest to wartosc typu unsigned wiec '-1' nie istnieje. By jednak miec mozliwosc sprawdzenia czy cos jest -1, uzywa sie wartosci 0xfffffffff. Zgodnie z dokumentacja -1 mogloby byc ale nie dzialalo by na 100% https://timsong-cpp.github.io/cppwp/n4659/conv.integral#2 Tutaj juz zalezy od implementacji w kompliatorze jakby kod zachowal sie dla -1. Tak mamy pewnosc ze zachowa sie tak a nie inaczej bo 0xffffffff ma jasno okreslona wartos w systemie two complement.

Nigdy nie spodziewalem sie ze az takie dygresje i informacje bedzie mozna wyczytac z kodu sortowania. Lecimy dalej.

```
switch(keysElType) {
```

Wchodzimy coraz glebiej i zaczhaczamy o moment wyboru ktorej implementacji Sortowania wybierzemy.

Mamy typy:
Informacje o nich znajdziemy na 

https://docs.microsoft.com/en-us/dotnet/framework/unmanaged-api/metadata/corelementtype-enumeration

https://docs.microsoft.com/en-us/dotnet/api/microsoft.visualstudio.cordebuginterop.corelementtype?view=visualstudiosdk-2017

```
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
```

Mamy dwa przypadki w ktorych sytuacja jest nieokreslona

```
    case ELEMENT_TYPE_I:
    case ELEMENT_TYPE_U:
        // In V1.0, IntPtr & UIntPtr are not fully supported types.  They do 
        // not implement IComparable, so searching & sorting for them should
        // fail.  In V1.1 or V2.0, this should change.  
        FC_RETURN_BOOL(FALSE);

    default:
        _ASSERTE(!"Unrecognized primitive type in ArrayHelper::TrySZSort");
        FC_RETURN_BOOL(FALSE);
```

Czemu nie jest to calosc default - mozliwe ze bylo duzo pytan o wsparcie dla 'wskaznikow' stad jest tutaj dodatkowo klauzula - jak widac nic sie tu nie zmienilo - ciekawe czym jest v1.1 i v2.0 - co ciekawe autor komentarza pisze tutaj o 'shoul fail' gdzie tak naprawde wiemy ze zwrocenie false z metody TrySZSort wywola sortowanie inne.


```
   case ELEMENT_TYPE_I1:
    ArrayHelpers<I1>::IntrospectiveSort((I1*) keys->GetDataPtr(), (I1*) (items == NULL ? NULL : items->GetDataPtr()), left, right);
    break;
```

Wiec dla kazdego typu zdefinwanego w tabelcne odpalana jest specjalnia generyczna funkcja Sortujaca.

```
ArrayHelpers<I1>::IntrosepctiveSort(elementy_listy, null, 0, length -1)
```

W przypadku ktory omawiany i sortowania calej listy parametry beda wyglada tak drugi parametr nie bylby nullem gdyby byla to wczesniej wspominana sortedList ktora jest slownikiem i ma w sobie klucze i  wartosci


Dla Floata i Double wwyglada to troche inaczej


```
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
```

Przedewszystkim jest tutaj widoczna funkcja NaNPrepassA

```
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
```

Funkcja ta w czasie O(n) iteruje po liscie, wyszukuje w niej wartosci 'null' przesuwa je na poczatek listy i przesuwa parametr left. DZieki temu wartosci Null ktore sa nieokreslone nie beda wplywac na dalsze dzialanie algorytmu sortowania poniewaz nie da sie ich posortowac. Zalozone tutaj jest ze Null bedize na poczatku.

TA operacja mimo tego ze wydaje sie O(n) wiec mozna zalozyc ze po co ja robic nie wplywa na asymptotycznosc zlozonosc calego procesu sortowania. W dalszej czesci algorytm uzywa (IntroSort(wiecej o tym pozniej)) ktory ma najgorszy case O(nlogn) wiec sortowanie bylo by zlaczeniem tych wartosci O(n) + O(nlogn) jak wiemy bierzemy najwiekszy czynnik przy wyzcanieniu koncowego O wiec bedzie to dalej O(nlogn) gdyz O(n) jest mniejsze niz O(nlogn). Asymptotycznie ta operacja nie zwieksza naszej zlozonosci ale zapewne wplywa korzystnie na praktyczne dzialanie algorytmu sortowania zmniejszajac jego czas uruchomienia. 

<Tu przydalby sie test empiryczny dowodzacy temu>

Po tych przejsciach mysle ze mozna przejsc juz do algorytmu :) Tyle tekstu a my dopiero przejdziemy do Algorytmu sortowania ... pieknie.

I have recently spent a lot of time learning the programming basics. It is mainly related to my inner need of filling knowledge gaps. I mean here things like: algorithmics, data sturctures, computational complexity, etc. I feel sometimes that I entered job market too quickly and focused too much on being 'coding-monkey'. With time, I noticed an increase in the number of problems that required these basics. There was a feeling that, I am missing something. The turning point in this entire process was my previous and current company. All in all, it's only now after 9-10  years that, I feel like an engineer.

Zaczalem od banalow jak algorytmy sortuajce. Pojawia sie tam oczywiscie quicksort- uwazamy za najszybszy. Jest to stwierdzenie w wiekszosci przypadkow prawdziwe ale sa wyjatki. Quicksort jest swietnym przyklade uzycia techniki 'divide and coqnuer' i rekurencyjnego kodu.

```
function quicksort(array)
    less, equal, greater := three empty arrays
    if length(array) > 1  
        pivot := select any element of array
        for each x in array
            if x < pivot then add x to less
            if x = pivot then add x to equal
            if x > pivot then add x to greater
        quicksort(less)
        quicksort(greater)
        array := concatenate(less, equal, greater)
```

Pseudo kod nie wydaje sie trudny. I bazuje na podziale duzego problemu na mniejsze, latwiejsze do rozwiazania. Pozwala to wygenerowac sredni czas sortowania w zakresie 'O(nlogn)' ale zawsze tam gdzies jest przypadek najgorszy ktory juz wymaga wiecej czasu 'O(n^2)' (jest to przypadek w ktorym tablica jest juz calkowicie badz po czesci posortowana). Duzo tutaj zalezy on wybrania 'pivotu' - czyli punktu porowanczego - na kazdy etapie podzialu. 

```
quicksort(array):
     if len(array) <= 1:
         return array
     else:
         pivot = random.choice(array)
         less = [x for x in array if x < pivot]
         equal = [x for x in array if x == pivot]
         greater = [x for x in array if x > pivot]
         return quicksort(less) + equal + quicksort(greater)
```

Prosty kod w pythonie - ktory nie jest oszczedny pamieciowo bo alokuje na kazdym podziale nowe tablice i przy za duzej ilosci podzialow moze wykrzaczyc nam stos - moze wygladac jak kod powyzej. Python jest o tyle pieknym jezykem ze pozwala stworzyc kod ktory czyta sie prawie jak pseudo kod.

```
function quicksort(array)
    if length(array) > 1
        pivot := select any element of array
        left := first index of array
        right := last index of array
        while left ≤ right
            while array[left] < pivot
                left := left + 1
            while array[right] > pivot
                right := right - 1
            if left ≤ right
                swap array[left] with array[right]
                left := left + 1
                right := right - 1
        quicksort(array from first index to right)
        quicksort(array from left to last index)
```

Istnieja wersje algorytmu ktore bazuja na przetwarzaniu jednej i tej samej tablicy przez sprytne manipulowanie poczatkowym i koncowym indexem na kazdym pozionie podzialu. Pozwala to zrobic operacje in-place i nie generowac niepotrzebnej alokacji. Ta wersja jest juz znacznie mniej przejrzysta.


```
def quicksort(array):
    __quicksort(array, 0, len(array) -1)

def __quicksort(array, start, stop):
    if stop - start > 0:
        pivot = array[start]
        left = start
        right = stop

        while left <= right:
            while array[left] < pivot:
                left += 1
            while array[right] > pivot:
                right -= 1

            if left <= right:
                array[left], array[right] = array[right], array[left]
                left += 1
                right -= 1

        __quicksort(array, start, right)
        __quicksort(array, left, stop)

```

Kod nadal w zasadzie odpowiada pseudokodowy. Python naprawde jest wyjatkowy.

------------------ Wstepne pokazanie quick sorta w Pythone ------------------


```
    // Implementation of Introspection Sort
    static void IntrospectiveSort(KIND keys[], KIND items[], int left, int right) {
        WRAPPER_NO_CONTRACT;

        // Make sure left != right in your own code.
        _ASSERTE(keys != NULL && left < right);

        int length = right - left + 1;

        if (length < 2)
            return;

        IntroSort(keys, items, left, right, 2 * FloorLog2(length));
    }
```

Mamy tu kolejne sprawdzenia parametrow wejsciowych. Sprawwdzenie  czy jest w ogole sens cokolwiek sprawdzac, jezeli right - left + 1 = <2 to jest to albo 1 albo 0 elementowa tablica wiec nie ma sensu z nia nic robic.

NAstepnie mamy wywolanie algorytmu IntroSort. Tyle bylo mowione o QuickSorcie a tu prosze cos innego, IntroSort. Czemu tak?a

```
procedure sort(A : array):
    let maxdepth = ⌊log(length(A))⌋ × 2
    introsort(A, maxdepth)

procedure introsort(A, maxdepth):
    n ← length(A)
    if n ≤ 1:
        return 
    else if maxdepth = 0:
        heapsort(A)
    else:
        p ← partition(A) 
        introsort(A[0:p], maxdepth - 1)
        introsort(A[p+1:n], maxdepth - 1)
```

Moze pierw omowiony czym jest intro sort a nastepnei przejdziemy do tego jakie daje benefity. IntroSort to quicksort ktory zamienia sie w HeapSort. Zaczyna od quick sorta by w pewnym momencie 'zaglebienia' wezla zamienic sie w heap sort. W przypadku implementacji zachodzi tutaj jeszcze InsertionSort ale to omowimy dodatkowo jakie ma benefity :)

Wiec co jest nie tak z QuickSortem? PRoblemem jest tutaj zachowanie w najgorszym przypadku gdy tablica na ktorej operujemy jest juz calkowicie badz w wiekszosci posrotowania. Wtedy mamy czas zlozonoscy na poziomie O(n^2). Badania empiryczzne wykazaly ze pomimo tej cechy Quick Sort i tak dziala szybciej niz inne znane nam algorytmu stortuajce. Nie zmienia to oczywiscie tego ze mozna dalej ten algorytm usprawniac i mozliwe ze da sie pozbyc tego O(n^2). Do akcji wkracza tutaj heapsort ktory ma zarowno sredni jak i najmniej korzysty scenariusz O(nlogn). Spostrzegawcza osoba moglaby teraz powiedizec, hallo halloo, skoro HeapSort ma takie cechy ktore sa lepsze niz Quicksort to dlaczego nie uzyc odrazu HeapSorta. Po co bawic sie z QuickSortem. Ano wlasnie z powodu tego ze analiza O jest wielka abstrakcja ktora moze ukryc 'realny swiat'. Intuicja podpowiadaa nam ze HeapSort powinien byc lepszy a jednak okazuje sie ze w swiecie realnych danych to QuickSort okazuje sie najlepszy, ma tylko pewnie minusy ktore statystycznie nawet jak wystepuja to i tak powoduja ze algorytm ten dziala szzybciej niz inne (przy zalozeniu ze dane nie sa zawsze posorotwane wtedy to w zasadzie mozna uzyc Bubble Sort :D tlko po co sortowac posorotwane dane).

Mala dygresja - bardzo duzo w algorytmach sortuajcych zalezy od wejsciowych danych i tego jakie maja charakterystyki. Jezeli to reczywiscie jest pelny random dane to quick sort wypada najlepiej. JEzeli natomiast mozna znalezc w tych danych pewne cechy wspolne ktore np ukladaja sie w 'rozklad normalny' to wtedy algorytmy z rodziny 'bucket sort' (czemu) robia dobra robote. Istneiej tez cala rodzina problemow 'external sorting algorithms' tzn takich w ktorych dane nie mieszcza sie w pamieci i trzeba tez je dociagac. MErge Sort <tutaj dopisz ze on jest good external i dlaczego>  Tutaj tez pojawia sie kwestia tego jak te dane otrzymujemy i czy mamy ich calosc odrazu. Zalozmy np sytuacje w ktorej otrzymuje dane w paczkach (jakis stream). By te dane moc posorotwac quicksortem bedziemy potrzebowac zebrac caly strumien, poczekac na niego i dopiero wtedy odpalic quick sorta. Z pomoca moze nam przyjsc heap sort ktory pozwala odpalic sortowanie na pofrafmentowanych zbiorach danych ktore przychodza z czasem, nie potrzebujemy calego zbiory juz gotowego - wystarczy miec cokolwiek by zaczac. Jest tez kwestia czy algorytm jest stabilny czy nie ...

<dlaczego max depth to log2() * 2>
<dlaczego insertion sort -> https://rosettacode.org/wiki/Sorting_algorithms/Insertion_sort -> chyba chodzi o locality of data>a

Dlaczego przelaczac sie na heapsorta przez depth limit? Zachowanie QuickSorta O(n^2) wystepuje w momencie gdy algorytm tworzy duzo malycch podzialow poniewaz nie moze dobrac dobrze pivota przy posortowanej liscie.  PRzejscie na heapsorta likwiduje ten problem i do podzialu nei chodzi.   Jest to swego rodzaju wentyl bezpieczenstwa. FloorLog2 * 2 zapewnia przestrzen gdy podzialy sa nadal dobre i nie ma potrzeby przejsci an heapsorta bo pivot jest wybierany 'dobrze' < pokazac przyklad>   Naatomiast gdy jest prawdopodobienstwo ze cos dzieje sie nei tak i weszlismy w petrle O(n^2) algorytm zauwaza to i dostosowywuej sie przerywajac to zachowanie i operujac na innym algorytmie. 

Wartosc depth Limit nie moze byc za mala - bo bedzie to wywolywac heap sorta za czesto - nie moze tez byc za duza by spedzic za duzo czasu w Quadratic time sortowaniu. Wartosc FloorLotg 2 * 2 empirytcznie przez [paper] zostala wyliczona  jako 'optymalna' i dajaca najlepsze rezultaty.

W przypadku gdy podzialy sa nierowne to miast glebokosc rosnac logarytmicznie rosnie linearnie. Najgorszy scenariusz to possortowania tablica i ilosc podzialow rowna n

Depth of quicksort in ideals scenario is approx log2n


Jak to wyglada w kodzie?

https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L155

```
    static void IntroSort(KIND keys[], KIND items[], int lo, int hi, int depthLimit)
    {
        while (hi > lo)
        {
            int partitionSize = hi - lo + 1;
            if(partitionSize <= introsortSizeThreshold)
            {
                if (partitionSize == 1)
                {
                    return;
                }
                if (partitionSize == 2)
                {
                    SwapIfGreaterWithItems(keys, items, lo, hi);
                    return;
                }
                if (partitionSize == 3)
                {
                    SwapIfGreaterWithItems(keys, items, lo, hi-1);
                    SwapIfGreaterWithItems(keys, items, lo, hi);
                    SwapIfGreaterWithItems(keys, items, hi-1, hi);
                    return;
                }
                
                InsertionSort(keys, items, lo, hi);
                return;
            }

            if (depthLimit == 0)
            {
                Heapsort(keys, items, lo, hi);
                return;
            }
            depthLimit--;

            int p = PickPivotAndPartition(keys, items, lo, hi);
            IntroSort(keys, items, p + 1, hi, depthLimit);
            hi = p - 1;            
        }
        return;
    }
```

Funkcja jest jeddnym duzym whilem ktorego waarunkiem stopu jest roznica hi > lo. Hi to nic innego jak nasz poprzedni 'right' index a lo 'left' index. Nie dzieje sie tutaj nic innego jak iterowanie po tablicy in place. W calym tym algorytmie ciezko znalezc quick sort. 

IntroSort Paper David R. Musser
http://liacs.leidenuniv.nl/~stefanovtp/courses/StudentenSeminarium/Papers/CO/ISSA.pdf

Zanim to jednak omowmy przedstawny podstawowy zarys algorytmu.

 jesli wielkosc partycji <3 
   - zrob swapa
 jestli wielkosc partycjji <16
   - uzyj insertionsorta
 jessli depthlimit == 0
   - uzyj heapsorta
 w innym przypadku wybierz nowy pivot i partycje i wywolal funkcje jeszce raz zmniejszaac limit zagniezdzenia.

```
   inline static void SwapIfGreaterWithItems(KIND keys[], KIND items[], int a, int b) {
        if (a != b) {
            if (keys[a] > keys[b]) {
                KIND key = keys[a];
                keys[a] = keys[b];
                keys[b] = key;
                if (items != NULL) {
                    KIND item = items[a];
                    items[a] = items[b];
                    items[b] = item;
                }
            }
        }
    }
}
```
Swapowanie jest dosyc prosta funkcja. Po prostu sortuje waaartosci jesli jedna jest wieksza od drugiej. Jest to standardowa operacja wykonywana w quicksorcie. Co tutaj jest ciekawe to wywolywanie tez etej funkcji w przypadku partycji 3 elementowej. Z pewnoscia jest to optymalizacja ktora ma za zadanie zmniejszych ilosc wywolan glownego algorytmu.

<sprawdzic jaka zmiane empiryczna to tworzy gdyby usunac partitionSize == 3 albo dodac partitionSize == 4, 5, 6, 7, 8, 9, 10>

TAka operacja ma czas uruchomienia O(1) i w calym rozrachunku nie ma zadnego znaczenia.

< czemu introsortSizeThreshold jest 16 a nie inna liczba? jak zostala ona wybrana? >

Przy depth 0 
Odaplany jest heap sort - nie bedziemy w tym artykule omawiam heap sorta omowimy tylko jego cechy i przedyskutujemy dlaczego warto przy zagniezdzeniu takim a nie innym wykonac heapsorta.

Wiecej o heapsorcie - <link do jakiegos algorytmu>

Quick sort

```
            int p = PickPivotAndPartition(keys, items, lo, hi);
            IntroSort(keys, items, p + 1, hi, depthLimit);
            hi = p - 1;            
```

https://en.wikipedia.org/wiki/Quicksort

lo + (hi - lo)/2 is to avoid integer overflow

It uses median of 3 algorithm for pivot 
https://stackoverflow.com/questions/7559608/median-of-three-values-strategy

teen fragment jest tak naprawde quick sortem. Mamy wybranie pivota pomiedzy lo i hi i wywolanie IntroSorta na innym segmencie tablicy. W tym przypadku od pivota do prawa.


[     p      ]
[p      ]



Why picking pivot is soo important?

Dlaczego wybor pivota nie mozna wyliczac po prostu? idealnie? a trzeba estymowac?

Chodzi o koszt wyliczenia idealnego pivota jest on za duzy i tak naprawde idealny pivot nie daje taakich benefitow -> pokazac przyklady.

- Qucik sort would be without weaknessess if its worst case scenario when it can hit O(n^2)
- when does this worst case happens? when the divide and conquer is not equal and created smaller and bigger arrays -> worst worst case is when the sub arrays are single index based. 
< explanation here >
Mostly worst case is -> sorted array

Pivot picking strategy is used to manage risk of hitting worst case - there is a price of course.
Another strategy is to change the algorithm to use different one and limit the risk of O(n^2).

- the runtime of quick sort is heavilly dependent on correct array splitting. If splitting results in one big array and one small array O can become O(n^2).
The more equal the splitting the close the O comes to O(nlogn)

The more balanced the split the less recursive calls required -> show example

- why changing to insertion sort
for small relatively small splits use insertion sorts that performs in linear time for almost ordered sub arrays

- pivot strategies
All this techniques want to avoid worst case scenario as much as possible

-> left-most | right-most -> susceptibility to O(N^2) when sorted array
-> random -> sligthly better, reduces risk of O(n^2) -> but random generation costly and unpredictable
-> Mo3 -> first | (first + last) / 2 | last -> better than random but still not perfect (example on when it will still hit worst case) ( decreases worst case, increases average case)
-> Mo5 -> Mo3 + 2 random values -> better than Mo3 but random generation is costly
-> Mo5 -> without random first | (first + last / 4) | (first + last /2 ) | (3 *(first + last ) / 4 ) | last -> but takes time to pick 5 items
-> Mo7, Mo9 -> increases more balanced split - but the time to pick a pivot increases -> it is interesting challenge to find a balance
-> there is albo Dynamic Pivot -> takes right-most then does a scan O(n) and and counts less or bigger items than pivot - then uses this values to generate next pivots increasing chance of balanced split 
(https://www.researchgate.net/publication/235351491_Enhancing_QuickSort_Algorithm_using_a_Dynamic_Pivot_Selection_Technique)
-> problem with this technique is Extreme - values in the array

In  his paper ISSA.pdf

http://liacs.leidenuniv.nl/~stefanovtp/courses/StudentenSeminarium/Papers/CO/ISSA.pdf

You can find MEdiaan 3 killer so it is still possible to change median algorithms to be quadratic

-> What would happen if I would implement Dynamic Pivot Selection Technique in QuickSort in .NET? or GO?

Why it is always first and last? 
- it is due to a plan to figth with ordered or almost ordered arrays
-> can i show some graph with probability of hitting worst case, average case? calculated in python with different techniques?


Dual Pivot QuickSort Algorithm
http://codeblab.com/wp-content/uploads/2009/09/DualPivotQuicksort.pdf
https://www.geeksforgeeks.org/dual-pivot-quicksort/
https://stackoverflow.com/questions/20917617/whats-the-difference-of-dual-pivot-quick-sort-and-quick-sort

Jaava python vs .NET?
https://stackoverflow.com/questions/7770230/comparison-between-timsort-and-quicksort
https://en.wikipedia.org/wiki/Timsort

What are the internals of quicksort in Go?
https://golang.org/src/sort/sort.go

Different pivot -> https://www.johndcook.com/blog/2009/06/23/tukey-median-ninther/

Javascsript -
https://stackoverflow.com/questions/6640347/javascript-native-sort-method-code
Ecma script doesnt no standardize it

Chrome - v8
https://github.com/v8/v8/blob/master/src/js/array.js

Source:
https://bytes.com/topic/c-sharp/answers/817547-what-sz-array#post3257964
https://stackoverflow.com/questions/21818889/why-is-my-c-sharp-quicksort-implementation-significantly-slower-than-listt-sor
https://en.wikipedia.org/wiki/Introsort
https://rosettacode.org/wiki/Sorting_algorithms/Quicksort#C.23
https://referencesource.microsoft.com/#mscorlib/system/array.cs
https://stackoverflow.com/questions/1863153/why-unsigned-int-0xffffffff-is-equal-to-int-1
https://en.wikipedia.org/wiki/Two%27s_complement
http://www.cs.utexas.edu/users/EWD/transcriptions/EWD08xx/EWD831.html
https://softwareengineering.stackexchange.com/questions/110804/why-are-zero-based-arrays-the-norm
http://me.dt.in.th/page/Quicksort/
https://en.wikipedia.org/wiki/Introsort
https://www.geeksforgeeks.org/external-sorting/
https://www.geeksforgeeks.org/know-your-sorting-algorithm-set-2-introsort-cs-sorting-weapon/
https://medium.com/basecs/pivoting-to-understand-quicksort-part-1-75178dfb9313
https://medium.com/basecs/pivoting-to-understand-quicksort-part-2-30161aefe1d3
https://www.cs.auckland.ac.nz/software/AlgAnim/qsort_perf.html
https://www.cs.auckland.ac.nz/software/AlgAnim/qsort3.html

