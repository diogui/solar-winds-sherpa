/**
 * Science page copy. Public text is English.
 * Edit this file to update questions, instruments, the worked example, and the bibliography.
 *
 * PENDING — internal only. Do not render these notes on the page.
 *
 * Confirmed with Danilo (2026-10):
 * 1. Questions + accessible explanations; opening image = Padilla TSE_2026_500mm_DBI;
 *    credit Tülin Bedel (not Iscan).
 * 2. Why eclipses = Moon vs coronagraph diffraction; complements other observatories.
 * 3. Instruments = white-light / narrow-band filters / multi-channel spectrometers (copy).
 *    In-house builds (Matěj, Adalbert) still pending.
 * 4. Pipeline / who does what — wait for Shadia.
 * 5. Featured papers: Habbal et al. 2026, Boe et al. 2018, Druckmüller et al. 2014.
 * 6. What comes next / funding ask — still open (marked “(To be confirmed)” on page).
 */

import { latestExpeditionHref } from './site';

export type ScienceImage =
	| 'corona-white'
	| 'padilla-2026'
	| 'sun'
	| 'corona'
	| 'prominences'
	| 'cameras-totality'
	| 'filter-rig'
	| 'field-station'
	| 'faroe-camp'
	| 'boe-fig1'
	| 'fe-composite'
	| 'druckmuller-2014'
	| 'corona-trigaza';

export const hero = {
	image: 'padilla-2026' as ScienceImage,
	alt: 'Processed white-light image of the entire solar corona visible from Padilla de Abajo during the 2026 total solar eclipse, with pink prominences along the Moon’s limb',
	caption:
		'Entire solar corona visible from Padilla de Abajo during the 12 August 2026 eclipse. A composition of 244 frames; fine structure is enhanced so it can be seen.',
	credit: '© 2026 Miloslav Druckmüller, Shadia Habbal, Zachary Bailey, Tülin Bedel',
};

export const questions = [
	{
		id: 'heating',
		index: '01',
		title: 'Why is the corona so hot?',
		text: 'The Sun’s visible surface is about 5,500 °C, while the corona above it reaches millions of degrees. How energy reaches that outer atmosphere, and how the plasma there is heated, remains one of the open problems in solar physics.',
	},
	{
		id: 'solar-wind',
		index: '02',
		title: 'Where does the solar wind begin?',
		text: 'The Sun continuously sends a stream of charged particles into space that interacts with the planets. We know many of its properties, but still investigate how it starts, how it is accelerated, and what sets its different speeds and character.',
	},
	{
		id: 'structure',
		index: '03',
		title: 'What does the magnetic field reveal about the corona?',
		text: 'The magnetic field organizes the corona and shapes its physical processes. Studying that configuration — especially during a total solar eclipse — shows how plasma is distributed, how energy moves, and how coronal structures connect to the solar wind.',
	},
] as const;

export const whyParagraphs = [
	'The main advantage of a total solar eclipse is that it lets us observe the inner corona very close to the Sun’s visible edge, using a natural occultation that is hard to reproduce with conventional instruments.',
	'Coronagraphs study the corona throughout the year by blocking the photosphere with an artificial disk. Diffraction around that disk makes the regions closest to the Sun difficult to see. During totality, the Moon covers the photosphere without an equivalent instrumental obstruction, so those inner regions can be recorded.',
	'An eclipse also lets us observe the corona in white light and, with specialized instruments, in specific spectral lines — combining structure with physical properties such as temperature and motion. Totality lasts only a few minutes at any site and depends on weather, so eclipses do not replace other observatories; they complement them.',
] as const;

export const eclipseFrames = [
	{
		image: 'sun' as ScienceImage,
		alt: 'The uneclipsed Sun, a bright orange disk whose glare hides the corona',
		caption: 'Hidden in the glare',
		detail: 'The bright solar disk. Its light overwhelms the faint corona.',
		position: '62% 48%',
	},
	{
		image: 'corona' as ScienceImage,
		alt: 'Total solar eclipse, with the Moon covering the Sun and the corona glowing around it',
		caption: 'Revealed by the Moon',
		detail: 'During totality the disk is covered and the corona can be recorded.',
		position: '50% 50%',
	},
	{
		image: 'prominences' as ScienceImage,
		alt: 'The Moon’s limb during totality, with pink prominences and a sliver of chromosphere',
		caption: 'At the Moon’s limb',
		detail: 'Prominences appear along the edge of the Moon.',
		position: '78% 50%',
	},
] as const;

export const instruments = [
	{
		id: 'white-light',
		name: 'White-light cameras',
		image: 'cameras-totality' as ScienceImage,
		alt: 'Large camera lenses in the foreground on a ridge, aimed toward a total solar eclipse over the mountains',
		caption: 'Cameras on the ridge during totality.',
		credit: 'Pico Trigaza, Spain, 2026',
		position: '58% 46%',
		measures:
			'The corona’s white-light emission across a wide brightness range, using several focal lengths and exposure times. Image processing developed by Miloslav Druckmüller turns those frames into high-resolution composites that show fine coronal structure.',
		question: 'How the corona is shaped, and how its large-scale structure connects to the magnetic field.',
	},
	{
		id: 'filters',
		name: 'Narrow-band filters',
		image: 'filter-rig' as ScienceImage,
		alt: 'A multi-camera instrument rig and a field laptop on a ridge in Spain, with hills behind',
		caption: 'A multi-camera rig and field computer on the ridge.',
		credit: 'Spain, 2026',
		position: '42% 58%',
		measures:
			'Narrow slices of the spectrum that isolate “colors” emitted by iron in different ionization states. Those filters reveal hotter regions of the corona that are invisible to the unaided eye.',
		question: 'Why the corona is so hot, and where different temperatures sit relative to the solar wind.',
	},
	{
		id: 'spectrometers',
		name: 'Multi-channel spectrometers',
		image: 'field-station' as ScienceImage,
		alt: 'A researcher at field computers inside a dark tent, with instruments beside the screens',
		caption: 'Instruments and field computers running in the dark.',
		credit: 'USA, 2024',
		position: '50% 42%',
		measures:
			'Resolved spectra of specific iron emission lines. Line widths and Doppler shifts give information on temperatures and motions in the corona.',
		question: 'How the corona is heated, and how plasma moves within it.',
	},
] as const;

export const pipelineIntro =
	'The images below follow one published example: the total solar eclipse of 20 March 2015, and the analysis in Boe et al. 2018. The field photograph is from the Faroe Islands that year. The corona images are figures from the paper.';

export const pipeline = [
	{
		id: 'prepare',
		index: '01',
		title: 'Preparation and calibration',
		text: 'The instruments are set up, aligned, and tested before totality. The few minutes of darkness are too short to fix a problem once the Moon’s shadow arrives. The photograph is the field camp, not a calibration frame.',
		image: 'faroe-camp' as ScienceImage,
		alt: 'A red expedition tent and instruments on a coastal gravel site, with two people setting up tripods',
		caption: 'Field camp before the eclipse.',
		credit: 'Faroe Islands, 2015',
	},
	{
		id: 'observe',
		index: '02',
		title: 'Observation and data collection',
		text: 'During totality the cameras record the corona in white light and through the narrow-band filters. A raw frame from this eclipse is not shown here. The image is the processed white-light view published as Figure 1A, made so faint rays can be seen.',
		image: 'corona-white' as ScienceImage,
		alt: 'Processed white-light image of the solar corona during the total eclipse of 20 March 2015',
		caption: 'Processed white-light corona from Boe et al. 2018, Figure 1A.',
		credit: 'Boe et al. 2018, The Astrophysical Journal',
	},
	{
		id: 'reduce',
		index: '03',
		title: 'Processing and analysis',
		text: 'Processing changes the contrast so faint structure can be seen. It does not add features that were not recorded. Emission-line images then separate two iron lines from the white-light view. Fe XI is the line at 789.2 nm, in the near-infrared. Fe XIV is the line at 530.3 nm, in the green. In this composite, Fe XI is given a red display color and Fe XIV a green one, so the two measurements can be compared. The corona does not have those colors in the sky.',
		image: 'fe-composite' as ScienceImage,
		alt: 'Composite eclipse image of the solar corona with Fe XI shown in red and Fe XIV shown in green',
		caption:
			'Boe et al. 2018, Figure 1C — Fe XI (red display color) and Fe XIV (green display color) combined.',
		credit: 'Boe et al. 2018, The Astrophysical Journal',
		legend: [
			{
				swatch: 'fe11',
				label: 'Red',
				text: 'A display color for Fe XI (789.2 nm). That light is near-infrared, not red.',
			},
			{
				swatch: 'fe14',
				label: 'Green',
				text: 'A display color for Fe XIV (530.3 nm), which is a green line.',
			},
		],
	},
	{
		id: 'interpret',
		index: '04',
		title: 'Interpretation and publication',
		text: 'The measurement is where each emission line is bright. The paper’s interpretation is where two iron ions settle into the charge states they then carry outward with the solar wind, and what that suggests about conditions near the Sun. That conclusion is argued in the paper. It is not written on the picture.',
		link: {
			href: 'https://doi.org/10.3847/1538-4357/aabfb7',
			label: 'Read Boe et al. 2018',
		},
	},
] as const;

export type Publication = {
	id: string;
	status: 'published';
	accessibleTitle: string;
	summary: string;
	title: string;
	authors: string;
	year: number;
	journal: string;
	volume: string;
	issue: string;
	page: string;
	doi: string;
	href: string;
	fullTextHref?: string;
	fullTextLabel?: string;
	image?: ScienceImage;
	imageAlt?: string;
	imageCaption?: string;
	imageCredit?: string;
};

export const publications: Publication[] = [
	{
		id: 'habbal-2026',
		status: 'published',
		accessibleTitle: 'Tracking plasma instabilities into space',
		summary:
			'Eclipse images first showed vortex-ring structures near the Sun. Combined with Parker Solar Probe white-light data, this work follows those structures outward and finds speeds that match the slow solar wind — evidence that they survive as they expand away from the Sun.',
		title:
			'Tracking the Evolution of Plasma Instabilities from the Prominence–Corona Transition Region into Interplanetary Space with Total Solar Eclipse and PSP/WISPR White Light Images',
		authors:
			'Shadia Rifai Habbal, Shaheda Begum Shaik, Zachary Bailey, Nathalia Alzate, Riddhi Bandyopadhyay, Miloslav Druckmüller, Simone Di Matteo, and Sage N. L. Constantinou',
		year: 2026,
		journal: 'The Astrophysical Journal',
		volume: '998',
		issue: '1',
		page: '51',
		doi: '10.3847/1538-4357/ae2ec7',
		href: 'https://doi.org/10.3847/1538-4357/ae2ec7',
		fullTextHref: 'https://arxiv.org/pdf/2601.10818',
		fullTextLabel: 'Full text',
		image: 'corona-trigaza',
		imageAlt:
			'Processed white-light image of the solar corona from Pico Trigaza during the 2026 eclipse, showing fine streamers around the Moon',
		imageCaption:
			'White-light eclipse imaging of the corona — the class of observations used to study fine structure and its evolution.',
		imageCredit: '© 2026 Miloslav Druckmüller, Shadia Habbal, Václav Široký · Pico Trigaza',
	},
	{
		id: 'boe-2018',
		status: 'published',
		accessibleTitle: 'Tracing the solar wind’s origins',
		summary:
			'Observations from the 2015 eclipse helped identify where two types of iron ions settle into the charge states they carry outward with the solar wind, offering clues to conditions near the Sun.',
		title:
			'The First Empirical Determination of the Fe¹⁰⁺ and Fe¹³⁺ Freeze-in Distances in the Solar Corona',
		authors:
			'Benjamin Boe, Shadia Habbal, Miloslav Druckmüller, Enrico Landi, Ehsan Kourkchi, Adalbert Ding, Pavel Starha, and Joseph Hutton',
		year: 2018,
		journal: 'The Astrophysical Journal',
		volume: '859',
		issue: '2',
		page: '155',
		doi: '10.3847/1538-4357/aabfb7',
		href: 'https://doi.org/10.3847/1538-4357/aabfb7',
		fullTextHref: 'https://arxiv.org/pdf/1805.03211',
		fullTextLabel: 'Full text',
		image: 'fe-composite',
		imageAlt:
			'Composite eclipse image of the solar corona, with Fe XI shown in red and Fe XIV shown in green',
		imageCaption:
			'Fe XI is shown in red and Fe XIV in green. Both are display colors, explained above. The dark corner is the edge of the frame, not a feature of the Sun.',
		imageCredit: 'Boe et al. 2018, The Astrophysical Journal, Figure 1C',
	},
	{
		id: 'druckmuller-2014',
		status: 'published',
		accessibleTitle: 'Revealing fine structures in the corona',
		summary:
			'Detailed processing of eclipse images revealed faint loops, rings and twisted structures, providing new evidence of the corona’s dynamic behavior.',
		title: 'Discovery of a New Class of Coronal Structures in White Light Eclipse Images',
		authors: 'Miloslav Druckmüller, Shadia Rifai Habbal, and Huw Morgan',
		year: 2014,
		journal: 'The Astrophysical Journal',
		volume: '785',
		issue: '1',
		page: '14',
		doi: '10.1088/0004-637X/785/1/14',
		href: 'https://doi.org/10.1088/0004-637X/785/1/14',
		image: 'druckmuller-2014',
		imageAlt:
			'Processed white-light image of the solar corona from the 11 July 2010 total eclipse at Tatakoto, showing fine streamers and structure around the Moon',
		imageCaption:
			'High-resolution white-light corona from the 11 July 2010 eclipse at Tatakoto — the same campaign illustrated in the paper.',
		imageCredit: '© Miloslav Druckmüller · Tatakoto, 2010',
	},
];

export const featuredIds = ['habbal-2026', 'boe-2018', 'druckmuller-2014'] as const;

export const nextStep = {
	title: 'The Burgos observations are being reduced.',
	text: 'Some images from the 2026 eclipse are already processed. The rest of the analysis will take months, and in some cases years. The next totality is 2 August 2027.',
	expeditionHref: latestExpeditionHref,
	expeditionLabel: 'Explore our latest expedition',
	supportHref: '#support',
	supportLabel: 'Support our research',
	imageAlt:
		'Tripods and instruments silhouetted against a low sun over the valley at Pico Trigaza, Burgos',
	imageCredit: 'Pico Trigaza · Václav Široký, 2026',
} as const;
