---
layout: post
title: DNS Architecture from a single file to globally distributed database
date: 2019-10-14 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [dns, deep-dive]
image: 
series:
permalink: /blog/dns-single-file-to-globally-distributed-database/
summary: Evolution of DNS architecture.
---

{% include toc.html %}

Due to the stuff I am working on in my current company, I had to get into more details about DNS recently. The way I usually looked at DNS was - it is this simple key/value store where for a given hostname you get the IP address back, which you then put to your packet of data, send it to the internet and it magically finds the way to the destination. 

Of course it is not that simple. DNS evolved over time from from simple beginnings to a globaly and highly available distributed database. If you know me well, you know I am really passionate about history. Usually this passion is oriented around, ancient history, forming of nations, kings, queens - you know the typical stuff.

 When studying history I am mostly interested in answering question why. Why has something happened? What kind of conditions and context generated this specific outcome. You can learn a lot from it and understand the world better thanks to it.

I do approach learning a new tech simillary. So with DNS, I started with its history.

- How did it happend that we have current solution?
- What kind of problems/requirements shaped its current implementation and architecture?
- Where was the beginning?

And so where to start the journey? I think with the - Atomic Bomb.

[^packet-switching]:[Wikipedia - packet switching](https://en.wikipedia.org/wiki/Packet_switching)
[^paul-baran-origin-of-internet]:[Rand - Paul Baran and the origins of the Internet](https://www.rand.org/about/history/baran.list.html)
[^paul-baran-line-switching]:[Rand - The Distributed Adaptive Message Block Network](https://www.rand.org/pubs/research_memoranda/RM3638/RM3638.chap3.html)

[^not-used]:[Not Used](http://www.cs.virginia.edu/~jorg/teaching/cs457/slides/Introduction.pdf)


### Internet and the Atomic Bomb - packet switching[^packet-switching]

I was surprised to learn that Atomic bomb is the reason we have Internet today.

In 1960s, communication networks were mostly made from analog circuits. To transfer information from point A to point B a connection had to be established on each node in the network. To do this network had to reconfigure itself using `circuit switching`. It is similar concept to telephone lines and asking the operator to let you through. Network was much more centralised with swtiching nodes requiring to have `state` of which lines to connect.

![Circuit Switching](/images/circuit-switching.gif "Circuit switching - switching centrals reconfigure the network to establish different connections.")
{: .tofigure }

This approach has its advantages like reliable reserved connection with allocated bandwidth. There is however one big problem - fault tolerance. In a hypothetical attack you could `break` the ability to send information by destroying one of the nodes, breaking the connection and requiring to create new connection using different route. This takes time and creates disruption.

US military wanted more distributed and resilient system that could still send signal through with considerable damage to the network. This is where `packet switching` comes in.[^paul-baran-origin-of-internet][^paul-baran-line-switching]

The first step to achieve more resilience was to remove `state` from network nodes. To do this, instead of having a place telling nodes how to `switch circuits`let them decide dynamically on the fly how to move data across the network. But then how would the nodes know were to send a data? That is how `packet` was born, a piece of information with metadata added to it, containing information required by the network. This enables networ nodes to make decision `just in time` without any supervision and removes any central from the picture making whole system more tolerant to disruption.


![UDP packet vs TCP packet](/images/udp_vs_tcp.png "Packets are sometimes called datagrams, but there is a reason why UDP - User Datagram Protocol - has a datagram inside its name. Datagrams are considered to be packets with metadata able to create `connectionless` but unreliable transmission of data. TCP packets on the other hand contain a lot more metadata as the protocol is more complicated but it provides a reliable transmission of data.")
{: .tofigure }

The second step is decentralise and and make the network more distributed, without stations responsible to arrange a call, without a step to create a connection.

![Distributed vs Centralised](/images/distributed_vs_centralised.png "Centralized network resembles more a tree structure with root and leafe nodes. There is a hierarchy. Distributed network is a graph without any hierarchy.")
{: .tofigure }

With packets and more distributed network there is no central place you can take out to disrupt the network. Also with packets you don't need to arrange calls. You partition your data into packets, attach metadata like destination to each one, and sent them to the network. There is no need to start a call. As long as there is `one` working route in the network your data will be delivered.

![Packet switching](/images/packet-switching.png "Packet switching - In 90's internet was called an information highway, as packets resebmled cars on a highway going from one destination to another, making decision which turn to take.")
{: .tofigure }

[^first-network-lecture]:[Youtube - The first Internet connection, with UCLA's Leonard Kleinroc](https://www.youtube.com/watch?v=vuiBTJZfeo8)
[^ucla-wikipedia]:[University of California](https://en.wikipedia.org/wiki/University_of_California,_Los_Angeles)
[^sri-wikipedia]:[Stanford Research Institue](https://en.wikipedia.org/wiki/SRI_International)
[^imp-wikipedia]:[Interface Message Processor](https://en.wikipedia.org/wiki/Interface_Message_Processor)
[^dns-book]:[Signposts in Cyberspace: The Domain Name System and Internet Navigation](https://www.amazon.co.uk/Signposts-Cyberspace-Domain-Internet-Navigation/dp/0309096405)
[^sigma-7]:[Sigma7 device](https://en.wikipedia.org/wiki/SDS_Sigma_series)
[^pdp]:[Programmed Data Processor](https://en.wikipedia.org/wiki/Programmed_Data_Processor)

### First network and first packet [^first-network-lecture]

Internet was born on `October 29, 1969`. The first network was very simple. Two nodes - one in `UCLA`[^ucla-wikipedia] and 2nd one in `SRI`[^sri-wikipedia]. In order to communicate the machines used a serial interface connected to `IMP`[^imp-wikipedia] (Interface Message Processor, a device which was the size of a refrigerator). IMP was the precurssor of todays routers, a device that moves and routes the packets through the network.

- First node UCLA - September 2nd, 1969 - `Sigma7`[^sigma-7] connected to IMP.
- Second node SRI - October 1, 1969 - SRI - `PDP`[^pdp] with another IMP

![First network](/images/first-network.png "First network - 2 hosts")
{: .tofigure }

The network expanded to 4 hosts the same year.

- Third node - November 1st, 1969
- Fourth node - December, 1969

![Evolution 4 hosts](/images/4-host-network.png "First network - 4 hosts")
{: .tofigure }

The first packet send in this network was character `l`. Engineers in UCLA wanted to send `login` message from their terminal to terminal in SRI. The system crashed when they got to `g` character. Internet was born with a crash.

[^rfc208]:[rfc208 - Address Tables](https://tools.ietf.org/html/rfc208)
[^rfc226]:[rfc226 - Standardization of Host Mneumonics](https://tools.ietf.org/html/rfc226)
[^rfc236]:[rfc236 - Standard Host Names](https://tools.ietf.org/html/rfc236)
[^rfc247]:[rfc247 - Preferred Set of Standard Host Names](https://tools.ietf.org/html/rfc247)

#### First Address Table

Early network had two types of machines. `HOSTS` and `IMPS`. IMP is responsible for data transfer like a router. HOST machine is used by user to send data across the network.

![HOSTS and IMPS](/images/hosts_with_imps.png "Network with HOSTS and IMPS")
{: .tofigure }

Eeach packet had an 8-bit address - six bits for IMP devivce number and two bits for Host. With 2 bits you can only have 4 differents states `[00, 01, 10, 11]`, this ment that one IMP could support only 4 HOST machines. With 6 bits for IMP address there was also a limit to (2^6 = 64) IMPS. This type of address specification limited whole system to have `256` HOSTS attached to it.

![HOSTS and IMPS](/images/imp_packet.png "http://mercury.lcs.mit.edu/~jnc/tech/arpapkt.html")
{: .tofigure }


Addressing of IMP devices was handled internaly as a User you only had to know which HOST machine you want to send data to. RFC208[^rfc208] contain first address table. 

![Early addressing](/images/early_addressing.png "It is August 1971 there are 30 IMP devices and around 40 HOSTS. Each pair of Imp Number, Host number is translated network address.")
{: .tofigure }

As a User you specify which HOST you want to reach and it is translated to Network Address. This HOST list was manintained manually on each Host. So each HOST had its onw list with its own naming conventions.

First standarizaiton happened in RFC226[^rfc226] with a 6 letter designator poiting to a HOST (network address).

![rfc226](/images/rfc226.png "First standarization of designator and host number.")
{: .tofigure }

#### Alternate hostnamess and first authorization process

![rfc236](/images/rfc236.png "Expanded list of hostnames with alternate names.")
{: .tofigure }

This list was then expanded and included alternate names. These were added due to very interesting reasons, user experience, apparently early users were to lazy to use longer names.[^rfc236].

> It has been brought to my attention that programmers are lazy and don't like
to deal with character strings longer than one computer word or containing
characters other than the capital letters A-Z or the digits 0-9.  Thus, I
have included an alternate list which is limited to 4 character names using
only the alphanumerics.

There is also mention of first type of hostname authorization process in RFC236

> It also seems to me to be a good idea to consult with each host's technical liaison officer before assigning that host's name.

Then in RFC247[^rfc247]. Network Address was attached to a name constructed from `site` name and `machine` name.

![rfc247](/images/rfc247.png "Figure todo")
{: .tofigure }

Hostnames and addressing was a really hot topic back in these days, as there are a lot of RFCs dedicated to discussions around it, also in RFC247 you can find this sentence.

> an RFC actually generated comments!!!

#### Rapid expansion of the internet

- show maps and numbers how quickly it has expanded
http://mercury.lcs.mit.edu/~jnc/tech/ARPANet_Maps.gif
http://www.cbi.umn.edu/hostedpublications/pdf/McKenzieNCP1972.pdf

First problems https://tools.ietf.org/html/rfc305
How was the host uptadet?
- There was a BBN notification mentioning new imp devices and Hosts, operators updates it on theirs site.
- This of course generates problems as some sites might not update in time or forget it, or make mistakes. The process was manuall.

Each node has its own hosts table. And it was not transferable really beetwen people departments.

Host to IMP protocol
https://tools.ietf.org/html/rfc690
- mention that 16mln was considered a lot :D
- and now we reached out ipv4
- and how about ipv6


#### Centralised HOSTS.txt - file driven address resolution

http://www.rfc-editor.org/rfc/rfc606.txt

To start slow standarization process first standarized list was created. In Rfc226[8] you can find this list, it is dated 20 september 1971. It is amazing that at that time there were only 20 hosts. You could fit this list in your local moder hosts file easilly.

https://tools.ietf.org/html/rfc226 
- how it was managed, how it looked like
- ftp 
- how it was propagated to everyone else?  Syncrhonization problems.

hostname is born
https://tools.ietf.org/html/rfc247

### Hostname Server
http://www.rfc-editor.org/rfc/rfc625.txt
http://www.rfc-editor.org/rfc/rfc623.txt
https://tools.ietf.org/html/rfc811
https://tools.ietf.org/html/rfc953


### DNS and domain names are born
- difficulty to remember ip addresses

https://www.cs.cornell.edu/people/egs/615/mockapetris.pdf

RFCS
----
http://www.zytrax.com/books/dns/apd/


#### First design

### IP is born

### TXT is added

### CAA is added
https://tools.ietf.org/html/rfc6844

### NA is added
https://tools.ietf.org/html/rfc3403

### IPV6
https://tools.ietf.org/html/rfc3596

### Current system

http://www.zytrax.com/books/dns/ch4/

Types of DNS servers
https://www.cloudflare.com/learning/dns/dns-server-types/

why there are only 13 root servers
https://www.lifewire.com/dns-root-name-servers-3971336

https://securitytrails.com/blog/dns-root-servers

https://root-servers.org/

#### Global

#### Distributed

#### Database


DNS History:
- http://www.softpanorama.org/DNS/history.shtml
https://www.livinginternet.com/i/iw_dns_history.htm
https://www.cloudns.net/blog/dns-hisotry-creation-first/
