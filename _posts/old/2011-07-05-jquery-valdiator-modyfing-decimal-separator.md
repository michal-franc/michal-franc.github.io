---
layout: post
title: JQuery Validator– Modyfing decimal separator
date: 2011-07-05 20:28
author: Michal Franc

comments: true
categories: []
tags: [archive]
permalink: /javascript/jquery-valdiator-modyfing-decimal-separator/
---
<h2>Problem</h2>
By default <strong>jQuery</strong> validator  uses only validation by <strong>“dot”</strong> separator.
<h3>default code:</h3>

{% highlight csharp %}
jQuery.extend(jQuery.validator.methods, { 
       number: function(value, element) { 
       return this.optional(element) 
        || /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value) 
       } 
});
{% endhighlight %}

I needed plugin that would allow <strong>“comma”</strong> separator.
<h2>Solutions</h2>
<h3>Simple or operator :</h3>

{% highlight csharp %}
jQuery.extend(jQuery.validator.methods, { 
         number: function(value, element) { 
            return this.optional(element) 
            || /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value) 
            ||  /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value); 
          }
});
{% endhighlight %}

Combining two regexps. Not optimal but if you don’t know regexp its “good enough”.
<h3>brute force version :</h3>

{% highlight csharp %}
jQuery.extend(jQuery.validator.methods, { 
         number: function(value, element) { 
            var val =  value.replace(',','.');
            return this.optional(element) 
             || /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(val);
          }
});
{% endhighlight %}

Simple but effective version with string replace.
<h3>One regexp :</h3>

{% highlight csharp %}
jQuery.extend(jQuery.validator.methods, { 
         number: function(value, element) { 
            return this.optional(element) 
             || /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:[,.]\d+)?$/.test(value);
          }
});
{% endhighlight %}

Best Solution ;]
