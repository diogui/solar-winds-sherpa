/**
 * Science page copy. Public text is English.
 * Edit this file to update questions, instruments, the worked example, and the bibliography.
 *
 * PENDING — internal only. Do not render these notes on the page.
 *
 * 1. Questions. The three themes are the candidates in the page brief: coronal heating,
 *    the origin of the solar wind, and the structure and evolution of the corona and its
 *    magnetic fields. Confirm they are the questions to feature. No temperature numbers
 *    are stated; add them only if the team wants a specific wording.
 *
 * 2. Why eclipses matter. The page says totality complements spacecraft and other
 *    instruments. It does not claim the corona can only be studied during an eclipse.
 *    Confirm the specific advantage the team wants stated here.
 *    Photographer credits are missing for src/assets/images/why/sun.jpg, corona.jpg,
 *    and prominences.jpg.
 *
 * 3. Equipment. Groups are the ones already named on the site: white-light cameras,
 *    narrow-band filters, and spectrometers. Danilo still needs to confirm the inventory,
 *    which photograph belongs to which system, and what the Sherpas designed or adapted.
 *    Until then the page names no models, specifications, or in-house hardware.
 *    Photo pairings are descriptive only:
 *    - burgos-totality.jpg — cameras on the ridge during totality, Pico Trigaza, Spain 2026.
 *      Photographer credit is not confirmed (Latest Expedition uses this frame for the site).
 *    - latest-instruments.jpg — multi-camera rig, Spain 2026. Not confirmed as the filter system.
 *    - computers-night.jpg — instruments and computers running, USA 2024 (About caption).
 *      Not confirmed as a spectrometer.
 *    Photographer credits for these three files are not on the page.
 *
 * 4. Worked example. The sequence follows the 20 March 2015 eclipse and Boe et al. 2018
 *    because that is the published result with figures already in the repo. Confirm:
 *    - group-field-2015.jpg may be shown with that paper (About caption: Faroe Islands, 2015).
 *      It is not claimed as the exact frame of data in Figure 1.
 *    - corona-structures.jpg is Boe et al. 2018 Figure 1A.
 *    - boe-2018-fig1.png panel letters match the paper, especially panel B.
 *    - Color key: red is a display color for Fe XI (789.2 nm); green is the display color
 *      for Fe XIV (530.3 nm). Wavelengths are from the published abstract.
 *    A photo set from one expedition covering calibration, totality, and reduction is still
 *    missing, so the camp photograph and the paper figures are not one continuous shoot.
 *
 * 5. Publications. Only the two papers already linked from the home page are listed.
 *    Do not add a third until the team names it. Do not use Boe et al. 2018 Figure 1A
 *    as the figure for Druckmüller et al. 2014 — that crop is only a stand-in on the home cards.
 *    Druckmüller et al. 2014 has no confirmed open full text (no arXiv record).
 *    Authors, year, journal, volume, issue, and page are from Crossref.
 *    The accessible summaries are the home-page wording. The team still needs to validate
 *    them against the papers and to extend the selected list. No publication count is shown.
 *
 * 6. What comes next. The close follows the Latest Expedition page: Burgos data reduction
 *    is underway and will take months to years; the next totality is 2 August 2027.
 *    Confirm that this science-page close should stay in step with that page.
 *    “Support our research” points at /#support while /join still redirects home.
 */

export type ScienceImage =
	| 'corona-white'
	| 'sun'
	| 'corona'
	| 'prominences'
	| 'cameras-totality'
	| 'filter-rig'
	| 'field-station'
	| 'faroe-camp'
	| 'boe-fig1'
	| 'fe-composite';

export const hero = {
	image: 'corona-white' as ScienceImage,
	alt: 'Processed white-light image of the solar corona during the total eclipse of 20 March 2015, with fine rays around the black disk of the Moon and a small prominence on the left',
	caption:
		'Processed white-light image of the solar corona during the total eclipse of 20 March 2015. Faint rays are enhanced so they can be seen. This is not a single raw exposure.',
	credit: 'Boe et al. 2018, The Astrophysical Journal, Figure 1A',
};

export const questions = [
	{
		id: 'heating',
		index: '01',
		title: 'Why is the corona so hot?',
		text: 'The Sun’s visible surface is much cooler than the corona above it. How that heat is arranged, and how it relates to magnetic structure, is one of the central problems in solar physics. Eclipse images are one way to see that arrangement.',
	},
	{
		id: 'solar-wind',
		index: '02',
		title: 'Where does the solar wind begin?',
		text: 'The solar wind is the stream of particles that flows out from the Sun and past Earth. It is launched in the inner corona. These observations look for where that happens, and how it differs from one coronal structure to another.',
	},
	{
		id: 'structure',
		index: '03',
		title: 'How do the corona and its magnetic fields change?',
		text: 'Streamers, loops, and prominences trace the corona’s large-scale structure. Repeating the same kinds of observations from eclipse to eclipse shows how that structure evolves, including across the solar cycle.',
	},
] as const;

export const whyParagraphs = [
	'The corona is the Sun’s outer atmosphere. Its visible light is faint, and it is usually lost in the glare of the solar surface. When the Moon covers that surface, the corona — and the prominences at its edge — can be photographed from the ground.',
	'Spacecraft and other observatories study the corona throughout the year. Eclipse observations complement those measurements. During totality, Solar Wind Sherpas record the corona in white light, through narrow-band filters on emission lines of ionized iron, and with spectrometers. Those data are used to examine the corona’s structure, temperature, and motion, and its connection to the solar wind.',
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
			'The corona’s visible light across a broad range of colors. In white-light images, streamers and prominences show the large-scale shape of the corona.',
		question: 'How the corona and its magnetic fields are structured, and how they change.',
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
			'Narrow slices of the spectrum, including emission lines of ionized iron such as Fe XI and Fe XIV. Comparing those lines shows where hotter and cooler plasma lies.',
		question: 'Why the corona is so hot, and where the solar wind begins.',
	},
	{
		id: 'spectrometers',
		name: 'Spectrometers',
		image: 'field-station' as ScienceImage,
		alt: 'A researcher at field computers inside a dark tent, with instruments beside the screens',
		caption: 'Instruments and field computers running in the dark.',
		credit: 'USA, 2024',
		position: '50% 42%',
		measures:
			'The spectrum of coronal light, so individual emission lines can be separated and studied. Spectra are part of how the team examines temperature and motion.',
		question: 'How the corona is heated, and how it moves.',
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
		caption: 'The same white-light image as at the top of this page, published as Figure 1A.',
		credit: 'Boe et al. 2018, The Astrophysical Journal',
	},
	{
		id: 'reduce',
		index: '03',
		title: 'Processing and analysis',
		text: 'Processing changes the contrast so faint structure can be seen. It does not add features that were not recorded. The panels then separate two emission lines from the white-light view. Fe XI is the line at 789.2 nm, in the near-infrared. Fe XIV is the line at 530.3 nm, in the green. In the figure, Fe XI is given a red display color and Fe XIV a green one, so the two measurements can be compared. The corona does not have those colors in the sky.',
		image: 'boe-fig1' as ScienceImage,
		alt: 'Five-panel scientific figure of the 20 March 2015 corona: processed white light, a closer white-light view, a red-and-green composite, Fe XI in red, and Fe XIV in green',
		caption:
			'Figure 1 of Boe et al. 2018. Panels A and B are white-light views. Panels D and E show one emission line each. Panel C combines them.',
		credit: 'Boe et al. 2018, The Astrophysical Journal',
		legend: [
			{
				swatch: 'light',
				label: 'White light',
				text: 'Processed so faint rays can be seen. The gray tones are contrast, not the color of the sky.',
			},
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
	},
];

export const featuredIds = ['boe-2018', 'druckmuller-2014'] as const;

export const nextStep = {
	title: 'The Burgos observations are being reduced.',
	text: 'Some images from the 2026 eclipse are already processed. The rest of the analysis will take months, and in some cases years. The next totality is 2 August 2027.',
	expeditionHref: '/latest-expedition',
	expeditionLabel: 'Explore our latest expedition',
	supportHref: '/#support',
	supportLabel: 'Support our research',
} as const;
