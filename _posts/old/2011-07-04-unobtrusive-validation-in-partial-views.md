---
layout: post
title: Unobtrusive validation - Partial View
date: 2011-07-04 18:20
author: Michal Franc

comments: true
categories: [Javascript, jquery]
---
<strong>TL;DR;</strong>

<h2>Solution</h2>
And here is the final solution. simple plugin to jQuery.

{% highlight csharp %}
(function ($) { 
    $.validator.unobtrusive.addValidation = function (selector) { 
    //get the relevant form 
    var form = $(selector); 
    // delete validator in case someone called form.validate()
    $(form).removeData("validator"); 
    $.validator.unobtrusive.parse(form); 
  }
{% endhighlight %}

<h2>Usage</h2>
On the partial view use

<h2>Explanation - Unobtrusive validation in partial view</h2>
<p align="justify">Unobtrusive validation is a great feature. You can easily bind your server side validation to client side validation provided by JQuery plugin.</p>
<p align="justify">Everything is fine but there is a small problem. When working with Partial views with form you need to load unobtrusive validation two times. First on when the main window is loaded and then the second time when the partial view is injected. Why ? Unobtrusive validation attaches special attributes to field on load event, which are used to bind your own rules defined inside the model with rules implementation provided by JQuery library.</p>
<p align="justify">When you create a partial view  fields in new form are without those special attributes and so validation is not working.</p>
<p align="justify">One of the solution is to load unobtrusive .js file again. It works but you need to load something twice wasting resources.</p>
Let's find a better solution.
<h2>Scenario 1 - dynamic elements</h2>
Some googling / binging and <a href="http://xhalent.wordpress.com/2011/01/24/applying-unobtrusive-validation-to-dynamic-content/">I found this post</a>

This solution is ok if you are adding dynamic element to a form with already attached validation attributes .
<p align="justify">In my scenario with dynamic data in partial, I am creating new form waiting to be validated. So let’s look at the next solution.</p>

<h2>Scenario 2 - new form (in partial view)</h2>

<p align="justify">After a lot of research  and debugging through the jQuery and MS validation plugin (at least I know in details how unobtrusive validation works ) . I noticed that unobtrusive creates special OnError method and overrides the default one ( which  injects default label ) in the jQuery</p>

<h3>Unobtrusive</h3>

{% highlight csharp %}
    function onError(error, inputElement) {  // 'this' is the form element
        var container = $(this).find("[data-valmsg-for='" + inputElement[0].name + "']"),
            replace = $.parseJSON(container.attr("data-valmsg-replace")) !== false;

        container.removeClass("field-validation-valid").addClass("field-validation-error");
        error.data("unobtrusiveContainer", container);

        if (replace) {
            container.empty();
            error.removeClass("input-validation-error").appendTo(container);
        }
        else {
            error.hide();
        }
    }
{% endhighlight %}

Creating proxy with <strong>onError </strong>:

{% highlight csharp %}
        if (!result) {
            result = {
                options: {  // options structure passed to jQuery Validate's validate() method
                    errorClass: "input-validation-error",
                    errorElement: "span",
                    errorPlacement: $.proxy(onError, form),
                    invalidHandler: $.proxy(onErrors, form),
                    messages: {},
                    rules: {},
                    success: $.proxy(onSuccess, form)
                },
                attachValidation: function () {
                    $form.validate(this.options);
                },
                validate: function () {  // a validation function that is called by unobtrusive Ajax
                    $form.validate();
                    return $form.valid();
                }
            };
            $form.data(data_validation, result);
{% endhighlight %}

<p align="justify">There is a method <strong>“parse”</strong> in unobtrusive plugin , which is responsible for creating validation attributes , adapters and also what’s really important <strong>errorPlacement</strong> adapter. Everything you need. Knowing all of this we can just use this <strong>“parse” </strong>on the form and everything should work fine.</p>

<p align="justify">Well there is a small problem. This won't work because after a bit of analysis,I found that you can create validation rules once (correctly , without reloading whole script file ). Second and Third try won’t do anything. There will be problems with error placement or validation messages won’t show at all.</p>

<p align="justify">It seems that cached values are used. And it doesn’t matter if there are two different forms this behavior is global. Developers assumed that page should have only one form.</p?

So how to fix this ?

<strong>Delete validator data.</strong>
