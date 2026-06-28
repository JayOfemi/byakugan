// Deliberately AI-written-sounding paragraphs for the "Try an AI example"
// button, so people can see the checker work without pasting their own writing.
// These are stuffed with the stock phrasing, even rhythm, and formulaic openers
// that AI prose overuses, so the checker should read them high. They also serve
// as the AI end of the detector's calibration set. Wording rules do not apply
// here on purpose; the point is that this reads as machine-written.
export const AiExamples: readonly string[] = [
	"In today's world, artificial intelligence is fundamentally reshaping the way we live and work. From healthcare to finance, organizations are leveraging cutting-edge technologies to unlock unprecedented value. Moreover, these tools empower teams to navigate the complexities of a rapidly evolving landscape. It is important to note that, at the end of the day, success hinges on a holistic approach. As we embark on this transformative journey, one thing remains clear, the future is bright and the possibilities are truly endless.",
	"The concept of sustainability has become a pivotal cornerstone of modern society. Furthermore, it plays a crucial role in shaping policies across every sector. Businesses, governments, and individuals alike must work together to foster meaningful change. Indeed, a myriad of challenges remain, yet the opportunities are equally vast. Ultimately, by embracing innovation and collaboration, we can build a more resilient and equitable world for generations to come.",
	"Our platform delivers a seamless, end-to-end experience designed to meet the needs of today's demanding users. By harnessing the power of data, we provide actionable insights that drive real results. First and foremost, we prioritize security and transparency at every step. Whether you are a small startup or a global enterprise, our solution scales effortlessly to support your growth. Simply put, we are committed to helping you succeed in an ever-changing digital landscape.",
	"Throughout history, great civilizations have risen and fallen, leaving behind a rich tapestry of culture and achievement. Each era serves as a testament to human ingenuity and resilience. When it comes to understanding the past, it is worth noting that context is everything. From the bustling markets of ancient Rome to the meticulous craftsmanship of the Renaissance, these moments continue to inspire us. In conclusion, the lessons of history remain as relevant today as they were centuries ago.",
	"Success is not merely a destination but a continuous journey of growth and self-discovery. To unlock your full potential, you must first embrace the challenges that lie ahead. Additionally, surrounding yourself with positive influences plays a vital role in your development. Remember, every setback is simply an opportunity in disguise. As you embark on this path, stay focused, stay determined, and never lose sight of your goals. The power to transform your life lies within you."
];

// Picks an example, avoiding the one already shown so a repeat click changes it.
export function randomExample(current: string): string {
	const pool = AiExamples.filter(e => e !== current);
	const choices = pool.length > 0 ? pool : AiExamples;
	return choices[Math.floor(Math.random() * choices.length)];
}
