---
layout: post
title: Optymalizacja Grafu
date: 2009-11-24 19:33
author: Michal Franc
comments: true
categories: []
tags: [archive]
---
Na mojej kochanej PWR realizowałem prostą implementację grafu z wyszukiwaniem najkrótszych ścieżek w grafie. Trochę się zirytowałem gdy mój cudowny kod chodził 20 razy wolniej ;] od kodu kolegi. Niestety moja chorobliwa ambicja nie odpuściła i postanowiłem zoptymalizować kod ..... 

Zabawę zacząłem z programikiem <a href="http://www.jetbrains.com/profiler/index.html"><strong>dotTrace</strong></a> który jest świetnym profilerem badającym wydajność programów. Fajną sprawą jest wyświetlanie ilości wywołań poszczególnych metod i czas ich trwania. Dzięki temu z łatwością możemy wydzielić bloki kodu w których najprawdopodobniej powinniśmy optymalizować. Zgodnie z zasadą 20/80 zmiana 20% najbardziej czasochłonnych  linii kodu da 80% wzrost wydajności.
<a href="http://lammichalfranc.files.wordpress.com/2009/11/profiler1.jpg"><img src="http://lammichalfranc.files.wordpress.com/2009/11/profiler1.jpg" alt="" title="profiler" width="450" height="207" class="aligncenter size-full wp-image-112" /></a>

Po analizie i paru zmianach okazało się że źle przeprowadzałem testy. Zamiast ciągle operować na tym samym elemencie za każdym razem tworzyłem nową instancję klasy odpowiedzialnej za algorytm. Przy 1 Milionie wywołań algorytmu dawało to długi czas działania aplikacji po lekkiej modyfikacji czas wykonania spadł z 60 s do 320ms.
<a href="http://lammichalfranc.files.wordpress.com/2009/11/djikstractr.jpg"><img src="http://lammichalfranc.files.wordpress.com/2009/11/djikstractr.jpg" alt="" title="DjikstraCtr" width="450" height="16" class="aligncenter size-full wp-image-120" /></a>

Conclusion:
Pamiętajmy o odpowiednim konstruowaniu testów :P


Ciekawy jest także fakt że tak naprawdę czas wykonania mojego programu zajmuje tylko 56% czasu działania aplikacji. 44% pożerają procedury .netowe
<a href="http://lammichalfranc.files.wordpress.com/2009/11/main.jpg"><img src="http://lammichalfranc.files.wordpress.com/2009/11/main.jpg" alt="" title="main" width="450" height="158" class="aligncenter size-full wp-image-124" /></a>



