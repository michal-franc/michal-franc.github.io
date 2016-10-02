---
layout: post
title: OAPT - "One Assert Per Test"
date: 2013-02-06 16:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [tdd]
---
In <a href="http://www.mfranc.com/unit-testing/good-unit-test-one-assert/">previous posts</a> we discussed the problem with multiple asserts in the unit test. One of the reasons to create test with only single assert was "Unit Test Misinformation". 

One of the readers of my blog remainded me in the comments that there are frameworks that can help in a situation like this. One example of such a framework is <a href="http://rauchy.net/oapt/">One Assert Per Test - OAPT</a>

What does it do.

<blockquote>Oapt saves you this trouble by running your unit tests several times, each time using one assert and ignoring the rest.</blockquote>

Quite cool idea, that can save a lot of trouble.

 Still I think that unit test should only contain one assert whenever possible. When it's not, frameworks like this are quite helpfull :)
