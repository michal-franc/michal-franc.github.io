const reviewWrap = document.getElementById("reviewWrap");
const leftArrow = document.getElementById("leftArrow");
const rightArrow = document.getElementById("rightArrow");
const imgDiv = document.getElementById("imgDiv");
const personName = document.getElementById("personName");
const profession = document.getElementById("profession");
const description = document.getElementById("description");
const surpriseMeBtn = document.getElementById("surpriseMeBtn");
const chicken = document.querySelector(".chicken");

let people = [
	{
		photo: "url('https://media.licdn.com/dms/image/C4E03AQFs1OY_nTJ7_A/profile-displayphoto-shrink_100_100/0/1516949579752?e=1727308800&v=beta&t=NLEgw76HoBO_5rDGky3u7ItYIuU6jo6oh6GSL89AQBU')",
		name: "Aleksandra Woźniak",
		profession: "Head of Engineering at FORM3",
		description: "Michał is great at juggling multiple responsibilities and is always ready to tackle the most tricky problems. Thanks to his vast technical expertise and decisiveness, he has an outstanding ability to efficiently analyse and diagnose technical issues and take necessary actions to solve the problem at hand, even in crisis situations. As a Staff Engineer, Michał continuously provided technical designs and recommendations. Advice that he gave was always well thought-through, based on a deep and multi-faceted analysis of the problem. Moreover, he always incorporated business perspective in his proposals, which I greatly appreciated."
	},
	{
		photo: 'url("https://media.licdn.com/dms/image/D4E03AQHuw5JB4sUowQ/profile-displayphoto-shrink_100_100/0/1697195915170?e=1727308800&v=beta&t=QWpXNHf5BfMN1zXFaDclyeVFw7QTPB5xJZIjw5uNU5Q")',
		name: "Jake Scutt",
		profession: "Senior Product Manager at FORM3",
		description: "Michal is business focused and a very experienced engineer, he is happy to wear many hats to ensure he and the teams he works with are delivering the most value. He is a fountain of knowledge and strategic ideas, always delivering quality work and happy to receive feedback. This approach and his openness to collaboration makes him the type of engineer any product person would love to work with. Michal as a team lead and as an individual contributor cares deeply about the people and projects he works on. He is committed to making an impact and successfully motivates and influences people to make this happen."
	},
	{
		photo: "url('https://media.licdn.com/dms/image/C4E03AQGp3F59xz3uCg/profile-displayphoto-shrink_100_100/0/1619701737272?e=1727308800&v=beta&t=AFMKGeji_QMVC2S6qG0yzrg7LFh-LGrLOeZc0zioCp8')",
		name: "Patryk Żmigrodzki",
		profession: "Senior Software Engineer at FORM3",
		description: "I worked with Michal in various capacities, including him as a Senior Software Engineer, Team Leader, and Staff Engineer, and I can confidently say that he is one of the best engineers I have ever encountered. As a Staff Engineer, Michal truly could see the bigger picture. He effectively planned long-term initiatives and facilitated efforts across an engineering organization composed of hundreds of engineers. His strategic vision and coordination skills ensure that projects are not only successful but also aligned with the overarching goals of the company."
	}
];

imgDiv.style.backgroundImage = people[0].photo;
personName.innerText = people[0].name;
profession.innerText = people[0].profession;
description.innerText = people[0].description;
let currentPerson = 0;

//Select the side where you want to slide
function slide(whichSide, personNumber) {
	let reviewWrapWidth = reviewWrap.offsetWidth + "px";
	let descriptionHeight = description.offsetHeight + "px";
	//(+ or -)
	let side1symbol = whichSide === "left" ? "" : "-";
	let side2symbol = whichSide === "left" ? "-" : "";

	let tl = gsap.timeline();

	tl.to(reviewWrap, {
		duration: 0.4,
		opacity: 0,
		translateX: `${side1symbol + reviewWrapWidth}`
	});

	tl.to(reviewWrap, {
		duration: 0,
		translateX: `${side2symbol + reviewWrapWidth}`
	});

	setTimeout(() => {
		imgDiv.style.backgroundImage = people[personNumber].photo;
	}, 400);
	setTimeout(() => {
		description.style.height = descriptionHeight;
	}, 400);
	setTimeout(() => {
		personName.innerText = people[personNumber].name;
	}, 400);
	setTimeout(() => {
		profession.innerText = people[personNumber].profession;
	}, 400);
	setTimeout(() => {
		description.innerText = people[personNumber].description;
	}, 400);

	tl.to(reviewWrap, {
		duration: 0.4,
		opacity: 1,
		translateX: 0
	});
}

function setNextCardLeft() {
	if (currentPerson === (people.length -1)) {
		currentPerson = 0;
		slide("left", currentPerson);
	} else {
		currentPerson++;
	}

	slide("left", currentPerson);
}

function setNextCardRight() {
	if (currentPerson === 0) {
		currentPerson = people.length - 1;
		slide("right", currentPerson);
	} else {
		currentPerson--;
	}

	slide("right", currentPerson);
}

leftArrow.addEventListener("click", setNextCardLeft);
rightArrow.addEventListener("click", setNextCardRight);

window.addEventListener("resize", () => {
	description.style.height = "100%";
});
