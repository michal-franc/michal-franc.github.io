---
layout: post
title: Migrating from Wordpress to Blog Engine .Net
date: 2010-07-27 16:02
author: Michal Franc

comments: true
categories: [Uncategorized]
---
<p style="text-align:justify;">Thank God that there is such a tool like BlogML. Without it migrating from Wordpress to BlogEngine Net would be a difficult and  time-consuming task.</p>
<p style="text-align:justify;">If you are hosting your Wordpress Blog by yourself. There are tools to import database. <a href="http://www.aghausman.net/blog-engine/Migrate_from_WordPress_to_BlogEnginenet.html">AghaUsmanAhmed</a></p>
<p style="text-align:justify;">If your Blog was on a official Wordpress site , you don't have access to database , follow those steps.</p>

<h3>Simple Steps:</h3>
<strong>
</strong>

<strong>
<h4>1. Export your Wordpress to XML.</h4>
</strong>

Just go to Wordpress Tools and there is an option to export all to XML.

<strong> </strong>

<strong>
<h4>2. Convert XML to BlogML format</h4>
</strong>

There is a tool made by Goran. <a href="http://www.visualsoftware.net/Blog/post/2009/10/27/WordPress-eXtended-RSS-to-BlogMl-converter-WXR-2-BlogML.aspx"> .Net Lorem Ipsum</a>

Use it to Convert XML.

If there is a runtime error or somekind of an Exception. Download VS 2008 solution and  change

{% highlight csharp %}
          static DateTime ParseWPDate(string value)
        {
             return DateTime.ParseExact(value, "ddd, dd MMM yyyy HH:mm:ss zz00", ci.DateTimeFormat);
        }
{% endhighlight %}

<strong>To</strong>

{% highlight csharp %}
			static DateTime ParseWPDate(string value)
            try
            {
                return DateTime.ParseExact(value, "ddd, dd MMM yyyy HH:mm:ss zz00", ci.DateTimeFormat);
            }
            catch
            {
                return DateTime.Now;
            }
{% endhighlight %}

There can also be a problem with xml and some "atom" tag just delete it.

<strong> </strong>

<strong>
<h4>3. Import BlogML xml in BlogEngine .Net Settings.</h4>
</strong>
<p style="text-align:justify;">Open BlogEngine .Net site in IE <strong><em>(Its Important beacuase import toll wont work on other browsers)</em></strong>.  Run Import Toll select converted xml and Thats All :P</p>
