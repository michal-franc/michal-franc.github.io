Jadro Ciemnosci - Quick Sort in .NEt

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

 Napisanie wlasnych implementacji to tylko pierwszy krok do zrozuminia algorytmu. By wkrecic sie jeszcze bardziej postanowilem sprawdzic jak to jest w .NETie. Jak wyglada implementacja QuickSorta. Z tego co pamietam na tym algorytmie opieral sie .NET. Okazalo sie to fajnym zrodlem informacji i wiedzy. Ten post jest w zasadzie o tym. Analizie algorytmu QuickSort w .NET.

----------------------------------------

Postanowilem wystartowac od Listy. Podstawowej kolekcji ktora ma metode .Sort(). Metoda ta ma dwie opcje albo uzyjemy domyslnego IComparer albo dostarczymy swojego. Zaczniemy od wersji domyslnej bo jak sie okazuje te dwie wersje nie roznia sie w zasadzie kodem ale roznia sie juz miejscami gzdie sa wolane.

```
https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726f
public void Sort()
{
    Sort(0, Count, null);
}
```
Poczatek jest prosty. Mamy metode bezparametrowa ktora wola inna metode przekazuaj parametry listy jak Count i startowy index 0. Wynika z tego ze mamy tez metode ktora pozwala nam sortowac tylko sekcje danej listy.

This ultimately leads to this piece of code
```
Array.Sort<T>(_items, index, count, comparer);
_version++;
```

Przy sorotwaniu calej listy parametry:
- index -> 0 - zaczynamy od poczatku
- Count -> list count -> chcemy przesortowac cala liste
- comparer -> null -> uzywamy domyslnego
_items -> T[] 'hidden' representation of our List 

```
static readonly T[]  _emptyArray = new T[0];        
    
// Constructs a List. The list is initially empty and has a capacity
// of zero. Upon adding the first element to the list the capacity is
// increased to 16, and then increased in multiples of two as required.
public List() {
    _items = _emptyArray;
}
```

<pokazac statystyki z alokacja i bez alookacji, jak wygenerujemy milion typow>
<czy mozna to jakos zabusowac?>

Tutaj trafilem na pierwsza ciekawostke. Tworzenie pustej listy tak naprawde nie alokuje nowej tablicy ale przypisuje nasz wewnetrzny stan Listy, _items. Do istniejacecj statycznej pustej tablicy. Tablica ta jest zaznaczona jako readonly by jakis smialek przez przypadek jej nie nadpisal I spowodowal ze kazda pusta lista bedzie miala jakis stan poczatkowy. Ten zabieg pozwala zaoszczedzic jedna alokacje*. Gwiazdka jest tutaj spowodowana tym ze jest to typ generyczny wiec ta statyczna tablica bedize oszcedzala jeedna alokacje per typ. Gdybysmy stworzyli pusta liste dla milionow roznych typow to zaalokujemy milion pustych tablic.

```
_version++
```

<rozwinac  pokaaac jak mozna popsuc kod refleksja, pokazac przypadki jak to popsuje sie w forze zwyklym>

Kolejna ciekawostka jest ten ciekawy wpis _version++. A coz to za ustrojstwo? Pierwsza sprawa - jest to typ integer i oczywiscie jest inkrementacja. Operacja ta wykonywania jest przy kazdej zmianie 'stanu' listy. Sort, Insert, Remove itd. Pojawia sie tutaj odrazu mysl ze musi to byc uzywane do sprawdzenia czy stan sie zmienil. 

Kiedy potrzebujemy sprawdzic takie cos? Zapewne spotkaliscie sie z wyjatkiem InvalidOperationException - 'Collection was modified; enumeration operation may not execute.'. Ta wartosc jest wlasnie wykorzystywana do sprawdzenia czy w momencie gdy enumerujemy po kolekcji ktos inny nie zmodyfikowal jej. Jest to mechanizm obrony ktory ma na m pomoc nie pokaleczyc sie kodem - w aplikacjach wielowaatkowych ale i nie tylko. Domyslnie enumerujac po kolekcji oczekujemy ze ma ona staly stan i jest to tylko operacja read only - zmiany tego stanu najczesciej wynikaja z blednego kodu.

W przypadkach gdy rzeczywiscie potrzebujemy operowac na kolekcji ktora sie czesto zmienia - wtedy musimy celowo zaakceptowac ze nasza aplikacja bedzie czasami operowala na 'dirty readach'. W takich przypadkach przydatne sa kolekcje 'Concurrent' pozwalajace pisac takie aplikacji - nie musimy wtedy bawic sie wlasnorecznie sekcjami krytynczymi i lockami. Warto jednak pamietac tutaj ze to przypadek szczegolny wymagjacy wiecej przemyslen o tym jak aplikacja zachowuje sie w sytuacji gdy mamy np wielu zapisujacych i odczytujacych.

Mozna tutaj posluzyc sie przykladem petli for ktora sluzy do wyluskania wartosci z tablicy i operowania na ich wartosciach. Petla for nie rzuci nam tego wyjatku w momencie gdy jednoczescie odczytujac zmienimy kolekcje. Tworzy to jednak nie okreslona sytuacje. Co jesli zmienilismy kolekcje tak ze nowy element pojawil sie na poczaatku tej kolekcji a my jestesmy w srodku. Przy zalozeniu zejestesmy na 5 elemencie przejdzie on na miejsce 6 w tablicy i kolejna iteracja mzieni wartosc naszego indexu na 6 i tak naprawde przetworzymy te sama wartosc 2 razy w tablicy. Powoduje to 'ukryte' problemy ktorymi mozna sie pokaleczyc. Dlatego foreach i enumeratory kopiuja wartosc version i badaja czy nie doszlo czasem do zmian. Jest to pomoc skierowana do nas developerow.

_version jest uzywane w operacjacch takich jak:
- ForEAch -> https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,0e5a9cf0a310b9e5
- Get Enumerator -> https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,5d3accf5b217bdbf
- Enumerator trzyma version jako swoj wewnetrzny stan -> https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,d3661cf752ff3f44

To byla calkiem spora dygresja ale badz co badz wartosciowa :)

Wrocmy do QuickSorta - metoda do metody i jak po sznurku trafiamy na Array.Sort. 
Tutaj juz przestajemy operowac na na Listech ale zaczzynamy operowac na TAblicy Array. 

https://referencesource.microsoft.com/#mscorlib/system/array.cs,54496ee33e3b155a

```
[ReliabilityContract(Consistency.MayCorruptInstance, Cer.MayFail)]
public static void Sort(Array array, int index, int length, IComparer comparer) {
    Sort(array, null, index, length, comparer);
}
```

Parametry:
- Array -> _items z naszej listy
- index -> 0 element poczatkowy
- length -> Count listy poniewaz sortujemy cala liste
- comparer -> Null -> bedziemy uzywac domyslnego

Pomijajac assercje dochodzimy do momentu w ktorym zaczynamy prawdziwa zabawe z sortowaniem.

```
if (length > 1) {
    if (comparer == Comparer.Default || comparer == null) {
        bool r = TrySZSort(keys, items, index, index + length - 1);
        if (r)
            return;
    }

    Object[] objKeys = keys as Object[];
    Object[] objItems = null;
    if (objKeys != null)
        objItems = items as Object[];
    if (objKeys != null && (items==null || objItems != null)) {
        SorterObjectArray sorter = new SorterObjectArray(objKeys, objItems, comparer);
        sorter.Sort(index, length);
    }
    else {
        SorterGenericArray sorter = new SorterGenericArray(keys, items, comparer);
        sorter.Sort(index, length);
    }
```

Jest troche tego kodu. 

Pierwsza sprawa - sprawdzamy czy jest w ogole sens srotowac liste. Jezeli ma dlugosc mniejsza niz 1 to nie ma sensus alokowac nie potrzebnych zasobow i po prostu zwrocic liste - jest juz posortowana.

Pierwszy blok jest z uzyciem domyslnego Comparera i tutaj juz kolejna niespodzianka... czym jest TrySZSort? Strasznie dziwna nazwa, nie pasujaca do konwencji .NETowych. Wrocimy do tego za doslownie pare zdan.

Ciekawe ze gdy TrySZSort nie powiedzie sie - co jest sygnalizowane zwroceniem wartosci false - To jest podejmowania proba sortowania tablicy dalsza metoda oparta juz nie o domyslny comparer.

Dalsza czesc to obslugiwanie sytuacji gdy podeslemy wlasnego IComparera - to juz omowimy pozniej. Wrocmy do TrySZSort bo zapewne juz nie mozecie usiedziec spokojnie, zzera was ciekawosc i szukacie co to jest - spokojnie lecimy dalej. 

TrySZSort jest zewnetrzna natywna funkcja ktora pod spodem posiada impplementacje sortowania zoptymalizowana do kazdego primitywnego typu. Ehh ok mysle ze rozjasni sie to jak wejdziemy glebiej w te funkcje. Co ciekawe dostarczenie swojego ICompareraa powoduje ze juz nie trafimy do tej funkcji ale bedziemy operowac na kodzie CLR-a - C# - co bedzie 'wolniejsze'.

Na razie zastanowmy sie skad sie wziela ta nazwa. Mamy dwa czlony 'SZ' i 'Sort'. Sort nie trzeba tlumaczyc - czym wiec jest SZ. Okazuje sie ze to skrocona nazwa okreslajaca SZ arrays (Single-dimensioned Zero-based arrays' -> SZ).

To zaczelo rodzic u mnie pytania czym jest Zero-based array. Single dimensioned wiadomo chodzi o tablice jednowymiarowa. Zero-based array oznacza ze tablica zaczyna sie od indexu - 0. Ok ... ale przeciez to domysslna opcja? Ktora jest juz wszedzie standardem - tablice zaczynaja sie od 0 i koncza na dlugosc - 1. Nikt tego juz nie kwestionuje.

Okazuje sie ze nazwa ta zawiera w sobie dluga przeszlosc programistyczna i pamieta czasy jezyka Visual Basic ktory pozwalal tworzyc tablice zaczynajace sie od przez nas wybranego indexu. Brzmi troche jak aabstrakcja. 

Troche o historii Visual Basica tutaj [http://www.panopticoncentral.net/2004/03/17/non-zero-lower-bounded-arrays-the-other-side-of-the-coin/]
tl;dr; do VB .NET 2002 - programisci VB mogli dowolnie definiowac inde poczatkowy swoich tablic. W przeciwienstwie do jezykow wywodzacych sie z rodziny C. <Rozwinac TL;DR; na bazie bog posta?>

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

Then there is a switch statement that pick up correct IntrospecriveSort implementaiton bassed on Type. Its cpp so probably using templates generted per type (more powerfull generics)?

https://docs.microsoft.com/en-us/dotnet/framework/unmanaged-api/metadata/corelementtype-enumeration
Types enum defined here.

Switch statement covers unsigned and signed integers.

Logic is different for Floating points arrays as there is a step to move all the NaN's values to the front of the Array + moving left index to start on the 'real' values. This is a optimization technique? as NaN's you cant check these.

Then  there is a check for sscenario - what if whole array was of NAN's and left == right index so actually we dont have anything to sort.

And we can Finally get to the 'algorithm that is surprisingly called Introspective Sort. IF you google that  https://en.wikipedia.org/wiki/Introsort
Is a hybrid sorting algorithm that switches from quick sort to heapsort on 'specified' recursion level' this is a technique to make QuickSort wors-case performance O(n^2) (in case of sorted array and pivot point in not the best place and change to heap sort) 

Why is changing to heap sort making worst case better?

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

