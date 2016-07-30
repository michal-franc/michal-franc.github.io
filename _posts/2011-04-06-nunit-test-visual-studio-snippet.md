---
layout: post
title: NUnit Test Visual Studio Snippet
date: 2011-04-06 06:45
author: LaM
comments: true
categories: [NUnit, Uncategorized, visual studio]
---
I am using NUnit framework to write Unit Tests. To simplify my work I have a simple snippet which generates test method.
<pre class="lang:default decode:true">[Test]
public void TestName()
{
   #region Arrange
   #endregion 

   #region Act

   Assert.Fail();

   #endregion

   #region Assert
   #endregion
}</pre>
As you can see there are regions for different actions.

Here is a code for this snippet. If you want to use it. Just copy paste it to the xml file and name it with extensions “*.snippet”. Then in Visual Studio go to (Tools –&gt; Code Snippet Manager) and import this file.
<pre class="lang:default decode:true ">&lt;CodeSnippets xmlns="http://schemas.microsoft.com/VisualStudio/2010/CodeSnippet"&gt;
    &lt;CodeSnippet Format="1.0.0"&gt;
        &lt;Header&gt;
            &lt;Title&gt;
                NUnit Test
            &lt;/Title&gt;
        &lt;/Header&gt; 
        &lt;Snippet&gt;
            &lt;Declarations&gt;
                &lt;Literal&gt;
                    &lt;ID&gt;TestName&lt;/ID&gt;
                    &lt;ToolTip&gt;Replace with TestName.&lt;/ToolTip&gt;
                    &lt;Default&gt;TestName&lt;/Default&gt;
                &lt;/Literal&gt;
            &lt;/Declarations&gt;
            &lt;Code Language="CSharp"&gt;
                &lt;![CDATA[
                [Test]
                public void $TestName$()
                {
                    #region Arrange
                    #endregion

                    #region Act

                    Assert.Fail();

                    #endregion

                    #region Assert
                    #endregion
                }
                ]]&gt;
            &lt;/Code&gt;
       &lt;/Snippet&gt;
    &lt;/CodeSnippet&gt;
&lt;/CodeSnippets&gt;</pre>
&nbsp;
