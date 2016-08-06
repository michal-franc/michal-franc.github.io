---
layout: post
title: Boids Simulation v0.0.1 – Changes
date: 2012-07-19 20:00
author: Michal Franc

comments: true
categories: [Uncategorized]
---
<p>I have made a couple of changes to Silverlight Boids project </p> <p>Functional :</p> <ul> <li>Simplified UI ( better menu)</li> <li>Ability to zoom in zoom out with ctrl+"+” , ctrl+"-”</li> <li>Load / Save Scenario ( Saved states of simulation )</li> <ul> <li>I m using <strong>Redis </strong>db to store data.</li></ul> <li>Pre defined scenarios to easily test app.</li> <li>add many <strong>boids</strong> at once</li></ul> <p>Refactorization : </p> <ul> <li>moved algorithms and calculations to new <strong>“Core” </strong>project</li> <li>replaced custom logger with <strong>NLog </strong>behind <strong>WCF service</strong></li></ul> <p>Todo :</p> <ul> <li>more cleanup, there is still big mess in some parts of the codebase</li> <li>optimize algorithms</li> <li>redesing of start page</li></ul> <p>&nbsp;</p> <p><a href="https://github.com/Michal Franc
ik/SilverlightBoids/">Check the code</a> or <a href="http://projects.mfranc.com/project/boids/run">try out app</a>.</p>
