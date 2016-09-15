---
layout: page
title: Speaking
permalink: /speaking/
---
2016
<ul>
{% for year_events in site.data.speaking %}
{% assign events_2016 = year_events[1] %}
	{% for event in events_2016 %}
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
{% endfor %}
</ul>

