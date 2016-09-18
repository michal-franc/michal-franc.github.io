---
layout: page
title: Speaking
permalink: /speaking/
---
{% for year_events in site.data.speaking reversed  %}
{{ year_events[0] }}
<ul>
{% assign events = year_events[1] %}
	{% for event in events %}
	  <li>
	     {{ event.date }} - <a href="{{ event.url }}">{{ event.name }}</a> -
	     {% if event.video_url %}
			 <a href="{{ event.video_url }}">{{ event.topic }}</a>
	     {% else %}
			 {{ event.topic }}
	     {% endif %}
	     {% if event.summary_url %}
			 <a href="{{ event.summary_url }}">[blog]</a>
	     {% endif %}
      </li>
	{% endfor %}
</ul>
{% endfor %}
