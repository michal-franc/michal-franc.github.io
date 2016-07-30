---
layout: post
title: Activity Tracker –WPF Auto Updated Data Binding with INotifyPropertyChanged
date: 2010-09-02 17:44
author: LaM
comments: true
categories: [.net, Uncategorized, wpf]
---
After styling and Data binding time has come for the logic implementation. I need a simple counter with a timer. At first I tried to use the Timer class which has an Elapsed event but there were some problems with <strong>DataBinding</strong>, so I have decided to create my own thread with a one second sleep time. Its main purpose is to increment the counter.

In order to create a better logic, I have decided to create a new class TaskWPF. It wraps the Task class which is used as a simple data container. TaskWPF includes logic used by the Wpf <strong>DataBinding</strong> mechanism. Task class is used also in other projects, so I have decided to split it.  TaskWPF implements the <strong>INotifyPropertyChanged</strong> interface. It is needed to implement automatic data binding updates.
<h3>Auto Updated Data Binding:</h3>
Each second value on TimeSpent is incremented. I want to track this time in real-time. In order to do that we have to redraw the <strong>TextBlock. </strong>By using the <strong>DataBinding, </strong>we<strong> </strong>can do this process automatically every time the bound data is changed. This option is not default. We have to set up few options.

<strong>1)</strong> First our class which contains bound properties needs to implement the <strong>INotifyPropertyChanged</strong> interface. We have to implement the method <strong>OnPropertyChanged</strong> and call it every time we are changing the property which we want to auto update. This call will notify the bound <strong>WPF</strong> control, in my example <strong>TextBlock,</strong> that the value has changed and this will force the <strong>TextBlock</strong> to redraw itself with a new value.
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:ac8baeac-6b0f-4a72-a107-27e254b387c7" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>
<pre class="lang:default decode:true ">public class TaskWPF : INotifyPropertyChanged
{
     ....
     public void Increment()
     {
          AddSecond(1);
          OnPropertyChanged("TimeSpentString");
     } 
     ... 

     #region INotifyPropertyChanged Members

     public event PropertyChangedEventHandler PropertyChanged;
     protectedvoid OnPropertyChanged(string name)
     {
          PropertyChangedEventHandler handler = PropertyChanged;
          if (handler !=null)
          {
               handler(this, new PropertyChangedEventArgs(name));
          }
     }
     #endregion
     ...
}</pre>
&nbsp;

</div>
</div>
<div><span style="color: #000000;"> </span><span style="font-family: Georgia, 'Times New Roman', 'Bitstream Charter', Times, serif; line-height: 19px; white-space: normal; font-size: 13px;">As you can see every time I am calling the increment method I am m also calling the <strong>OnPropertyChanged</strong> function.  This one notifies the <strong>TextBlock</strong> that the property has changed.</span></div>
<strong>2)</strong> We have to tell the <strong>TextBlock</strong> to watch out for property updates. There is a special property <strong>UpdateSourceTrigger</strong> in the <strong>Binding</strong> segment that specifies how the <strong>Binding</strong> will behave. . On default, it is set on <strong>LostFocus</strong> option which updates bound value every time the control losses focus.  In order to auto update on property changed, we have to set it on “<strong>PropertyChanged</strong>“ option.
<pre class="lang:default decode:true">&lt;HierarchicalDataTemplate x:Key="TaskTemplate" ItemsSource="{Binding Childrens}" DataType="{x:Type data:TaskWPF}"&gt;
   ...
   &lt;TextBlock Name="TimeSpent" Text="{Binding Path=TimeSpentString Mode=OneWay, UpdateSourceTrigger=PropertyChanged}"/&gt;
   ....
&lt;/HierarchicalDataTemplate&gt;</pre>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:207c887f-8d06-4789-9080-742f4b213a5a" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">

<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
Same technique is used for time estimated limit notification. Right now I have made a simple border which is changing the color when the time spent is greater than estimated time.

<a href="http://lammichalfranc.files.wordpress.com/2010/09/image.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/09/image_thumb.png" alt="image" width="244" height="205" border="0" /></a> <a href="http://lammichalfranc.files.wordpress.com/2010/09/image1.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/09/image_thumb1.png" alt="image" width="223" height="206" border="0" /></a>

Background color of the Border is bound to the property in TaskWPF class.
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:6704c60f-a714-4da8-84e6-3255ddbbb38a" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<pre class="lang:default decode:true ">public void IsOverEstimatedTime()
    {
        if (_task.TimeSpent &gt; _task.TimeEstimate)
        {
            TaskColor ="Red";
            OnPropertyChanged("TaskColor");
        }
    }</pre>
&nbsp;

</div>
<div></div>
<div>
<pre>Every time I am incrementing the counter. I am also checking if the time spent is greater than time estimated. When this is its true color name is changed,  and the <strong>OnPropertyChanged</strong> method is called. It notifies the Border by the <strong>Binding</strong> to redraw itself because the value has changed. One important thing to note. Color is specified by a string name because Background property in the Xaml doesn't accept a Color" class.

Next Chapter. Communication with Xml files and TODO List.</pre>
</div>
<div></div>
