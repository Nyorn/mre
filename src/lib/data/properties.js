// Объекты. Пока демо: данные условные, только координаты выбраны по реальным районам.
// Поля «до моря» и «до аэропорта» считаются автоматически по береговой линии OSM (см. src/lib/server/objects.js).

/**
 * @typedef {Object} Property
 * @property {string} slug
 * @property {boolean} demo      пометка «демо-объект» на всех экранах
 * @property {string} title
 * @property {string} place      город / курорт
 * @property {string} type
 * @property {number} lat
 * @property {number} lon
 * @property {number|null} price  EUR; null = по запросу
 * @property {number|null} area   м²
 * @property {string|null} floor
 * @property {number|null} rooms
 * @property {string} line       одна сильная фраза объекта
 * @property {string} description
 * @property {number} mood       высота солнца в сцене объекта (рад): <0.05 закат/рассвет, ~0.2 день
 * @property {string[]} highlights
 */

/** @type {Property[]} */
export const properties = [
	{
		slug: 'dom-v-starom-nesebre',
		demo: true,
		title: 'Дом в старом Несебре',
		place: 'Несебр',
		type: 'Дом',
		lat: 42.6588,
		lon: 27.733,
		price: null,
		area: null,
		floor: null,
		rooms: null,
		line: 'Каменный полуостров, вода с трёх сторон.',
		description:
			'Демо-описание. Здесь будет рассказ об объекте: что за дом, какой из него вид, как устроен быт и почему он стоит своих денег.',
		mood: 0.03,
		highlights: ['Старый город под охраной ЮНЕСКО', 'Пешеходные улицы', 'Вид на залив']
	},
	{
		slug: 'apartamenty-v-svyatom-vlase',
		demo: true,
		title: 'Апартаменты в Святом Власе',
		place: 'Свети Влас',
		type: 'Апартаменты',
		lat: 42.7135,
		lon: 27.7605,
		price: null,
		area: null,
		floor: null,
		rooms: null,
		line: 'Марина под окнами, горы за спиной.',
		description:
			'Демо-описание. Здесь будет рассказ об объекте: планировка, вид, инфраструктура комплекса и расходы на содержание.',
		mood: 0.14,
		highlights: ['Марина Dinevi', 'Горы Стара-Планины', 'Тихий залив']
	},
	{
		slug: 'villa-nad-balchikom',
		demo: true,
		title: 'Вилла над Балчиком',
		place: 'Балчик',
		type: 'Вилла',
		lat: 43.4135,
		lon: 28.1475,
		price: null,
		area: null,
		floor: null,
		rooms: null,
		line: 'Белые скалы и самый спокойный север побережья.',
		description:
			'Демо-описание. Здесь будет рассказ об объекте: участок, дом, вид с террасы и что рядом.',
		mood: 0.2,
		highlights: ['Дворец и ботанический сад', 'Гольф-поля Калиакры', 'Меньше туристов']
	},
	{
		slug: 'studiya-u-sozopolya',
		demo: true,
		title: 'Студия у Созополя',
		place: 'Созополь',
		type: 'Студия',
		lat: 42.412,
		lon: 27.6885,
		price: null,
		area: null,
		floor: null,
		rooms: null,
		line: 'Самый южный характер: сосны, бухты, старый город.',
		description:
			'Демо-описание. Здесь будет рассказ об объекте: комплекс, пляж, сезонность и аренда.',
		mood: 0.08,
		highlights: ['Пляж Харманите', 'Старый Созополь', 'Сосновые бухты юга']
	}
];
