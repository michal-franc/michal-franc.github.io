---
layout: post
title: Activity Tracker – WPF DataBinding the TabControl with TreeView
date: 2010-08-28 08:19
author: Michal Franc

comments: true
categories: []
---
In the first post about <strong>Activity Tracker</strong>, I have created a simple style for my application. In this post, I want to show <strong>DataBinding</strong>. With this feature, we can make a flexible connection between Model and View Layer. There is no need for code. Everything is constructed in <strong>XAML</strong> language, which is similar to the HTML Markup.
<h3>Simple Binding - DataTemplate</h3>
&nbsp;

In the first example, we have a simple <strong>DataTemplate</strong>. It contains a structured Grid,  Button and couple of TextBlocks. By assigning to the Text Property <strong>Binding</strong> logic we are telling the Template too look for a specific property in a Class, which will be used with the Template.
<div>

{% highlight csharp %}
<DataTemplate x:Key="TaskTemplate">
   <Grid Width="200">
      <Grid.ColumnDefinitions>
         <ColumnDefinition Width="5*"></ColumnDefinition>
         <ColumnDefinition Width="1*"></ColumnDefinition>
         <ColumnDefinition Width="1*"></ColumnDefinition>
         <ColumnDefinition Width="3*"></ColumnDefinition>
      </Grid.ColumnDefinitions>
      <TextBlock Grid.Column="0" Text="{Binding Path=Title}"/>
      <TextBlock Grid.Column="1" Text="{Binding Path=TimeSpent}"/>
      <TextBlock Grid.Column="2" Text="{Binding Path=TimeEstimate}"/>
      <Button Grid.Column="3">Start</Button>13 </Grid>14 </DataTemplate>
{% endhighlight %}

Template is looking for specified properties in a collection bound to the

</div>
<div></div>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:90b9145c-9edc-4909-9f87-3f5b7d8a5069" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div><strong>ItemsSource</strong> Property. We can also do this by the <strong>DataContext</strong>, it’s more powerful concept for another Post.</div>
</div>
<a href="http://lammichalfranc.files.wordpress.com/2010/08/image40.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb40.png" alt="image" width="244" height="226" border="0" /></a>
<h3>HierarchicalDataTemplate</h3>
Simple DataTemplate doesn’t have the ability to automatically create a hierarchy. I could make a code and implement a logic  to get this effect but fortunately <strong>WPF</strong> have a <strong>HierarchicalDataTemplate</strong>. This special template is automatically making a hierarchical view used on the TreeViews.
<div>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:c11f5546-4e5c-469d-8b79-11f4057df4d0" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
<HierarchicalDataTemplate x:Key="TaskTemplate" ItemsSource="{Binding Childrens}" DataType="{x:Type data:Task}">
   <Grid Width="200">
     <Grid.ColumnDefinitions>
        <ColumnDefinition Width="5*"></ColumnDefinition>
        <ColumnDefinition Width="1*"></ColumnDefinition>
        <ColumnDefinition Width="1*"></ColumnDefinition>
        <ColumnDefinition Width="3*"></ColumnDefinition>
      </Grid.ColumnDefinitions>
      <TextBlock Grid.Column="0" Text="{Binding Path=Title}"/>
      <TextBlock Grid.Column="1" Text="{Binding Path=TimeSpent}"/>
      <TextBlock Grid.Column="2" Text="{Binding Path=TimeEstimate}"/>
      <Button Grid.Column="3">Start</Button>
    </Grid>
</HierarchicalDataTemplate>
{% endhighlight %}

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
</div>
<a href="http://lammichalfranc.files.wordpress.com/2010/08/image42.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb41.png" alt="image" width="244" height="226" border="0" /></a>

Task class contains a list of <strong>Childrens</strong> which is used in the <strong>HierarchicalDataTemplate</strong>.
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:2678f708-e812-4f50-b17b-48d30936ca70" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
public class Task
{ 
   .....
   public List<Task> Childrens { get; set; }
   .....
}
{% endhighlight %}

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
<strong>HierarchicalDataTemplate</strong> has a property <strong>ItemsSource</strong> which is binded to Children's property. The Template will create the root element and also elements from the Children's List. I don’t have to worry about how it’s working. Magic happens behind the scene.
<h3>Binding TabControl Content</h3>
Every TabControl contains a TreeView, which is filled with Task Items. I wanted another Template, which would automatically inject the TreeView into TabControl.

{% highlight csharp %}
<DataTemplate x:Key="TabItemTemplate">
    <Grid>
       <TreeView Background="Transparent" ItemsSource="{Binding Content}" ItemTemplate="{StaticResource TaskTemplate}">
      </TreeView>
    </Grid>
</DataTemplate>
{% endhighlight %}

<strong>TabItem</strong> Template creates a Transparent TreeView. It's bound to the <strong>Content</strong> property. This is a property of Project class which is used to create a new <strong>TabItems</strong> with children's injected to the TreeView.
<div>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:1a9470ae-9a29-4035-8b4c-44dca516e6ea" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
public class Project
{ 
    public string Title { get; set; }
    public List<Task> Content { get; set; }
}
{% endhighlight %}

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
</div>
Project class is a root for every Task set. It’s Title bound to the Header property of a TabItem.
<div>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:91cfd2a4-b3a3-4d0f-ab13-87cf447734e4" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
<Grid Name="MainTree" Grid.Row="1" Grid.RowSpan="1">
   <TabControl Name="MainTabControl" ContentTemplate="{StaticResource TabItemTemplate}"></TabControl>
</Grid>
{% endhighlight %}

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
</div>
In order to bind the <strong>Title</strong> from the Project class to the <strong>TabItem</strong> the header, I had to change a tab item style a bit. The Content Presenter was replaced by the <strong>TextBlock</strong> which Text Property is bound to The Title.
<div>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:851fcd4d-294f-4ee8-9888-0e00aa3615f6" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
<Style TargetType="TabItem"> 
    .... 
    <Grid>
      <StackPanel Orientation="Horizontal">
          <Border Name="Border" Padding="2" BorderBrush="Black" BorderThickness="1,1,1,1" 
          CornerRadius="10,10,0,0" Background="DarkOrange">
             <TextBlock Text="{Binding Path=Title}"></TextBlock>
         </Border>
      </StackPanel>
    </Grid>
    ....
</Style>
{% endhighlight %}

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
</div>
When all is done I just need to  create sample data.
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:142916b0-cf8b-4a75-b6f1-cafe51ad9cf8" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
List<Task> tasks =new List<Task>() 
{
      new Task("test",10,"I",DateTime.Now,8,"komentarz"){ TimeSpent ="0"}, 
      new Task("test",10,"I",DateTime.Now,8,"komentarz"){ TimeSpent ="0"},
      new Task("test",10,"I",DateTime.Now,8,"komentarz"){ TimeSpent ="0"},
      new Task("test",10,"I",DateTime.Now,8,"komentarz"){ TimeSpent ="0"}
};

InitializeComponent();

tasks[0].Childrens =new List<Task>()
{ 
      new Task("test",10,"I",DateTime.Now,8,"komentarz"){ TimeSpent ="0"} 
};

List<Project> projects =new List<Project>() 
{ 
      new Project() { Content = tasks, Title ="Projekt1" }, 
      new Project() { Title ="Projekt2" } 
};

MainTabControl.ItemsSource = projects;
{% endhighlight %}

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
And the result is :

<a href="http://lammichalfranc.files.wordpress.com/2010/08/image43.png"><img style="display: inline; border: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb42.png" alt="image" width="244" height="228" border="0" /></a>

Next post Timers + activity tracker logic.
