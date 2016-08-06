---
layout: post
title: Changing File Encoding in multiple Files
date: 2011-11-09 22:33
author: Michal Franc

comments: true
categories: [Uncategorized]
---
In one of the projects developed in my firm we had encoding set on almost all the files to Something like <strong>CodeBase 1252</strong> which supports only the limited set of characters.

There was a problem with Swedish characters <strong>“ö,ä,å”</strong> and also especially pound currency character which was used in one of the regular expression in the app. With my operating system, configured with the English culture settings using <strong>CodeBase 1250</strong>, those characters where changed and there were couple of runtime errors. We had to change the encoding to <strong>UTF8</strong> that’s one of the solutions. <strong>UTF8</strong> has a bigger character set.

There is an option in <strong>Visual Studio File –> Advanced Save Options </strong> that can be used to change <strong>encoding</strong> but it’s only usable for scenarios with one file. In this situation I had to change couple thousand of files. To fix this problem I have found a nice solution that uses <strong>PowerShell</strong> .

Script:

{% highlight csharp %}
function ChangeEncoding ($baseDirectory)
{
        $allFiles = Get-ChildItem $baseDirectory -include *.aspx,*.ascx -recurse 
               | where-object { -not $_.PSIsContainer}
        foreach( $file in $allFiles){
            $fileContent = get-content $file.FullName -force
            $fileContent | set-content -encoding utf8  $file.FullName -force
         }
}
ChangeEncoding("BaseDirectoryPath")
{% endhighlight %}

This script iterates through all the files in directories and their directories and rewrites them with correct encoding. It’s not the best solution but it works.

Little Explanation:

<span style="background-color: red;">Get-ChildItem $baseDirectory -include *.aspx,*.ascx –recurse</span>

Gets all the files with specified extensions  (aspx and ascx) , recurse option enables search through all the files in directories and subdirectories

<span style="background-color: red;">where-object { -not $_.PSIsContainer}</span>

Used to exclude directories from the files list.

This script loads the file to a temporary variable because we have to read and write the same file. Pipelined solution would be cleaner but it reads and writes the data one line at time. You can’t write and read on the same file at the same time.
