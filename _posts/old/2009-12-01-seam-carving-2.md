---
layout: post
title: Seam Carving (2)
date: 2009-12-01 21:05
author: Michal Franc
comments: true
categories: []
tags: [archive]
---
Po dłuższej przerwie postanowiłem ostro wziąć się do roboty za algorytm skalowania obrazków. Jest już ładna formatka [szczyt ui designu] i parę opcji. Skalowanie statycznym seamem tzn po lini prostej i skalowanie dynamicznym seamem tzn wyszukiwanie najlepszej drogi. Wszystko jak na razie działa przy pionowym skalowaniu ale wkrótce zmontuje skalowanie poziome. Pierw muszę troszeczkę przeprojektować aplikację bo wdarł się lekki chaos do kodu i kod jest "be" a ja nie na widzę brzydkiego kodu :P

Przeprojektowałem znacznie aplikację , zrefaktoryzowałem kod dla lepszej czytelności i dorzuciłem interfejsy w celu zmniejszenia zależności pomiędzy klasami i wyeliminowania z duplikowanego kodu zgodnie z zasadą DRY = "Don't repeat Yourself" ;]. Jeszcze jeden interfejs nie jest do końca dorobiony i przemyślany bo nie wiem jak pogodzić zabawę na wskaźnikach w klasie z modyfikatorem "unsafe" ... coś wymyślę ;]

Aplikacja opiera się teraz na 2 interfejsach.

<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;&nbsp;9</span>&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">public</span> <span style="color:#ee6f11;">interface</span> <span style="color:#2b91af;">IImageProcessing</span></p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;10</span>&nbsp;&nbsp;&nbsp;&nbsp; {</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;11</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> Open();</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;12</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> Close();</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;13</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;14</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> SetBmp(<span style="color:#2b91af;">Bitmap</span> bmp);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;15</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#2b91af;">Bitmap</span> GetBmp();</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;16</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> SaveBmp(<span style="color:#ee6f11;">string</span> fileLocation);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;17</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;18</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> RemoveStaticRow(<span style="color:#ee6f11;">int</span> x);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;19</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> RemoveDynamicRow(<span style="color:#ee6f11;">int</span>[] inTab);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;20</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> MarkDynamicRow(<span style="color:#ee6f11;">int</span>[] inTab);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;21</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> MarkStaticRow(<span style="color:#ee6f11;">int</span> x);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;22</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;23</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">int</span>[,] Gradient(<span style="color:#ee6f11;">bool</span> saveBmp);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;24</span>&nbsp;&nbsp;&nbsp;&nbsp; }</p>

<strong>IImageProcessing</strong> definiuje nasz silnik graficzny na którym będziemy operować i jego metody do obróbki obrazu.
W tym momencie mam jedną klasę implementująca ten interfejs GDIImageProces. Dzięki takiemu rozdzieleniu interfejsów od implementacji Klasa SeamCarving nie zastanawia się nad tym co się dzieje przy obróbce obrazu i mogę łatwo podmienić silnik graficzni np na wolniejszy korzystający z metod GetPixel SetPixel. Wystarczy ze stworzę nową klasę i zaimplementuje odpowiednie metody interfejsu IImageProcessing. Jest to bodajże pewna implementacja wzorca <a href="http://en.wikipedia.org/wiki/Strategy_pattern"><strong>Strategia "Policy".</strong></a>

<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;10</span>&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">public</span> <span style="color:#ee6f11;">interface</span> <span style="color:#2b91af;">IManipulator</span></p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;11</span>&nbsp;&nbsp;&nbsp;&nbsp; {</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;12</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">void</span> ManipulateSeam(<span style="color:#2b91af;">IImageProcessing</span> imgProcessor);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;13</span>&nbsp;&nbsp;&nbsp;&nbsp; }</p>




<strong>IManipulator</strong> definiuje algorytmy przetwarzania Seamow wyszcególniam 4 rodzaje tych algorytmów:
- Statyczne usuwanie Seama bez zaznaczania czerwoną kreską
- Statyczne usuwanie Seama z zaznaczaniem
- Dynamicznie usuwanie bez zaznaczania
- Dynamicznie usuwanie z zaznaczaniem

W tym momencie rozdzielone mam 2 metody wyjściowe jedną przyjmująca obiekt implementujący IManipulatora z zaznaczaniem i drugą bez zaznazczania. Wkrótce postaram się znaleźć jakieś lepsze rozwiązanie by była jedna metoda. A nie 2 przyjmujące podobny obiekt. Wprowadza to pewne "confusion" dla usera który nie do końca wie jak z tych metod skorzystać. Jest to spowodowane tym że musiałem zastosować śmieszne obejście błedu w GDI+ poprzez dwukrotne clonowanie bitmap.

<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;82</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#2b91af;">Bitmap</span> tmp = (<span style="color:#2b91af;">Bitmap</span>)_imgProcessor.GetBmp().Clone();</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;83</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;84</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; SeamManipulation(seamManipulator, numberOfOper);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;85</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;86</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#2b91af;">Bitmap</span> tmp1 = (<span style="color:#2b91af;">Bitmap</span>)_imgProcessor.GetBmp().Clone();</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;87</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; _imgProcessor.SetBmp(tmp);</p>

Znalazłem na razie zastępczą metodę dla kolorowania składni. Add-in do visuala <strong><a href="http://copysourceashtml.codeplex.com">Copy Source As Html</strong></a>

<a href="http://lammichalfranc.files.wordpress.com/2009/12/dynamicseam.jpg"><img src="http://lammichalfranc.files.wordpress.com/2009/12/dynamicseam.jpg" alt="" title="dynamicSeam" width="450" height="539" class="aligncenter size-full wp-image-148" /></a>
Dynamiczny Seam

<a href="http://lammichalfranc.files.wordpress.com/2009/12/seamcarvingdynamic100.jpg"><img class="aligncenter size-full wp-image-147" title="seamcarvingdynamic100" src="http://lammichalfranc.files.wordpress.com/2009/12/seamcarvingdynamic100.jpg" alt="" width="343" height="583" /></a>

Rysunek po obróbce 150+ seamów.

Wrzuciłem kod źródłowy wersji "alpha" do działu <a href="http://lammichalfranc.wordpress.com/pliki/"><strong> Projekciki </strong></a>. Podaje tam także linka do mojego repozytorium Svn-owego. Proszę się nie śmiać z komentarzy :] 
