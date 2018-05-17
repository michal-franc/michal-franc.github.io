---
layout: draft
title: Everything you wanted to know about Sorting in .NET
date: 2018-04-01 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [algorithms]
permalink: /blog/net-sorting-intro/
---

TODO:   

- Matt Warren consult with this blog post
- coreclr - docs ask for addng this post to the list
- create new articles type of page - which contains one big article with introduction and Chapters sections + contents + link to all the single pages
- add new jekyll plugin for TOC and series support (If github doesnt support it then use generation on your machine and just push statis website)
- add drafts suport
- there will be three types of posts - blog post - article - quick note
  - article is a serie of posts
  - quick note is just smaller blog post that i do spend only 30 min weekly to work on
  - https://bsn.io/2017/01/public-drafts-with-a-github-pages-blog
- Rename the series to - `Journey to the heart of .NET sorting` 

Hey welcome to my new serie about `Sorting` and `.NET Internals`. It has started as a simple question `Hey, I wonder how Quicksort is implemented in .NET?`. I was planning to release one blog post, wrap up quickly and jump to another idea. But when I started the journey I just couldn't stop asking question `why` and wanted to learn more. You cant think of this serie as a `journey log`. Me going trhough the code startign at `List.Sort()` function to `IntroSort` algorithm, documenting my observations and finding answers to the questions along the way.

To make it more manageable, I divided this work to two chapters:  

- Chapter I - .NET internals - from `List<T>.Sort()` to `TrySZSort`  

A journey through the code. Starting with `List<T>.Sort()` and ending on `assembly` code level explaining how functions communicate using `CPU` instructions. How `CLR` can handle `Exceptions` or `Garbage Collection`  from the unmanaged code - and many more. If you are interested in how `.NET` and `CLR` work internaly or what `FCall`, `QCall`, `P/Invoke`, `marshalling` is. This is must have chapter for you. If you are not interested in `.NET internals`, you can jump straight ahead to `Chapter II` but oh boy you might miss a lot of `fun` (It depends how  you define `fun`, I for sure had fun exploring all the topics in there).  

- Chapter II - Sorting in the real world - IntroSort


### Chapter I - .NET Internals:    

* [`System.Collections.Generic.List<T>.Sort()`][part1]
  * `_version++` - keeping enumaration save from unwanted changes
* [`Array.Sort<T>()`][part2]
  * `[System.Security.SecuritySafeCritical]` and `[ReliabilityContract]`
  * `Array.CreateInstance` vs `new[]`
  * Visual Basic and the world of non one based arrays
* [`TrySZSort`][part3]
  * why part of the sorting is in unmanaged code?
  * P/Invoke vs InternallCall
  * Calling CLR from managed code
  * FCall and QCall
* [`How functions communicate on the assemlby level`][part4]
  * calling conventions
  * fastcall vs cdecl
* [`FCall and __fastcall`][part5]
  * stubs and frames
  * `garbage collection` and `exception` in `native CLR code`
* [`FCALL_CONTRACT`][part6]
  * `NanPrePass`
  * Why `0xffffffff` = -1

### Chapter II - Sorting in the real world - IntoSort:  

- Basics Of Quicksort
- Overview of search algorithms - strength and weaknesses
- IntroSort
- CLR implementation

[part1]:/blog/net-sorting-part1/
[part2]:/blog/net-sorting-part2/
[part3]:/blog/net-sorting-part3/
[part4]:/blog/net-sorting-part4/
[part5]:/blog/net-sorting-part5/
[part6]:/blog/net-sorting-part6/
[part7]:/blog/net-sorting-part7/


You might ask question. Why do you need to know sorting algorithms at all. There are frameworks that have tools to not be bothered about that at all. I call .Sort() function, magic happens time to go home. There is a lot of truth in that but ... 

* Frameworks are great for `generic` majority of problems
* There are however problems that might require sorting algorithms knoweledge
* Even with frameworks support, it is good to know what stable nad unstable sorting algorithm is, it can influence your design
* Sorting algorithms are a great introduction to the world of engineering `trade-offs`
* This is also an example of multiple `tools` doing same thing in different ways
* It is a good way to learn about `divide and conquer`, `asympthotic complexity` and `recurssion`

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

#### From Quick Sort To IntroSort

First of all, as it was mentioned before. .NET uses [IntroSort][intro-sort-wiki] algorithm. It is a enchanced [Quicksort][quick-sort-wiki]. Before we get there we need to discuss `QuickSort` a bit. 

[intro-sort-wiki]:https://en.wikipecia.org/wiki/Introsort
[quick-sort-wiki]:https://en.wikipedia.org/wiki/Quicksort

You might have implemented `QuickSort` on the university or other hobby projects. It was a standard algorithm in the past used in many frameworks. The basic idea is simple and uses `divide and conquer` to split `big` task into `smaller` tasks.  It is also great example of using recurrence. You might have to one day implement `Quicksort on some interview`. 

{% highlight csharp %}
function quicksort(array)
    less, equal, greater := three empty arrays
    if length(array) > 1  
        pivot := select any element of array

        #O(n) operation of moving items on the left or right side of pivot
        for each x in array
            if x < pivot then add x to less
            if x = pivot then add x to equal
            if x > pivot then add x to greater

        quicksort(less)
        quicksort(greater)
        array := concatenate(less, equal, greater)
{% endhighlight %}

This is a very simplified pseudo code of the `easiest` implementaion (using allocated arrays)  of `QuickSort`. The average sorting case is handled by `O(nlogn)` but `Quicksort` worst case scenario (when array is already sorted) will take `O(n^2)`. A lot depends on the pivot selection strategy - as it can potentialy identify already sorted array and adjust worst case scenario to the average one ( we will talk about it later).

{% highlight python %}
quicksort(array):
     if len(array) <= 1:
         return array
     else:
         pivot = random.choice(array)
         less = [x for x in array if x < pivot]
         equal = [x for x in array if x == pivot]
         greater = [x for x in array if x > pivot]
         return quicksort(less) + equal + quicksort(greater))
{% endhighlight %}

This is a simple code in python. Pivot selection strategy is `random`. This is good enough strategy. This example uses array allocation that can `be` deadly and can lead to `StackOverflow`. There are other implementations that avoid using `arrays` and operate on the same `array` using `indexes` to generate `sub arrays`.

{% highlight python %}
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

{% endhighlight %}

I had to show this code as later on in the .NET - IntroSort implementation there is also `right` and `left` being used with manipulation of `one` array.

So what is `IntroSort`? It starts with `QuickSort` then switches to `HeapSort`. Why is it done like that? In a quick summary - this makes `QuickSort` average and worst case scenarios to be `O(nlogn)`. `IntroSort` takes the pros of `QuickSort` adn removes the `cons`. We will discuss how `HeapSort` makes it possible that worst case complexity of O(n^2) can be averted.

{% highlight python %}
procedure sort(array):
    let maxdepth = ⌊log(length(A))⌋ × 2
    introsort(array, maxdepth)

procedure introsort(array, maxdepth):
    n ← length(array)
    if n ≤ 1:
        return 
    else if maxdepth = 0:
        heapsort(array)
    else:
        p ← partition(array) 
        introsort(array[0:p], maxdepth - 1)
        introsort(array[p+1:n], maxdepth - 1)
{% endhighlight %}

As you can see here. There is a special parameter introduced - maxdepth. It is used to find when to start using `HeapSort`.


Wiec co jest nie tak z QuickSortem? PRoblemem jest tutaj zachowanie w najgorszym przypadku gdy tablica na ktorej operujemy jest juz calkowicie badz w wiekszosci posrotowania. Wtedy mamy czas zlozonoscy na poziomie O(n^2). Badania empiryczzne wykazaly ze pomimo tej cechy Quick Sort i tak dziala szybciej niz inne znane nam algorytmu stortuajce. Nie zmienia to oczywiscie tego ze mozna dalej ten algorytm usprawniac i mozliwe ze da sie pozbyc tego O(n^2). Do akcji wkracza tutaj heapsort ktory ma zarowno sredni jak i najmniej korzysty scenariusz O(nlogn). Spostrzegawcza osoba moglaby teraz powiedizec, hallo halloo, skoro HeapSort ma takie cechy ktore sa lepsze niz Quicksort to dlaczego nie uzyc odrazu HeapSorta. Po co bawic sie z QuickSortem. Ano wlasnie z powodu tego ze analiza O jest wielka abstrakcja ktora moze ukryc 'realny swiat'. Intuicja podpowiadaa nam ze HeapSort powinien byc lepszy a jednak okazuje sie ze w swiecie realnych danych to QuickSort okazuje sie najlepszy, ma tylko pewnie minusy ktore statystycznie nawet jak wystepuja to i tak powoduja ze algorytm ten dziala szzybciej niz inne (przy zalozeniu ze dane nie sa zawsze posorotwane wtedy to w zasadzie mozna uzyc Bubble Sort :D tlko po co sortowac posorotwane dane).

Mala dygresja - bardzo duzo w algorytmach sortuajcych zalezy od wejsciowych danych i tego jakie maja charakterystyki. Jezeli to reczywiscie jest pelny random dane to quick sort wypada najlepiej. JEzeli natomiast mozna znalezc w tych danych pewne cechy wspolne ktore np ukladaja sie w 'rozklad normalny' to wtedy algorytmy z rodziny 'bucket sort' (czemu) robia dobra robote. Istneiej tez cala rodzina problemow 'external sorting algorithms' tzn takich w ktorych dane nie mieszcza sie w pamieci i trzeba tez je dociagac. MErge Sort <tutaj dopisz ze on jest good external i dlaczego>  Tutaj tez pojawia sie kwestia tego jak te dane otrzymujemy i czy mamy ich calosc odrazu. Zalozmy np sytuacje w ktorej otrzymuje dane w paczkach (jakis stream). By te dane moc posorotwac quicksortem bedziemy potrzebowac zebrac caly strumien, poczekac na niego i dopiero wtedy odpalic quick sorta. Z pomoca moze nam przyjsc heap sort ktory pozwala odpalic sortowanie na pofrafmentowanych zbiorach danych ktore przychodza z czasem, nie potrzebujemy calego zbiory juz gotowego - wystarczy miec cokolwiek by zaczac. Jest tez kwestia czy algorytm jest stabilny czy nie ...

<dlaczego max depth to log2() * 2>
<dlaczego insertion sort -> https://rosettacode.org/wiki/Sorting_algorithms/Insertion_sort -> chyba chodzi o locality of data>a

Dlaczego przelaczac sie na heapsorta przez depth limit? Zachowanie QuickSorta O(n^2) wystepuje w momencie gdy algorytm tworzy duzo malycch podzialow poniewaz nie moze dobrac dobrze pivota przy posortowanej liscie.  PRzejscie na heapsorta likwiduje ten problem i do podzialu nei chodzi.   Jest to swego rodzaju wentyl bezpieczenstwa. FloorLog2 * 2 zapewnia przestrzen gdy podzialy sa nadal dobre i nie ma potrzeby przejsci an heapsorta bo pivot jest wybierany 'dobrze' < pokazac przyklad>   Naatomiast gdy jest prawdopodobienstwo ze cos dzieje sie nei tak i weszlismy w petrle O(n^2) algorytm zauwaza to i dostosowywuej sie przerywajac to zachowanie i operujac na innym algorytmie. 

Wartosc depth Limit nie moze byc za mala - bo bedzie to wywolywac heap sorta za czesto - nie moze tez byc za duza by spedzic za duzo czasu w Quadratic time sortowaniu. Wartosc FloorLotg 2 * 2 empirytcznie przez [paper] zostala wyliczona  jako 'optymalna' i dajaca najlepsze rezultaty.

W przypadku gdy podzialy sa nierowne to miast glebokosc rosnac logarytmicznie rosnie linearnie. Najgorszy scenariusz to possortowania tablica i ilosc podzialow rowna n

Depth of quicksort in ideals scenario is approx log2n


Jak to wyglada w kodzie?

{% highlight csharp %}
static void IntrospectiveSort(KIND keys[], KIND items[], int left, int right) {
    WRAPPER_NO_CONTRACT;

    // Make sure left != right in your own code.   

    _ASSERTE(keys != NULL && left < right);

    int length = right - left + 1;

    if (length < 2)
        return;

    IntroSort(keys, items, left, right, 2 * FloorLog2(length));
}
{% endhighlight %}

Mamy tu kolejne sprawdzenia parametrow wejsciowych. Sprawwdzenie  czy jest w ogole sens cokolwiek sprawdzac, jezeli right - left + 1 = <2 to jest to albo 1 albo 0 elementowa tablica wiec nie ma sensu z nia nic robic.

NAstepnie mamy wywolanie algorytmu IntroSort. Tyle bylo mowione o QuickSorcie a tu prosze cos innego, IntroSort. Czemu tak?a

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

Dlaczego HeapSort a nie inny algorytm wiec?

Czy mozemy zamiast heaposorta na tym levelu uzyc insertion sorta albo merge sorta? Dlaczego HeapSort?

https://cs.stackexchange.com/questions/24446/why-does-introsort-use-heapsort-rather-than-mergesort

Heapsort's O(1)O(1) extra space requirement makes it a better choice to mergsort's O(n)O(n) where for a contrived array that nn could still be large.

The reason heapsort isn't used for the full sort is because it is slower than quicksort (due in part to the hidden constants in the big O expression and in part to the cache behavior)


Dlaczego Insertion Sort skoro jest juz HeapSort?

To stop generating subproblems after certain treshdold that is small enough to use Insertion Sort (Locality of data?)  we swithc to InsertionSort as it is more optimal. 

Although it is one of the elementary sorting algorithms with O(n2) worst-case time, insertion sort is the algorithm of choice either when the data is nearly sorted (because it is adaptive) or when the problem size is small (because it has low overhead).  For these reasons, and because it is also stable, insertion sort is often used as the recursive base case (when the problem size is small) for higher overhead divide-and-conquer sorting algorithms, such as merge sort or quick sort.

+1. Insertion sort's inner loop just happens to be a good fit for modern CPUs and caches -- it's a very tight loop that accesses memory in increasing order only. 

Insertion sort is also good because it's useful in online situation, when you get one element at a time. 

https://stackoverflow.com/questions/736920/is-there-ever-a-good-reason-to-use-insertion-sort

Insertion sort is faster for small n because Quick Sort has extra overhead from the recursive function calls. Insertion sort is also more stable than Quick sort and requires less memory.

For the curious, the O(N^2) one will be faster than the O(N Log N) one until about N=9000 entries or so. 

However, the constant factor and overhead are still important. If your application ensures that N never gets very large, the asymptotic behavior of O(N^2) vs. O(N log N) doesn't come into play.
Insertion sort is simple and, for small lists, it is generally faster than a comparably implemented quicksort or mergesort. That is why a practical sort implementation will generally fall back on something like insertion sort for the "base case", instead of recursing all the way down to single elements.

https://algs4.cs.princeton.edu/23quicksort/

Cutoff to insertion sort. As with mergesort, it pays to switch to insertion sort for tiny arrays. The optimum value of the cutoff is system-dependent, but any value between 5 and 15 is likely to work well in most situations.

https://cs.stackexchange.com/questions/37956/why-is-the-optimal-cut-off-for-switching-from-quicksort-to-insertion-sort-machin

Because the actual running time (in seconds) of real code on a real computer depends on how fast that computer runs the instructions and how fast it retrieves the relevant data from memory, how well it caches it and so on. Insertion sort and quicksort use different instructions and hava different memory access patterns. So the running time of quicksort versus insertion sort for any particular dataset on any particular system will depend both on the instructions used to implement those two sorting routines and the memory access patterns of the data. Given the different mixes of instructions, it's perfectly possible that insertion sort is faster for lists of up to ten items on one system, but only for lists up to six items on some other system.

https://www.quora.com/Among-quick-sort-insertion-sort-and-heap-sort-which-is-the-best-to-sort-data-and-why






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

