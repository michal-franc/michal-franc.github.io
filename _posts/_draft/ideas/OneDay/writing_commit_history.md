Promotion
- Hashtags (#git, #programming, #cleancode)
- Facebook groups (JS News, .NET developers Poland, Find more ( react ? ) )
- Reddit ( programming )
- Wykop? ( for sure )
- HackerNews? ( for sure )

###Git commit anti patterns

KISS, SOLID, DRY and other rules help us keep the code 'clean'. There are also tools like StyleCop, FxCop, ESLint etc. Plenty of rules, guides, tips and all the sources of how to write a 'proper code'. Why then we as developers tend to forget about proper 'git commit' messages. Is it the proper of lack of tooling ? Lack of practices ?

Just like with code, keeping commit history clean will save time and money. Sure, the impact is not that big. We spent much more time reading, changing code than the commits. There are two interesting differences beetwen those two.

-   You can easilly change code while git history change is much more complicated. 
-   Clean code requires much more experience and training, while clean git history can be achieved with simple habbit changes

Lets explore some of the antipatterns and tips.

###Too big to fail
Check out this history
https://github.com/michal-franc/ImageClassification/commits/master
- Init Commit
- lot of changes
- Lot of changes :D Created Form application to test algorithms. Distr.  .

This one doesnt contain much of usefull information. What does lot of changes mean ? Kind of nothing. Ideally Git history should be like a book with a story of the product.

Looking at stats, lot of changes means
14 changed files  with 371 additions and 51 deletions.

Those werent some random changes but some kind of functionality, feature. Why then hiding this feature behind a non usefull description 'lot of changes'. I always ended like this when my changes were soo complicated and contained many different cahnges that it was really hard to find approperiate commit message for this chunk of changes.

Similar problem to class name paralysis, when developer is blocked by 'simple' task of naming classes and spends too much time thinking about it ( yes I know that naming convention can get tricky ).

*Make it a habit to allways commit as small work as possible.*

###Lack Of context
Previous example misses any context. Was this work a bugfix ? cleanup ? feature ?

I find this convention usefull.

- JCF-799 New feature
- (Bugfix) Fixing image service host name injection cfg param name
- (Bugfix) if images are empty then just initialize as a empty list
- (Bugfix) Fixing the last cleanup logic
- (Cleanup) commented out value in config
- (Refactor) Removing some SQL connection based queries and switching to… …
- (Cleanup) namespaces
- (Refactor) namespaces

There is context now, and when checking the commit history I can probably ignore all the cleanup code changes if I am looking for some feature. JCF-799 is a jira ticket to track what part of ticket is this story. This gives me a nice integration with jira and info which commits are part of this story etc.

*Try to add some meta data to your commit messages*

###Scout Rule all the things
Imagine a nice commit, changes in one file, someone is implementing new feature, but they couldnt resist the urge to cleanup some code here and there. You are then forced to check all the changes that are completely irreleveant to the task. A waste of time. 

*Keep your cleanups and refactorizations in separate commits*

###It wasnt me!
IDE, and other different tools give powerfull tools to refactor the code. The wors thing one can do is while doint some code changes and feature he will do a full reformat of code hiding the most important changes in the sea of diff maddness.

<example in blog stuff>

###Spaces everywhere
This one is pretty minor but always annoys me. Please remove all the trailing spaces from the diff. I don't want to waste my time going thoruhg changes like this.

<example in blog stuff>

2nd post
TODO:
- Habits to keep you commit history clean
  - show important info on removing spaces and how to spot them ( small )
  - show commit hunks, lines, trick
- Tools to make you commit history clean
- Why git rewrite of history seems like a good idea but is very harmfull
