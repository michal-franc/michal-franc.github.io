---
layout: post
title: Asp .Net Mvc [Authorize] over Wcf – Role Check
date: 2011-05-01 16:27
author: Michal Franc

comments: true
categories: [asp.net mvc, Uncategorized, wcf]
---
<p align="justify">In Asp.Net MVC you can attach various attributes to the controllers actions. One of them is <strong><a href="http://msdn.microsoft.com/en-us/library/system.web.mvc.authorizeattribute.aspx">Authorize</a></strong> which is used to managed access.</p>


{% highlight csharp %}
[Authorize]
public ActionResult Index()
{
    var profile = _service.GetByName(UserName);
    return RedirectToAction("Details", new { id = profile.ID });
}
{% endhighlight %}

In this example every time user runs the Index action Authorize class performs :
<ol>
<ol>
	<li>Check if user is in list of users in the <strong>Authorize User </strong>parameter.
<ul>
	<li>you can set usernames parameter</li>
	<li>
</li>
</ul>
</li>
</ol>
</ol>
<ol>
<ol>
	<li>Check if the user is logged in.</li>
</ol>
</ol>
<div>

{% highlight csharp %}
if (!user.Identity.IsAuthenticated)
{
        return false;
}
{% endhighlight %}

</div>
<ol>
<ol>
	<li>Check if user is atlest in one role definied in authorize parameters</li>
</ol>
</ol>
<div>

</div>
<ol>
<ol>
<ul>
	<li>role check looks like this</li>
</ul>
</ol>
</ol>

{% highlight csharp %}
if (!Enumerable.Any<string>(roles, new Func<string, bool>(user.IsInRole)))
{
        return false;
}
{% endhighlight %}

<p align="justify">In my scenario I have database with all the data required for the membership provider on another server. Simple methods like <strong>ValidateUser</strong> are on the wire. Default Authorize class uses the <strong>user.IsInRole</strong> which needs “local” role provider . With DB behind the service layer it won’t work at all.  I have launched <a href="http://wiki.sharpdevelop.net/ilspy.ashx">ILSpy</a> and made a little research.</p>
<p align="justify">It appears that Authorize Attribute is not sealed and you can extend its behaviors. Mehods inside class are marked as virtual so you can easily override them.</p>
<p align="justify">So here is my implementation of Authorize class over WCV. Most important part is the call <strong>service.IsUserInroles(name).</strong> Service through <strong>WCF</strong> check the roles and return boolean value.</p>


{% highlight csharp %}
    public class AuthorizeAttributeWCF : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (httpContext == null)
            {
                throw new ArgumentNullException("httpContext");
            }
            IPrincipal user = httpContext.User;
            if (!user.Identity.IsAuthenticated)
            {
                return false;
            }
            if (this.Users.Length > 0 &amp;&amp; !Enumerable.Contains<string>(this.Users.Split(','
                ), user.Identity.Name, StringComparer.OrdinalIgnoreCase))
            {
                return false;
            }
            if (this.Roles.Length > 0)
            {
                string [] roles = this.Roles.Split(',');
                var service = new ProfileService.ProfileServiceClient();
                return service.IsUserInRoles(user.Identity.Name,roles);
            }
            return true;
        }
    }
{% endhighlight %}

Method used in my service

{% highlight csharp %}
        public bool IsUserInRoles(string userName,string[] roles)
        {
            foreach (string s in roles)
            {
                if (Roles.IsUserInRole(userName,s))
                {
                    return true;
                }
            }
            return false;
        }
{% endhighlight %}

&nbsp;
