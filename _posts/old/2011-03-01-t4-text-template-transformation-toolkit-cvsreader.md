---
layout: post
title: T4 - Text Template Transformation Toolkit CvsReader
date: 2011-03-01 00:19
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
While watching <a href="http://channel9.msdn.com/Blogs/matthijs/ASPNET-MVC-2-Ninja-Black-Belt-Tips-by-Scott-Hanselman">Scot Hansleman presentation about MVC</a> I discovered great feature in <strong>Visual Studio 2010</strong>. T4 is an code generation engine. It translates template files (“*.tt”) ,  using scripts created in <strong>C# or VB ,  to C# , VB , T-SQl</strong> , Txt files etc.

You can generate a lot of different things :

- Dynamic classes which are changing based on the settings file

- CRUD procedures which are generated dynamically

- Generated Unit Tests (that would be cool)

I have made a simple template which generates Class that automates reading the <strong>CVS</strong> files. It’s a simple project created just 4fun.

CVS format file :

{% highlight csharp %}
ID,Nazwa,Cena,Ilosc,Data,Imie 
int,string,decimal,int,DateTime,string 
1,Truskawki,100,1,10-10-2010,Michal 
2,Pomarancze,200,2,11-02-2011,Stefan
{% endhighlight %}

First line defines column names and second line specifies their types.
<h4>Template</h4>
Templates are stored in “*.tt” files.  Every “*.tt” files starts with a “template” directive containing options. You can specify language used to analyze file . You also need to load the assemblies used by the script blocks in template. I just need <strong>System </strong>assembly for <strong>IO</strong> operations.

With <strong>Visual Studio 2010</strong> there is a special item type “Text Template”. When you create this item VS will ask you if you want to run the template. T4 engine generates new files every time you save "changes to the “*.tt” file.

{% highlight csharp %}
<#@ template debug="false" hostspecific="true" language="C#" #> 
<#@ assembly name="System" #>
{% endhighlight %}

<h4>Simple Class</h4>
Let’s create a simple container class which stores data defined in the <strong>CVS</strong> . Column name and type is defined in the first two lines.

{% highlight csharp %}
<# 
   string columns = null; 
   string types = null; 
   System.IO.StreamReader re = null; 
   string absolutePath = Host.ResolvePath("Data.cvs"); 
   if(System.IO.File.Exists(absolutePath)) 
   { 
    re = System.IO.File.OpenText(absolutePath);

    columns = re.ReadLine();

    types = re.ReadLine(); 
   } 
#>
{% endhighlight %}

This Script loads first two lines from a file and loads them into the <strong>columns</strong> and <strong>types</strong> string. As you can see this code is in “C#”.  Every script in the template must be within the “<# #>”.

With column names and types we can start the container class generation. Let’s call it “<strong>CvsData</strong>”.

{% highlight csharp %}
using System; 
using System.Collections.Generic; 
public class CvsData 
{ 
<# 
   string [] columntype = types.Split(','); 
   int counter = 0; 
   foreach(string s in columns.Split(',')) 
   { 
    Write("tpublic " + columntype[counter] + " " + s + " {get;set;}n"); 
    counter++; 
   } 
#> 
}
{% endhighlight %}

<p class="csharp" style="font-family: consolas,; font-size: small;"><span style="font-family: arial;">Code outside the <strong>“<# #>”</strong> scope is treated just like simple text. Inside script I m using the Write() function to create text. For each column script generates property.</span></p>

Generated “*.cs” file.

{% highlight csharp %}
using System; 
using System.Collections.Generic; 
public class CvsData 
{ 
   public int ID {get;set;} 
   public string Nazwa {get;set;} 
   public decimal Cena {get;set;} 
   public int Ilosc {get;set;} 
   public DateTime Data {get;set;} 
   public string Imie {get;set;} 
}
{% endhighlight %}

Now I can compile this file and use the CvsData class.
<h4>Simple Reader</h4>
I just want to read data and return it  as a List with CvsData objects.

{% highlight csharp %}
public static class CvsReader 
{ 
   public static List<CvsData> LoadData(string filePath) 
   { 
      List<CvsData> returnData = new List<CvsData>(); 
      if(System.IO.File.Exists(filePath)) 
      { 
         System.IO.StreamReader re = System.IO.File.OpenText(filePath); 
         string line = String.Empty; 
         //Miss first two lines 
         re.ReadLine(); 
         re.ReadLine(); 
         while((line = re.ReadLine()) != null) 
         { 
            string [] values = line.Split(','); 
            returnData.Add(new CvsData(){ 
            <# 
            counter = 0; 
            foreach(string s in columns.Split(',')) 
            { 
              Write("tttttt"+ s + " ="); 
              if(!columntype[counter].Contains("string")) 
              { 
                Write(columntype[counter]+".Parse"); 
              } 
              Write("(values["+counter+"]),n"); 
              counter++; 
            } 
            #> 
          }); 
      } 
      re.Close(); 
    } 
  return returnData; 
} 
}
{% endhighlight %}

<p class="csharp" style="font-family: consolas,; font-size: small;"><span style="font-family: arial;">Generated reader:</span></p>


{% highlight csharp %}
public static class CvsReader 
{ 
    public static List<CvsData> LoadData(string filePath) 
    { 
       List<CvsData> returnData = new List<CvsData>(); 
       if(System.IO.File.Exists(filePath)) 
       { 
          System.IO.StreamReader re = System.IO.File.OpenText(filePath); 
          string line = String.Empty; 
          //Miss first two lines 
          re.ReadLine(); 
          re.ReadLine(); 
          while((line = re.ReadLine()) != null) 
          { 
            string [] values = line.Split(','); 
            returnData.Add(new CvsData(){ 
               ID =int.Parse(values[0]), 
               Nazwa =(values[1]), 
               Cena =decimal.Parse(values[2]), 
               Ilosc =int.Parse(values[3]), 
               Data =DateTime.Parse(values[4]), 
               Imie =(values[5]), 
            }); 
         } 
         re.Close(); 
        } 
      return returnData; 
    } 
}
{% endhighlight %}

&nbsp;
<div class="csharp" style="font-family: consolas,;"><span style="font-family: arial;">This is a very simple example. Created just for fun and to demonstrate basics of T4, Check the </span><a href="http://www.olegsych.com/2007/12/text-template-transformation-toolkit/"><span style="font-family: arial;">Oleg Sych</span></a><span style="font-family: arial;"> site for more info and tutorials. He has created a bunch of great materials about T4. </span></div>
I will definitely spend more time playing/learning the T4 engine.

Code was generated with the <a href="http://qbnz.com/highlighter/">GeSHI</a>
