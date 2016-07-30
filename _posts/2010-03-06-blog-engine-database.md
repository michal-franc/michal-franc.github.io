---
layout: post
title: BlogEngine .Net + Database
date: 2010-03-06 16:11
author: LaM
comments: true
categories: [.net, c#, sql, Uncategorized]
---
<div>

In the future i m planning to redeploy my blog on BlogEngine.Net and because in my <a href="http://www.grupaeka.pl">.Net Group</a> we are making a site also on this engine i m going to explain / write about this great platform. I think that this post could lead to a thematic series about mechanism in BlogEngine .Net

The engine has a nice architecture and you can learn a lot from it. There are lot of design patterns in practical use.
<h2>Let'sStart with BlogEngine DataSource.</h2>
Databases are one of the typical choices when we want to store all kinds of data. Comments , Posts , UserData etc.  nowadays almost everything is stored in Databases. Smae goes for BlogEngine .Net. There is also a different DataStore available , XML stored data , this aproach uses XML files. :et'sleave this interesting approach for a later post.

There are a lot of DataBase Engines available. We can use MSSql , MySql , OracleDb etc. They are based on official <a href="http://en.wikipedia.org/wiki/SQL">SQL specification</a>. Of course when there is a big competition on the market there are different ideas and implementations. Every Engine has its own unique featuers and solutions almost their own original language.
<blockquote><address>Detailed Comparision :  <a href="http://troels.arvin.dk/db/rdbms/">Comparison of different SQL implementations</a> <a href="http://www.postgresonline.com/journal/index.php?/archives/51-Cross-Compare-of-SQL-Server,-MySQL,-and-PostgreSQL.html">CROSS COMPARE OF SQL SERVER, MYSQL, AND POSTGRESQL</a></address></blockquote>
<address> </address><address> </address><address><a href="http://lammichalfranc.files.wordpress.com/2010/03/strona-ze-zrodlem-danych.jpg"><img class="aligncenter" title="Strona ze zrodlem danych" src="http://lammichalfranc.files.wordpress.com/2010/03/strona-ze-zrodlem-danych.jpg" alt="" width="450" height="206" /></a></address>Fortunately core of the SQL standard is solid. It is a basis upon which concrete technologies are built. We can create universal "code" based on the standard which will run on every technology. This is very important , we can create independet code.  Remember ......
<blockquote>"<em>Program to an 'interface</em>', <em>not an 'implementation</em>'." (Gang of Four 1995:18)</blockquote>
If you are programming to concrete implementation you are asking yourself for problems in the near future.

BlogEngine's database code is based on the Abstract Factory pattern. The Factory creates specific implementation by analyzing parameters in Connection String. The implementation contains concrete methods to specific DataBase implementation. Everything is nicely "wrapped" in Provider Factory. The Provider class defines the interface , common methods for every provider. This creates an abstraction layer between our program logic and Data Source.

<a href="http://en.wikipedia.org/wiki/Abstract_factory_pattern">Abstract Factory</a> is a design pattern , which conceals the "creation" logic of the object. Factory returns wrapped object based on the parameters. In our case we are getting generic object used to comunicate with every Database. We doesn't have to worry about its implementation. It is hidden and should be. We should be interested only on the interface which is the same for every class.

The Provider Factory is creating DBProviderFactory Object which is used to create  Connection and Command. Those are abstract objects. Their role is to delegate our task to objects which are inheriting from them.

The Concrete implementation of MSSQL logic , in the SQLCommand , inherits from DBCommand. By using the Down Cast it changes our "general" DBCommand class to more concrete and specific Object SQLCommand. By changing the Provider we are just changing the inherited class which is hidden behind the DBCommand
<pre>string connString=ConfigurationManager.ConnectionStrings[connStringName].ConnectionString; 

string providerName = ConfigurationManager.ConnectionStrings[connStringName].ProviderName; 

DbProviderFactory provider = DbProviderFactories.GetFactory(providerName); 
using (DbConnection conn = provider.CreateConnection())
   {
     conn.ConnectionString = connString; 
         using (DbCommand cmd = conn.CreateCommand()) 
           {   
             using (DbDataReader rdr = cmd.ExecuteReader()) 
              {        
               // Reading Logic        
              }        
             cmd.ExecuteNonQuery();         
             //itd     
           } 
    }</pre>
GetFactory methods decides on which provider to return back based on the parameter in Connection String. Provider creates his specific Connection and Command.

We are not using concrete classes like SQLConnection or SQLcommand everything is wrapped on more  general objects  DBConnection and DBCommand .

<a href="http://lammichalfranc.files.wordpress.com/2010/03/provider-factory.jpg"><img class="aligncenter" title="provider factory" src="http://lammichalfranc.files.wordpress.com/2010/03/provider-factory.jpg" alt="" width="450" height="385" /></a>

After brief presentation i would like to to show you how to connect to DB engine. I want to create DB logic for "pools".

Let's Do It !:

In this case. I have implemented only Database logic . BlogEngine also supports XML files as a data source . To attach DB logic for our objects i have created 2 partial classes. One of them extends DbBlogProvider  class ,which contains communication logic. The BlogProvider ,class is defines common interface for both the xml and db data storing concept . This is the another abstraction layer by which we can attach differetn db data storing procedures without significant change in the existing code .

<a href="http://lammichalfranc.files.wordpress.com/2010/03/roznci-dbproviderzy1.jpg"><img class="aligncenter" title="Roznci DbProviderzy" src="http://lammichalfranc.files.wordpress.com/2010/03/roznci-dbproviderzy1.jpg" alt="" width="450" height="326" /></a>

I just had to extend the partial class with my own methods.
<pre>namespace BlogEngine.Core.Providers 
{
 public partial class DbBlogProvider: BlogProvider 
    { 
      public override bool CheckPoll(Poll poll) 
        { 
          //concrete logic
         } 
      ... 
    } 
}</pre>
After this step we  just have to use the provider mechanism in BlogEngine.
<pre>_provider = BlogEngine.Core.Providers.BlogService.Provider;

_provider.CheckPoll(poll);</pre>
</div>
