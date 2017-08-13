Today:
- Overview of distributed system we are going to build in next lessons
- Architecture, requirements and assumption

We are going to build online shopping platform. Cool right? 

Requirements:
- Client app can be either mobile, web, device etc. - we won't be building that
- order and payment processing
- notifications send to user
- recommendation system
- basic system for warehouse handling
- 'interesting' scale, thousands of requests per second

Assumptions:
- Not building frontend apps only backend system 
- Simulation of user interaction using scripts sending requests
- simplified logic just to show ideas and system design not complex domain logic
- simulation of load done artifically 
- simplified validation handling and user account management, not secure

All the simplification are needed to focus on building systems, not single components. We don't want to spend too much time discussing how to build production ready componentss. It's all about system design.

There is a potential to write hundreds of pages about requirements. Usually it is done with domain expert but still most of those things will be discovered along the way. For now we need something to start reasoning about the project.

Where to start? - Actors
--------------- 

We need to identify what kind of Actors we have. This is backend only and all the Actors are abstracted away. Instead of an user we have a http request.

---- Image Two Actors ----

We have two types of actors:

- external
External Actor is an user, customer, someone using our product to do something, probably fulifll a need. This is online shop, so this entity is making order to buy 'something'.

- internal
Internal actor is someone maintaining the shop, employee, super user. Soemone revewing orders, checking the status of things, amending orders etc

At the beggingin our system is a 'black box', something unknown.

What kind of actions can these actors perform?
Actions are the most important aspect of our system. Those are the entry points makes the system do something. It is important to start with them.

External:
- create order
- amend order
- pay for order
- cancel order
- check order
- check order history
- check recommended product list
- browse the order list
- manage account - crud
- return order / partial order
- more...

Internal:
- cancel/change order
- block account
- add/remove/update products catalogue
- more...

We need to stop now, building full list would conversations with domain experts, and we don't want to get into to may details. Some of the actions and requirements are hidden and need to be discovered. This is how it is in software development, we do both discovery and implementation at the same time. This is one of the reasons while Agile based iterative approach to software builidng is popular. Project with perfect and full specification of requirements are rare. On top of that a lot of companies, doesn't even understand fully their processes. It is our human nature that every group of people builds its own private way of working together.

With those actions we can uncovering the mysterious black box.

Two actors two contexts - we could build the system in a monolithic way, but this is a course about microserices. Monoliths are great and are not going away. I will leave the discussion when to use monolith or microservices for the future. But you have to understand that sometimes monolith is better, it is not like Microservices are the silver bullet. Monolith is usefull and a good option - especially at the begginging when you are builind MVP product and are still exploring the initial idea with the client or customers on the market.

--- image Monolithic typical way of doing stuff ---

Two types of users, monolithic app and one DB. Most of the systems are still built like that. 

Microservice based approach
-------------------------

--- image split of the apps ---

We know we need to support some ordering and payments processing. This means two microservices 'Order Service' and 'Payment Service'. 

--- Intorducing first microservices ---

We need to notify users about all the actions in the system. Traditional way to do that was trhough email. We need Email Service. In 21 cenutry with huge mobile devices adoption it would be also good to have some kind of 'mobile push' notificaitons. All those scenarios can be handled by Notification service.

--- Notification Services ---

There is mention of recommendation service system. We also need a service to do that.

--- Adding recommeservice ---

From the ops side it would be good to be able to manage the 'warehouse' of available items for sale.

--- Warehouse Management Service ---

As you can see this list could get bigger and bigger. We can probably add Customer Management Portal and create another service for that.

--- Customer Management Service ---

I will stop here. This should give you the general idea where we are heading with this. We still haven't touched the topic of Databases. This list could get bigger and bigger, it is all based on the requirements. More complicated sscenarios, more services to handle them. The current picture is also a very generic view. Current services will be split up later on. But more on those discussions later on.

Right now we want to explore the problem space and have a general overview, of the thing we will design together. At the begginging we might start building one big service and then split it up after discovering new requirements or complexities. The architecture will be an ongoing evolution. At the moment we have something 'simple' to start. 
