/**
 * caculate the width of text
 */
export type WidthCaculator = (
	text: string,
	start: number,
	end?: number,
) => number;

/**
 * nextLine search potiential end position.
 */
const nextEnding = (
	text: string,
	width: number,
	start: number,
	caculateWidth: WidthCaculator,
): number => {
	if (caculateWidth(text, start) <= width) return text.length;

	let l = start;
	let r = text.length - 1;
	let m: number;
	while (l < r - 1) {
		m = l + (r - l) / 2;
		if (caculateWidth(text, start, m) > width) {
			r = m;
		} else {
			l = m;
		}
	}
	return r;
};

/**
 * nextWordsEnding search potiential end position with words granularity.
 */
const nextWordsEnding = (
	text: string,
	width: number,
	start: number,
	caculateWidth: WidthCaculator,
): number => {
	// TODO: compare heuristic search effecience
	const border = nextEnding(text, width, start, caculateWidth);
	// the rest text cannot fullfill the width
	if (border === text.length) return border;
	for (let i = border - 1; i > start; i--) {
		if (text.charAt(i) === " ") return i;
	}
	return border;
};

/**
 * cut the last line and ellipsis if required
 */
export const cutLastLine = (
	text: string,
	width: number,
	start: number,
	caculateWidth: WidthCaculator,
	wordBased?: boolean,
	ellipsis?: boolean,
): string => {
	if (caculateWidth(text, start) <= width) return text.substring(start);

	const idx = wordBased
		? nextWordsEnding(text, width, start, caculateWidth)
		: nextEnding(text, width, start, caculateWidth);

	const result = text.substring(start, idx);

	if (ellipsis) return `${result}...`;
	return result;
};

/**
 * seperate text to at most given lines
 */
export const seperateText2MultiLines = (
	text: string,
	width: number,
	caculateWidth: WidthCaculator,
	targetLines: number,
	wordBased?: boolean,
	ellipsis?: boolean,
): string[] => {
	const lines: string[] = [];
	let l = 0;
	for (let i = 0; i < targetLines - 1; i++) {
		// trim prefix space
		if (i > 0) {
			for (; l < text.length; l++) {
				if (text.charAt(l) !== " ") break;
			}
		}
		const idx = wordBased
			? nextWordsEnding(text, width, l, caculateWidth)
			: nextEnding(text, width, l, caculateWidth);
		lines.push(text.substring(l, idx).trim());
		if (idx >= text.length) return lines;
		l = idx;
	}

	for (; l < text.length; l++) {
		if (text.charAt(l) !== " ") break;
	}
	const lastLine = cutLastLine(
		text,
		width,
		l,
		caculateWidth,
		wordBased,
		ellipsis,
	);
	lines.push(lastLine.trim());

	return lines;
};
