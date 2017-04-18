---
layout: post
title: Code Review - C# Code
summary: Interesting code review of less complex code.
date: 2017-04-17 10:00
author: Michal Franc
comments: true
categories: [tech]
tags: [code-review]
image: code_review.jpeg
---

A brief Code Review for a friend - C# code.

{% highlight csharp %}
        public IEnumerable<GitHubUser> FavoritesList()
        {
            CookieHelper cookieHelper = new CookieHelper(this.HttpContext);
            HttpCookie httpCookie = cookieHelper.SetAndGetHttpCookies();
            MyCookie myCookie = new MyCookie()
            {
                ID = Convert.ToInt32(httpCookie["Id"])
            };
            List<GitUser> favoritesList = new List<GitUser>();

            using (var db = new GitHubContext())
            {
                var results = (from ch in db.CookiesHistory
                               where ch.UserId == myCookie.ID
                               select new { GitUserId = ch.GitUserId });

                foreach (var result in results)
                {
                    var user = (from u in db.GitUsers
                                where u.Id == result.GitUserId
                                select new { u }).First();

                    favoritesList.Add(user.u);
                }
            }

            return favoritesList;
        }
{% endhighlight %}

Looks like a trivial code. Where to start? Context! Context is king. It will be obvious but first, you need to ask questions:

* **What are you trying to achieve here?**
* **What are the requirements?**

This function returns a list of Github favourited users. On Github, there is an ability to follow users.

It is the best start of every code-review process. A person asking for review already knows those answers. It would be a waste to try to discover this by yourself. 

Initial Observations:

* **I see GIT** - but there is no GitHub API client call?.
* **LINQ** - indicates that we are doing some queries.  
* **Context keyword** - Entity Framework - ORM to access Data.  
* **HttpContext and Cookies** - executed in ASP.NET scope
* **Function** - without params returning a list of 'favourites'

Questions:

* **Where is the call to Github Api?** - There is a snahpsho of Github data stored in external data store. 

### Naming convention

The ideal code is the one that is easy to grasp. I do like the KISS principle here pragmatic approach. Simple but elegant code triumphs everything. I want to read my code like a book with a narrative. There is a certain mechanism that we can use to make the code 'read' better. Starting with the function name.

{% highlight csharp %}
public IEnumerable<GitHubUser> FavoritesList()
{% endhighlight %}

This is not enough, it doesn't tell me anything. 

{% highlight csharp %}
public IEnumerable<GitHubUser> FavouriteGitHubUsers()
{% endhighlight %}

Better but ... GitHub doesn't have a concept of favourites. There is a concept of Followed users.

{% highlight csharp %}
public IEnumerable<GitHubUser> FollowedGitHubUsers()
{% endhighlight %}

It is important to name functions correctly, taking into account business language. DDD experts might call it ubiquitous language. Word 'Favourite' will confuse GitHub domain experts familiar with the different term. This confusion equals lost time and in the end money. Don't create new names and when you need to 'invent' new word or convention. Discuss it. Ask domain experts and teammates. Maybe there is already a name for that functionality or piece of code? **Just like we strive to create simple shortcode we should also try to keep our domain vocabulary clean, simple and ubiquitous.**

### Parameterless functions

For me, function without parameters is an anti-pattern. Yes, there are certain scenarios that it might be useful, but those are very rare and mostly related to already broken 'design'. If the function doesn't have any params then what does it do? Where does it take the input, state? It could a global one, but that is an antipattern too. Functions need input and output and should be 'pure'. A pure function is a nice concept, I learned while exploring Functional programming.

> A pure function is a function where the return value is only determined by its input values, without observable side effects. This is how functions in math work: Math.cos(x) will, for the same value of x , always return the same result.

Current function is not pure due to global state in form of Cookie and reliance on HTTPContext. My friend tried to hide the logic to access them in CookieHelper, but that is not enough. The problem is still there. In Asp.NET, use HTTPContext outside the function. It shouldn't leak to the inside. Current code can't work in different context. If we execute it in the process without global HTTPContext it will break. 

There is another anti-pattern here, new keyword. Try to inject as many things as possible. This advice can be used incorrectly but Dependancy Injection is your friend don't ignore it. 

A closer look at the code shows that CookieHelper gives access to myCookie.ID. We can remove all this logic from this function by introducing a function param ID. 

{% highlight csharp %}
public IEnumerable<GitHubUser> FollowedGitHubUsers(int cookieId)
{% endhighlight %}
        
We don't care where the cookieId value is coming from. This gives more options as we can get the cookieId from other sources, not only Cookie.

**Code after changes**

{% highlight csharp %}
        public IEnumerable<GitHubUser> FollowedGitHubUsers(int userId)
        {
            List<GitHubUser> favoritesList = new List<GitHubUser>();

            using (var db = new GitHubContext())
            {
                var results = (from ch in db.CookiesHistory
                               where ch.UserId == userId 
                               select new { GitUserId = ch.GitUserId });


                foreach (var result in results)
                {
                    var user = (from u in db.GitUsers
                                where u.Id == result.GitUserId
                                select new { u }).First();

                    favoritesList.Add(user.u);
                }
            }

            return favoritesList;
        }
{% endhighlight %}

We gained some 'clarity' and I no longer have to worry about Cookies.

### Divide the code to separate functions

There are two queries to DB, both using the same Context. I want to have code that looks like this.

{% highlight csharp %}
        public IEnumerable<GitHubUser> FollowedGitHubUsers(int userId)
        {
            using (var db = new GitHubContext())
            {
                var followedUserIds = this.GiveMeFollowedUsersIdFor(db, userId); 
                return this.FindUsers(db, followedUsersIds);
            }
        }
{% endhighlight %}

Isn't that lovely and simple? All of this thanks to extraction of functions. It is now super easy to read. On this level, I don't care how I am getting users. All I need to see is the 'orchestration' of some functions and input. If I need more details I can jump into this function.

{% highlight csharp %}
        private IEnumerable<GitHubUser>FindUsers(GitHubContext db, IEnumerable<int> userIds)
        {
                List<GitHubUser> favoritesList = new List<GitHubUser>();

                foreach (var id in userIds)
                {
                    var user = (from u in db.GitUsers
                                where u.Id == id
                                select new { u }).First();

                    favoritesList.Add(user.u);
                }
            }

            return favoritesList;
        }
{% endhighlight %}

Jumping into this function also gives me a simpler picture. There is a clear input and output. I don't have to worry about anything else but query here. Simple small functions give more clarity and help the brain to digest information. With smaller functions, we have to worry about the smaller number of lines of code. With clear input and output, we can establish scope and context. There is no cookie helper here, there is no need to bother where do we get the userId from. We hid all the complexity and can concentrate on the important stuff. There is a lot less noise in functions like this.


There are more issues in this code, help me find more :)
