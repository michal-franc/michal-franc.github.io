---
layout: page
title: Speaking
permalink: /speaking/
---

<ul>
{% for year_events in site.data.speaking %}
{% assign events_2016 = year_events[1] %}
	{% for event in events_2016 %}
	  <li>
		{{ event.date }} - {{ event.name}}
	  </li>
	{% endfor %}
{% endfor %}
</ul>

