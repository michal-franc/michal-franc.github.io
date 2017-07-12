-----------------
-----------------
MORE Posts ------
-----------------
-----------------

Some other post later on 
add reverse-proxy like Nginx - why

https://docs.microsoft.com/en-us/aspnet/core/publishing/linuxproduction

In this articules there is a nice info on why nginx can be usefull
-----------------

-------------------------------
Projects that I could build

Uber? - a taxi client system
- this gives me customers asking for a cab
- this gives me people people aaacting as a cab

Usual Ordering system? 
- as the one in Warsaw

Restaurant mgmnt system
- orders, takeaway
- drivers management etc
- payments

Twitter system
- with different clients approaches

Factory maintnance system?
- the one that someone mentione

---------------------------------------------------
Microservices that might be needed

Creating new type of microservice that contacts a redis and stores something in a database.

- read updaaeeet to redis
- show how to do a healtcheck that ceecsk db
- show when the db is down a healthcheck is bad

Create a job service that takes dhe data from DB aggregates them
- storing the result on other database

Create a notified service
- that gests a call from the job aggregator and notifies someeone with email?
- that something was donek

other lessons 
- after introducing mutliple services and load balancer
- have a manage endpoint to disable, enable service, or do a gracefull cleanup, or cleanup of logs, resources etc monitoreed by our system
- also add registry so that load balanceer knows how to locate the services


- with monitoring we need to add monitoring of cpu memory etc and some apm tool

Next lessons will cover 
- building more interesting microservices
  - saving some data
  - reading data
  - worker job
- building simple distrbuted systems using those
- adding nginx as a reverse proxy layer and benefits of using it
- building more complex distributed systems using docker compose
- adding databasess and so on and so on
- deploying to AWS
- maybe using kubernetes
