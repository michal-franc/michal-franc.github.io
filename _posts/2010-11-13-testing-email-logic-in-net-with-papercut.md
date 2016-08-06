---
layout: post
title: Testing email logic in .Net with Papercut
date: 2010-11-13 16:37
author: Michal Franc

comments: true
categories: [.net, papercut, Uncategorized]
---
<p align="justify"></p>
<p align="justify"><span style="font-size: medium;">Email is a great way to communicate something to the end user asynchronously. You can review the message anytime you want.  As Developers we often need to make some kind of logic which uses emails eg. reminders , alerts etc. While testing it is common to just send an email through smtp server. Receive it , check it etc. </span></p>
<p align="justify"></p>
<p align="justify"><span style="font-size: medium;">But ?</span></p>
<p align="justify"></p>
<p align="justify"><span style="font-size: medium;">What to do when you or your client doesn’t have an smtp server [or your admins doesn’t have time to configure it properly] ? Well there is a simple app which creates such a “testing server”</span></p>
<p align="justify"></p>
<p align="justify"><a href="http://papercut.codeplex.com/"><span style="font-size: medium;"><strong>Papercut</strong></span></a></p>
<p align="justify"></p>

<blockquote>
<p align="justify"><span style="font-size: small;">Papercut is a simplified SMTP server designed to only receive messages (not to send them on) with a GUI on top of it allowing you to see the messages it receives. It doesn't enforce any restrictions on addresses, it just takes the message and allows you see it. It is only active while it is running, and if you want it in the background, just minimize it to the system tray. When it receives a new message, a balloon message will show up to let you know.</span></p>
</blockquote>
<p align="justify"></p>
<p align="justify"></p>
<p align="justify"><a href="http://lammichalfranc.files.wordpress.com/2010/11/picture.jpg"><span style="font-size: medium;"><img style="background-image: none; padding-left: 0; padding-right: 0; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0; border-width: 0;" title="Picture" src="http://lammichalfranc.files.wordpress.com/2010/11/picture_thumb.jpg" alt="Picture" width="442" height="262" border="0" /></span></a></p>
<p align="center"><span style="font-size: medium;"><strong>Pic 1. Papercut Options Windows</strong></span></p>
<p align="justify"></p>
<p align="justify"></p>
<p align="justify"><strong><span style="font-size: x-large;">Testing</span></strong></p>
<p align="justify"><span style="font-size: medium;">Let’s test <a href="http://papercut.codeplex.com/"><span style="font-size: medium;"><strong>Papercut</strong></span></a> with a simple app. </span></p>
<p align="justify"></p>


{% highlight csharp %}
public static void Main(string[] args) 
{ 
    SmtpClient client = new SmtpClient("192.168.0.128",25); 
    MailMessage msg = new MailMessage("michal.franc@mfranc.pl", "test@test.com",  
       "Testing mail", "Testing Body"); 
    client.Send(msg);
}
{% endhighlight %}

&nbsp;
<p align="justify"><span style="font-size: medium;"><a href="http://papercut.codeplex.com/"><span style="font-size: medium;"><strong>Papercut</strong></span></a> works in the background. When the message is received you get a nice popup, and you can check the message.</span></p>
<p align="justify"></p>
<p align="justify"><a href="http://lammichalfranc.files.wordpress.com/2010/11/test.jpg"><span style="font-size: medium;"><img style="background-image: none; padding-left: 0; padding-right: 0; display: block; float: none; margin-left: auto; margin-right: auto; padding-top: 0; border: 0;" title="test" src="http://lammichalfranc.files.wordpress.com/2010/11/test_thumb.jpg" alt="test" width="579" height="239" border="0" /></span></a></p>
<p align="center"><span style="font-size: medium;"><strong>Pic 2. You can check the message.</strong></span></p>
<p align="justify"></p>
<p align="justify"></p>
<p align="justify"></p>
<p align="justify"><span style="font-size: medium;">As you can see it’s a great app which can be useful in many different scenarios.

</span></p>
