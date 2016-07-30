---
layout: post
title: FluentNHibernate–Testing
date: 2011-04-23 20:05
author: LaM
comments: true
categories: [FluentNHibernate, NHibernate, Uncategorized]
---
<h1 align="justify"></h1>
<h3 align="justify">FluentNHibernate</h3>
<p align="justify"></p>
<p align="justify">FluentNhibernate framework provides easy way to define mappings in NHibernate. You don’t need to create complex xml files , instead you can use C# syntax and write the code in the “.cs” file. FluentNH generates cfg from it.</p>
<p align="justify">Just to show you how this is simple check this class mapping,</p>

<pre class="lang:default decode:true">        public GroupModelMap()
        {
            Id(x =&gt; x.ID);
            Map(x =&gt; x.GroupName).Not.Nullable();

            //One
            References(x =&gt; x.GroupType).Not.LazyLoad();

            //Many
            HasMany(x=&gt;x.Users);           
        }</pre>
<p align="justify">Mapped class looks like this :</p>

<pre class="lang:default decode:true">    public class GroupModel 
    {
        public virtual int ID { get; private set; }
        public virtual string GroupName { get; set; }

        public virtual GroupTypeModel GroupType { get; set; }
        public virtual IList&lt;ProfileModel&gt; Users { get; set; }

    }</pre>
<p align="justify">Every property needs to be marked as virtual and every mapped class needs ID property. It’s just simple as that. There are many options you can use. But I wont go into details in this post. If you want to try it just check the <a href="http://fluentnhibernate.org/">site</a>.</p>
<p align="justify">In this post ,I want to show you other aspects of FluentNHibernate , that can make your life easier. FluentNH is not only about mappings anymore it provides lots of more functionalities.</p>
<p align="justify"></p>

<h3 align="justify">In Memory Testing</h3>
<p align="justify"></p>
<p align="justify">When testing NHibernate layer , it is a good way to use database stored in memory. Unit tests should be isolated , so by running tests on Database Engine you break this rule.</p>
<p align="justify">For InMemory DB  , I  prefer the SqlLite database engine. Its quite good and FluentNH has a good “out of box” support for it. Creating InMemory DB can be a painful experience. You can encounter various problems and one of them is session management. With InMemory DB when session is closed data is deleted from memory and you don’t have access to data. In one of the projects , I have implemented my own mechanism based on the <a href="http://www.maciejaniserowicz.com/">Maciej Aniserowicz samples</a>. It worked fine, but also required a lot of testing and improving.</p>
<p align="justify">Fortunately for us Fluent NH provides mechanism for creating the session object leaving you problem of implementing the tests. We just need to provide the SqlLite configuration.</p>
<p align="justify">Something like :</p>

<pre class="lang:default decode:true ">_configuration = Fluently.Configure()
                  .Database(() =&gt; SQLiteConfiguration.Standard.InMemory().ShowSql())
                  .Mappings(x =&gt; x.FluentMappings.AddFromAssembly(typeof(ProfileModel).Assembly))
                  .BuildConfiguration();</pre>
&nbsp;
<p align="justify">Then you can create session and use it for tests.</p>

<pre class="lang:default decode:true">var sessionSource = new SingleConnectionSessionSourceForSQLiteInMemoryTesting(configuration);

ISession session = sessionSource.CreateSession()</pre>
<h3 align="justify">Testing Nhibernate Mappings</h3>
<p align="justify">In unit test world with ORM layers it is good idea to test mappings. Writing your own tests can be a mundane and boring task. FluentNHibernate provides  a way to test it quite simply.</p>
<p align="justify">You can use the PersistenceSpecification class</p>

<pre class="lang:default decode:true">new PersistenceSpecification&lt;ForumModel&gt;(session, new IDEqualityComparer())
       .CheckProperty(c =&gt; c.Name, "test")
       .CheckProperty(c =&gt; c.Author, "test")
       .CheckList&lt;TopicModel&gt;(c =&gt; c.Topics,
                   new List&lt;TopicModel&gt;() 
                        { 
                            new TopicModel(){ Text="test"}
                        }
                   )
        .VerifyTheMappings();</pre>
<p align="justify">This class performs:</p>

<ul>
	<li>
<div align="justify">create ForumModel instance</div></li>
	<li>
<div align="justify">insert this instance to DB</div></li>
	<li>
<div align="justify">retrieve it</div></li>
	<li>
<div align="justify">and verify if returned data is correct</div></li>
</ul>
<p align="justify">Besides the session parameter this class can take Comparer class which defines the your own comparison idea .</p>
<p align="justify">Look at this example. In one of the projects , I am performing comparison based on the unique ID to check if Reference is correct.</p>

<pre class="lang:default decode:true  crayon-selected">    public class IDEqualityComparer : IEqualityComparer
    {
        new public bool Equals(object x, object y)
        {
            #region Comparer

            if (x == null || y == null)
            {
                return false;
            }
            if (x is IModel &amp;&amp; y is IModel)
            {
                return ((IModel)x).ID == ((IModel)y).ID;
            }

            return x.Equals(y); 
            #endregion
        }

        public int GetHashCode(object obj)
        {
            throw new NotImplementedException();
        }
    }</pre>
<p align="justify">IModel is used here to shorten the code. It contains only ID property. Every model class implements it.</p>
<p align="justify">More info</p>
<p align="justify"><a href="http://wiki.fluentnhibernate.org/Persistence_specification_testing">http://wiki.fluentnhibernate.org/Persistence_specification_testing</a></p>
