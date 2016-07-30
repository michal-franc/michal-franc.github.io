---
layout: post
title: String Interning
date: 2009-12-28 13:22
author: LaM
comments: true
categories: [.net, interning, Uncategorized]
---
Czytając blog <a href="http://ayende.com/Blog/default.aspx">Ayende Rahien-a</a> natknąłem się na dość ciekawą technikę przetrzymywania stringów w pamięci. "String Interning".

Stringi wrzuca się do tablicy. Jeżeli dany string znajduje się już w tablicy przekazujemy tylko wskaźnik do istniejącego stringa jeżeli nie istnieje wrzucamy go do pamięci i przekazujemy wskaźnik.

Technika ta pozwala zaoszczędzić pamięć i przyspiesza porównywanie stringów [Sprowadza porównywanie  do porownywania zwyklych referencji a nie obiektów. Jak wiemy porownywanie stringów to operacja o zlozonosci obliczeniowej O(n) natomiast porównywanie  wskaźników to O(1).
				
Java i .Net stosuje ten mechanizm automatycznie w momencie tworzenia literałów.Python składuje tak małe stringi.

<div style="font-family:Fixedsys;font-size:10pt;color:#bfbf00;background:black;">
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;12</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">int</span> <span style="color:white;">i</span> = 1;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;13</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#ee6f11;">int</span> <span style="color:white;">j</span> = 1;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;14</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;15</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#2b91af;">String</span> <span style="color:white;">s</span> = <span style="color:#eb6565;">&quot;jakis string&quot;</span>;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;16</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#2b91af;">String</span> <span style="color:white;">a</span> = <span style="color:#eb6565;">&quot;jakis string&quot;</span>;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;17</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;18</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;19</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#2b91af;">Console</span>.<span style="color:white;">WriteLine</span>((<span style="color:#2b91af;">Object</span>)<span style="color:white;">s</span> == (<span style="color:#2b91af;">Object</span>)<span style="color:white;">a</span>);</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;20</span>&nbsp;</p>
<p style="margin:0;"><span style="color:yellow;">&nbsp;&nbsp;&nbsp;21</span>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; <span style="color:#2b91af;">Console</span>.<span style="color:white;">WriteLine</span>((<span style="color:#2b91af;">Object</span>)<span style="color:white;">i</span> == (<span style="color:#2b91af;">Object</span>)<span style="color:white;">j</span>);</p>
</div>

W przykładzie tym 1 porównanie zwróci wartość true. Oznacza to że oba obiekty wskazują w to samo miejsce. 
W momencie tworzenia <strong>stringa s</strong> została przeszukana tablica stringów. Jako że nie było w niej stringu "jakiś string" została ona wrzucona do tej tablicy i został przekazany wskaźnik. <strong>Stringowi a</strong> natomiast został przypisany wskaźnik do miejsca na stercie na które wskazuje s ponieważ ta wartość już jest w tablicy. [Tak to działa w znacznym uproszczeniu].

Rzutowanie na <strong>Object</strong> jest wykonane po to by odwołać się do przeciążenia operatora w klasie bazowej (==) który porównuje referencję.

2 porównanie zwraca wartość false. Przykład ten jest tylko po to by ukazać że interning nie jest stosowane dla np intów. A to dlatego że są one w przeciwieństwie do literałów obiektami <a href="http://en.wikipedia.org/wiki/Immutable_object">immutable</a> [zmiennymi] 
