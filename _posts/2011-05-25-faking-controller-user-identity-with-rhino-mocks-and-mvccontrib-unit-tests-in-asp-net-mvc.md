---
layout: post
title: Faking Controller User.Identity with Rhino Mocks and MvcContrib. Unit Tests in Asp.Net Mvc
date: 2011-05-25 20:46
author: LaM
comments: true
categories: [asp.net mvc, mvc contrib, rhino mocks, Uncategorized]
---
<p align="justify">Some of the actions that we are writing in Asp.Net <a href="http://www.asp.net/mvc">MVC</a> contains logic which uses data from the <strong>User </strong>context eg. user authentication or user name. <strong>Controller </strong>base class contains <strong>User</strong> property which is the instance of  <strong>IPrincipal</strong> with two important properties.</p>

<pre class="lang:default decode:true">User.Identity.Name
User.Identity.IsAuthenticated</pre>
<p align="justify">The <strong>IPrincipal </strong>is taken from the <strong>HttpContext</strong></p>

<pre class="lang:default decode:true">    public IPrincipal User
    {
      get
      {
        if (this.HttpContext != null)
          return this.HttpContext.User;
        else
          return (IPrincipal) null;
      }
    }</pre>
<p align="justify">So if your action is using the <strong>User  </strong>property directly (you can always wrap this property inside a class that implements mockable <strong>Interface</strong> ) there is a problem with unit testing. In a isolated enviroment like test case , <strong>Controller</strong> doesn’t have the <strong>HttpContext</strong>. It is an external dependency.</p>
<p align="justify"><strong>HttpContext </strong>is retrieved from the <strong>ControllerContext</strong></p>

<pre class="lang:default decode:true">    public HttpContextBase HttpContext
    {
      get
      {
        if (this.ControllerContext != null)
          return this.ControllerContext.HttpContext;
        else
          return (HttpContextBase) null;
      }
    }</pre>
<p align="justify">In order to fake the <strong>User </strong>property First we need to create a fake  <strong>ControllerContext. </strong>To create it we need  <strong>HttpContext  </strong>which also needs <strong>HttpRequest. </strong><strong> </strong>User is created from <strong>IPrincipal</strong> and <strong>IIdentity ,</strong> with those classes we can create a<strong> Stub </strong>inside the<strong> HttpContext</strong>.</p>
<p align="justify">Yep , It’s quite complicated. Fortunately <a href="http://mvccontrib.codeplex.com/">MvcContrib</a> Library helps a little by providing classes that are faking <strong>IIdentity</strong> and <strong>IPrincipal</strong></p>
<p align="justify">If you want to create a fake user you just need to write</p>

<pre class="lang:default decode:true">var user = new FakePrincipal(new FakeIdentity(userName),null);</pre>
<p align="justify">When creating <strong>FakeIdentity</strong> <strong>userName</strong> <strong>parametr</strong> is really important. If you want ,not authenticated user , pass <strong>Empty String as a parameter</strong></p>

<pre class="lang:default decode:true">var user = new FakePrincipal(new FakeIdentity(String.Empty), null);</pre>
<p align="justify"></p>
<p align="justify">Yey , it’s the end ! Check out this simple graph.</p>
<p align="justify"><a href="http://lammichalfranc.files.wordpress.com/2011/05/image.png"><img style="background-image: none; padding-left: 0; padding-right: 0; display: inline; float: left; padding-top: 0; border-width: 0; margin: 0 0 5px;" title="image" src="http://lammichalfranc.files.wordpress.com/2011/05/image_thumb.png" alt="image" width="565" height="301" align="left" border="0" /></a></p>


<p>Using this information , I have implemented simple <strong>TestHelper</strong> with methods to generate Fake <strong>ControlleContext</strong> with faked <strong>User.</strong></p>

<pre class="lang:default decode:true">  public static class TestHelper
    {
        public static ControllerContext MockControllerContext(Controller controller)
        {
            var httpContext = MockRepository.GenerateMock&lt;HttpContextBase&gt;();
            var httpRequest = MockRepository.GenerateMock&lt;HttpRequestBase&gt;();
            httpContext.Stub(x =&gt; x.Request).Return(httpRequest);
            return new ControllerContext(httpContext,new RouteData(),controller);
        }

        public static ControllerContext WithAuthenticatedUser(this ControllerContext context, string userName)
        {
            var user = new FakePrincipal(new FakeIdentity(userName),null);
            context.HttpContext.Stub(x =&gt; x.User).Return(user);
            return new ControllerContext(context.HttpContext,new RouteData(),context.Controller);
        }

        public static ControllerContext WithNotAuthenticatedUser(this ControllerContext context)
        {
            var user = new FakePrincipal(new FakeIdentity(String.Empty), null);
            context.HttpContext.Stub(x =&gt; x.User).Return(user); 
            return new ControllerContext(context.HttpContext, new RouteData(), context.Controller);
        }
}</pre>
<p align="justify"><strong>Usage:</strong></p>

<pre class="lang:default decode:true">ProfileController.ControllerContext =
TestHelper.MockControllerContext(ProfileController).WithAuthenticatedUser("test");</pre>
Hope this sample helps.
