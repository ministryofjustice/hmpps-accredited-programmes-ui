# 6. Use Git commits to explain our work

Date: 2023-10-13

## Status

Accepted

## Context

We are developing new software as a team.

### Understanding decisions

At any point in time, our codebase will be an aggregate of many influences. It
reflects, for example:

- conversations that we’ve had as a development team
- conversations with other members of the project team
- conversations with stakeholders
- technical facts we’ve learned from outside sources
- things we’ve learned from failed attempts
- ideas we’ve had as individual developers
- compromises that we’ve had to make in the interests of time

As the team develops the service, it is very likely that we’re going to have
questions about why the codebase is the way that it is. We might see a certain
piece of functionality that doesn’t make sense, or a piece of code that
seemingly could have been written more simply. In order to know whether we can
change these things, we need to first understand the context in which they were
originally done, so that we can assess whether the same conditions still hold.
Without being able to understand the motivation, we’ll find it difficult to
confidently make changes that affect these areas.

The answers to these questions might live in people’s memories. But people
forget things, so maybe not. Also, the development team is not static - today’s
developers might not be here tomorrow. This is especially true on this project,
where several developers come from external organisations and will leave the
project in the relatively near future.

We need a way to record these decisions so that they can be easily discovered by
the team at any point in the future.

Every change to the codebase is accompanied by a Git commit. The commit message
for this commit provides us with a space to explain any relevant context that
lives behind the change.

### Reviewing work

When we develop software in a team, we spend quite a lot of time reviewing other
developers’ code. Sometimes, multiple developers will review a single pull
request. We want to make sure that reviewing a pull request is not a
time-consuming process.

As developers opening a pull request, we should think about how we present our
work to others. We should make sure that we present our work in a way that is
easy for others to understand. We should do this by splitting our work into
logical Git commits, each of which make a single change, with an accompanying
commit message which explains the change and addresses any questions that we
think a reviewer might have about the change.

We should also consider how merge commits can impact the reviewability of our
pull requests. Merge commits stop the pull request from being a simple linear
sequence of commits. Also, the diff of a merge commit, as presented by GitHub,
can often be hard to understand.

### The Git repository is probably immortal

There are other places where some of the codebase’s influences might be recorded
— deliberately or not. For example, Trello cards and their comments, GitHub pull
request messages, GitHub pull request comments. There is sometimes a temptation
to think that these tools will be around forever, but this is not true. The Git
repository is the one of the few things that we can be pretty sure will be
around for the lifetime of the project.

## Decision

When we open a pull request, we will make sure that we present our work with a
Git commit history that tells a clear story of the work that we’ve done and why
we’ve done it that way.

Our pull requests will have a linear history, meaning that they will not contain
any merge commits.

The pull request message will be a summary of the work that we’ve done, but
any important information that it contains will also be in the commit messages.

If we make changes to a pull request, we will restructure our commits to make
sure that they continue to tell a useful story.

When we merge a pull request into the main branch, we will preserve that pull
request’s commits, and not squash them into a single commit.

## Consequences

It takes time to produce good commits. It might take even more time if a
developer needs to become familiar with some Git functionality that they haven’t
used before, like rebasing. This might slow down an individual developer working
on a feature. But, even just the time saved by making code review easier for
multiple developers is likely to mitigate this.

## Further reading/viewing

- [Some rules](https://cbea.ms/git-commit/#seven-rules) that may help new
developers write good commit messages.
- [A
  talk](https://tekin.co.uk/2019/02/a-talk-about-revision-histories#:~:text=This%20is%20a%20story%20about,history%20and%20an%20unhelpful%20one.)
  that goes into more detail on specific examples of the above approach, why
  it's useful, and some tools for working with git.
