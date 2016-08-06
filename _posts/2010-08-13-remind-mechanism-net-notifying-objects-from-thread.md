---
layout: post
title: Remind Mechanism .Net – notifying objects from the thread
date: 2010-08-13 23:14
author: Michal Franc

comments: true
categories: [.net, c#, Uncategorized]
---
In TimeIsMoney project, I am planning to add a lot of notifiers . I was looking for a mechanism but could find any solution, so I created one from the scratch.  Reminder should work on a thread not to interrupt the main application, I have created a simple  class which uses the thread to check if a condition is met on particular time.

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image19.png"><img style="display:inline;border:0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb19.png" border="0" alt="image" width="566" height="361" /></a>

Run performs a check if a specified time is met or if the option RemindWholeDay which enables the reminder all the time. There is  simple pause between balloon tips. In the future I want to implement a simple pipeline mechanisms with queue.

What’s important here is _notifiedObjects List  this  collection contains an object which is notified by the reminder.

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image20.png"><img style="display:inline;border:0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb20.png" border="0" alt="image" width="466" height="152" /></a>

Every class to be notified  implements INotified interface , which defines the IsNotified and Notify method.

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image41.png"><img style="display:inline;border:0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image4_thumb.png" border="0" alt="image" width="268" height="115" /></a>

Let's look at examples.

In TimeIsMoney project main Form has a notify Icon, which is used to show the Balloon Tips in the tray. Those tips contain various informations like a number of items still waiting to be sorted out between the lists. Form1 implements the INotfied interface and defines the methods.

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image21.png"><img style="display:inline;border-width:0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb21.png" border="0" alt="image" width="648" height="465" /></a>

As you can see IsNotified method is used to check the Count value of the items. If there are items in it return true. When the IsNotified is true the action is doing the Notify class, which shows a simple balloon tip in the tray..

This mechanism gives me the ability to create notified object just by implementing the  INotifiy interface.

Lets look at another example.

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image22.png"><img style="display:inline;border:0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb22.png" border="0" alt="image" width="584" height="467" /></a>

Notifier class  will  be used to manage all the notifiers. It operates on the reference to the Form1.notify Icon.

This class is added to the collection of reminder class.

This simple process is for some flexibility.
