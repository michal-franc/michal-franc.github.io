---
layout: post
title: Sonar .Net installation
date: 2012-09-26 11:43
author: Michal Franc

comments: true
categories: [Uncategorized]
---
In this post I want to describe step by step process of Sonar installation for .Net .
<h3>Sonar ?</h3>
Basically  Sonar<strong> </strong>is web application that gathers data from various analytical tools available on .Net, Java <strong></strong>etc.

In .Net environment we can provide data from for example:
<ul>
	<li><strong>FxCop </strong></li>
	<li><strong>StyleCop </strong></li>
	<li><strong>Open Cover </strong></li>
</ul>
How does it look like ?. Check this <a href="http://nemo.sonarsource.org/">online repository of one of the open source projects</a>.

&nbsp;
<h3>Installation</h3>
&nbsp;
<ol>
	<li>What do I need
<ul>
	<li><a href="http://www.sonarsource.org/downloads/"><strong>Sonar</strong></a><strong> </strong></li>
	<li><a href="http://docs.codehaus.org/download/attachments/201228384/CSharpPluginsEcosystem-1.4.zip?version=2&amp;modificationDate=1347376166648"><strong>Sonar C# Ecosystem + Plugins</strong></a></li>
	<li><a href="http://docs.codehaus.org/display/SONAR/Installing+and+Configuring+Sonar+Runner"><strong>Sonar Runner</strong></a></li>
	<li><a href="http://www.oracle.com/technetwork/java/javase/downloads/index.html"><strong>Java JDK</strong></a></li>
	<li><strong>Database</strong>
<ul>
	<li>you can use embedded DB but this one is not recommended for bigger projects</li>
	<li><strong>MySql</strong> is proffered DB engine, <strong>Sonar</strong> is based on Java and its driver for <strong>MsSql</strong> doesn’t work. I tried to run it on <strong>MsSql</strong> but -unfortunately right now I wasn’t able to do this.</li>
</ul>
</li>
	<li><strong>Analytical tools</strong>
<ul>
	<li><a href="http://www.microsoft.com/en-us/download/details.aspx?id=6544">FxCop</a> – should be already installed on your system</li>
	<li><a href="http://stylecop.codeplex.com">StyleCop</a></li>
	<li><a href="https://github.com/sawilde/opencover/downloads">OpenCover</a> – best to download <strong>*.msi</strong></li>
	<li><a href="http://www.gallio.org/">Gallio</a> – test runner</li>
</ul>
</li>
</ul>
</li>
	<li>Copy sonar to some folder let’s say C:\sonar</li>
	<li>Copy sonar runner to some folder let’s say C:\sonarrunner</li>
	<li>Install JDK</li>
	<li>Install OpenCover</li>
	<li>Install Gallio</li>
	<li>Configure user Variables. Add These Values
<ul>
	<li>SONAR_RUNNER_HOME – path to sonar runner (eg: C:\sonarrunner )</li>
	<li>JAVA_HOME – path to jdk (eg: C:\Program Files\Java\jdk1.7.0_03)</li>
	<li>Path – Add path to Gallilo and sonarrrunner (eg:C:\Program Files\Gallio\bin;C:\sonarrunner\bin; )</li>
</ul>
</li>
	<li>Configure Sonar DB access
<ul>
	<li>Locate file sonar.properties (eg: c:\sonar\conf ). I n this file you will find various settings. What we want right now is to set up connection to our DB. Locate value sonar.jdbc.url. We will configure our sonar to use embedded DB. In order to do that locate Comment that explains Embedded DB connection and make sure that <strong>sonar.jdb.url:</strong> value is uncommented</li>
	<li>If you want to use <strong>MySql</strong> comment out <strong>embedded database connection</strong> and uncomment <strong>MySql</strong> connection. Make sure that <strong>Port</strong> is ok and <strong>Crendentials</strong> are ok</li>
</ul>
</li>
	<li>Installing C# Ecosystem + Plugins
<ul>
	<li>copy all the files to (eg: C:\sonar\extensions\plugins )</li>
</ul>
</li>
	<li>Running Sonar
<ul>
	<li>go to your sonar installation folder</li>
	<li>locate bin folder</li>
	<li>go to  folder with your operating system</li>
	<li>run <strong>StartSonar.bat</strong></li>
	<li>wait 1-2 minutes and check <a href="http://localhost:9000/sonar">http://localhost:9000/sonar</a></li>
	<li>if everything went ok you should see sonar starting page</li>
</ul>
</li>
	<li>Configuring Plugins
<ul>
	<li>Log in as <strong>login</strong> : admin, password : admin</li>
	<li>Go to <strong>Configuration</strong></li>
	<li>On the right side go to <strong>General Settings. </strong>Here you will find different Categories.
<ul>
	<li>C# Core
<ul>
	<li>Here you can setup path to <strong>.Net</strong> libraries. If you have them in <strong>default </strong>folders don’t change anything.</li>
</ul>
</li>
	<li>C# FxCop
<ul>
	<li>point <strong>“FxCop installation directory”</strong> to your installation folder (eg: C:\Program Files (x86)\Microsoft FxCop 1.36)</li>
</ul>
</li>
	<li>C# Gallio
<ul>
	<li>point “OpenCover install directory” to your installation folder ( eg: C:\Users\mfc\AppData\Local\Apps\OpenCover),</li>
	<li>point Gallio install directory to your installation folder</li>
	<li>Change Coverage tool to “OpenCover”</li>
</ul>
</li>
	<li>C# StyleCop
<ul>
	<li>As before point StyleCop Installation folder (eg : C:\Program Files (x86)\Microsoft StyleCop 4.3.3.0 )</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
	<li>Configuring Project File
<ul>
	<li>Each project needs his own configuration file.</li>
	<li>Go to your solution folder ( <strong>*.sln</strong> file has to be in this folder )</li>
	<li>Add two files:
<ul>
	<li><strong>sonar-project.properties</strong># Project identification
sonar.projectKey=( project key eg: MyCompany:Console_App )
sonar.projectVersion= ( project version )
sonar.projectName= ( project name displayed in dashboard eg: Console_App )
# Info required for Sonar
sonar.sources=.&nbsp;
<h6>sonar.language=cs</h6>
sonar.dotnet.visualstudio.solution.file= ( solution name eg : ConsoleApp.sln )
sonar.donet.visualstudio.testProjectPattern=( part of the name projects containg unit tests eg : *.Tests )</li>
	<li><strong>sonar-project-run.bat</strong></li>
	<li>run here just sonar-runner ( if you configured path correctly )</li>
</ul>
</li>
</ul>
</li>
	<li>Running Sonar Analysis
<ul>
	<li>execute sonar-project-run.bat – remember that instance of Sonar has to be running !</li>
</ul>
</li>
</ol>
<h4>Helpful links</h4>
<a href="http://stackoverflow.com/questions/4791051/sonar-installation-problem">http://stackoverflow.com/questions/4791051/sonar-installation-problem</a>

<a href="http://stackoverflow.com/questions/8095485/error-running-sonar-connected-to-sql-server-2005-sonar-dbo-rules-for-column-des">http://stackoverflow.com/questions/8095485/error-running-sonar-connected-to-sql-server-2005-sonar-dbo-rules-for-column-des</a>

<a href="http://www.microsoft.com/download/en/details.aspx?displaylang=en&amp;id=11774">http://www.microsoft.com/download/en/details.aspx?displaylang=en&amp;id=11774</a>

<a href="http://resources.visual-paradigm.com/index.php/tips-support/53-support/95-sql-connection-problem.html">http://resources.visual-paradigm.com/index.php/tips-support/53-support/95-sql-connection-problem.html</a>
