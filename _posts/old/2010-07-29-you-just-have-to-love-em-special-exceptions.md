---
layout: post
title: Sharepoint - Exceptions
date: 2010-07-29 18:12
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
Today I was doing the “boring” stuff. Yeah , creating list definitions , field definitions and installing features it is … boooring. You have to “click click click”.

By the way a co-worker told me about a nice addin to Visual Studio <a href="http://blog.mikeobrien.net/2007/06/insertguid-visual-studio-2005-addin.html"> InsertGuid </a> it's quite useful.

&nbsp;

Ok so while developing I encountered an exception <strong>“cannot complete this action please try again”</strong> when <strong>SPField.Update()</strong> was called. So, I started to check recent modifications. Nothing. Checked the Iist. Nothing. Restarted the Iist. Nothing . Recreated whole site on the sharepoint. Nothing. Then while inspecting schema I realized that my ContentType Definition had a typo in its ID parameter.

It was
<strong>0x01CBC435A1D27A418DA9AB503224F75CDA</strong>
but should be
<strong>0x0100CBC435A1D27A418DA9AB503224F75CDA</strong>
4 hours wasted ...

Definitely the best one of those special Exceptions is <strong> “Unspecified Error” </strong> when calling Unmanaged classes. Very informative , elegant just cool. This one happened when I was calling Active Directory and performed a Check if a user exists which used the <strong>DirectorySearcher.FindAll()</strong> method .... couple hours wasted and solution ?? Application pool or user with permission to AD had too low security access.

Doh , You just have to love those “special” exceptions . I hope that this short post will be helpful to some poor soul trying to figure out "What the hell happened?" :D
