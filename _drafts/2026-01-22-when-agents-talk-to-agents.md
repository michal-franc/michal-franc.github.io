---
layout: post
title: "When Agents Talk to Agents: The Communication Overhead Problem"
date: 2026-01-22 00:00
author: Michal Franc
comments: true
categories: [tech]
tags: [ai, agentic-ai, agent-to-agent, a2a, future-of-work, management, communication]
summary: "10x productivity means 10x communication overhead. The inevitable solution? Agents handling routine communication while humans focus on conflicts that require judgment."
---

10x productivity means 10x communication overhead. That's not sustainable. The inevitable solution? Agents handling routine communication - status updates, simple questions, information gathering - while humans focus on the conflicts that require judgment. Agent-to-agent protocols are already being built. The future is agents talking to agents, with humans stepping in only when complexity requires it.

## The Communication Overhead Problem

OK so here's something that worries me a bit.

If we get 10x more productive - and I think we will - that means 10x more pressure. More output means more decisions, more coordination, more communication.

I already get like 100 notifications a day on Slack. Countless discussions across teams and departments. It's a lot. And you know what? In a year, will that be 1000 notifications a day?

That's not sustainable. Something has to give.

**My prediction:** Agents will start handling some of the communication. Not all of it. But the routine stuff - status updates, simple questions, information gathering - that will get delegated to agents.

And this isn't science fiction. [Google's A2A protocol](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) and the [Linux Foundation's Agent2Agent project](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents) are already building the infrastructure for agents to talk to each other. Over 50 enterprise partners are involved - Salesforce, ServiceNow, UiPath, and others.

The plumbing is being built right now.

## Agent-to-Agent: A Vision That Feels Inevitable

Let me paint you a picture of what I think is coming. And honestly, as I write this, it feels so obvious that I'm pretty sure it will happen.

Imagine you could tell people: "Here, talk to my agent. If it can't answer your question, it will escalate to me."

Like a personal assistant, but for async communication.

Someone asks: "Hey, how's project X going?" Your agent responds with a status update based on the project context it has access to.

Someone asks a complex question your agent can't handle? It escalates: "Hey Michal, this is your agent. The other team says they have blockers. They didn't listen to my arguments. I need you, the human, to resolve this conflict."

Agents talking to agents. Humans stepping in only when the complexity requires it.

I know this sounds a bit sci-fi. But when I write it out, I realize - this is just how organizations already work, just with humans doing all the routing. We're going to automate the routing layer.

> **This already exists in customer service**
>
> Think about it - chatbots have been handling first-line customer support for years now, escalating to humans when needed. We're just bringing that pattern inside the organization, between teams and individuals.

## The Alignment Work Flip

Here's where it gets really interesting for me personally.

Right now, about 90% of my work is alignment. Aligning people across teams and departments. Communication. Making sure everyone is on the same page. It's exhausting but necessary work.

What if agents could do most of that?

Picture this scenario:

1. Team X has a product idea
2. Their team agent broadcasts it to a company-wide consensus system
3. The system routes it: "Go talk to agents from teams Y, Z, and V"
4. A few hours later, the agent comes back with a full analysis:
   - "Product is feasible"
   - "We already have component X out of the box"
   - "Blockers are on dependency Y"
   - "Timelines of teams A, B, C don't allow this quarter - could fit in Q2"
   - "For you, human, here are your next tasks: 1, 2, 3, 4, 5"

That's... that's the job of a program manager, partially automated.

**The shift:** From 90% alignment / 10% complex decisions → 10% manual clash resolution / 90% agent-handled alignment.

The humans focus on the hard stuff - the conflicts that can't be resolved algorithmically, the decisions that require judgment and relationships and context that agents don't have. The routine coordination gets automated.

## The Evolution: From Humans to Agent Hierarchies

Let me walk you through how I see this evolving. It's not a sudden jump - it's a gradual transformation.

![Evolution stages](/images/agent-to-agent-stage1.png)

### Stage 1: Humans in Teams (Where We Were)

The traditional model. Teams of humans communicating with other teams of humans. All coordination happens person-to-person. Every status update, every dependency check, every timeline negotiation - it's all manual.

This worked fine when the pace was slower. But it doesn't scale.

### Stage 2: Augmented Engineers (Where Most Are Now)

Humans with AI assistants. Copilot, Cursor, Claude - tools that help individuals be more productive. The human is still the driver, still doing all the communication. The AI just helps them work faster.

This is where most organizations are today. It's a productivity boost, but it doesn't solve the communication overhead problem. If anything, it makes it worse - more output means more coordination needed.

### Stage 3: Agents Alongside Humans (Where We're Heading)

This is the shift. Agents become teammates, not just tools. They work in parallel with humans, handling tasks autonomously. They have context about the project, the codebase, the goals.

But here's the key insight: if agents are doing work, they also need to communicate about that work. And that's where agent-to-agent communication becomes necessary.

![Stage 3 diagram](/images/agent-to-agent-stage3.png)

### Stage 4: Agents Representing Entities (The Future)

This is where it gets interesting. Agents won't just represent individuals - they'll represent organizational units:

- **Personal agents** - handling your individual communication and tasks
- **Team agents** - representing the team's collective context, priorities, and availability
- **Project agents** - tracking project status, dependencies, and blockers across teams
- **Department agents** - coordinating at the organizational level

When Team A wants to check dependencies with Team B, their team agents talk first. Only unresolved issues escalate to humans.

When a project needs resources from three departments, the project agent negotiates with department agents. Humans get a summary and make the final call on conflicts.

This isn't replacing human judgment. It's automating the routing and information gathering that currently takes 90% of coordination time.

![Stage 4 diagram](/images/agent-to-agent-stage4.png)

### How These Agents Build Context

For this to work, agents need context. They can't negotiate on behalf of a team if they don't know what the team is working on.

The good news? The data already exists. It's sitting in:

- **Meetings** - transcripts, decisions, action items
- **Slack/Teams** - discussions, announcements, questions
- **Jira/Linear** - tickets, sprints, blockers
- **Docs/Confluence** - specs, designs, decisions
- **PRs/Code** - what's being built, what's blocked
- **Calendar** - availability, deadlines, milestones
- **Email** - external communication, approvals

Each type of agent builds specialized context from these shared sources:

**Team Agent knows:**
- Who's on the team and their skills
- Current capacity and availability
- Active blockers and dependencies
- Team priorities and commitments

**Project Agent knows:**
- Cross-team dependencies
- Timeline and milestones
- Status of deliverables
- Risk factors and blockers

**Department Agent knows:**
- Strategic priorities
- Budget and resource allocation
- Cross-project dependencies
- Organizational constraints

The agents don't just store this data - they understand it in context. When another agent asks "can Team A take on this work in Q2?", the team agent doesn't just check a calendar. It considers current commitments, known risks, team capacity, and historical velocity.

![Context building](/images/agent-to-agent-context.png)

## Example: New Project Feasibility Study

Let's say you have an idea for a new project. Today, figuring out if it's feasible means:

1. Schedule meetings with 3-4 teams
2. Wait for calendar availability
3. Explain the idea multiple times
4. Collect feedback over days or weeks
5. Synthesize everything yourself

With agent-to-agent communication, it looks like this:

1. You describe the idea to your project agent
2. The agent spins up, talks to Team A, B, C agents and the department agent
3. A few hours later, you get back a structured analysis:
   - ✓ Feasible
   - ✓ Team A has capacity
   - ✗ Team B blocked until Q2
   - → Suggested timeline: Q2
   - → Here are your next steps: 1, 2, 3

The human spawns the agent, the agent negotiates with the network, and the human decides on any conflicts that couldn't be resolved automatically.

![Feasibility study flow](/images/agent-to-agent-feasibility.png)

## Example: Querying the Agent Network

This also changes how you get information day-to-day.

Instead of digging through Jira, pinging people on Slack, or waiting for standups, you just ask:

**"What are the blockers for Project X?"**

Your project agent queries the relevant team agents and returns:
- API dependency (Team B) - ETA: Feb 15
- Design review pending - Owner: @sarah

**"When can we ship feature Y?"**

Your team agent checks with project agents and department agents:
- Dev complete: Feb 20
- QA needed: 5 days
- Dependencies clear: Feb 18
- → Ship date: ~Feb 28

Natural language queries in, structured answers out. The agents aggregate context from across the organization so you don't have to.

---

## References
- [Google A2A Protocol - A new era of agent interoperability](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [Linux Foundation launches Agent2Agent Protocol Project](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [MCP vs A2A: A Guide to AI Agent Communication Protocols](https://auth0.com/blog/mcp-vs-a2a/)
- [Workday: The Future of AI - The Power of Agent-to-Agent](https://blog.workday.com/en-us/agent-to-agent-overview.html)
