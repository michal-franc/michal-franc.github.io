---
layout: post
title: Docker container to container communication
summary: 
date: 2017-04-10 10:00
author: Michal Franc
comments: true
categories: [tech]
tags: [docker, archive]
image: containers.jpg
---

I am building simple distributed system with the simplified service registry. All the services have to register to one main service, sending simple metadata: name of service, up etc. The plan is to deploy each service inside the container and establish communication between them. Containers can't call each other by default.

**Using docker network to establish connection**.
By default, docker creates three networks (those are built into the docker and you can't remove them etc). The default one is - 'bridge'. In default, network container can communicate by IP.

> Docker does not support automatic service discovery on the default bridge network

This is not super usefull to me and I need them to recognize by name. To do that you have to add a new network (there is a legacy option --link but I guees there is a reason why this is a legacy).

Creating new network for containers.

<code>
docker network create --driver=bridge -o "com.docker.network.bridge.enable_icc"="true" name_of_the_network
</code>

Driver 'bridge' which is the 'simple one' and only works for one docker host. There is also 'overlay' driver that is able to work on multiple hosts. This one requires access to key/value store to manage state.

> com.docker.network.bridge.enable_icc - Enable or Disable Inter Container Connectivity

I tried the default settings but it looks enable_icc has to be enabled as it is false based on documentation.

After the network was created all you had to do is to run container using this new network.

<code>
docker run -d --network=name_of_the_network name_of_container
</code>

Using this approach my services are able to call simple service discovery service by name, not IP.

[1]:https://docs.docker.com/engine/userguide/networking/
