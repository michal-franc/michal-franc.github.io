---
layout: post
title: Take care of your test code
date: 2016-03-01 01:32
author: LaM
comments: true
categories: [Blog]
---
<p>As developers we tend to write complicated unit tests that are hard to read and maintain. Maybe it comes from the feeling that test code is not a proper code ? There is some magic in writing 'proper' unit tests. Using word proper might not be even suitable here because how do you define 'proper'. It is the same problem as with the definition of 'unit, everyone has his own definition that depends on the context.</p>

<p>Code below feels like not 'proper'</p>

<pre class="lang:c# decode:true " >[Test]
public void IfUserIsAuthenticated_and_Admin_return_View()
{
  AuthServiceMoq.Setup(x =&gt; x.CheckAccess(It.IsAny&lt;HttpContextBase&gt;())).Returns(true);
  var sut = new Controller(service.Object, service2.Object, service3.Object, service4.Object, service5.Object, service6.Object, service7.Object)
  var result = sut.Edit(var1, var2, var3);
  Assert.That(result, Is.InstanceOf&lt;ViewResult&gt;());
}</pre>

<p>This one was found on production (slight changes applied). I don't really like the function name to start with.</p>

<p><strong>IfUserIsAuthenticated_and_Admin_return_View()</strong><br />
It looks ok but what does it really say ? It does something for scenario with authenticated user, probably an admin user and it returns some View.</p>

<p><strong>Code</strong></p>

<ul>
<li>mocks some kind of authentication service that uses HttpContext </li>
<li>sut is a controller with a nice list of dependencies </li>
<li>we do execute sut with edit and a list of variables </li>
<li>and some view is returned in the process</li>
</ul>

<p>Does this test looks good ? Does it reads really well ? I don't think so. The mocking logic, as usual, is making it complicated. Creation of the sut is also full of surprises with its number of dependencies.</p>

<p><strong>Improvement</strong></p>

<pre class="lang:c# decode:true " >public void EditView_is_accessible_to_authorized_user_of_admin_type()
{
   var sut = CreateSutWithAuth(isAuthorized: true, UserType.Admin);
   var result = sut.Edit(_, _, _);  
   Assert.True(HasAccess(result));
}</pre>

<p><strong>EditView_is_accessible_to_authorized_user_of_admin_type()</strong><br />
Not perfect but better, clear message on what is happening here.</p>

<p><strong>Code</strong></p>

<ul>
<li>Sut creation is hidden behind the helper class with an 'interface' exposing only important bits. I need to control if the user is authorized and what kind of type he is to perform this test</li>
<li>Edit call is very simple with variables that are not affecting test are hidden behind variable '_'. This is usefull technique to hide non important parts of the code</li>
<li>Check for the access is hidden behind custom assertion. We don't need to expose details here.</li>
</ul>

<p>Simple changes yet making a huge difference.</p>

