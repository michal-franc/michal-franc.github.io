---
layout: post
title: FluentNHibernate , NHibernate–Notes
date: 2011-03-30 22:30
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
<p align="justify">I m currently implementing some project using the NHibernate. I dont like the mappongs stored in xml files so I am using FluentNhiberante.</p>
<p align="justify"></p>

<h5 align="justify">1. Mapping Whole Assembly.</h5>
<p align="justify">Before discovering this feature , I created one line foreach mapping defined in the assembly. You can replace this “useless” code with the procedure to map whole assembly. FluentNH  will scan the assembly and look for classes inheriting from ClassMap<></p>


{% highlight csharp %}
 return Fluently.Configure().
    Database(MsSqlConfiguration.MsSql2008.ConnectionString("connstring"))
      .Mappings(x => x.FluentMappings.AddFromAssembly(System.Reflection.Assembly.GetExecutingAssembly()))
      .ExposeConfiguration(func)
      .BuildSessionFactory();
{% endhighlight %}

&nbsp;
<h5 align="justify">2. not null fields</h5>
<p align="justify">If you want to create some fields in the DB as “not null”. use the Not.Nullable() sequence.</p>

&nbsp;
<h5 align="justify">3. Reseting Schema for Testing</h5>
<p align="justify">I don’t know if this is a good approach but when , I am working with NH i create an instance of test database with sample data. Everytime , I am running tests i m reseting schema , filling DB with sample data and then database is erased from memory (SQLite) or the server.</p>
<p align="justify"><strong>Session Factory Class</strong></p>
<p align="justify">In my session factory Class i have methods to reset and update Schema</p>
<p align="justify"></p>


{% highlight csharp %}
 public static class SessionFactory
{
    public static ISession OpenSession()
    {
        return GetSessionFactory().OpenSession();
    }
     private static ISessionFactory GetSessionFactory()
     {
        if (_sessionFactory == null)
        {
            _sessionFactory = CreateSessionFactory(UpdateSchema);
         }
         return _sessionFactory;
     }
        private static ISessionFactory _sessionFactory;

        public static void ResetSchema()
        {
            CreateSessionFactory(ResetSchema);
        }

        private static ISessionFactory CreateSessionFactory(Action<Configuration> func)
        {

          return Fluently.Configure().
               Database(MsSqlConfiguration.MsSql2008.ConnectionString
               ("connstring"))
               .Mappings(x => x.FluentMappings.AddFromAssembly(System.Reflection.Assembly.GetExecutingAssembly()))
               .ExposeConfiguration(func)
               .BuildSessionFactory();
        }
        private static void UpdateSchema(Configuration config)
        {
            new SchemaUpdate(config).Execute(true, true);
        }

        public static void ResetSchema(Configuration config)
        {
            new SchemaExport(config).Create(true, true);
        }
{% endhighlight %}

&nbsp;
<p align="justify"><strong>4. Generic Repository</strong></p>
<p align="justify">I am the fan of the repositories used to perform all the CRUD and complex query operations. In the code I have a base repository class and complex repositories deriving from the base class.</p>


{% highlight csharp %}
public  class Repository<T> : IRepository<T>
        where T : class
    {
        public T GetById(int id)
        {
            T klient;

            klient = GetByFilter("Id",id).FirstOrDefault();

            return klient;
        }

        public IList<T> GetByFilter(string parameterName, object value)
        {
            IList<T> returnedList = null;
            using (var session = SessionFactory.OpenSession())
            {
                returnedList = session.CreateCriteria(typeof(T)).Add(Expression.Eq(parameterName, value)).List<T>();
                session.Flush();
            }
            return returnedList;
        }

        protected IList<T> GetByQuery(string query)
        {
            IList<T> returnedList = null;
            using (var session = SessionFactory.OpenSession())
            {
                returnedList = session.CreateQuery(query).List<T>();
                session.Flush();
            }
            return returnedList;
        }

      .....

    }
{% endhighlight %}

<p align="justify">Simple Repository used for most CRUD operations.</p>
<p align="justify">For more complex queries , I just create a new class deriving from the base one.</p>


{% highlight csharp %}
    public class KlientRepository : Repository<Klient>
    {
        public Klient GetByImieNazwisko(string imie, string nazwisko)
        {
            return GetByQuery(String.Format("from Klient k where k.Imie = '{0}' and k.Nazwisko = '{1}'",imie,nazwisko)).FirstOrDefault();
        }

        public IList<Klient> GetByRodzaj(string rodzaj)
        {
            return GetByQuery(String.Format("from Klient k where k.Rodzaj.Rodzaj = '{0}' ", rodzaj)).ToList();

        }
    }
{% endhighlight %}

&nbsp;
