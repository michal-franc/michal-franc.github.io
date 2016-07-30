---
layout: post
title: Cursors in T-SQL
date: 2010-03-13 20:39
author: LaM
comments: true
categories: [.net, sql, Uncategorized]
---
Lately, I have started an internship in one of the IT Companies located in Wroclaw. I am really happy because this is a great opportunity to catch "real job" experience. Academic projects are a different kind of story.

I had a task to implement some MsSql queries and some operations on retrieved results. My first thought was to implement a simple for loop, iterate thought the result collection, do something on each result, „voila” .

Sure, Easier said than done.

Simple loop thought the results of SQL Query is great if we want to do something with a bunch of the data, but what should we do when with every iteration we want to do a specific operation on exactly one record. There is a problem because We would have to track the index of the current record. This would take a lot of effort to write test, etc. If you don't want to waste a lot of time try the "Cursors". They are ideal for this kind of a situation. They are similar to iterator in collections. You can fetch records, one by one and do some operations on them.
<h3>Cursors</h3>
Let's assume that we have some Table called „UserData” with typical Columns:
<ul>
	<li>ID</li>
	<li>Name</li>
	<li>Date</li>
	<li>isActive</li>
</ul>
The simplest sql query ....
<pre class="lang:default decode:true">SELECT * FROM UserData</pre>
will return :
<ul>
	<li>1 , Michał Franc , 2008-10-10 , 1</li>
	<li>2 , Stefan Romański , 2006-01-01 , 1</li>
	<li>3 , Maria Kozłowska , 2005-04-04 , 1</li>
</ul>
This is my test Data [Those are my secret personalities on the Net ].

Let's ask for the name of the users with Date value before year 2007. This is another query falling to the „simple” category.

SELECT Name FROM USerData Where DATEDIFF(day,'2007-01-01',Date) &lt; 0

Result:
<ul>
	<li>Stefan Romański</li>
	<li>Maria Kozłowska</li>
</ul>
Let's create a procedure to take an ID as a parameter and set the isActive column to 0. This procedure is used to set all users with Date before year 2007 to isActive status 0.

Lets Create Query for ID's .

SELECT ID FROM DaneUzytkownikow Where DATEDIFF(day,'2007-01-01',Data) &lt; 0

Result:
<ul>
	<li>2</li>
	<li>3</li>
</ul>
We have ID's of inactive users. We will use the cursors now to run a procedure for every ID.

Before going further let me describe you how to use Cursors:
<ol>
	<li><em>Create temporary variables for data fetched from result row</em></li>
	<li><em>Create Cursor and assing a Select Query to it</em></li>
	<li><em>Open Cursor , this commands fils Cursor with data returned from assigned Query</em></li>
	<li><em>Iteration on records with Fetch function , assign data to temporary  variables</em></li>
	<li><em>Run procedure with temporary variables as a parameters</em></li>
	<li><em>repeat step 4 and 5</em></li>
	<li><em>Close Cursor , disposing resources</em></li>
	<li><em>Cursor Deallocation</em></li>
</ol>
<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8db1bc4e-6c66-4a6a-a698-763e4a1def35">
<pre class="lang:default decode:true  crayon-selected">DECLARE@UserIdint 
Declare@CursorCursor 
Set@Cursor=CursorFORSELECT ID FROM UserData Where DATEDIFF(day,'2007-01-01',Data) &lt;0
Open@Cursor  Fetch Next From @CursorInto @UserId  
While (@@FETCH_STATUS=0)
Begin
        EXEC SetInactive @Id=@UserID Fetch Next From @CursorInto @UserID
End
Close @Cursor
Deallocate @Cursor</pre>
</div>
<h3>1.Declaring Temporary Variable @UserId</h3>
DECLARE @UserId int - This variable on each iteration will
<h3>2.Create Cursor</h3>
Declare @Cursor Cursor

Set @Cursor = Cursor

For SELECT ID FROM UserData Where DATEDIFF(day,'2007-01-01',Data) &lt; 0

- We have to assign sql query.
<h3>3.Open Cursor.</h3>
Open @Cursor - Assigned Query is executed.
<h3>4.Iterating through records.</h3>
We have to store data from row in temporary variable

<em>Fetch Next From @Cursor Into @UserId</em>

While (@@FETCH_STATUS = 0) - The while loop will iterate till last row returned from the query.
<h3>5.Executing Procedure with temporary variable as a parameter</h3>
<em>Begin EXEC SetInactive @Id = @UserID</em>

After executing the procedure we need to fetch next data.

<em>Fetch Next From @Cursor Into @UserID End</em>
<h3>7 i 8.Closing and Deallocating Cursor</h3>
Close @Cursor Deallocate @Cursor

And that would be all its quite simple and easy. Cursors are very useful in lot of scenarios.

Cursors are also available in  <a href="http://dev.mysql.com/doc/refman/5.0/en/cursors.html">MySql</a> and <a href="http://www.oracle-base.com/articles/misc/UsingRefCursorsToReturnRecordsets.php">Oracle</a>.
