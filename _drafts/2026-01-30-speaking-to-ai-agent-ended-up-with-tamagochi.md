---
layout: d3post
title: "So I wanted to speak to AI agent ... and ended up with a Tamagochi on my phone"
date: 2026-01-30 00:00
author: Michal Franc
comments: true
categories: [tech]
tags: [claude-code, deepgram, speech-to-text, galaxy-watch, linux, ai]
summary: "Building a personal speech-to-text setup on Linux - from dictation scripts to a Galaxy Watch Tamagotchi companion talking to Claude Code."
---

## The era of personal software?

This year's start has been interesting. I've been building a lot of stuff lately, thanks to Claude Code. Usually small things, scripts, automations, little tools for my Linux setup. Not production-ready software, sometimes vibe coded. The itch comes mostly from the need to experience as much of Claude Code and agentic coding as possible, and ideally to spot breaking points. Moments where it no longer makes sense. I need this intuition to have an opinion on what will happen in the next 2-3 years. The roles I usually take at companies I work with are typically responsible for long-term vision and strategy for multiple engineering teams.

And I keep thinking: are we entering a new era of personalized software? Apps that aren't polished, aren't fully reliable, but apps you can just... write for yourself, maybe self-host them? Or even communities of developers building bespoke solutions for their communities?

One of the personalized things I built recently was a speech-to-text integration. A tool that I could use to dictate text and have it flow into whatever I was working on - notes, code, messages. And then to also dictate commands to Claude itself, from my watch, while away from my desk.

Choosing the right speech-to-text model turned into a rabbit hole about moats, pricing dynamics, and why startups can undercut Google. It's interesting, I promise. And if you don't care, just skip to section 4.

## The problem: I needed Superwhisper for Linux

While testing Mac Speech to Text I stumbled upon [Superwhisper](https://superwhisper.com). If you haven't seen it - it's a Mac app that lets you dictate anywhere on your system by pressing a hotkey - it just streams the text to the current focus window. Mac supports something similar but it has accuracy problems. Well they don't have an app for Linux at the moment.

I know on Linux I would most likely find something similar, but where is the fun in that, and with the `personalized` mindset I just decided to build something similar myself and see how complex it will be with Claude Code (spoiler alert: it was super easy and actually blew my mind).

The core requirements I need:
- Press a key - start dictating
- Text appears in the active window as I speak (streaming, not batch)
- Works everywhere - terminal, browser, Obsidian, whatever
- Bonus: pipe the text to Claude for quick commands
- Bonus: integrate with polybar and i3 events to show dictation status

The "pipe to Claude" part came from how I use my notes. I have a 2nd brain setup in Obsidian, and I often want to do things like "find that note about X and add this thought to it." Typing that out breaks the flow. Dictating it? Much better.

So that's the goal. Now the first real decision: which speech-to-text model to use?

## The Project
Link  -  [GitHub - michal-franc/claude-watch](https://github.com/michal-franc/claude-watch)
Star if you like it - though I am not sure its ready to be used by someone else.

## 1. Local dictation script
I started with a simple dictation streaming script. The flow is straightforward: capture audio from the microphone, send it to Deepgram for transcription, and stream the resulting text directly into whatever window is focused. I found it convenient to just speak to the terminal - especially for longer explanations or when I wanted to think out loud while coding.

But Deepgram charges by the minute, and it adds up fast if you leave the stream running. I've accidentally left audio streams open before and watched the bill climb. So I built in some protections to avoid that.
1. Auto-stop after silence - script exits after 10 seconds of no speech, in case I forget to turn it off
2. Crontab - every 5 minutes, kills all processes associated with dictation, in case there's a bug in auto-stop
3. Polybar integration - shows whether dictation is on or off

![Polybar dictation status](/images/dictation-polybar.png)

## 2. Directly to claude code
But tracking the active window wasn't enough on its own. The problem was getting the transcribed text into the right place. I tried a few approaches - clipboard manipulation, simulating keystrokes - but they all felt fragile. So I took a different route: I spawn a new process that pipes the text directly to Claude CLI. This way, instead of trying to inject text into whatever application I'm using, I can just speak my thoughts and have them land in a conversation with Claude. It's a bit unconventional, but it sidesteps all the window focus and input simulation headaches.

![Piping dictation to Claude](/images/dictation-claude-pipe.png)

## 2.1 Directly to long running claude session
This was cool, but I also needed a way to send transcripts to a specific long-running Claude CLI session - not just spawn a new one each time. I often have a conversation going for an hour or more while working on a project, and I wanted to speak into that existing context rather than starting fresh.

This is where tmux and its `send-keys` command came in. I run my Claude CLI sessions inside tmux panes with known names, so I can target them from any script. When I finish dictating, the transcript gets piped to the right pane using `tmux send-keys -t session:pane`. The text shows up as if I'd typed it myself. It's a simple trick, but it means I can be in my browser or editor, hit my dictation hotkey, speak, and have those words appear in my ongoing Claude conversation without touching the keyboard or switching windows.

![Tmux integration](/images/dictation-tmux.png)

## 3. Galaxy watch integration
Dictation worked really well. I was using it daily for notes, for talking to Claude, for drafting sections of documents. It felt natural after a few days.

But then one night, right before sleep, my brain decided to start solving problems I didn't ask it to solve. I started thinking about my Galaxy Watch. It has a microphone. It can record audio. What if I could dictate on the watch while away from my desk - on a walk, in the kitchen, wherever - and have it send the audio file to my computer for transcription?

![Galaxy Watch integration](/images/dictation-galaxy-watch.png)

This solution runs a wrapper around Claude Code CLI. When you run Claude Code with the `--output-format stream-json` flag, it sends all its messages back as JSON - assistant responses, tool calls, status updates, everything. My wrapper parses this stream and forwards relevant pieces to connected clients over WebSocket.

Claude Code runs inside a tmux session, which gives me two things. First, the server can send input to the process using `tmux send-keys`, so clients can submit prompts without direct terminal access. Second, I can attach to the tmux pane anytime and watch what's happening in real time. This is useful for debugging or just keeping an eye on a long-running task.

<video controls width="400" style="max-width:100%">
  <source src="/images/claudewatchwatchdemo.mp4" type="video/mp4">
</video>

The architecture is not that complicated. There are a few moving parts, but each one does a simple job:
- **Galaxy Watch** - the client. It records audio, sends it to the server, and either displays text responses or plays back voice ones. It's a Kotlin app running on Wear OS.
- **Python server** - runs locally on my machine. It receives audio from the watch, sends it over to Deepgram for transcription and text-to-speech, and talks to Claude.
- **Deepgram** - TTS, STT provider - `audio in > text out` - `text in > audio out`
- **Claude Code** - CLI process running on my machine. The wrapper script handles input sending, capturing output, and managing the process lifecycle. Before the wrapper I used a tmux get pane solution but it was unreliable as I was scraping data from the terminal. JSON-based approach is much cleaner.
- **tmux session** - the wrapper logs everything to a tmux session called `claude-watch`. This gives me visibility into the way the Claude Code works.

![Architecture](/images/dictation-architecture-simple.png)

### 3.1 Permission Hooks

One of the interesting things to solve was permission hooks. I wanted the watch to get the various permissions to be approved or not by the user so that I don't have to come over to the PC to approve them.

Claude Code has a hooks system - it enables registration of scripts that run before or after specific tool calls. I use a `PreToolUse` hook, which fires every time Claude tries to run a Bash command, write a file, or edit something. The hook is registered in `.claude/settings.json` and points to a Python script called `permission_hook.py`.

Here's how the whole flow works:

1. **Hook intercepts the tool call** - When Claude wants to use a tool like Bash or Write, the hook script receives the tool call details on stdin - the tool name, unique id etc. Then script checks if this is a safe operation, `ls`, `cat`, `grep` - read-only commands get auto-approved.
2. **Permission check sent over to server** - Operations like writing files, running scripts, installing packages are sent as POST request to `/api/permission/request`. The request includes tool name, input, and the ID so the server knows which tool call it is.
3. **Broadcasts to the watch** - The server receives the permission request, assigns it a `request_id`, and pushes it out over WebSocket to the watch app. The app receives the message and a simple UI is displayed with a decision to Allow/Deny the request.
4. **Hook waits for the response** - The hook script in parallel is polling `GET /api/permission/status/{request_id}` every half second. Waiting for a decision/response from the user.
5. **User clicks Allow or Deny** - When I tap a button on the watch, the app sends `POST /api/permission/respond` with the `request_id` and the decision. The server stores it for polling hook to receive.
6. **Polling hook gets the decision** - On the next poll, the hook gets the decision, outputs the appropriate JSON response (allow or deny), and Claude Code either proceeds with the tool call or blocks it.

![Permission hooks flow](/images/dictation-permission-hooks.png)

## 4. Server dashboard
I wanted to see what was going on without staring at a terminal, so I threw together a basic web UI. It's just a dashboard that connects over WebSocket and shows the conversation in real time. I can watch my prompts go in and Claude's responses come back, see which files are being touched, what tools are running. It tells me if Claude is thinking or waiting for me to say something.

There's a text box where I can type prompts straight from the browser. Nothing special about it - text field, send button, that's it. But now I can poke at a running session from my phone while I'm making coffee, or from my laptop in another room. Handy for babysitting longer tasks without having to sit at my main machine.

![Server dashboard](/images/dictation-dashboard.png)

## 5. Mobile phone tamagochi

Then the idea evolved into something more like a Tamagotchi. I gave the bot a personality and called him `toadie`. Instead of a sterile coding assistant interface, I wanted something that felt more like a companion sitting on my phone - something with a bit of character that I'd actually want to interact with throughout the day.

The architecture is a central server with multiple clients connecting over WebSocket. My phone can connect, my Galaxy Watch can connect, the web dashboard can connect - they all talk to the same Claude session running on my machine. So I can start a conversation from my desk, continue it from my phone while I'm on the couch, or send a quick voice note from my watch.

It also handles permission prompts. When Claude wants to run a command or edit a file, the prompt gets forwarded to whatever client is currently active. I can approve or reject tool use from my phone, which means `toadie` can actually do real work on my machine while I'm away from it - as long as I'm there to approve what it's doing.

<video controls width="200" style="max-width:100%">
  <source src="/images/claudewatchdemo.mp4" type="video/mp4">
</video>

### Interactive mockup

<div markdown="0">
{% include claude-watch/mockup-playground.html %}
</div>

## The Final Architecture

Adding the phone and dashboard to the diagram basically means adding two new clients. The web dashboard is also a client connected through WebSocket.

![Full architecture](/images/architecture.jpg)

## Private Access through Tailscale

All these components - the watch, the phone, the web dashboard, and the server - need to talk to each other. But they're on different networks. My phone is on cellular, my watch is on WiFi, and the server is at home behind a router.

Tailscale solves this. It creates a virtual private network across all your devices using WireGuard tunnels. Every device gets a stable IP (100.x.x.x), and identity, key management, and discovery are handled out of the box. It just works.

What's interesting is how it connects devices behind NAT. Normally, your router won't let random incoming packets through - there's no mapping for them. So two devices behind NAT can't talk directly. Tailscale uses UDP hole punching to get around this.

<div markdown="0">
{% include toadie/tailscale-viz.html %}
</div>

When hole punching fails (some NATs are too strict), Tailscale falls back to DERP relay servers. Slower, but always works. In practice, direct connections succeed most of the time.

## Why not ClawdBot?

I started building this before ClaudBot blew up in popularity. By the time I saw people sharing it everywhere, I already had my own thing going. And honestly, even after looking at what ClaudBot offers, I still prefer my setup.

It's not that ClaudBot is bad. It solves real problems and has a solid set of integrations. But I want to run into those same problems myself and figure out my own solutions. That's where the learning happens. If I just plug in someone else's tool, I get the feature but I don't understand the problem it's solving. When I build it myself, I know exactly what's going on under the hood, and I can fix or change anything without waiting on someone else's roadmap.

My needs are also pretty specific. I want dictation from my watch. I want tmux integration. I want a weird Tamagotchi bot on my phone. No general-purpose tool is going to give me that exact combination. And the stuff I don't need? I don't want it in my stack adding complexity. I'd rather have a few scripts I fully understand than a feature-rich app where I use 20% of what it does.

There's also the TOS issue. ClaudBot automates interactions with Claude in ways that go against Anthropic's terms of service. I don't know how strictly they enforce it, but I'd rather not build my workflow on top of something that could get shut down or have its access revoked at any point. My setup uses Claude Code CLI directly, which is an official tool from Anthropic, so I'm not worried about that.

## Why Deepgram? as TTS and STT

OK so this is where I went a bit overboard. What started as "which API should I use" turned into me thinking about business strategy for an hour. Feel free to skip to the next section if you just want the technical stuff.
### Local vs cloud

I tested local models first - Vosk wasn't accurate enough. Whisper large-v3 was good on accuracy but the transcription time didn't fit my use case as it had too big delays. I'll probably use local Whisper for batch transcription later, but not for this. I am pretty sure in 2-3 years time local models for this functionality will become much better and will fit my use case.

Local models like Vosk and Whisper give you full privacy and no API costs, but accuracy and speed suffer. They need tweaking to get right.

So I was thinking what are the other options there? And I have been using voice typing in Google Docs and liked it, so I tried [Google Cloud STT](https://cloud.google.com/speech-to-text). Results were good both in accuracy as well as in speed to stream the text. I was a bit worried with the costs so I have set proper limits to quotas, budgets and alerts - even set a crontab script to kill all the processes related to dictation script running every 5 min - just in case I miss to turn it off.

But then I checked what Superwhisper uses and found [Deepgram](https://deepgram.com/) mentioned. Discussion with Claude chat  also mentioned generous free budget per month (but this was actually old data from the time the model was trained). Still as of the time of writing they offered $200 free credits I could use to check their solution.

Cloud models like Deepgram and Google Cloud give you better accuracy and speed out of the box. The tradeoff: costs money, your data leaves your machine (fine for my personal setup), and you hit API limits.

Plus the best part Deepgram is 3x-4x cheaper:
- Deepgram: ~$0.0077/min streaming (~$0.46/hr)
- Google Cloud: $0.006-0.009/15sec (~$1.44-2.16/hr)
### Why is Deepgram 3x-4x cheaper than Google?

Deepgram is a startup competing on price. They need market share and are the ones disrupting the consensus. Google doesn't, they have a huge position with a ton of customers, for them it is just additional service they provide. They don't compete with Deepgram, google power is bundling services in a package. They also focus on efficiency. Deepgram [claims](https://deepgram.com/learn/deepgram-vs-openai-vs-google-stt-accuracy-latency-price-compared) 5-40x faster inference than competitors. Faster = less compute = cheaper to run.

Different target market too. Deepgram probably targets customers that are interested in volume (call centers, transcription services). Low price attracts high volume. Google target existing customers that value the whole ecosystem of Google and won't integrate with a small specialized company just to save costs. Every new vendor in your system increases complexity and risk profile, you have another relationship to manage.

But there is a caveat .... if the TTS capability is critical for your business and will be a huge portion of your costs - then this increased complexity and risk can of course make sense. Plus if TTS for your is business critical - specialized vendor will bring more value vs generic one like Google.  Deepgram feels more pressure to be great - STT is all they do. For Google, it's just another service in their portfolio. Google can lose focus, talent can shift to other parts of the org, there might be less incentive to compete on quality.

## What are the moats here?

### Google's moats

| Google advantage  | Why it matters                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Ecosystem lock-in | Already on GCP? Adding STT is one click. Another vendor = another bill, another API.                                                       |
| Bundled pricing   | Big GCP customers get STT discounted or free as part of committed spend deals                                                              |
| Integration depth | Plugs into Meet, YouTube, Android, Docs voice typing. Deepgram can't touch these.                                                          |
| Distribution      | Every Android phone has Google STT built in. Developers default to what they know. I even started with Google cloud first for this reason. |
| Data              | Decades of voice data from Search, Assistant, YouTube (though shrinking advantage)                                                         |
### Deepgram's counter-moats

| Deepgram advantage   | Why it matters                                    |
| -------------------- | ------------------------------------------------- |
| Price                | 4-6x cheaper attracts startups, high-volume users |
| Speed                | Fastest inference = better real-time UX           |
| Focus                | Speech-only company = faster innovation           |
| Developer experience | Simpler API, better docs, faster onboarding       |
| Flexibility          | No cloud lock-in, works with any stack            |
