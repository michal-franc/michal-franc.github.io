---
layout: post
title: Edytowalny ListBox
date: 2010-02-20 19:07
author: Michal Franc

comments: true
categories: [.net, c#, Uncategorized, visual studio]
---
Dużo czasu spędzam ostatnio przy mini projekcicku [więcej info wkrótce]. Potrzebowałem kontrolki listboxa ale z edytowalnymi polami.
Jako że w .necie taka kontrolka nie jest dostępna standardowo to postanowiłem "wyciosać" własną. .Net daje nam spore pole do popisu jeżeli chodzi o tworzenie własnych "customowych" kontrolek.

By tego dokonać będziemy potrzebować dwóch nowych kontrolek.
<ul>
	<li><span style="color: #ffff00;">TextBoxa  który będzie komunikował się z danymi ListBoxa</span></li>
	<li><span style="color: #ffff00;"> ListBoxa wykorzystującego tego TextBoxa</span></li>
</ul>
<!--more-->
<h2 style="text-align: left;"><span style="color: #ffff00;">Opis Działania.</span></h2>
ListBox normalnie wyświetli Itemy. W momencie wybrania któregoś pola w miejscu Itema wygeneruje odpowiednią kontrolkę TextBoxa. Po wprowadzeniu textu do TextBoxa będzie on znikał i tracił "focus" przesyłając zmiany do ListBoxa , [ skupienie :D jak to dziwnie brzmi ostatnio zauważyłem że niektóre wydawnictwa tłumaczą "singleton" jako "samotnik" ].

<a href="http://lammichalfranc.files.wordpress.com/2010/02/edytowalny-listbox-test.jpg"><img class="aligncenter size-full wp-image-332" title="Edytowalny ListBox Test" src="http://lammichalfranc.files.wordpress.com/2010/02/edytowalny-listbox-test.jpg" alt="" width="450" height="158" /></a>
<h2><span style="color: #ffff00;">TextBox</span></h2>
Zaczniemy od TextBoxa bo zawiera on mniej modyfikacji.

{% highlight csharp %}
class EdditableTextBox : TextBox
{
   private int _index = -1;

   public int Index
   {
    set { _index = value; }
   }
...
{% endhighlight %}

&nbsp;

Dziedziczymy po standardowum TextBoxie i definiujemy pole Index , które będzie zawierać numer naszego obiektu , itemu , w listBoxie.

{% highlight csharp %}
protected override void OnLeave(EventArgs e)
{
   ((ListBox)this.Parent).Items[_index] = this.Text;
   base.OnLeave(e);
}
{% endhighlight %}

&nbsp;

Przeciążamy metodę wywoływaną w momencie wychodzenia z textBoxa tak by wszelkie wprowadzone zmiany zmieniały także obiekt w naszym ListBoxie do tego jest nam potrzebny parametr <strong>Index</strong> , który określa do którego konkretnie elementu się odnosimy.Odwołanie do ListBoxa realizujemy poprzez propercje Parent.

Na wszelki wypadek wywołujemy bazową metodę.

Można oczywiście zrobić inny mechanizm. Np akceptowanie zmian w momencie wciśnięcia odpowiegniego klawisza.

{% highlight csharp %}
protected override void OnKeyPress(KeyPressEventArgs e)
{
   if (e.KeyChar == (char)Keys.Enter)
   {
      ((ListBox)this.Parent).Items[_index] = this.Text;
   }
   base.OnKeyPress(e);
}
{% endhighlight %}

&nbsp;

W tym przypadku <strong>Enter</strong>
<h2><span style="color: #ffff00;">ListBox</span></h2>
Przejdzmy teraz do ListBoxa. Tutaj już będzie troszeczkę więcej zmian.

{% highlight csharp %}
class EdditableListBox : ListBox
{
      private static int MarginBeetwenItems = 5;
      private EdditableTextBox tbox;
{% endhighlight %}

&nbsp;

Dziedziczymy po ListBoxie tworzymy propercje oznaczającą odstęp pomiędzy wyświetlanymi itemamy i tworzymy lokalna kopię naszego zmodyfikowanego TextBoxa

{% highlight csharp %}
public EdditableListBox()
{
   tbox = new EdditableTextBox();
   tbox.Hide();
   tbox.Parent = this;
   Controls.Add(tbox);
}
{% endhighlight %}

&nbsp;

Tworzymy Text Boxa ustawiamy jego "rodzica" . Propercja <strong>Parent</strong> będzie nam służyła do komunikacji pomiędzy TextBoxem i ListBoxem.

{% highlight csharp %}
protected override void OnDrawItem(DrawItemEventArgs e)
{
   if (e.Index > -1)
   {
        string s = Items[e.Index].ToString();

        Rectangle rect = new Rectangle(
        e.Bounds.X, e.Bounds.Y + (e.Index * MarginBeetwenItems),
        e.Bounds.Width, e.Bounds.Height);

        e.Graphics.DrawString(s, Font, new SolidBrush(SystemColors.WindowText), rect);
    }
}
{% endhighlight %}

&nbsp;

Musimy przeciążyć metodę odrysowywującą. Na wszelki wypadek badamy index Obiektu w ListBoxie , wyznaczamy prostokąt na podstawie jego parametrów , uwzględniając
<strong>MarginBeetwenItems</strong>. Rysujemy napis w odpowiednim miejscu.

{% highlight csharp %}
protected override void OnMouseUp(MouseEventArgs e)
{
     int index = IndexFromPoint(e.X, e.Y);

     if (index != ListBox.NoMatches &amp;&amp; index != 65535)
     {
          if (e.Button == MouseButtons.Left)
          {
               string s = Items[index].ToString();
               Rectangle rect = GetItemRectangle(index);

               tbox.Location = new Point(rect.X, rect.Y + (index * MarginBeetwenItems));
               tbox.Size = new Size(rect.Width, rect.Height);
               tbox.Text = s;
               tbox.Index = index;
               tbox.SelectAll();
               tbox.Show();
               tbox.Focus();
          }
     }

     base.OnMouseUp(e);
}
{% endhighlight %}

&nbsp;

Główna metoda tworząca [chociaż bardziej pasuje słowo modyfikująca] odpowiednio kontrolke TextBoxa , przy kliknięciu Lewym Przyciskiem myszki. Parametry TextBoxa modyfikujemy tak aby wyświetlał się w miejscu klikniętego obiektu na ListBoxie.

{% highlight csharp %}
protected override void OnSelectedIndexChanged(EventArgs e)
{
      tbox.Hide();
      base.OnSelectedIndexChanged(e);
}

protected override void OnLeave(EventArgs e)
{
      tbox.Hide();
      base.OnLeave(e);
}
{% endhighlight %}

&nbsp;

Odpowiednie funkcje powodujące zniknięcie naszego TextBoxa przy wyjściu z kontrolki i przy zmianie obiektu.
