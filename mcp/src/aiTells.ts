// Phrases that show up far more in AI-written prose than in most human writing.
// A hit is a weak signal on its own; the density of hits is what the phrasing
// feature reads. All lowercase, matched case-insensitively on a word boundary.
// Kept free of pairs where one entry is a substring of another, so a single
// occurrence cannot register as several hits.

export const AiTellPhrases: readonly string[] = [
	"delve",
	"delving into",
	"a rich tapestry",
	"testament to",
	"underscore",
	"navigate the complexities",
	"in today's world",
	"in the realm of",
	"ever-evolving",
	"ever-changing",
	"it is important to note",
	"it's important to note",
	"it is worth noting",
	"a myriad of",
	"a plethora of",
	"seamless",
	"leveraging",
	"a game-changer",
	"cutting-edge",
	"at the end of the day",
	"when it comes to",
	"first and foremost",
	"last but not least",
	"in conclusion",
	"to sum up",
	"holistic approach",
	"unlock the",
	"embark on",
	"pivotal role",
	"plays a crucial role",
	"plays a vital role",
	"meticulous",
	"a beacon of"
];
