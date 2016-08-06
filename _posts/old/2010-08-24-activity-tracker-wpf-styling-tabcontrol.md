---
layout: post
title: Activity Tracker – WPF Styling TabControl
date: 2010-08-24 19:40
author: Michal Franc

comments: true
categories: [.net, c#, Uncategorized, wpf]
---
<p style="text-align: justify;">I have started another mini tool which will be a part of the <strong>TimeIsMoney</strong> project. <a href="http://screeperzone.com/products/"><strong>Activity Tracker</strong></a><strong>.</strong> Look at the simple example. Right now I am using this tool in my job. It’s great but for my project i need something more advanced.</p>
<p style="text-align: justify;"><a href="http://lammichalfranc.files.wordpress.com/2010/08/image35.png"><img style="display: block; float: none; margin-left: auto; margin-right: auto; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb35.png" alt="image" width="198" height="244" border="0" /></a></p>
<p style="text-align: justify;"><em><strong>Activity Tracker from the </strong></em><a href="http://screeperzone.com/"><strong>ScreeperZone</strong></a></p>
<p style="text-align: justify;">This tracker is a windows gadget. There was an idea to create some sort of  the link between <a href="http://www.codeproject.com/KB/applications/todolist2.aspx"><strong>TODO List</strong></a> and this application,  but I have encountered several major problems. It’s a windows gadget so it's created from the simple html with JavaScript, and its data is stored in <strong><a href="http://pl.wikipedia.org/wiki/JSON">Json</a></strong> format. Accessing and modifying  this data would be a simple task but the application refreshes its data only on the start. There is no way to invoke the data refresh without restarting the <strong>Activity Tracker</strong>. So there is only ability to “bind the data between application in <strong>OneWay</strong>”. I need this communications to be “<strong>TwoWay</strong>” Because of this problem and some other constraints,  I have decided to create my own application from the scratch.</p>
<p style="text-align: justify;"><strong>Ideas</strong></p>

<ul style="text-align: justify;">
	<li>
<div>Time spent calculation.</div></li>
	<li>
<div>Application will read the xml list. User will have the ability to select lists and items to track.</div></li>
	<li>
<div>activity log – needed for the reports module.</div></li>
</ul>
<p style="text-align: justify;"><strong>UI Concept</strong></p>
<p style="text-align: justify;"><a href="http://lammichalfranc.files.wordpress.com/2010/08/image36.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb36.png" alt="image" width="244" height="215" border="0" /></a></p>
<p style="text-align: justify;">This is a simple concept created in … MS Paint. As you can see its just a <strong>TabControl</strong> with a customized <strong>TreeView. </strong>Items in the treeview will display the title time spent + time estimated by the user. There is a button which is used to activate the time counter. You will be able to check the comments attached to a task by right clicking on the item.</p>
<p style="text-align: justify;"></p>
<p style="text-align: justify;"><strong><span style="font-size: medium;">Implementation</span></strong></p>
<p style="text-align: justify;"></p>
<p style="text-align: justify;">I created styles first. Yeah i know that you should implement the Model and Controller first and then move to the View. The styling in WPF is so great that i couldn't resist.</p>
<p style="text-align: justify;"><strong>TabItem Custom Styles</strong></p>
<p style="text-align: justify;"><a href="http://lammichalfranc.files.wordpress.com/2010/08/image37.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb37.png" alt="image" width="204" height="30" border="0" /></a></p>

<div style="text-align: justify;">
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:7caac4de-d865-489a-abf1-2ea953cb51d6" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
<Style TargetType="TabItem">
    <Setter Property ="Template">
        <Setter.Value>
            <ControlTemplate TargetType="TabItem">
                <Grid>
                    <StackPanel Orientation="Horizontal">
                        <Border Name="Border" Padding="2" BorderBrush="Black" Borde                            rThickness="1,1,1,1" 
                    CornerRadius="10,10,0,0" Background="DarkOrange">
                            <ContentPresenter Name="PART_header" ContentSource="Header"/>
                        </Border>
                    </StackPanel>
                </Grid>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>
{% endhighlight %}

&nbsp;

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
</div>
<p style="text-align: justify;">Most Interesting part in, here is a <strong>ContentPresenter</strong> this tag represents the place where the actual data of an item will be displayed. By specifying the <strong>ContentSource</strong>, we can inject the data to it. By using the <strong>ContentPresenter</strong>, I can create a <strong>TabItem</strong> and specify its attribute <strong>Header</strong>.</p>

<div style="text-align: justify;">
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:711d868f-3183-466e-8961-999d4ea08ab5" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div><span style="color: #008080;">1</span> <span style="color: #0000ff;"><</span><span style="color: #800000;">TabItem </span><span style="color: #ff0000;">Header</span><span style="color: #0000ff;">=”Projekt1”/></span></div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
</div>
<p style="text-align: justify;">The value in Header will be automatically inserted in the place of the <strong>ContentPresenter.</strong></p>
<p style="text-align: justify;"><strong>TabItem Triggers – Changing color of TabItem</strong></p>
<p style="text-align: justify;"></p>
<p style="text-align: justify;"></p>
<p style="text-align: justify;"><strong>WPF</strong> is great because it lets you omit a lot of code. To do the simple <strong>Background color</strong> change in a Windows Forms you would have to write a lot of code. More code means more bugs, longer development time, and the cost of a product.</p>
<p style="text-align: justify;">In this scenario, we want the background color of the <strong>Tabitem</strong> to change when it’s selected. In <strong>WPF,</strong> we don’t need to write a single line of code. <strong>Xaml</strong> and its magic is enough for this task. To implement a simple behavior, we can use the <strong>Triggers</strong>.</p>
<p style="text-align: justify;"></p>
<p style="text-align: justify;"><a href="http://lammichalfranc.files.wordpress.com/2010/08/image38.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb38.png" alt="image" width="205" height="30" border="0" /></a></p>

<div style="text-align: justify;">
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f42c0442-c4b7-43c5-a74b-2b9bbddac77e" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
<ControlTemplate.Triggers>
    <Trigger Property="IsSelected" Value="True">
        <Setter TargetName="Border" Property="Background" Value="Gold"/>
    </Trigger>
    <Trigger Property="IsSelected" Value="False">
        <Setter TargetName="Border" Property="Background" Value="DarkOrange"/>     </Trigger>
</ControlTemplate.Triggers>
{% endhighlight %}

&nbsp;

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
</div>
<p style="text-align: justify;">As you can see <strong>Trigger</strong> “observes” a property and its value. In this example, it’s the <strong>IsSelected</strong> property. I need two triggers one for each option. <strong>Trigger </strong>contains a setter logic which is used to apply the changes. The <strong>Setter</strong> is attached to a property of a target and changes its value.</p>
<p style="text-align: justify;"><strong>TabItem Triggers – Changing color of TabItem</strong></p>
<p style="text-align: justify;"><a href="http://lammichalfranc.files.wordpress.com/2010/08/image39.png"><img style="display: inline; border-width: 0;" title="image" src="http://lammichalfranc.files.wordpress.com/2010/08/image_thumb39.png" alt="image" width="244" height="204" border="0" /></a></p>

<div style="text-align: justify;">
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f7e0055c-5fbf-4412-bf10-6d5e3deb640e" class="wlWriterEditableSmartContent" style="display: inline; float: none; margin: 0; padding: 0;">
<div>

{% highlight csharp %}
<Style TargetType="{x:Type TabControl}">
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="{x:Type TabControl}">
                <Grid>
                    <Grid.RowDefinitions>
                        <RowDefinition Height="Auto"/>
                        <RowDefinition Height="*"/>
                    </Grid.RowDefinitions>
                    <TabPanel Grid.Row="0" Panel.ZIndex="1" Margin="0,0,0,0" IsItemsHost="True" Background="Transparent"/>
                        <Border Margin="0,0,0,0" Padding="0" Background="Gold" Grid.Row="1" BorderBrush="Black" BorderThickness="1,1,1,1">
                            <ContentPresenter ContentSource="SelectedContent"/>
                        </Border>
                    </Grid>
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>
{% endhighlight %}

&nbsp;

</div>
<!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com -->

</div>
</div>
<p style="text-align: justify;">Last Thing to style is a <strong>TabControl</strong>. I need a customized background for every item in the <strong>Control</strong>. <strong>ContentPresenter</strong> is attached to a <strong>SelectedContent</strong>. This is the place where a <strong>Content</strong> of a Selected <strong>TabItem</strong> is displayed.</p>
<p style="text-align: justify;">That’s all for now. Next Chapter simple Data Binding.</p>
