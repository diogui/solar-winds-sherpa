/**
 * Numbered list from https://www.solarwindsherpas.com/expeditions
 * (Past Expeditions 1–24). Coordinates place the named country or site;
 * they are not claimed as exact instrument GPS. Dual-country lines get two points.
 *
 * `totality` is predicted duration at or near the named place (NASA/Espenak,
 * Wikipedia/timeanddate city tables, UH news for Svalbard, Druckmüller for Kenya).
 * It is not a stopwatch reading from the instruments.
 * Review with Danilo: confirm the 24-count vs “thirty / twenty” on Who we are.
 */
export type ExpeditionStatus = 'past' | 'upcoming';

export type ExpeditionSite = {
	id: string;
	n: number;
	year: number;
	date: string;
	place: string;
	lat: number;
	lng: number;
	totality: string;
	status: ExpeditionStatus;
};

export const expeditionSites: ExpeditionSite[] = [
	{ id: '1995-india', n: 1, year: 1995, date: '24 October 1995', place: 'India', lat: 24.88, lng: 74.62, totality: '50 s', status: 'past' },
	{ id: '1997-mongolia', n: 2, year: 1997, date: '9 March 1997', place: 'Mongolia', lat: 48.8, lng: 98.0, totality: '2 min 30 s', status: 'past' },
	{ id: '1998-antigua', n: 3, year: 1998, date: '26 February 1998', place: 'Antigua / Guadalupe', lat: 17.08, lng: -61.8, totality: '3 min', status: 'past' },
	{ id: '1999-syria', n: 4, year: 1999, date: '11 August 1999', place: 'Syria', lat: 35.2, lng: 37.5, totality: '2 min 5 s', status: 'past' },
	{ id: '2001-zambia', n: 5, year: 2001, date: '21 June 2001', place: 'Zambia', lat: -14.4, lng: 28.3, totality: '3 min 35 s', status: 'past' },
	{ id: '2002-south-africa', n: 6, year: 2002, date: '4 December 2002', place: 'South Africa', lat: -23.9, lng: 29.9, totality: '1 min 25 s', status: 'past' },
	{ id: '2006-libya', n: 7, year: 2006, date: '29 March 2006', place: 'Libya', lat: 26.6, lng: 14.3, totality: '4 min 7 s', status: 'past' },
	{ id: '2008-china', n: 8, year: 2008, date: '1 August 2008', place: 'China', lat: 40.8, lng: 111.7, totality: '2 min 3 s', status: 'past' },
	{ id: '2009-marshall', n: 9, year: 2009, date: '22 July 2009', place: 'Marshall Islands', lat: 7.13, lng: 171.19, totality: '5 min 40 s', status: 'past' },
	{ id: '2010-tatakoto', n: 10, year: 2010, date: '11 July 2010', place: 'Tatakoto', lat: -17.341, lng: -138.401, totality: '4 min 35 s', status: 'past' },
	{ id: '2012-australia', n: 11, year: 2012, date: '13 November 2012', place: 'Australia', lat: -16.92, lng: 145.78, totality: '2 min 1 s', status: 'past' },
	{ id: '2013-kenya', n: 12, year: 2013, date: '3 November 2013', place: 'Kenya', lat: 3.5, lng: 35.95, totality: '10 s', status: 'past' },
	{ id: '2015-svalbard', n: 13, year: 2015, date: '20 March 2015', place: 'Svalbard', lat: 78.223, lng: 15.646, totality: '2 min 20 s', status: 'past' },
	{ id: '2016-indonesia', n: 14, year: 2016, date: '9 March 2016', place: 'Indonesia', lat: -0.9, lng: 119.9, totality: '2 min 45 s', status: 'past' },
	{ id: '2017-usa', n: 15, year: 2017, date: '21 August 2017', place: 'United States', lat: 42.85, lng: -106.33, totality: '2 min 26 s', status: 'past' },
	{ id: '2019-chile', n: 16, year: 2019, date: '2 July 2019', place: 'Chile', lat: -30.03, lng: -70.71, totality: '2 min 15 s', status: 'past' },
	{ id: '2019-argentina', n: 16, year: 2019, date: '2 July 2019', place: 'Argentina', lat: -31.42, lng: -64.19, totality: '2 min', status: 'past' },
	{ id: '2020-chile', n: 17, year: 2020, date: '14 December 2020', place: 'Chile', lat: -39.3, lng: -72.2, totality: '2 min 8 s', status: 'past' },
	{ id: '2021-antarctica', n: 18, year: 2021, date: '4 December 2021', place: 'Antarctica', lat: -71.0, lng: -15.0, totality: '1 min 54 s', status: 'past' },
	{ id: '2023-australia', n: 19, year: 2023, date: '20 April 2023', place: 'Australia', lat: -21.93, lng: 114.13, totality: '1 min', status: 'past' },
	{ id: '2024-usa', n: 20, year: 2024, date: '8 April 2024', place: 'United States', lat: 31.56, lng: -97.14, totality: '4 min 13 s', status: 'past' },
	{ id: '2024-mexico', n: 20, year: 2024, date: '8 April 2024', place: 'Mexico', lat: 23.25, lng: -106.41, totality: '4 min 19 s', status: 'past' },
	{ id: '2026-iceland', n: 21, year: 2026, date: '12 August 2026', place: 'Iceland', lat: 65.502, lng: -24.367, totality: '2 min 13 s', status: 'past' },
	{ id: '2026-spain', n: 21, year: 2026, date: '12 August 2026', place: 'Spain', lat: 42.34, lng: -3.7, totality: '1 min 44 s', status: 'past' },
	{ id: '2027-egypt', n: 22, year: 2027, date: '2 August 2027', place: 'Egypt', lat: 25.69, lng: 32.64, totality: '6 min 22 s', status: 'upcoming' },
	{ id: '2027-spain', n: 22, year: 2027, date: '2 August 2027', place: 'Spain', lat: 36.72, lng: -4.42, totality: '1 min 57 s', status: 'upcoming' },
	{ id: '2028-australia', n: 23, year: 2028, date: '22 July 2028', place: 'Australia', lat: -15.7, lng: 129.0, totality: '5 min 10 s', status: 'upcoming' },
	{ id: '2030-south-africa', n: 24, year: 2030, date: '25 November 2030', place: 'South Africa', lat: -28.5, lng: 24.8, totality: '2 min 20 s', status: 'upcoming' },
	{ id: '2030-botswana', n: 24, year: 2030, date: '25 November 2030', place: 'Botswana', lat: -24.7, lng: 23.5, totality: '2 min', status: 'upcoming' },
];

export const defaultExpeditionId = '2026-spain';
