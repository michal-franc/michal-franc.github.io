---
layout: post
title: Testowanie jednostkowe metody prywatnej
date: 2009-12-30 20:04
author: LaM
comments: true
categories: [NUnit, Uncategorized, unit test]
---
Natknąłem się ostatnio na pewien problem.

Jak przeprowadzić test funkcji zadeklarowanej jako <strong>private</strong> wewnątrz pewnej klasy.

Rozwiązania:

1. Najbardziej oczywiste zmienić dostęp do metody na publiczny.

2. Zadeklarować metodę jako <strong>protected</strong> i dziedziczyć w innej klasie która obuduje metodę prywatną metodą publiczną [wrapper].

3.Zadeklarować funkcje jako <strong>internal</strong> i użyć Attrybutu <a href="http://devlicio.us/blogs/derik_whittaker/archive/2007/04/09/internalsvisibleto-testing-internal-methods-in-net-2-0.aspx">InternalsVisibleTo</a>. Oczywiście jeżeli kod testów trzymamy w tym samym projekcie co nasza metoda to <strong>internal</strong> już zapewnia nam dostęp do niej. Dobrą praktyką jednak jest trzymanie kodu testującego w oddzielnym Assembly.

Wszystkie te sposoby psują naszą koncepcje która z jakiegoś ważnego powodu zakładała że nasza  funkcja powinna być prywatna.

Pozostają jeszcze :

4.Użyć mechanizmu refleksji.

5. Zastanowić się czy aby na pewno powinniśmy testować metodę prywatną .Z zalożenia testy jednostkowe powinny testować interfejs naszej klasy.Testując metody prywatne narażamy sie na testowanie implementacji co przy zmianie kodu może wymusić zmianę testów.

<a href="http://www.codeproject.com/KB/cs/testnonpublicmembers.aspx">Więcej Info</a>
