---
layout: post
title: DBViewEngine in Asp.Net Mvc
date: 2012-01-22 15:36
author: Michal Franc

comments: true
categories: []
---
<p align="justify">I have been working on a simple side project. It is a idea of View Engine that uses Database in order to get Views. It is maybe not so useful scenario, but a good one to learn more about inner workings of Asp.Net MVC and also <strong>NoSql</strong> databases. There is a  big hype around <strong>NoSql</strong>. I will use <strong>RavenDB</strong> because this implementation is very close to .<strong>Net</strong> community.</p>
<p align="justify">First we will explore <strong>ViewEngines</strong> and <strong>HTML</strong> response generation,then we will move into the custom View Engine World. If you are interested dear reader then “Stay while and listen …” <img class="wlEmoticon wlEmoticon-openmouthedsmile" style="border-style: none;" src="http://www.mfranc.com/wp-content/uploads/2012/01/wlEmoticon-openmouthedsmile.png" alt="Open-mouthed smile" /></p>

<h2>ViewEngine</h2>
<strong>ViewEngine</strong> is responsible for <strong>HTML</strong> generation that is sent back to the client. Programmers with <strong>Asp.Net</strong> background should be familiar with <strong>WebForms</strong> Engine that uses <strong><% %> syntax</strong> and <strong>WebControls</strong> . There are other <strong>ViewEngines</strong> like <strong>RazorEngine</strong>, which is quite popular right now, but we won’t discuss this here as it is not important for this post.

&nbsp;

<a href="http://www.mfranc.com/wp-content/uploads/2012/01/image.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border-width: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/01/image_thumb.png" alt="image" width="574" height="240" border="0" /></a>
<h3 align="center"><span style="font-weight: bold;">Pic 1. Simplified Request/Response cycle</span></h3>
&nbsp;

Every  <strong>ViewEngine</strong> implements <strong>IViewEngine</strong> interface

{% highlight csharp %}
  public interface IViewEngine
  {
    ViewEngineResult FindPartialView(ControllerContext controllerContext, string partialViewName, bool useCache);
    ViewEngineResult FindView(ControllerContext controllerContext, string viewName, string masterName, bool useCache);
    void ReleaseView(ControllerContext controllerContext, IView view);
  }
{% endhighlight %}

This interface contains method responsible for <strong>ViewEngineResult</strong> generation,

<strong>ViewEngineResult </strong>class is a simple data container<strong> </strong>holding information about <strong>ViewEngine</strong> we are using and instance of <strong>View</strong> class.

<strong>View </strong>class is an implementation <strong>IView</strong> interface which is very simple and contains only one method.

{% highlight csharp %}
  public interface IView
  {
    void Render(ViewContext viewContext, TextWriter writer);
  }
{% endhighlight %}

This is a very simple interface  that contains <strong>Render</strong> method which has access to <strong>TextWriter</strong> that should be used to write data that will be displayed in a response sent back to client. This is almost like <strong>Render </strong>method inside <strong>WebControls.</strong>

<strong>Ok lets go back to </strong>ViewEngine.<strong> </strong>Unfortunately, or to be honest that is a very good decision,<strong> WebFormViewEngine </strong>is not directly implementing <strong>IViewEngine.</strong>

There is another layer in form of <strong>VirtualPathProviderViewEngine. </strong>This class is implementing <strong>IViewEngine </strong>and is responsible for adding “physical path” support, if you want to use files stored on your server’s file system you should create custom <strong>ViewEngine</strong> that extends this class.
<h4>Summarising:</h4>
<a href="http://www.mfranc.com/wp-content/uploads/2012/01/image1.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border-width: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/01/image_thumb1.png" alt="image" width="466" height="252" border="0" /></a>
<h3 align="center"><span style="font-weight: bold;">Pic 2. Simplified WebFormsViewEngine Request/Response</span></h3>
<h2></h2>
<h2>Simple Custom ViewEngine</h2>
Ok so we <strong>“hopefully” </strong>know how the whole <strong>ViewEngine</strong> stuff works, so lets do our own one. <strong>Yey \o/</strong>

Our first <strong>ViewEngine</strong> will be very simple and we will call it <strong>HelloWorldViewEngine</strong>.

{% highlight csharp %}
    public class HelloWorldViewEngine : IViewEngine
    {
        public ViewEngineResult FindPartialView(ControllerContext controllerContext,
             string partialViewName, bool useCache)
        {
            return new ViewEngineResult(new HelloWorldView(), this);
        }
        public ViewEngineResult FindView(ControllerContext controllerContext,
              string viewName, string masterName, bool useCache)
        {
            return new ViewEngineResult(new HelloWorldView(), this);
        }
        public void ReleaseView(ControllerContext controllerContext, IView view)
        {
            IDisposable disposable = view as IDisposable;
            if (disposable == null)
                return;
            disposable.Dispose();
        }
    }
{% endhighlight %}

<strong>ReleaseView </strong>method is a copy/paste code from Microsoft Code. As you can see this method should be used to dispose <strong>View</strong> instance.

<strong>FindPartialView</strong> and <strong>FindView</strong> methods are only returning <strong>DummyViewEngineResult</strong>. Unfortunately we had to create our own implementation of <strong>IView </strong>interface called <strong>HelloWorldView</strong> because <strong>WebFormView </strong>uses physical files and I couldn’t get it  to render something.

{% highlight csharp %}
    public class HelloWorldView : IView
    {
        public void Render(ViewContext viewContext, TextWriter writer)
        {
            writer.WriteLine("Hello World");
        }
    }
{% endhighlight %}

This View is very simple and prints out only <strong>“Hello World”</strong> message. Cool<img class="wlEmoticon wlEmoticon-smilewithtongueout" style="border-style: none;" src="http://www.mfranc.com/wp-content/uploads/2012/01/wlEmoticon-smilewithtongueout.png" alt="Smile with tongue out" />

In order to use this <strong>“awesome” ViewEngine</strong> we have to register it inside<strong> Global.asax</strong> file.

{% highlight csharp %}
protected void Application_Start()
{
      AreaRegistration.RegisterAllAreas();
      ViewEngines.Engines.Clear();
      ViewEngines.Engines.Add(new HelloWorldViewEngine());
      RegisterRoutes(RouteTable.Routes);
}
{% endhighlight %}

First we are clearing all the Engines that are currently used and then we are adding our own custom one.

Hopefully on the start you will see beautiful <strong>“Hello World”</strong> message <img class="wlEmoticon wlEmoticon-smile" style="border-style: none;" src="http://www.mfranc.com/wp-content/uploads/2012/01/wlEmoticon-smile.png" alt="Smile" />.

&nbsp;
<h2>DBViewEngine</h2>
I  will make Database based on RavenDB just 4fun and in order to use it for the first time.
<h4>RavenDB ?</h4>
<blockquote><a href="http://ravendb.net/documentation/docs-what-is-raven">Raven is a .NET Linq enabled Document Database, focused on providing high performance, schema-less, flexible and scalable NoSQL data store for the .NET and Windows platforms.</a></blockquote>
In short <strong>NoSql</strong> :
<h5>Pros</h5>
<ul>
	<li>Good when your app is used for many Reads</li>
	<li>Scalability benefits</li>
	<li>No strict schema&nbsp;</li>
	<li>Less problems with data mappings</li>
</ul>
<h5>Cons</h5>
<ul>
	<li>Bad when your app is used for many Writes</li>
</ul>
I won’t get into details about <strong>RavenDB </strong>so lets start implementing our first version of <strong>DBViewEngine.</strong>
<h4>RavenDB DAL</h4>
In order to retrieve data we will make a simple <strong>DAL.</strong>
<h3></h3>
<h5>Page Entity</h5>
For this simple scenario we are persisting objects only with <strong>ViewName</strong> and <strong>HTML </strong>data.

{% highlight csharp %}
    public class Page
    {
        public string Html { get; set; }
        public string ViewName { get; set; }
    }
{% endhighlight %}

Html is an actual data that will be rendered by browser.
<h5>GetPageByViewName</h5>

{% highlight csharp %}
       public Page GetPageByViewName(string viewName)
        {
            using (var session = _store.OpenSession())
            {
                return session.Query<Page>().Where(x => x.ViewName == viewName).FirstOrDefault();
            }
        }
{% endhighlight %}

A simple function to get page by viewname this one will be used by the engine to get the data about the page.

&nbsp;

<a href="http://www.mfranc.com/wp-content/uploads/2012/01/image2.png"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0px; border-width: 0px;" title="image" src="http://www.mfranc.com/wp-content/uploads/2012/01/image_thumb2.png" alt="image" width="244" height="126" border="0" /></a>

In DB we gonna store two pages <strong>About </strong>and <strong>Home. </strong>They will only display simple message like “Welcome to the about page”.
<h5>ViewEngine</h5>
So now the best part. How to link <strong>ViewEngine</strong> with <strong>DB.</strong>

IViewEngine interface has a definition of <strong>FindView</strong> method. This method has all the data we want right now including <strong>ViewName</strong> parameter. So let’s implement this method.

{% highlight csharp %}
        public ViewEngineResult FindView(ControllerContext controllerContext,
                string viewName, string masterName, bool useCache)
        {
            var page = new PageDal().GetPageByViewName(viewName);
            return new ViewEngineResult(new DBView(page), this);
        }
{% endhighlight %}

Little test:

<strong>Url</strong> - <strong>/Home/About </strong>

And yuppi we have a message indicating that this is a correct site.

<a href="https://github.com/Michal Franc
ik/DBViewEngine">Source Code</a>
<h2>Conclusion</h2>
Asp.Net MVC architecture is quite easy to modyfi and extend. In this post we analysed how we can implement our different <strong>ViewEngine</strong> which is using <strong>RavenDB</strong> as a source<strong> </strong>of the files,
