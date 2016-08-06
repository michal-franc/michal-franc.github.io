---
layout: post
title: Faking ModelState.IsValid–unit tests in Asp.Net Mvc
date: 2011-05-22 20:47
author: Michal Franc

comments: true
categories: []
---
<p align="justify">As a part of my thesis , I am creating web app in Asp.net MVC. I m using <a href="http://nhforge.org/Default.aspx">NHibernate</a> , <a href="http://www.nunit.org/">NUnit</a> , <a href="https://github.com/hibernating-rhinos/rhino-mocks">RhinoMocks</a> , <a href="http://msdn.microsoft.com/en-us/netframework/aa663324">WCF</a> , <a href="http://ninject.org/">Ninject</a> , <a href="http://www.nuget.org/List/Packages/Glimpse">Glimpse</a> and also <a href="https://code.google.com/p/elmah/">Elmah</a> . This is a quite big project with a lot of unit tests. I am treating it as a playground.</p>
<p align="justify">This is the the first post o  of a series about using unit tests with <a href="http://www.asp.net/mvc">MVC</a> and <a href="http://msdn.microsoft.com/en-us/netframework/aa663324">WCF</a> .</p>
<p align="justify">Create entity action scenario in my app is simple. First there is a get action which builds View and prepares model. Then this newly created model (filled with values from the view)  is passed to action with <strong>[HttpPost]</strong> attribute. It is a good practice to if  <strong>ModelState.IsValid </strong>before performing any DB operations.</p>
<p align="justify">I have a lot of tests testing controllers and their action. In this case on of the tests should check behaviour of the controller when the <strong>ModelState.IsValid</strong> value is false. I have tried different approaches : trying to mock controller , trying to mock its context , inspecting code with <a href="http://www.jetbrains.com/decompiler/">dotPeek</a> (cool decompiler from the JetBrains) wasn’t helpfull.  Then I realized that you can do something like this.</p>


{% highlight csharp %}
//Faking ModelState.IsValid = false           
  CourseController.ModelState.Add("testError", new ModelState());     
  CourseController.ModelState.AddModelError("testError", "test");
{% endhighlight %}


{% highlight csharp %}
[Test]  
 public void Post_if_model_state_invalid_then_dont_add_course_and_return_error_view()   
{       
      #region Arrange   

       //Faking ModelState.IsValid = false      
       CourseController.ModelState.Add("testError", new ModelState());
       CourseController.ModelState.AddModelError("testError", "test");   

        using (Mock.Record()) 
        {    
             Expect.Call(CourseService.AddCourse(Course)).Repeat.Never();    
         }  
         #endregion    

         #region Act        
        ViewResult view;      
         using (Mock.Playback())   
          {   
              view = (ViewResult)CourseController.Create(Course);   
          }  
           #endregion    
           #region Assert    
           Assert.That(view.ViewName,Is.EqualTo("Error"));  
           Assert.That(view.ViewBag.Error, Is.EqualTo(elearn.Common.ErrorMessages.Course.ModelUpdateError));  

           #endregion  
       }
{% endhighlight %}

As you can see ,  I am modifying ModelState by injecting fake data that will result in <strong>IsValid</strong> property set to false.
