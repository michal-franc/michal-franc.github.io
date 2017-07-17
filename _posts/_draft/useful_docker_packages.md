
Blogg Post: Usefull docker images for .NET core maniacs

- reddit dotnet
- dotnet grupa
- slack
- mail ( need links for newsletter too )

### Microsoft

#### [microsoft/dotnet][https://hub.docker.com/r/microsoft/dotnet/]
[link to repo][https://github.com/dotnet/dotnet-docker]

Probably the most defualt docker image you can use. Contains all you need to run dotnet core apps.?? Can you dev with it

#### https://hub.docker.com/r/microsoft/aspnetcore/
Package that contains precompilsed.package that contains precompiled dotnet libriaries to speed up the app start, 
##### Interesting bits and pieces
They get the precompiled dotnet from ms cdn
``` -> code
##### https://github.com/aspnet/aspnet-docker/blob/master/README.aspnetcore-build.mdpackage used as a build process in CI

Nice interesting way to warmup nuget cache.Example on how to warmup nuget cache in a very simple way
````
# warmup up NuGet package cache
COPY packagescache.csproj C:/warmup/packagescache.csproj
RUN dotnet restore C:/warmup/packagescache.csproj `
        --source https://api.nuget.org/v3/index.json; `
    Remove-Item -Recurse -Force C:/warmup
#### microsoft/iis -> iis on linux?

#### I would much advise using nginx instead

##### more interesting packages 2 or 3 ?
NServiceBus?
RabbitMQ?
SQL Server?
ServiceStack?
NancyFX?


Thanks to @mdymel for showing those.
