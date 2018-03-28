rol11 [18:16]
Cześć! [Java]
Fizycznie mam 5 aplikacji, które mają jeden core. 
Wszystkie są w teorii bardzo podobne jednak różni sie pare rzeczy. Obecnie mam to w postaci monolitycznej aplikacjii...jednak nie do końca wiem czy to jest dobre podejście.
Myślałem nad dwoma innymi podejściami:
- biblioteka
- corowe funkcjonalności jako libki

Jak sądzicie co jest najlepszą opcją? Jak Wy byście zrobili?
(problem jest taki, że chyba nie do konca łapie czym jest duży projekt. Jak na razie kodze sam, jednak powoli szukamy ludzi.... i troszkę boje sie, że:
- ktoś nie ogarnie
- ktoś zepsuje/dotknie coś czego nie powinien.... obecnie to jest około 8k linii kodu)

michal-franc [19:30]
@karol11
> - ktoś zepsuje/dotknie coś czego nie powinien.... obecnie to jest około 8k linii kodu)
- testy
- code review
- ci
i minimalizujesz szanse potkniecia, szansa zawsze jest, bledy zawsze sa
zeby zlikwidowac ten problem musisz zainwestowac w procesy, gatekepperow jak boisz sie o poziom osob ktore zatrudniasz
tylko to ma swoja cene - lepsze rozwiazanie to pisanie tak aplikacji by minimalizowac problemy
jedna warstwa to wlasnie testy, code review, ci i kod w ktorym latwo znalezc 'problem' - monitoring, logi 
druga warstwa to pisanie kodu ktory minimalizuje straty jak juz sie zdarza poprzez izolacje, fail over, czy degradacje ficzerow
nie ma idealnego softu -> wiec imo z tym psuciem dotykaniem to masz zupelnie inny problem troche :slightly_smiling_face:

z Ogarnianiem to tez jest tak ze masz rozne warstwy w swojej aplikacji
jedyna warstwa ktora wymaga ogarniania to warstwa domenowa - tylko ona jest wyjatkowa
jak ja wydzielisz sensownie i oddzielisz od warstw 'typowych' - apir, orkierstracja, aggregacja - to przyszly programmer moze te typowe warsty skumac z konwencji i contextu oraz doswiadczenia (edited)
domenowej warstwy uczy sie z czasem
wiec wydziel domenowa warstwe ktora generuje zlozonosc od warstw ktore sa 'klepaniem' kodu i bedzie taniej komus to ogarnac
> jednak nie do końca wiem czy to jest dobre podejście.
jak zadajesz takie pytanie to chyba jeszce nie wydarzyly sie problemy o ktore sie martwisz :stuck_out_tongue:
zatrudnij ludzi, nowe osoby (bo o tym wspominasz) ze swiezym spojrzeniem, pozwol im zetknac sie z tym co masz i na bazie tego feedbacku ulepszajcie (edited)
Monolityczna aplikacja nie jest zla i ma prawo bytu - jak juz chcesz cos zmieniac to nie baw sie w mikroserwisy i zmiany na rozne procesy ktore o zgrozo jeszce moze oddzielisz fizycznie od siebie przez siec
tylko sproboj wygenerowac big overview tego co masz w tyk kodzie i ciagle trzymajac to w jednym procesie zrob rozne 'mikro-serwisy'
> Myślałem nad dwoma innymi podejściami:
> - biblioteka
> - corowe funkcjonalności jako libki
To moze miec sens ale ... ma sens jak jakas libka, biblioteka jest stabilna - jak mozesz znalezc takie rzeczy ktore wiesz ze sie nie zmienia i mozna je 'tanio' zrobic generycznymi do pewnego stopniu to jasne calkiem spoko sprawa. 
Utrzymanie corowych libek, bibliotek moze byc kosztowne jesli sie ciagle zmieniaja i moze sie okazac ze z czasem ta czesc wspolna zniknela i masz teraz libke ktora jest dzielona przez 5 aplikacji ktore maja inne wymagania
imo glowne pytanie jakie musisz sobie zadac to czym jest ta czesc wspolna w tych 5 projektach i czy ta czesc wspolna jest juz okreslona i stabilna - czy nadal jestes w fazie - 'odkrywania' tego co ten kod ma robic (edited)
> Jak sądzicie co jest najlepszą opcją?
nie ma czegos takiego :stuck_out_tongue: jest opcja bardziej albo mniej optymalna (edited)
