---
layout: post
title: Custom ListBox - using Attributes to create dynamic Controls
date: 2010-07-31 23:42
author: Michal Franc

comments: true
categories: [.net, c#, Uncategorized]
---
<p style="text-align: justify; padding-left: 30px;">This is the Control I created for my mini project <strong>TimeIsMoney</strong>. It is a simple ListBox with a <strong>"complex item</strong>" creation logic . <strong>NewItemBox </strong>which is used to create new Item is modifying itself based on the Object type. The Control is used to create “TaskBins” which are containers of Tasks. The main <strong>TaskBin </strong>is our “UnsortedBin”. Here we have items waiting to be sorted. Then we can add multiple Bins which are used to store the sorted Items</p>
<p style="text-align: justify;"></p>

<h2><span style="color: #000000;"><strong><span style="color: #ff6600;">What is it ?</span></strong></span></h2>
<span style="color: #000000;"><strong>
</strong></span>
<p style="padding-left: 30px;">The control contains 1 ListBox and 2 Buttons.</p>
<p style="padding-left: 30px;"><a href="http://lammichalfranc.files.wordpress.com/2010/07/timeismoney1.png"><img class="aligncenter size-full wp-image-487" title="TimeIsMoney1" src="http://lammichalfranc.files.wordpress.com/2010/07/timeismoney1.png" alt="" width="294" height="266" /></a></p>
<p style="padding-left: 30px;">By clicking the add button a new <strong>NewItemBox</strong> Appears with dynamically created controls.</p>
<p style="padding-left: 30px;"><a href="http://lammichalfranc.files.wordpress.com/2010/07/timeismoney2.png"><img class="aligncenter size-full wp-image-488" title="TimeIsMoney2" src="http://lammichalfranc.files.wordpress.com/2010/07/timeismoney2.png" alt="" width="339" height="285" /></a></p>
<p style="padding-left: 30px;"><strong>NewItemBox</strong> It analyzes the properties of the class and creates new controls. By creating a new property in <strong>TaskBin</strong> the Control will create a new control. By this behavior I don't have to worry about changes.</p>

<h2><span style="color: #ff6600;">How Does it Work ?</span></h2>
<p style="padding-left: 30px;">Everything is based on properties decorated by the attributes. Let's take a look at <strong>TaskBin</strong> class</p>


{% highlight csharp %}
[Serializable]
public class TaskBin : IEditable;TaskBin;
{
     [EditableDialogBox]
     public string Address { get; set; }
     [EditableTextBox]
     public string Name { get; set; }

     public string DisplayMember
     {
          get
          {
               return "Name";
          }
     }

#region IEditable<TaskBin> Members

     public TaskBin CreateFromString(string stringObject)
     {
          string[] datas = stringObject.Split(';');
          return new TaskBin() { Address = datas[1], Name = datas[3] };
     }

#endregion
}
{% endhighlight %}

&nbsp;

As you can see Address and Name property are decorated by <strong>EditableDialogBox </strong>and <strong>EditableTextBox </strong>Attribute [This is a simple class inheriting from the Attribute class]

{% highlight csharp %}
public class EditableTextBox : Attribute
{
}

public class EditableDialogBox : Attribute
{
}
{% endhighlight %}

<p style="padding-left: 30px; text-align: justify;">Those are empty classes. You can add some logic and behaviors to them.I m just using them to mark the properties which will be represented as a TextBox in the NewItemBox. Every property with an [Editable.....] attribute will have a textbox and user will be able to edit it .The displayMember proeprty doesn't have an Attribute so it wont available for the user. It is used for DataBinding to set the displayed property name on the ListBox].</p>
<p style="padding-left: 30px;">To check if the property has a specific attribute you need to use the Reflection mechanism.</p>
&nbsp;

{% highlight csharp %}
foreach (PropertyInfo prop in type.GetProperties())
{
     //Checking if property is decorated with EditableProperty Attribute
     if (prop.IsDefined(typeof(EditableTextBox), false))
     {
          newBox.CreateTextBox(prop.Name);
     }
     else if(prop.IsDefined(typeof(EditableDialogBox),false))
     {
          newBox.CreateFileDialogButton(prop.Name,string.Empty);
     }
}
{% endhighlight %}

<p style="padding-left: 30px; text-align: justify;">Using reflection we are iterating through the properties of the Object and checking if they are decorated by an Attribute. To perform this check i m using the IsDefined method. There are only two attributes right now. Each of them generates different logic in the NewItemBox.</p>


{% highlight csharp %}
public void CreateTextBox(string name)
{
    this.Controls.Add(new Label() { Text = name, Location = new Point(0, y) });
    this.Controls.Add(new TextBox() { Location = new Point(0, y + 20) });
    y += 40;
}

public void CreateFileDialogButton(string name, string filter)
{
    this.Controls.Add(new Label() { Text = name, Location = new Point(0, y) });
    TextBox dialogText = new TextBox();
    dialogText.Click += new EventHandler(dialog_Click);
    dialogText.Location = Location = new Point(0, y + 20);
    this.Controls.Add(dialogText);
    y += 40;
}
{% endhighlight %}

<p style="padding-left: 30px; text-align: justify;">Property with EditableTextBox attribute generates a simple Label with its name and TextBox. EditableDialogBox generates label, textbox and creates an Event Handler handled by the click Event. „dialog_Click” event summons the FileDialogBox which is used to set The TaskBin physical path.</p>
<p style="padding-left: 30px; text-align: justify;">We have a code to create a dynamic edit box but how to pass this data further to our main lists. To do this I created I mechanism which converts all the data from the controls to the string.</p>


{% highlight csharp %}
public string GenerateStringObject()
{
    string returnString = String.Empty;

    foreach (Control c in Controls)
    {
          returnString += String.Format(&amp;quot;{0};&amp;quot;, c.Text);
     }

     return returnString;
}
{% endhighlight %}

Class which is on the list, implements an IEditable Interface.

&nbsp;

{% highlight csharp %}
#region IEditable<TaskBin> Members

public TaskBin CreateFromString(string stringObject)
{
    string[] datas = stringObject.Split(';');
    return new TaskBin() { Address = datas[1], Name = datas[3] };
}

#endregion
{% endhighlight %}

<h2><span style="color: #ff6600;">How can I use it ?</span></h2>
<p style="padding-left: 30px;"><span style="color: #ff6600;">
</span></p>
<p style="padding-left: 30px;">In MainForm initialize the control with DataSource and Object type. Control saves changes directly to the specified DataSource</p>
