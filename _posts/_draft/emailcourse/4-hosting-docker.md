Last lesson we have build a simple microservice with basic core blocks. We have tested by running it on your local machine. 

This lesson is all about hosting this service somewhere. By hosting, I mean running it somewhere else than just console using kestrel server.

As this course is technology agnostic (or should be). Our hosting platform of choice will be Docker.

There are other options for local machine
Unix - https://docs.microsoft.com/en-us/aspnet/core/publishing/linuxproduction
Window -https://github.com/Topshelf/Topshelf 

#### Docker

If you are new to container and Docker [check this article.][https://blog.jayway.com/2015/03/21/a-not-very-short-introduction-to-docker/]

Now you should be ready to get to the world of Docker. I am assuming that your machine is running docker daemon. If not go ahead and [install everything.][https://docs.docker.com/engine/installation/]

Make sure you have some space on your hard drive. I did a mistake and killed my mint installation. Docker images can get 'heavy' (thanks to that, I have discovered how to extend partitions in Mint)

To test if docker is properly running on your machine.

```
docker ps
```

This is just to prove that docker is happy and running. This will return empty list at the moment as we haven't done anything yet. PS command lists all the running containers.

You can add option -a and get a list of current and closed containers. 

```
docker ps -a
```

#### Moving app to docker

To run our app in docker we need to add

Dockerfile. This is a file that describes how to build our 'app'. Ok not exactly how to build but how to generate the context. All the differentes parts needed for our app. Typicall it involves adding some base image which contains an operating system and then creating all the folders, files, downloading required packages . Image here means something similar to build package.

To start we need to add a file 'Dockerfile'.

Dockerfile

```
FROM microsoft/dotnet:latest

RUN  mkdir -p /usr/src/microservice
WORKDIR /usr/src/microservice

COPY . /usr/src/microservice
RUN dotnet restore

CMD [ "dotnet", "run" ]
```
Ok what is happening here. Dockerfile contains commands, here you can see FROM, RUN, COPY, CMD etc. Dockerfile is just a list of commands thats it. There is more magic into it as every Command generatee a 'delta' of our image. Something like git, every command is a commit to our 'image'. So images are build of multiple smaller commits applying changes on top of previous one. Those commits are called layers. When you rebuild an image only changed layers are modified. This makes it 'faster' as you can cache the layers. Images once constructed are also read-only. You need to create new image and use the previous one as a base to modify it. 

In the example above we use 'dotnet:latest' as a base image. This one is pretty heavy around 860MB but it contains all you need to run a dotnet app. There are for sure smaller images. You can also create your own, but right now not to overcomplicate things we will use the official microsot one that has the highest change of being 'stable'. Base image is loaded and cached on your filesystem the first time you build it. So don't worry you won't have to download 860MB of data every time.

```
RUN  mkdir -p /usr/src/microservice
WORKDIR /usr/src/microservice
```
This commmads executes a system command mkdir to create our based folder. WORKDIR as name suggests sets this folder as our current working directory.

```
COPY . /usr/src/microservice
```

Then we copy all the files to specified folder.

```
RUN dotnet restore
```

Run the command we got used to to build and restore our app.

```
CMD [ "dotnet", "run" ]
```

And at the end run a command to start the app. Simple.

You might have noticed that there is both RUN and CMD used. They both looks kind of similar in what they do. RUN is used to run command on the image preparation stage. CMD is executed when we start the container. There is a huge difference beetwen image and container. Image is like a package, but it is not yet a running app. The app is running when you create a container using the image by running it.

Dockerfile is used to build an image and specify how to run ccontainer. Before we build the image there is last thing we need to change. 

We need to change Program.cs file adding explicit binding to run on a specific port. Before that we let the dotnet by default start app in port 5000. When I tested this code Docker wasnt properly starting the app and I couldnt query the port 5000. Adding explicit declaration fixed that problem.

Program.cs
```
public static void Main(string[] args)
{
    var host = new WebHostBuilder()
        .UseKestrel()
        .UseContentRoot(Directory.GetCurrentDirectory())
        .UseIISIntegration()
        .UseStartup<Startup>()
        .UseUrls("http://*:5000")
        .Build();

    host.Run();
}
```

Now to build an image.

```
docker build -t workshop/micro-web .
```

This command takes current folder and looks for Dockerfile and builds the image.
While its running you can check what it is doing in the console messages. There are imarges downloaded, build commands started. You should see a dotnet restore activated. Dotnet run was not executed this was is waiting for us to run the image and generate container.

To display list of all the images available on your machine.

```
docker images
```

There should be workshop/micro-web and microsoft/dotnet visible. Now when you create new service using microsoft/dotnet it will use the version cached on your file system unless you need new version.

To run the image and actually create a container.

```
docker run -d -p 5000:5000 workshop/micro-web
```

A bit info about options used here.

-d = detached mode - the container will run in the background
-p = opens the port 5000 for the host machine
And the name of the image.

run command returns ID of newly created container. You can all the running containers using.

```
docker ps
```

The final test is to check if port 5000 is returning anything.

```
http localhost:5000/status/health
```

Hah awesome we have jsut hosted our app in docker container!
We can now start another copy of this application!

With

```
docker run -d -p 5000:5000 workshop/micro-core
```

But oops the port 5000 is already taken. We need to pick another port. 5001?

Lets do this

```
docker run -d -p 5001:5001 workshop/micro-core
```

Ha, but even if now we have made the port 5001 available the app inside container serves data on port 5000. Host is not able to reach the app. We have made the port to be static 5000 value. Time to change that.

First we need to make sure that we can set up port on start of the app.

Program.cs
```
public static void Main(string[] args)
{
    var portNumber = args[0];

    var host = new WebHostBuilder()
        .UseKestrel()
        .UseContentRoot(Directory.GetCurrentDirectory())
        .UseIISIntegration()
        .UseStartup<Startup>()
        .UseUrls($"http://*:{portNumber}")
        .Build();

    host.Run();
}
```

What we are doing here is using args input params to inject the port number when starting the app and then using this arg in URL Binding function.

With this change we can run app like

```
dotnet run 7000
```
And make it run on port 7000.

Now we need to change our Dockerfile to inject this port value

Dockerfile

```
FROM microsoft/dotnet:latest

RUN mkdir -p /usr/src/microservice
WORKDIR /usr/src/microservice

COPY . /usr/src/microservice
RUN dotnet restore

ENTRYPOINT [ "dotnet", "run" ]

CMD [ "5000" ]
```

We introduced ENTRYPOINT and change CMD slightly.  By default if there is no ENTRYPOINT CMD is used as a command when the container is set to run. And an default ENTRYPOINT IS used which is set on unix as /bin/sh -c.

If we introduce ENTRYPOINT, CMD is used to provide default params.

now we can rebuild the image

```
docker build --no-cache -t workshop/micro-web.
```

and run  multiple containers with 

(--no-cache option tell the docker to not use image layer cache)

```
docker run -d -p 5003:5003 workshop/micro-web 5003
docker run -d -p 5004:5004 workshop/micro-web 5004
docker run -d -p 5005:5005 workshop/micro-web 5005
```

This should create 3 containers running 3 apps on difretenc ports, try it :)

Uhh and that should be it for now. This was a brief introduction to how to use Docker. Right now you should feel more comfortable using this great tool.

#### More Links

[Caching image layers][https://www.ctl.io/developers/blog/post/caching-docker-images/]
