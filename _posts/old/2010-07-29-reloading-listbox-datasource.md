---
layout: post
title: Reloading ListBox DataSource
date: 2010-07-29 22:58
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
My Little project TimeIsMoney is participating in a contest by <a href="http://www.maciejaniserowicz.com/">Maciej Aniserowicz.</a>

At the moment it's really simple tool used to help me with collecting and sorting various tasks.

<a href="http://lammichalfranc.files.wordpress.com/2010/07/timeismoney.png"><img class="aligncenter size-full wp-image-480" title="TimeIsMoney" src="http://lammichalfranc.files.wordpress.com/2010/07/timeismoney.png" alt="" width="417" height="295" /></a>

I'm doing this just for fun. This contest will be a great motivation and good way to promote this blog :P

So what's interesting in the code right now ?

<strong>1. ListBox DataSource Reloading</strong>

{% highlight csharp %}
public static class Extension
{
    public static void eReloadDataSource(this ListBox listbox)
    {
    string s = listbox.DisplayMember;
    Object obj = listbox.DataSource;
    listbox.DataSource = null;
    listbox.DataSource = obj;
    listbox.DisplayMember=s;
    }
}
{% endhighlight %}

This Extension method reloads the Data source of a ListBox. I know it looks stupid but it works :D.
Let's take a look in Reflector …. hmm

{% highlight csharp %}
public object DataSource
{
     [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
     get
     {
          return this.dataSource;
     }
     set
     {
          if (((value != null) &amp;&amp; !(value is IList)) &amp;&amp; !(value is IListSource))
     {
     throw new ArgumentException(SR.GetString("BadDataSourceForComplexBinding"));
     }
     if (this.dataSource != value)
     {
          try
          {
               this.SetDataConnection(value, this.displayMember, false);
          }
          catch
          {
               this.DisplayMember = "";
          }
          if (value == null)
          {
               this.DisplayMember = "";
          }
     }
}
{% endhighlight %}

&nbsp;

So by assigning null value i m calling the SetDataConnection(,,,) which reloads the data. Also you can easily see that we have to reasssign DisplayMember value beacuase it is set to an Empty String at the end.

<strong>2. GlobalKeyHook</strong>

To catch the key press events i am using slightly modified code from <a href="http://www.codeproject.com/KB/cs/CSLLKeyboardHook.aspx">link</a> . I made a little tweak to enable the special keys combinations , so you can catch the alt+ctrl+b sequention.

That's all for now ;] If you want to check the code it is on the <a href="http://github.com/Michal Franc
ik/TimeIsMoney">GitHub.</a>
