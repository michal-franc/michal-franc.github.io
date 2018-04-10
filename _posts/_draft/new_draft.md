Everything you wanted to know about Sorting implementation in .NET

TL;DR; To get you interested this post is not only about Sorting

---------------------------- Wprowadzenie -----------------------------

Mozna zadac sobie pytanie. Po co zastanawiac sie jak dziala sortowanie w moim wybranym frameworku. Przeciez po to uzywam framework by nie musiec sie tym przejmowac. Wywoluje funkcje sortujaca i wszytko sie automagicznie dzieje - wartosci sa posortowaie i po sprawie.

W takim podejsciu jest wiele racji i nie jest ono zle. Framework to narzedzie do rozwiazywania naszych problemow biznesowych ktore w wiekszosci przypadkow sa wwanziejsze niz rozwazania nad tym jak dzialaja dokladnie algorytmy sortujace. Moj szef baardziej bedzie zadowolony jak dowioze nowy ficzer na produkcje zamiast ekscytujacego opowiaadania o tym ze .NET uzywa algorytmu IntroSort ktory dziala tak i tak. Wiedza ta tez nie zaimponuje moim znajomym.

Po co wiec inwestowac czas I budowac takie powiazania w sieci Neuronowej. Po pierwsze czytajac ten post dostajesz juz gotowa wydystylowana wersje i wiedze. Wiec nie musisz spedzac tyle czasu co ja (autor) na przeszukiwaniu i googlowaniu internetow oraz czytaniu White Paperow.

Po drugie drugie - Algorytmy sortujace i to jak sa skontsutrowane oraz jakie 'tradeoffs' sie w nich podejmuje jest bardzo ciekawe i wbrew pozorom moze sie przydac w przyszlej pracy. Na pewno przyda sie w pracy w ktorej wychodzimy poza framework i zderzamy sie z problemami dla ktorych framework nie jest wystarczajacy. 

<przyklad takich problemow? -> np sortowanie duzych ilosci danych albo sortowanie danych external, albo ficzer wymagajacy sortowania stabilnego>

Po trzecie - Na poziomie tak niskiego kodu jak sczegoly implementacyjne algorytmow sortujacych - sa to lata badan naukowcow - jest tam tona wiedzy ktora moze sie przydac w innych systemach. Czytajac o algorytmach sortuajcych mozna czerpac z tej wiedzy.

Po czwarte, i ostatnie - jako Architekt-Inzynier na codzien w pracu musze lawirowac w niedoskonalych rozwiazaniach przy ktorych ciagle musze podejmowac decyzje 'tradeoff' - te decyzje czessto sa saa suma mniejszych calosci - i rzeczy na niskim poziomie.

==  - Why is it usefull to have this kind of knowledge?
==  -- Where sorting is important?
==  -- What kind of things you need:
==  --- to know
==  --- could be usefull to know


1. We will go deep down to .NET and start getting deep inside the framework starting with List.Sort() operation discussing what is happening
  - Stack Trace road to the Algorithm
  - IEnumerable _version and state management
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
  - scala | clojure ?
  - C++? C?
  - django?
  - ta java od JetBrainsa
  - why developers didnt standarised sorting algorithm across the industry and platform

---- Gdzie sorotwanie jest wazne
---- Czego mozna sie z sortowania naauczyc zauwazyc
---- Real world vs theory

===================================================================================

'StackTrace'
- System.Collections.Generic.List<T>.Sort() (source) -> https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726f
 * _version++ - state change based version management 
- Array.Sort<T>() (source) -> https://referencesource.microsoft.com/#mscorlib/system/array.cs,54496ee33e3b155a
 * what happens if comparer is provided or not?
 * What is FEATURE_LEGACYNETCF and MangoArraySortHelper? why this thing (in the making)
- TrySZSort()
 * what is SZSort?
 * Visual Basic and the world of non one based arrays
- TrySZ and native function (source) -> https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.cpp#L268
 * FCIMPL4 - and internals of extern calling
 * ValidateObject? Asserte?
 * Why VB is Sad with this implementation
 * Which types are supported and how they are expressed and checked?
 * Why ddifferent implementation per type?
 * What is NanPrepass and Why NanPrepass for Float and Double?
 * What happens if TrySZSort 'fails'?
- IntrospectiveSort (source) -> https://github.com/dotnet/coreclr/blob/master/src/classlibnative/bcltype/arrayhelpers.h#L128
-> Chapter 3

- omowienie introsorta

Gdzie wiec zaczac? chba najprosciej bedzie po prostu od funkcji List.Sort(). Ktorej wywolanie powoduje ze w magiczny sposob elementy listy sa posortowane.

Postanowilem wystartowac od Listy. Podstawowej kolekcji ktora ma metode .Sort(). Metoda ta ma dwie opcje albo uzyjemy domyslnego IComparer albo dostarczymy swojego. Zaczniemy od wersji domyslnej bo jak sie okazuje te dwie wersje nie roznia sie w zasadzie kodem ale roznia sie juz miejscami gzdie sa wolane.

```
https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs,2f4bb2904365726f
public void Sort()
{
    Sort(0, Count, null);
}
```
Poczatek jest prosty. Mamy metode bezparametrowa ktora wola inna metode przekazuaj parametry listy jak Count i startowy index 0. Wynika z tego ze mamy tez metode ktora pozwala nam sortowac tylko sekcje danej listy. Czyli mozemy wywoal taka sytuacje w ktorej nie sortujemy calej listy a tylko jej czesc

< TUTAJ JESTESM !!!!!!!!!!!!!!!!!!!!!!!>

Przyklad wywolania z sortowaniem -> kod i wynik z LinqPada

This ultimately leads to this piece of code
```
Array.Sort<T>(_items, index, count, comparer);
_version++;
```

Parametry w tym przypadku.
- index -> 0 - zaczynamy od poczatku listy
- Count -> list count -> chcemy przesortowac cala liste
- comparer -> null -> uzywamy domyslnego comparera (bedzie o tym pozniej)
- _items -> T[] 'hidden' representation of our List 
```

_items to reprezentacja wewneetrzena listy. List<T> to tak naprawde opakowana tablica, ktorej wielkosc jest zwiekszaniaa w zaleznosci od potrzeb - dynamicznie.

Ciekawy jest zapis _version++? Do czego to sluzy?
```
_version++
```
<rozwinac  pokazac jak mozna popsuc kod refleksja, pokazac przypadki jak to popsuje sie w forze zwyklym>

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
