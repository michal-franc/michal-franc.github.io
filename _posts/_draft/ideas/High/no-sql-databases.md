chal Franc Ignacy Wilczyński wg mnie nie ma sensu czytac o SQL vs NoSql i zastosowaniach bez wchodzenia w tematy czym jest data store i jaki problem pozwala ci rozwiazac -> Dostep do durable nosnika ktory pozwala ci zapisac i odczytac dane - czyli operacje I/O. W przypadku aplikacji Crudowych ktore nie maja jakiejs ogromnej skali I/O nie powoduje problemow i mozna praktycznie pominac. W przypadku wiekszych aplikacji mozna pozostac przy modelu relacyjnym ktory sprawdza sie znakomicie.

Ale sa systemy ktore juz nie dzialaja znakomicie i maja problemy przy takim zalozeniu i I/O zaczyna przeszkadzac. Caly ruch NoSql to po prostu proby walczenia z tymi ograniczenia.

I o tym wg mnie wlasnie jest ksiazka Data-Intensive Applications Kleepmana. :)

Mateusz Mazurek pytal sie w innym watku jak to jest z nosqlowymi bazami danych i przyklady uzycia.

CassandraDB (ktora zostanie prawdopodobnie ubita przez ScyllaDB [0]) - z tego co czytalem write heavy appki - czyli ogromna ilosc zapisow + spory przyrost danych. Jak nie da sie utrzymac danych tanio na jednej bazce to potrzebny jest klaster. Jak klaster nie wystarcza to wtedy trzeba siegnac po wiele klastrow w roznych data centre - I tutaj swietnie sprawdza sie Cassandra - dostarczajac niezlego write-a i rozsadny read. Team od ScyllaDB po przepisaniu Cassandry z Javy na C++ ( i zastosowaniu jakis niskopoziomych hackow) twierdzi ze zwiekszyl wydajnosc 10x.

MongoDB - Zorientowanie danych na 'dokumenty' co pozwala przy odpowiednio dopasowanych procesach biznesowych ograniczyc ilosc writeow i zoptymalizowac ready oraz uproscic logike apllikacji. Przy zle dopracowanym procesie no to wtedy mamy 'mongodb is webscale'. Sa takie systemy gdzie wyraznie w domenie mozesz rozpoznac dokument i owszem w SQL-u moglbys go trzymac jako blog json w jakiejs tabeli ale ... wydaje mi sie ze MongoDB lepiej do tego sie nadaje. Ponoc bazka tez swietnie sie replikuje i sharduje.

Mateusz Mazurek Baza dokumentowa w teorii np moze odciazyc ci ready bo rzeczywiscie nie musisz tworzyc Joinow ale tak jakby materializujesz dane i przedstawiasz je w dokumentach. Zalozenie ze dane nie sa zdenormalizowane i sa powtarzane moze za to kosztowac write-y. Bo musisz nagle updatowac wiele dokumentow jak zmienisz cos wspolnego a nie masz zalozenia ze dokument nie jest immutable. Plusem zorientowania na dokumenty wydaje mi sie ze jet latwiejsze shardowanie/partycjonowanie. Bo przenosisz dokumenty na baize jakiegos klucza na inna baze w klustrze i tym samym zwiekszasz przepustowosc. W przypadku relacyjnej - na pewno jest to utrudnione bo jak spartycjonujesz dane i nagle masz jedna czesc calosci w jednej bazie a druga w drugiej to by zlozyc caly zestaw danych potrzebujesz wolac kilka baz danych :) A co jak jedna sie wysypie? to nie mozesz danych poskladac w calosc?

Dynamo - produkt AWS ale oryginalny Whitepaper AWS jest baza wielu nowych baz danych[1]. Generalnie z praktycznego punktu widzenia - swietna bazka do trzymania prostych danych 'itemow' - jest to 'bazka' szyta na miare ktora jest w stanie sama dopasowac sie do naszych potrzeb. Robi to za pomoca mixu shardowania i replikacji na rozne nody - fajnie bo mozna dopasowac ile readow i writeow chcemy i w ten sposob kontrolowac jej zuzycie i nasze koszta. Do tego Dynamo ma swietne SLA ( i jest zarzadzane przez AWS wiec nie potrzebujesz przejmowac sie w zasadzie gdzie i jak to dziala). Minusem natomiast jest problem z goracymi nodeami ktore moga powstac przy zlym doborze partition key albo ruchu ktory ma trudny do przewidzenia rozklad zapisu i odczytu stanu ( czytalem ze ostantio jakies poprawki tutaj poczynili i rebalansuja node-y ale na razie nie bylem w stanie tego przetestowac ). W obecnym projekcie uzywam jej np jako taniego nosnika danych ktore maja Time To Live 1 dzien ( w sumie to cache). 

Redis - Key / Value Store-y ogolnie - wyspecjalizowane nosniki danych w pamieci ktore sluza jako dodatek do roznego rodzaju procesow by np odciazych glowna baze danych czy aplikacje. Przyklad uzycia np Cache. Wiem ze tez niektorzy uzywaja Redisa jako nosnika roznego rodzaju kolejek.

Google Spanner - to jest ciekawa baza ktora twierdzi ze 'pokonala' probabilistycznie CAP theorem dzieki infrastrukture Google-a. Google reklamuje jako mozesz miec zalety NoSQL i zalety SQL! ktorych brak powoduje komplikacje na warstwie aplikacji bo trzeba wiecej czasu poswiecic by w kodzie skompensowac brak tranzakcji[4](swietny wyklad o tranzakcjach) z puntku widzenia kodu czy warstwy uzytkownika.[2] (odskocznia od Spannera jest CoackroachDB ktory proboje zrobic to samo ale bez infrastruktury Google-a [3])

ElasticSearch - opakowany Lucene jako rozproszony system ktory dostarcza Search Engine - swietne full texst search mozliwosci - replikacja - shardowanie i ogolnie droga zabawka :)

Sa tez bazki time series np Graphite do trzymania danych o systemie etc.

Te wszytkie moje opisy sa bardzo uproszczone i bazuja po czesci na doswiadczeniu a po czesci na tym co gdzies tam wyczytalem ostatnio.

Polecam tez ten link -> https://db-engines.com/en/ranking

/cc Mateusz Mazurek

[0]: http://www.zdnet.com/.../a-rock-and-a-hard-place-between.../
[1]: https://www.allthingsdistributed.com/.../amazon-dynamo...
[2]: https://cloudplatform.googleblog.com/.../inside-Cloud...
[3]: https://www.cockroachlabs.com/.../living-without-atomic.../
[4]: https://www.youtube.com/watch?v=5ZjhNTM8XU8
