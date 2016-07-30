---
layout: post
title: From procedural to functional - an example in F#
date: 2015-07-13 09:00
author: LaM
comments: true
categories: [Uncategorized]
---
In this blog post, I show little code review of a code sent to me by friend. The code is quite simple example on how to read XML file using XmlProvider. My friend's biggest concern was that his code is still procedural and not 'functional'. I was asked if this code can be refactored to be more functional, whatever it means.

First of all, the code that I got, is fine and most importantly it works. Even when you are using F# to solve your problems, you don't really have to make your code super functional. That's the beauty of this language. You can still use state-full and mutable approach to implement solution. You don't have to make this code functional just for the sake of it.

Said that, I will still try to make the code better and in some ways more 'functional' to show some awesome F# features and approaches that do make the difference. My main goal here is to to remove loops and mutability.

XML structure
<pre class="lang:c# decode:true">&lt;catalog name="TERC" type="all" date="2015-01-01"&gt;
 &lt;row&gt;
   &lt;col name="WOJ"&gt;02&lt;/col&gt;
   &lt;col name="POW"/&gt;
   &lt;col name="GMI"/&gt;
   &lt;col name="RODZ"/&gt;
   &lt;col name="NAZWA"&gt;DOLNOsLaSKIE&lt;/col&gt;
   &lt;col name="NAZDOD"&gt;województwo&lt;/col&gt;
   &lt;col name="STAN_NA"&gt;2015-01-01&lt;/col&gt;
 &lt;/row&gt;
...</pre>
The XML is a representing a Collection of 'rows' with parameters specified as 'cols'. Each 'Col' has a param name and value. Some of the params are missing value.

Original Code
<pre class="nums:true nums-toggle:true lang:c# decode:true">open FSharp.Data
open System

type Record = {voivoship : Option&lt;int&gt;;  district : Option&lt;int&gt;; community:Option&lt;int&gt;; rozd:Option&lt;int&gt;; name: Option&lt;string&gt;; addinf: Option&lt;string&gt; }

type InputXml = XmlProvider&lt;"Terc.xml"&gt;
let tercs = InputXml.GetSample()

let records =
    seq {

        for row in tercs.Catalog.Rows do          

            let  vs = ref None
            let  dt = ref None
            let  cy = ref None
            let  rd = ref None
            let  ne = ref None
            let  af = ref None          

            for col in row.Cols do
                match col.Name with
                | "WOJ" -&gt; vs := col.Number
                | "POW" -&gt; dt := col.Number
                | "GMI" -&gt; cy :=  col.Number
                | "RODZ" -&gt; rd :=  col.Number
                | "NAZWA" -&gt; ne := col.String
                | "NAZDOD" -&gt; af :=  col.String
                | _ -&gt; ()

            yield {Record.voivoship = !vs; Record.district = !dt; Record.community = !cy; Record.rozd = !rd; Record.name = !ne; Record.addinf = !af}
         }</pre>
<ul>
	<li><span style="line-height: 1.5;">Record type defined with all the values as options. Column values are optional thus all the properties are declared as options. This allows the usage of 'None' value.</span></li>
	<li><span style="line-height: 1.5;">The data is being read using </span><a style="line-height: 1.5;" href="http://fsharp.github.io/FSharp.Data/">FSharp.Data</a> and XmlProvider</li>
	<li><span style="line-height: 1.5;">Collection of records is created by using </span><a style="line-height: 1.5;" href="https://msdn.microsoft.com/en-us/library/dd233209.aspx">Sequence</a><span style="line-height: 1.5;"> and yield operator.</span></li>
	<li>The core mapping code from XML to record is in the loop.</li>
	<li>By default all the values, that hold col value, are set to None and then if one of them exists we do set the proper value</li>
	<li>I am not sure why 'ref' has been used here. It can be changed to just mutable 'let binding'. <a href="https://lorgonblog.wordpress.com/2008/11/09/the-f-ref-type/">More on ref</a></li>
	<li>Because 'ref' is used, there has to be '!' used to get the data. Thus this weird syntax of '!cy' to extract the value from 'ref'.</li>
</ul>
So where to start with some changes ?
<h3>With operator and stateless record change</h3>
I start with a simple, yet a nice change, that makes the code cleaner.

<span style="line-height: 1.5;">Instead of extracting all the values and then creating a record instance at the end, I use 'with' operator and compose the Record on the fly.</span>

In order to do this, I need to define a function to create a default record type with all the values set to 'None' ( option type ). Thanks to this, I can remove ref' and weird initialization of temp values.
<pre class="lang:c# decode:true">    let createRecord =
        {
            voivoship = None
            district = None
            community = None
            rozd = None
            name = None
            addinf = None
        }</pre>
Then, I introduce a function that maps the 'col' and its value to proper field in the Record
<pre class="lang:c# decode:true">let addCol name number string record =
string -&gt; int -&gt; string -&gt; Record -&gt; Record</pre>
This function takes a name of the 'col' ( parameter ) , a number or a string and the existing record. The with operator creates a new Record based on existing one with specified field added to it.
<pre class="lang:c# decode:true"> let addCol name number string record =
        match name with
        | "WOJ" -&gt; { record with voivoship = number }
        | "POW" -&gt; { record with district = number }
        | "GMI" -&gt; { record with community = number }
        | "RODZ" -&gt; { record with rozd = number }
        | "NAZWA" -&gt; { record with name = string }
        | "NAZDOD" -&gt;  { record with addinf = string }
        | _ -&gt; record</pre>
Now, I can write code like this.
<pre class="lang:c# decode:true">let newRecord = createRecord
let recordWithNewValue = addCol "WOJ" 1 None newRecord</pre>
This code creates newRecord and then adds voivoship value to it. All the existing fields are still set to 'None'.
<h3>From loop to recursion</h3>
In the original code there is a loop used to change the state of the object. This is a perfect approach in procedural statefull approach. You just add new fields to the object. However when, stateless approach is needed, loop won't fit it due to its dependence on external state change. Loop doesn't return anything and it can only change existing state out of its scope. If you want to change something in the loop it has to be mutable.

<span style="line-height: 1.5;">If you want to loop some </span>collection<span style="line-height: 1.5;"> and change something without mutable value then you might use recursion. The good thing about it is that recursion is a function that has to return something and you can return new state. There is no need for mutable values.</span>

To change the loop from original code to recursion, I need to define a recursive function.
<pre class="lang:c# decode:true">        let rec iterateCols record (cols:List&lt;InputXml.Col&gt;) =
            match cols with
                | head::tail -&gt; iterateCols (addCol head.Name head.Number head.String record) tail
                | [] -&gt; record</pre>
<ul>
	<li><span style="line-height: 1.5;">rec means that this function is recursive</span></li>
	<li>this function takes an existing record and list of columns</li>
	<li>it loops through the list of columns using match</li>
	<li>'head::tail' is a list deconstruction convention using <a href="http://hestia.typepad.com/flatlander/2010/07/f-pattern-matching-for-beginners-part-4-lists-and-recursion.html">cons operator</a> - 'head' will be the first element while 'tail' is the rest of the collection</li>
	<li>to do recursive call, I invoke the same function passing record created by addCol function ( introduced earlier in the post ) and rest of the collection ( 'tail' )</li>
	<li>if the list is empty i return the record</li>
	<li>this is a very common pattern in functional programming</li>
</ul>
To bind everything together, there is a function that initiates the recursion
<pre class="lang:c# decode:true">    let createRecordBasedOnRow cols =
        let rec iterateCols record (cols:List&lt;InputXml.Col&gt;) =
            match cols with
                | head::tail -&gt; iterateCols (addCol head.Name head.Number head.String record) tail
                | [] -&gt; record
        iterateCols createRecord cols</pre>
<ul>
	<li><span style="line-height: 1.5;">I do declare a function iterateCols</span></li>
	<li><span style="line-height: 1.5;">and then invoke it with initial parameters ( an empty record ) and ( list of columns )</span></li>
</ul>
Sequence now returns a collection of Rows with values from Columns
<pre class="lang:c# decode:true">    let records =
        seq {
            for row in tercs.Rows do      
                yield (createRecordBasedOnRow (row.Cols |&gt; Array.toList))
            }</pre>
That's all. <a href="http://pastebin.com/yEJAMzDH ">Full code is available here.</a>
<h3>Recursion vs Loop</h3>
When you look at the original code and new code, it might look less readable. I do find recursion more readable now, but I got used to it. Normal for loop might be more readable in some cases and you have to always ask a questions like.
<ul>
	<li><span style="line-height: 1.5;">Do, I need stateless code in here ?</span></li>
	<li><span style="line-height: 1.5;"> What are the benefits of making this code more 'pure-functional'</span></li>
</ul>
<span style="line-height: 1.5;">Like everything in our field, there is no silver bullet and we have to be pragmatic.</span>

Feel free to leave a comments with your opinions about this code. I would love to hear more suggestion and ideas on how to approach problems like this.
