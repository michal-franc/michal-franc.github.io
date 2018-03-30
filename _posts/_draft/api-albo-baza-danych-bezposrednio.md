dwa mikroserwisy, jeden do pobierania dancyh o uzytkowniku drugi do zwracania kart uzytkownika. czy ten drugi moze z bazy pobrac imie uzytkownika czy powinien przez mikroserwis uzytkownikow sie odwolac? // @francmichal @liveweird @Biegal

Rozpatrzmy scenariusz - baza danych jako punkt integracji miedzy microserwisami
+ prostota
+ jeden serwis mniej do utrzymania
- baza danych jako miejsce gdzie zdefiniowane sa kontrakty -> ograniczanie mozliwosci rozwoju zmieniana bazki
- baza danych (wycieka) tzn klient ja wolajacy musi wiedziec jaka to baza i przejmowac sie jak z nia sie polaczyc
- wyciekniecie bazy danych moze powodowac to ze ktos w przyszlosci mimo tego ze mial tylko 'odczytywac stan' zacznie generowac 'zmiany stanu'
- nawet jezeli readerowi powiedzielismy ze moze tylko czytac te jedna konkretna tabele - widok etc to nic nie stoi na przeszkodzie czytania innej tabeli. Jest to problem w duzych systemach monolitycznych w ktorych tracisz kontrole nad swoimi kontraktami i tego jak definiujesz swoje 'wyjscie'. Mam dostep do zrodla wiec co mnie obchodzi jak ty postrzegasz stan zewnetrzny - sam sobie zrobie swoj zewnetrzny stan.

Rozpatrzmy scenariusz - baza danych szczegol implementacji, dane dostepne przez api
+ baza danych ukryta z punktu widzenia klienta nie interesuje mnie to skad te dane pochodza, moga byc z cachu, z pliku 
+ kontrakt definiowany przez serwis i kontrolowany na tym etapie
+ wieksza kontrola nad tym co rozumiem przez zewnetrzny stan. Np zalozmy ze nasz bounded context wewnetrznie zmienia dane co 1s ale dla swiata zewnetrznego wypluwamy tylko dane ktora zmienily sie raz na dzien bo nie ma innych wymagan. Generujemy raz dziennie read projekcie do jakiegos cachu i wystawiamy API ktore dostarcza tego cachu. Klienta nie interesuje jak to robic, jak obslugiwac cache, jak generowac dane raz dziennie tylko uderza do API i ma dane.
- wieksza zloznosc
- translacka SQL-a do API traci wiele atrybutow SQL-a i mozliwosci bazy danych - tak jest w przypadku tworzenia kazdej abstrakcji - slynny problem - DBContext jest juz repozytorium czy powinienem tworzyc swoje wlasnie IRepository?

Pytanie teraz ktore plusy sa wazniejsze dla ciebie a ktore minusy akceptujesz, ignorujesz albo skompensujesz.

Osobiscie jestem fanem baza danych jako szczegol implementacyjny nie mikro-serwisu ale bounded contextu. Bounded context moze miec wiele mikroserwisow ktore juz moga albo nie musza korzystac z tej samej bazy danych. Zewnetrzne bounded contexty komunikuja sie albo przez API ktore ja kontroluje albo podczepiaja sie do eventow, ktore generuje i same na bazie eventow generuja projekcie zewnetrzenego swiata dopasowana do swoich potrzeb

//cc @7d1
