        public IEnumerable<GitUser> FavoritesList()
        {
            //CookieHelper cookieHelper = new CookieHelper(myCookieRepository);
            HttpCookie httpCookie = cookieHelper.SetAndGetHttpCookies();
            MyCookie myCookie = new MyCookie()
            {
                ID = Convert.ToInt32(httpCookie["Id"])
            };
            List<GitUser> favoritesList = new List<GitUser>();

            using (var db = new GitContext())
            {
                var results = (from ch in db.CookiesHistory
                               where ch.GitUserId != null
                               where ch.MyCookieId == myCookie.ID
                               group ch by new { ch.GitUserId, ch.MyCookieId, ch.SearchGitUser } into g
                               orderby g.Count() descending
                               select new { GitUserId = g.Key.GitUserId, MyCookieId = g.Key.MyCookieId, SearchGitUser = g.Key.SearchGitUser, Count = g.Count() }).Take(3);


                foreach (var result in results)
                {
                    var user = (from u in db.GitUsers
                                where u.Id == result.GitUserId
                                select new { u }).First();

                    favoritesList.Add(user.u);
                }
            }

            return favoritesList;
        }
		
		
		efektem koncowym jest pozyskanie listy favoiurites

[20:25]  
do czego uzywasz myCookie ?

[20:25]  
aaa opk widze

[20:25]  
myCookie jest ci niepotrzebne uzywasz tylko ID

[20:26]  
wiec wynies wyciaganie ID z cookiesa poza ta funkcje

+ ID powinno byc przekazywane w parametrze funkcji Favourites List

[20:26]  
wtedy nie przecieka ci abstrakcja i warstwa http, cookies do tej funkjci

[20:26]  
to skad sie bierze ID chowasz

[20:28]  
1. wywalenie cookiesa :smile:

wiec 1 funklcja wyciaga ci userID
2 wyciaga ci na jego podstawie usera

[20:46]  
mozesz to opakowac w 2 funkcje i 2 usingi albo zrobic jedno query

[20:46]  
inna sprawa ze nie widze powiazania miedyz zwracanym parametrem u a favourites list

[20:47]  
wiec ta funkcja nie zwraca favourites ale userow :stuck_out_tongue:

[20:47]  
wiec nazwa funkcji tez sie musi zmienic


recovery [20:49]  
Bo tam chodzi o to ze pobiera userow na ktorych najczesciej wchodzilismy

michal-franc [20:49]  
okkk

[20:49]  
wiec favourites users :smile:


widzisz majac porzadna konwencje nazewiczna

[20:50]  
zrozumialbym ten kod juz dawno temu :stuck_out_tongue:

[20:50]  
empiryczny dowod dlaczego jest to wazne :d


where ch.GitUserId != null 
czemu w bazce zakladasz ze moze istniec rekord bez UserId ? (edited)

recovery [20:51]  
xd bo sie bawie w bigdate

[20:51]  
i jak ktos z cookiesem wpisze

[20:51]  
np nick z np forum

[20:51]  
sprawdzajac czy na githubie gosc ma konto

[20:52]  
o takiej nazwie

[20:52]  
to bedzie id == null

[20:52]  
a zbieram info ze ktos poszukiwal

[20:52]  
niby nic

[20:52]  
xD ale teraz zbiera sie wszystkie dane

michal-franc [20:52]  
to ja bym stworzuyl oddzielna tabelke

[20:52]  
i tam gromadzil takie dane

[20:52]  
miast zanieczyszczac ta tabelke

[20:53]  
a potem walczyc w kodzie zeby ja wyczyscic

[20:53]  
pozniej bedziesz mial innego deva ktory sie pogubi albo sam zapomnisz dlaczego zalozylesz takie cos


( albo tak jak w mojej firmie gdzie w bazie userow 40+ mln, zdarzali sie userzy bez imienia albo nazwiska .... albo nawet username bo przez 10 lat system tak sie czesto zmienial ze hackowali tabelke zeby dopasowac do nowych wymagan )

recovery [20:56]  
mhm no ok

[20:57]  
to cos z tym zrobie

[20:58]  
najpierw metody poprawie -> potem query i tabelki -> potem metody -> i potem moze mi sie uda cos z tymi testami


michal-franc [20:58]  
btw czemu tam jest take  #?

[20:58]  
3?

recovery [21:00]  
bo w interfejsie na stronie tak zrobilem ze 3 proponowane najczestsze osoby

michal-franc [21:00]  
wiec musisz zmienic funkcje nazwe

recovery [21:00]  
a po co mam pobierac  wszystko jak top 3

[21:00]  
szybciej

michal-franc [21:00]  
zeby miala topfabouritesusers

[21:00]  
i w parametrze dac count

[21:00]  
albo limit

[21:00]  
warunki brzegowe ktore wplywaja na to jak dziala funkcja

[21:00]  
musza byc przez parametry przekazywane

[21:01]  
bo iny dev wezmie ci te funkcje odpali

[21:01]  
i bedize sie zastanawial czemu mu 3 tylko zwraca

[21:01]  
jak zakomunikujesz to w parametrze i nazwie funkcji

[21:01]  
ulatwisz prace sobie i innym P:


michal-franc [21:02]  
daj znac jak bedzieszmial kolejna iteracje :stuck_out_tongue:

[21:03]  
ja rozbilbym te pobieranie danych na 2 rozne funkcje

[21:03]  
i wtedy mialbym ta funkcje co masz teraz + 2 wywolania innych funkcji uderzajacych do bazy

recovery [21:04]  
mhm ?  co bys rozbil na 2 funkcje

michal-franc [21:04]  
dzieki temu whodzac w funckje jedna do bazy moge schowac skomplikowanie i kontekst zewnetrzny i skupic sie tylko na tym co ma zrobic ta funkcja 1

michal-franc [21:04]  
added a Plain Text snippet 
1 FUNKCJA
var results = (from ch in db.CookiesHistory
                               where ch.GitUserId != null
                               where ch.MyCookieId == myCookie.ID
                               group ch by new { ch.GitUserId, ch.MyCookieId, ch.SearchGitUser } into g
                               orderby g.Count() descending
                               select new { GitUserId = g.Key.GitUserId, MyCookieId = g.Key.MyCookieId, SearchGitUser = g.Key.SearchGitUser, Count = g.Count() }).Take(3);
2 Funkcja
                foreach (var result in results)
                {
                    var user = (from u in db.GitUsers
                                where u.Id == result.GitUserId
                                select new { u }).First();
                    favoritesList.Add(user.u);
                }
Add Comment Collapse

recovery [21:04]  
ze od foreach 2 funkcja


recovery [21:04]  
ze od foreach 2 funkcja

[21:04]  
no czaje

[21:05]  
myslalem ze to glupie xD rozkladac to na 2 funkcje

[21:05]  
i dlatego tak nie robilem

markone [21:06]  
ja bym w ogóle przeniósl pobierane danych z bazy do osobnych obiektów

[21:07]  
cos na wzór repository, czy serwisów w java

michal-franc [21:07]  
added a Plain Text snippet 
        public IEnumerable<GitUser> FavoritesList()
        {
            using (var db = new GitContext())
            {
                
                var cookieHistory = GiveMeCookieHistory();
                var favouritesList = ExtractUsers(cookieHistory)'
            }
            return favoritesList;
        }
Add Comment Collapse

michal-franc [21:07]  
patrz jak to sie prosciej czyta

michal-franc [21:08]  
added and commented on a Plain Text snippet 
funciton trololol(int id){
var results = (from ch in db.CookiesHistory
                               where ch.GitUserId != null
                               where ch.MyCookieId == myCookie.ID
                               group ch by new { ch.GitUserId, ch.MyCookieId, ch.SearchGitUser } into g
                               orderby g.Count() descending
                               select new { GitUserId = g.Key.GitUserId, MyCookieId = g.Key.MyCookieId, SearchGitUser = g.Key.SearchGitUser, Count = g.Count() }).Take(3);
}
1 Comment Collapse
Tak samo to nie mam tego calego halasu i dalszego contextu, mam tylko moja funkcje parametry wejsciowe i to co na wyjsicu i tylko to mnie interesuje w tym momencie

michal-franc [21:09]  
( oczywiscie to sa tylko takie trolololo kody w nieokreslonym jezyku by tylko zobrazowac jak inaczje to wyglada i latwiej rozumowac z takim kodem )