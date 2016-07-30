---
layout: post
title: CouchDB - First Steps
date: 2013-04-30 12:00
author: LaM
comments: true
categories: [NoSql]
---
Long long time ago in one of the posts ... I briefly described CouchDB installation process on the local machine.

<h3>IrisCouch</h3>

If you don't want to configure local database you can use <a href="http://www.iriscouch.com/">IrisCouch hosting</a>.
You can get free database for basic tests. I am using this database hosting for one of the projects hosted in heroku. It is free for really basic usage.

Now we can play with our new toy. Let's start with some general concepts.

<h3>Where are my tables ?</h3>

Quick answer there are no tables. Data is stored in a form of documents, which are JSON objects. Each document have properties. Properties are like columns. You can story values, array of objects, custom objects in them. 

<pre class="lang:js decode:true " >{
   "_id": "40e4bddb4071125d6fb2e559c107d91f",
   "_rev": "1-ff557593af8688073e77405d96231a87",
   "type": "feed",
   "url": "http://feeds.feedburner.com/maciejaniserowicz",
   "isActive": true,
   "isApproved": true
}
</pre> 

Here is a simple example. This document has properties : isActive, isApproved, type, url. 

<b>_id</b> is a special value that has to be unique for each document. You can assign it by yourself, but it is also generated automaticly when you add document. Automatic value is a representation of UUID.

<b>_rev</b> is a special identification number which is used for the document versioning. Each time you save changes to the document _rev value is regenerated.

<h2>How to query this freaking thing ?</h2>

With this little introduction it is time create first query. I was using mostly relational databases that used SQL language to write queries. In CouchDB it is not simple like that. There is no SQL language and you don't write queries. Instead you create map/reduce functions that are stored in CouchDB in form of custom views.

Map function is used to filter out the data. We can think of it as QUERY with WHERE clause and SELECT statement.

Reduce function is used to transform data to a new object. You can perform operations like SUM or COUNT here. I will write about this particular function in some later posts. Let's focus now on querying the data.

<h3>Map function</h3>

<pre class="lang:js decode:true " >function (doc) {
              var id = doc._id;
              if(doc.type === 'feed' &amp;&amp; !doc.isApproved) {
                var url = doc.url;
                emit(id, url);
            }
          }
</pre> 

In CouchDB map function  === javascript function. It takes document as a parameter and returns nothing. Instead of return you have to use emit function. Map function iterates through all the documents and tries to match the document based on the if clause. If the document is matched we call the emit function.

emit() function takes two arguments ( key, value). This function can be called mutliple times in one map function and is used to create the view result with rows each containing key and value. View result then is converted to JSON object that contains rows and metadata.

<pre class="lang:js decode:true " >

{
  "total_rows": 0,
  "offset": 0,
  "rows": [
  ]
}
</pre> 

<h2>Accesing data from the browser</h2>

The nice thing about CouchDb is that we can access data by using the HTTP protocol. Simple GET message is all we need to  access data.

For example: GET to - http://localhost:5984/database.name/id 

Returns the document with the id. You can make GET query to views, documents, database. It is quite usefull when you want to access data from javascript without the hassle of installing all the different frameworks. 

In one of the apps on  node.js, I am using nano module to access the database. This module is just a wrapper to the HTTP protocol.

<h3>Summary</h3>

That's it for now. CouchDB is a nice database engine slightly different than Redis engine that I used recently. My experience with NoSql is still little low. But it is a fun thing to learn. I believe in a multiple databases used in the project with specialised database engines used for different things. You can read about this on <a href="http://martinfowler.com/bliki/PolyglotPersistence.html">Martin Fowler blog.</a>. 

Stay tuned for more CoudhDB adventures.
