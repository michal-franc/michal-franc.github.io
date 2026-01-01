---
layout: post
title: Tworzenie Pdf -a w .Necie 
date: 2010-02-23 18:27
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
Do dyspozycji mamy <a href="http://stackoverflow.com/questions/177/how-do-i-programmatically-create-a-pdf-in-my-net-application"> wiele bibliotek</a> tworzących , konwertujących do formatu PDF-a.Postanowiłem przetestować <a href="http://pdfsharp.com/">PDF-Sharpa</a>

Biblioteka jest łatwa i przyjemna. Po przeczytaniu <a href="http://pdfsharp.com/PDFsharp/index.php?option=com_content&amp;task=view&amp;id=15&amp;Itemid=35">kilku tutorialu i przglądnieciu sampli kodu</a> od razu można zacząć tworzyć nasze własne "Pedefki".

Potrzebowałem przekonwertować obrazek na PDF-ka.

Z PDF-Sharpikiem to żadna filozofia.

{% highlight csharp %}
PdfDocument document = new PdfDocument();

PdfPage page = document.AddPage();

XGraphics gfx = XGraphics.FromPdfPage(page);

Graphics g = Graphics.FromImage(pictureBoxHuman.Image);

g.DrawImage(pictureBoxHead.Image,new Point(0,0));

gfx.DrawImage(XImage.FromGdiPlusImage(pictureBoxHuman.Image),new Point(0,0));

string filename = "lobrazkowy.pdf";
document.Save(filename);
{% endhighlight %}

&nbsp;

Podstawą pdfka jest klasa <strong>PdfDocument</strong> która jest kolekcją obiektów np stron.Podobnie jest z <strong>PdfPagem</strong> , który jest kolekcją obiektów znajdujących się na stronie. Zresztą co ja tu będe opisywał. Nazwy metod i klas ładnie opisują proces i mechanizm działania biblioteki. Biblioteka jest fajnie przemyślana.

Polecam PDF-sharpika.
