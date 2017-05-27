1. Serveless what it is and example in AWS how to create simple function - What is serveless ? briefly - WIth a nice diagram
We barely started thinking in terms of microservices and here we go again serverless

3. Using Serverless and AWS lambda to automate blog
- listen to gibhub repo
2. Writing - Serverless Framework Overview:

"When you define an event for your AWS Lambda functions in the Serverless Framework, the Framework will automatically create any infrastructure necessary for that event (e.g., an API Gateway endpoint) and configure your AWS Lambda Functions to listen to it." "When you deploy a Service, all of the Functions, Events and Resources in your serverless.yml are translated to an AWS CloudFormation template and deployed as a single CloudFormation stack."

- What kind of problem does serveless framwork solve
One thing to notice here they have a great name

-  "We currently support AWS Lambda, Apache OpenWhisk, Microsoft Azure, and are expanding to support other cloud providers."

- What kind of templates are there

aws-nodejs
aws-python
aws-groovy-gradle
aws-java-gradle
aws-java-maven
aws-scala-sbt
aws-csharp

- What is generated on default template
for nodejs
handler.js and yml file with settings used by serverless framework to drop function

for csharp
Handler.cs
yml files

Deploying simple C# code to AWS with serverless

1.  install serverless
2. generate template
3. create soem cool code
4. credentials -https://serverless.com/framework/docs/providers/aws/guide/credentials/
5. deploya
6. profits

mention serverless company and blog add to dotnetomaniak 
