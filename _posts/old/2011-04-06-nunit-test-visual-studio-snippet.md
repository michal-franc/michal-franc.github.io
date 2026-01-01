---
layout: post
title: NUnit Test Visual Studio Snippet
date: 2011-04-06 06:45
author: Michal Franc

comments: true
categories: []
tags: [archive]
---
I am using NUnit framework to write Unit Tests. To simplify my work I have a simple snippet which generates test method.

{% highlight csharp %}
[Test]
public void TestName()
{
   #region Arrange
   #endregion 

   #region Act

   Assert.Fail();

   #endregion

   #region Assert
   #endregion
}
{% endhighlight %}

As you can see there are regions for different actions.

Here is a code for this snippet. If you want to use it. Just copy paste it to the xml file and name it with extensions “*.snippet”. Then in Visual Studio go to (Tools –> Code Snippet Manager) and import this file.

{% highlight csharp %}
<CodeSnippets xmlns="http://schemas.microsoft.com/VisualStudio/2010/CodeSnippet">
    <CodeSnippet Format="1.0.0">
        <Header>
            <Title>
                NUnit Test
            </Title>
        </Header> 
        <Snippet>
            <Declarations>
                <Literal>
                    <ID>TestName</ID>
                    <ToolTip>Replace with TestName.</ToolTip>
                    <Default>TestName</Default>
                </Literal>
            </Declarations>
            <Code Language="CSharp">
                <![CDATA[
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
                ]]>
            </Code>
       </Snippet>
    </CodeSnippet>
</CodeSnippets>
{% endhighlight %}

&nbsp;
