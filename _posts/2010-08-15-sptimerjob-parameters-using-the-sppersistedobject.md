---
layout: post
title: SPPersistedObject as SPTimerJob parameters
date: 2010-08-15 00:42
author: Michal Franc

comments: true
categories: [Programming, Sharepoint]
---
<h3>TL;DR; SPPersistedObject is a usefull class that can be used to store parameters for SPTimerJob in SPFarm.</h3>

<p align="justify">Timer Job is a very useful service available in SharePoint. You can set a function which will be executed on the specific time. This scenario is useful in many SharePoint applications. It's just like running SQL server job.</p>
<p align="justify">When working with the timer jobs, there is a little problem with parameters from the external source. Timer job doesn’t store passed parameters. In scenario, I have encountered in my job, there was a feature which was activating the <strong>TimerJob</strong>. On Feature parameters needed for the timer job were de-serialized from the xml file,  then they were passed to the timer job constructor. When executed timer job was returning the default values, not the values from the xml file.</p>
<p align="justify">I started looking for a solution, and found the <strong>SPPersistedObject</strong> class which gives us the ability to remember the parameters in <strong>SPFarm</strong>.</p>

<blockquote>
<p align="justify">The SPPersistedObject class provides a base class for all administration objects. It serializes all fields marked with the Persisted attribute to XML and writes the XML blob to the configuration database. The SPPersistedObject class contains code to serialize all its members that are base types, other persisted objects, and collections of persisted objects. Configuration data that is stored in persisted objects is automatically made available to every process on every server in the farm.</p>
</blockquote>
<p align="justify">Let's assume we have a scenario with a feature activating our timer jobs. We need to fill it with various parameters. To activate the timer job, we are using the feature receiver class, and feature activate method. First of all, we need to get our parameters to the feature receiver. I am using the serialized settings' class and an xml file. Parameters from the xml are then used to create the <strong>SPPersitedObject</strong>. Base class is doing all the work with de-serialization and serialization of data. I only had to call the proper function before job execution to get the parameters.</p>
<a href="http://lammichalfranc.files.wordpress.com/2010/08/image27.png"><img style="display: inline; border: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb27.png" alt="image" width="656" height="411" border="0" /></a>
<h2>How to use the SPPersistedObject</h2>
<p align="justify">First of all, we have to create our class with parameters. It has to extend the <strong>SPPersistedObject</strong>. Every field we want to be “persisted” should be marked by a <strong>[Persisted]</strong> attribute. We have to create the properties explicit because only fields can be marked with this Attribute after creating this class all you have to do is to create the object fill it with parameters and then save it to the <strong>SPFarm</strong>.</p>


{% highlight csharp %}
public class TimerJobSet: SPPersistedObject
{ 
   [Persisted] 
   public string siteName;

   [Persisted]
   public bool Debug;

   public TimerJobSet(string name, SPPersistedObject parent) : base(name,parent) {}}
{% endhighlight %}

<p align="justify">With this simple class, the first step is to create the Persisted Object on the <strong>SPFarm</strong>. It is really important to call the Update() method.</p>


{% highlight csharp %}
SPWeb web = properties.Feature.Parent;
SPSite site = web.Site;
SPPersistedObject parent = site.WebApplication;
CustomTimerJobSettings settings =new TimerJobSet("TimerJobSet", parent, Guid.NewGuid());
settings.Debug =false;
settings.siteName="host.com";
settings.Update();
{% endhighlight %}

<p align="justify">The object is serialized. Now while executing the <strong>Timer Job </strong> all we have to do is to get the parameters from the <strong>SPFarm.</strong></p>


{% highlight csharp %}
TimerJobSet settings =this.WebApplication.GetChild<TimerJobSet>("TimerJobSet");  string siteName = settings.SiteName;
bool debug = settings.Debug;
{% endhighlight %}

&nbsp;
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d0a11b8a-20c6-48ec-8289-da2dcea40a3a" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">

<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
That’s all. Hope this will help someone in his work. Have fun with Timer Jobs.
