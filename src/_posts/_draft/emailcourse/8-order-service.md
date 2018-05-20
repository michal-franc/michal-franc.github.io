- start with the order system aas this is the most inportant par of the system
if we cant take orders and persists them customers will go to someone else, there are of course other crucial parts like, how fast can we implement recommnedation systme or some searchin functionalitiyes, but in the end all that matters is ordering, we need to take an order, persist it somehow

- What kind of order we have? 
Main part of it is - what is being ordered, what kind of items + billing adderss + delivery addres + probalby also payment options ( this will be discuseed later )

Our first service is going to just take a request to create an order from the app and do something with it. At the moment all we will do is presist it.

- image of the order and all the ingredients using icons 

- Image of order service and order request with PUT ( to create ) -> have database as a question marker

- Database, how can we persist orders?
|Normally SQL with some denormalization.
Can we make it differnt though? Maybe document?

Image of SQL solution - denormalized or normalized

Image of Document solution ->
Explain problem with document and why SQL could be better here.
But order can be persiste aas a whole and if user updates the account, does it mean that order should be updated? WIll user assume this? Are we even allowing users to modify their data? Or should we just do it like in AWS where you can specify default billing and delivery data and this is persisted as single document without joins and lookups so if you want to change the order then you need to go and change order.

Explain why this solution is better and why communicating data change is impoortant to users. PErsisitn all the data in document without lookups has other benefit. With this approach Order is not dependant on any other external data and has all that is needed available here inside document to fulfiff the order.

- Create a microservices for orders and some document db ( not mongodb )
- Dont explain full code just details and create docker compose system to just download and run. + show people how to play around with it by provviding api calls and responses.

Explain also what docker compose is.
