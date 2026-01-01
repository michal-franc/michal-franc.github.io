---
layout: post
title: Seam Carving (3)
date: 2010-02-07 00:52
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
Zupdatowałem źródło projekciku Seam Carving.

Troszeczkę przesadziłem z designem aplikacji. No ale od czegoś trzeba zacząć. Już wiem z czym to się je.

Aplikacja Rozdzielona jest na trzy moduły.

<strong>-UI w Formsach
-Silnik Algorytmu
-Silnik Graficzny</strong>

<strong>Silnik Graficzny:</strong>

<strong> </strong>
IEnergyCalculator: - interfejs klasy liczącej energię
EnergyCalGradient - liczenie gradientu
IImageProcessor - interfejs klasy przetwarzającej obraz
GdiImageProcess - przetwarzanie przy pomocy GDI+ i LockBitów
IPixelManipulator - interfejs klasy modyfikującej pixele
PixelColor  -kolorowanie pixeli
PixelRemove - usuwanie pixeli

<strong>Silnik Algorytmu</strong>

<strong> </strong>
ISeamManipulator : - interfejs klasy operującej na Seamach
DynamicSeamManipulator - dynamiczne usuwanie seama
DynamicSeamManipulatorWithMark - to samo ale z zaznaczaniem seama
StaticSeamManipulator - statyczne seamy [nie obsługiwane]
StaticSeamManipulatorWithMark

<!--more-->

<a href="http://lammichalfranc.files.wordpress.com/2009/12/seamcarv.jpg"><img class="aligncenter size-full wp-image-312" title="SeamCarv" src="http://lammichalfranc.files.wordpress.com/2009/12/seamcarv.jpg" alt="" width="383" height="339" /></a>

<strong>Psuedo kod aplikacji:</strong>

<strong> </strong>
for 1 to n do
{
1. Wczytanie Obrazka
2. Wybranie Parametrów przetwarzania bitmapy
3. Wywołanie algorytmu SeamCarving
4. Wywołanie metody ManipulateSeam ISeamManipulatora
5. Wyliczenie Energi Obrazka wywołanie metody Energy silnika graficznego ktora jako jeden parametr przyjmuje interfejs  IEnergyCalculator
6. Wyznaczenie Seama
7. Wywołanie silnika graficznego i metody przetwarzającej obrazek na podstawie seama.
}
<div id="_mcePaste">Zastosowanie interfejsów pozwoliło mi stworzyć mniej powiązane klasy. Teraz np jak chcę policzyć Energię inną funkcją wystarczy , że stworzę klasę i odpowiednio zaimplementuje interfejs.W paru miejscach oczywiście przesadziłem m.in łamiąc regułę  <a href="http://en.wikipedia.org/wiki/You_ain't_gonna_need_it"> YAGNI ( You Aren't Gonna Need It)</a></div>
<strong>Testy</strong>

<a href="http://lammichalfranc.files.wordpress.com/2010/02/skytower.jpg"><img class="aligncenter size-full wp-image-323" title="skytower" src="http://lammichalfranc.files.wordpress.com/2010/02/skytower.jpg" alt="" width="450" height="544" /></a>

<strong>Energia</strong>

<a href="http://lammichalfranc.files.wordpress.com/2010/02/energia.jpg"><img class="aligncenter size-full wp-image-324" title="energia" src="http://lammichalfranc.files.wordpress.com/2010/02/energia.jpg" alt="" width="450" height="566" /></a>

<strong>Obrazek Po Skalowaniu</strong>
<a href="http://lammichalfranc.files.wordpress.com/2010/02/lobrazek.jpg"><img class="aligncenter size-full wp-image-366" title="lobrazek" src="http://lammichalfranc.files.wordpress.com/2010/02/lobrazek.jpg" alt="" width="238" height="408" /></a>

Na razie projekcik jest na wstrzymaniu. Jak ktoś ma jakieś uwagi , pytania to proszę pisać.
<a href="http://www.datafilehost.com/download-71284d0b.html">Projekt "SeamCarving"</a>
