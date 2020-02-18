---
layout: post
title: Begginging of the internet and first addressing problems
date: 2019-10-14 07:00
author: Michal Franc
comments: true
categories: [Tech]
tags: [dns, deep-dive]
image: 
series: 
permalink: /blog/begginging-of-internet-and-first-addressing/
summary: Evolution of DNS architecture.
---

{% include toc.html %}

Due to the stuff I am working on in with my current client, I had to get into more details about DNS recently. The way I usually looked at DNS was - it is this simple key/value store where for a given hostname you get the IP address back. You then attach it to data creating packet, send it to the internet and it magically finds the way to the destination. It sounds simple but there is a lot of complexity hidden behind moder DNS. This technology has evolved from a simple beginnings to a globaly and highly available distributed database. 

If you know me well, you know I am really passionate about history. When studying history, I am mostly interested in answering question why. Why has something happened? What kind of conditions and context generated this outcome. Simillary when learning some tech, of course its important to get to know how to use something but it is also important to understand how things evolved and changed over time. What is the story behind it. 

With DNS, I started with its history.

- How did it happend that we have current solution?
- What kind of problems/requirements shaped its current implementation and architecture?
- Where was the beginning?

[^packet-switching]:[Wikipedia - packet switching](https://en.wikipedia.org/wiki/Packet_switching)
[^paul-baran-origin-of-internet]:[Rand - Paul Baran and the origins of the Internet](https://www.rand.org/about/history/baran.list.html)
[^paul-baran-line-switching]:[Rand - The Distributed Adaptive Message Block Network](https://www.rand.org/pubs/research_memoranda/RM3638/RM3638.chap3.html)

[^not-used]:[Not Used](http://www.cs.virginia.edu/~jorg/teaching/cs457/slides/Introduction.pdf)


### Internet and the Atomic Bomb - packet switching[^packet-switching]

I was surprised to learn that Atomic bomb is the reason we have Internet today.

In 1960s, communication networks were mostly made from analog circuits. To transfer information from point A to point B a connection had to be established on each node in the network. To do this network had to reconfigure itself using `circuit switching`. It is similar concept to telephone lines and asking operator to let you through. You can see this sometimes in some old movies. Network was much more centralised with each node required to keep track which connection is active. This was not a `stateless` solution.

![Circuit Switching](/images/circuit-switching.gif "Circuit switching - switching centrals reconfigure the network to establish different connections.")
{: .tofigure }

This approach has its advantages. Like reliable reserved connection with pre-allocated bandwidth. You don't share it with anyone and the the whole network from point A to be B is reconfigured just for you and your communication. There is however one big problem - fault tolerance. In a hypothetical scenario you could `break` the ability to send information by destroying one of the nodes. This would reconfiguration which takes time and creates disruption, especially for the `client` wanting to send information as he has to wait for it to be ready.

US military wanted more distributed and resilient system that could still send a signal through with considerable damage to the network. This is where `packet switching` comes in.[^paul-baran-origin-of-internet][^paul-baran-line-switching]

The first step to achieve more `resilience` was to remove `state` from network nodes. To do this, instead of having a place telling the nodes how to `reconfigure` itself, allow them to decide dynamically on the fly how to move data across. Of course this poses a question, how would the nodes know were to send a data? That is how `packet` was born. Take your signal/data add to it some metadata required by the network to make these decisions and just send it over. This lets the network to make `just in time` decisions, without central supervision makin it more tolerant to disruption.


![UDP packet vs TCP packet](/images/udp_vs_tcp.png "Packets are sometimes called datagrams, but there is a reason why UDP - User Datagram Protocol - has a datagram inside its name. Datagrams are considered to be packets with metadata able to create `connectionless` but unreliable transmission of data. TCP packets on the other hand contain a lot more metadata as the protocol is more complicated but it provides a reliable transmission of data.")
{: .tofigure }

The second step is to decentralise the network and make it more distributed, without stations responsible to arrange a call, without a step of establishing a connection.

![Distributed vs Centralised](/images/distributed_vs_centralised.png "Centralized network resembles more a tree structure with root and leafe nodes. There is a hierarchy. Distributed network is similar to a graph without any hierarchy.")
{: .tofigure }

With packets and more distributed network there is no central place you can take out to disrupt the network. Also with packets you don't need to arrange calls. You partition your data into packets, attach metadata like destination to each one of them, and sent them to the network. There is no need to start a call. As long as there is `one` working route in the network your data will be delivered, and there is no need for someone to even know if there is a route.

![Packet switching](/images/packet-switching.png "Packet switching - In 90's internet was called an information highway, as packets resebmled cars on a highway going from one destination to another, making decision which turn to take.")
{: .tofigure }

[^first-network-lecture]:[Youtube - The first Internet connection, with UCLA's Leonard Kleinroc](https://www.youtube.com/watch?v=vuiBTJZfeo8)
[^ucla-wikipedia]:[University of California](https://en.wikipedia.org/wiki/University_of_California,_Los_Angeles)
[^sri-wikipedia]:[Stanford Research Institue](https://en.wikipedia.org/wiki/SRI_International)
[^imp-wikipedia]:[Interface Message Processor](https://en.wikipedia.org/wiki/Interface_Message_Processor)
[^dns-book]:[Signposts in Cyberspace: The Domain Name System and Internet Navigation](https://www.amazon.co.uk/Signposts-Cyberspace-Domain-Internet-Navigation/dp/0309096405)
[^sigma-7]:[Sigma7 device](https://en.wikipedia.org/wiki/SDS_Sigma_series)
[^pdp]:[Programmed Data Processor](https://en.wikipedia.org/wiki/Programmed_Data_Processor)

### First internet network and packet [^first-network-lecture]

Internet was born on `October 29, 1969`. The first network was very simple one. Two nodes - one in `UCLA`[^ucla-wikipedia] and 2nd one in `SRI`[^sri-wikipedia]. In order to communicate the machines used a serial interface connected to `IMP`[^imp-wikipedia] (Interface Message Processor, a device which was the size of a refrigerator). IMP was the precurssor of todays routers, a device that moves and routes the packets.

- First node UCLA - September 2nd, 1969 - `Sigma7`[^sigma-7] connected to IMP.
- Second node SRI - October 1, 1969 - SRI - `PDP`[^pdp] with another IMP

![First network](/images/first-network.png "First network - 2 hosts")
{: .tofigure }

The network expanded to 4 hosts the same year.

- Third node - November 1st, 1969
- Fourth node - December, 1969

![Evolution 4 hosts](/images/4-host-network.png "First network - 4 hosts")
{: .tofigure }

The first packet send in this network was character `l`. Engineers in UCLA wanted to send `login` message from their terminal to terminal in SRI. The system crashed when they got to `g` character. It is good to know that internet was born with a crash.

[^rfc208]:[rfc208 - Address Tables](https://tools.ietf.org/html/rfc208)
[^rfc226]:[rfc226 - Standardization of Host Mneumonics](https://tools.ietf.org/html/rfc226)
[^rfc236]:[rfc236 - Standard Host Names](https://tools.ietf.org/html/rfc236)
[^rfc247]:[rfc247 - Preferred Set of Standard Host Names](https://tools.ietf.org/html/rfc247)

#### First Address Table

Early network had two types of machines. `HOSTS` and `IMPS`. IMP was responsible for data transfer and routing like a router. HOST machine was used by user to tell which commands to send.

![HOSTS and IMPS](/images/hosts_with_imps.png "Network with HOSTS and IMPS")
{: .tofigure }

Eeach packet had an 8-bit address - six bits for IMP devivce number and two bits for Host. With 2 bits you can only have 4 differents states `[00, 01, 10, 11]`, this ment that one IMP could support only 4 HOST machines. With 6 bits for IMP address there was also a limit to `(2^6 = 64)` IMPS. This type of address specification limited whole system to have `256` HOSTS.

![HOSTS and IMPS](/images/imp_packet.png "http://mercury.lcs.mit.edu/~jnc/tech/arpapkt.html")
{: .tofigure }


Addressing of IMP devices was handled internaly. As a User you had to know which HOST machine you want to send data to. You can find first simple address table in this RFC208[^rfc208].

![Early addressing](/images/early_addressing.png "It is August 1971 there are 30 IMP devices and around 40 HOSTS. Each pair of [Imp Number: Host number] is translated into a network address.")
{: .tofigure }

As a User you specify which HOST you want to reach and it is translated to Network Address. This HOST list was manintained manually on each HOST, which leaad to different names and conventions per host. It means that when you moved places and used different machine you had to check the addressing table for this place to know how to send data to some place you send it over from a diff machine. This is of course not an ideal solution and first standarizaiton happened in RFC226[^rfc226] with a 6 letter designator pointing to a HOST (network address).

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

Hostnames and addressing was a really hot topic back in these days, as there are a lot of RFCs dedicated to discussions about it.

#### Centralised HOSTS.txt - file driven address resolution

The process of maintaing separate address tables was not scalable especially when a rapid expansion of the `internet` has happened. In RFC690[^rfc690] a discussion is taking place menioning that `addressing` has reached its capacitiy of `256` potential addresses and would need to expand to 24 bits (2 bytes for IMP devices and 1 byte for Hosts). This would enable network to address ~65k IMP device with each one able to sustain 256 HOSTS - network would be able to adrress ~16mil machines. This was considered to be a `big` number back then.

> Just a few years ago 256 seemed like a lot of hosts, perhaps, a extensible scheme might be more appropriate. (I concede 16,777,216, is big)

![Rapid expansion](/images/arpanet_expansion.gif "Expansion of host machines in the ARPANET http://mercury.lcs.mit.edu/~jnc/tech/ARPANet_Maps.gif")
{: .tofigure }

It was not an easy task to keep each host in sync with the network and its capabilities. This is especially visible in RFC305[^rfc305] which describes a confusion in the network when new host are added and tested. The proces to update Host tables as per RFC305 was to wait for a `BBN` notification mentioning a new device and host operators updating their tables on their sites. As this is asynchronous process this of course ment that some of the sites would forget about update or add it with some delay. Also as this was a manual process mistakes could happen easilly.

[^rfc305]:[rfc305 - Unknown host numbers](https://tools.ietf.org/html/rfc305)
[^rfc690]:[rfc690 - Comments on the proposed Host/IMP Protocol Change](https://tools.ietf.org/html/rfc690)

#### Host Names online

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


