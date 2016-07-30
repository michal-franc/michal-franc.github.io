---
layout: post
title: TimeIsMoney 0.2.2 – Colored items in ComboBox
date: 2010-08-14 16:25
author: LaM
comments: true
categories: [.net, c#, Uncategorized]
---
<span style="font-size: xx-small;"><strong>What’s New</strong></span>
<ul>
	<li>
<div><strong>0.2.2</strong></div>
<ul>
	<li>
<div>Task reminder</div></li>
	<li>
<div>Priority Graphic</div></li>
</ul>
</li>
</ul>
<strong>Task reminder </strong>

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image23.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb23.png" alt="image" width="244" height="62" border="0" /></a>

There is a new option in settings.

By selecting a task list with items to be reminded, the engine analyses the contents and notifies the user about items nearing the due date or with low estimated time.

<strong>Priority Graphic</strong>

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image24.png"><img style="display: inline; margin-left: 0; margin-right: 0; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb24.png" alt="image" width="166" height="140" align="left" border="0" /></a>

Another addition in this version is a new Priority coloring. Application uses custom ListBox which overrides the drawing method to create items in different colors.

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image25.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb25.png" alt="image" width="41" height="162" border="0" /></a>

Same effect is applied on the priority  ComBox If you want to get this effect. Create custom ComboBox and override the OnDrawItem method.
<blockquote>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:2c61692c-0184-486d-bf6a-8ac28ffbd5dd" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>
<pre class="lang:default decode:true ">public class ColorAbleComboBox : ComboBox 
{ 
   protected override void OnDrawItem(DrawItemEventArgs e) 
   { 
       if (e.Index &gt;=0)
       { 
         Rectangle rect =new Rectangle(e.Bounds.X, e.Bounds.Y, e.Bounds.Width, e.Bounds.Height); 
         if (e.Index &lt;=3) 
         {
             Color col = Color.FromArgb(0,255-(e.Index*60),0);
             SolidBrush greenBrush =new SolidBrush(col);
             e.Graphics.FillRectangle(greenBrush, rect);
         }
         else if (e.Index &gt;3 &amp;&amp; e.Index &lt;= 7)
         {   
              Color col = Color.FromArgb(0, 0, 255- ((e.Index-4) *60));
              SolidBrush blueBrush =new SolidBrush(col);
              e.Graphics.FillRectangle(blueBrush, rect);
         }
         else if (e.Index &gt;7)
         {
             Color col = Color.FromArgb(255- ((e.Index -8) *60), 0,0 ); 
             SolidBrush redBrush =new SolidBrush(col); 27 e.Graphics.FillRectangle(redBrush, rect); 
         } 
         e.Graphics.DrawString(Items[e.Index].ToString(), Font, new SolidBrush(Color.White), new PointF(rect.X, rect.Y));
     }
   } 
}</pre>
&nbsp;

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div></blockquote>
This code assumes that there are more than seven items in the box.

<strong>Important !! If you want items to draw on your overloaded method you need to change a property DrawMode from Normal to Either OwnerDrawVariable or OwnerDrawFixed.</strong>
<ul>
	<li>
<div><strong>0.2.3</strong></div>
<ul>
	<li>
<div>changes in reminder</div></li>
	<li>
<div>changes in notification logic</div></li>
	<li>
<div>added <strong>NUnit</strong> tests to <strong>XmlAnalyser</strong></div></li>
</ul>
</li>
</ul>
<strong>Notification logic</strong>

Reminder is described in my previous post <a href="http://lammichalfranc.wordpress.com/2010/08/13/remind-mechanism-net-notifying-objects-from-thread/">“Reminder Mechanism”</a> . For notifications, I am using an abstract Notifier which is extended by specific classes like DueDateNotifier .  Reminder adds Notifiers to his list, and then is querying them asking if the user should be notified about them.

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image26.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb26.png" alt="image" width="621" height="253" border="0" /></a>

<strong>Next Week</strong>
<ul>
	<li>
<div><strong>0.2.4</strong></div>
<ul>
	<li>
<div>Report engine</div></li>
	<li>
<div>UI in Wpf for reports engine</div></li>
</ul>
</li>
</ul>
