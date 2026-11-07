/** Sample data copied from the demo (src/data/districts.ts and scripts/generate-listings.mjs). */

// ---------- Districts (key = URL value, kept from the demo) ----------
export const DISTRICTS: { key: string; region: 'yerevan' | 'kotayk'; name: { hy: string; en: string; ru: string } }[] = [
  { key: 'kentron', region: 'yerevan', name: { hy: 'Կենտրոն', en: 'Kentron', ru: 'Кентрон' } },
  { key: 'arabkir', region: 'yerevan', name: { hy: 'Արաբկիր', en: 'Arabkir', ru: 'Арабкир' } },
  { key: 'ajapnyak', region: 'yerevan', name: { hy: 'Աջափնյակ', en: 'Ajapnyak', ru: 'Ачапняк' } },
  { key: 'avan', region: 'yerevan', name: { hy: 'Ավան', en: 'Avan', ru: 'Аван' } },
  { key: 'davtashen', region: 'yerevan', name: { hy: 'Դավթաշեն', en: 'Davtashen', ru: 'Давташен' } },
  { key: 'erebuni', region: 'yerevan', name: { hy: 'Էրեբունի', en: 'Erebuni', ru: 'Эребуни' } },
  { key: 'kanakerZeytun', region: 'yerevan', name: { hy: 'Քանաքեռ-Զեյթուն', en: 'Kanaker-Zeytun', ru: 'Канакер-Зейтун' } },
  { key: 'malatiaSebastia', region: 'yerevan', name: { hy: 'Մալաթիա-Սեբաստիա', en: 'Malatia-Sebastia', ru: 'Малатия-Себастия' } },
  { key: 'norNork', region: 'yerevan', name: { hy: 'Նոր Նորք', en: 'Nor Nork', ru: 'Нор Норк' } },
  { key: 'shengavit', region: 'yerevan', name: { hy: 'Շենգավիթ', en: 'Shengavit', ru: 'Шенгавит' } },
  { key: 'abovyanCity', region: 'kotayk', name: { hy: 'Աբովյան', en: 'Abovyan', ru: 'Абовян' } },
  { key: 'tsaghkadzor', region: 'kotayk', name: { hy: 'Ծաղկաձոր', en: 'Tsaghkadzor', ru: 'Цахкадзор' } },
]

// ---------- Sample agents (placeholders, clearly fictional) ----------
export const AGENTS = [
  { email: 'anna.sample@avenue.test', phone: '+374 93 77 22 71', whatsapp: '37493772271', languages: ['hy', 'en', 'ru'], name: { hy: 'Աննա Հակոբյան', en: 'Anna Hakobyan', ru: 'Анна Акопян' } },
  { email: 'davit.sample@avenue.test', phone: '+374 93 77 22 72', whatsapp: '37493772272', languages: ['hy', 'ru'], name: { hy: 'Դավիթ Սարգսյան', en: 'Davit Sargsyan', ru: 'Давит Саргсян' } },
  { email: 'mariam.sample@avenue.test', phone: '+374 93 77 22 73', whatsapp: '37493772273', languages: ['hy', 'en'], name: { hy: 'Մարիամ Գրիգորյան', en: 'Mariam Grigoryan', ru: 'Мариам Григорян' } },
] as const

// ---------- Photo pools (Unsplash, free licence) ----------
export const PHOTO_POOLS = {
  living: ['photo-1522708323590-d24dbb6b0267', 'photo-1586023492125-27b2c045efd7', 'photo-1502672260266-1c1ef2d93688', 'photo-1583847268964-b28dc8f51f92', 'photo-1560448204-e02f11c3d0e2', 'photo-1493809842364-78817add7ffb', 'photo-1564078516393-cf04bd966897', 'photo-1616047006789-b7af5afb8c20', 'photo-1598928506311-c55ded91a20c', 'photo-1618221195710-dd6b41faaea6', 'photo-1600121848594-d8644e57abab', 'photo-1560185007-cde436f6a4d0', 'photo-1631679706909-1844bbd07221', 'photo-1615800002234-05c4d488696c', 'photo-1605774337664-7a846e9cdf17', 'photo-1554995207-c18c203602cb', 'photo-1512918728675-ed5a9ecdebfd', 'photo-1585128792020-803d29415281'],
  kitchen: ['photo-1600489000022-c2086d79f9d4', 'photo-1484154218962-a197022b5858', 'photo-1565538810643-b5bdb714032a', 'photo-1556912173-46c336c7fd55', 'photo-1556911220-bff31c812dba', 'photo-1617228069096-4638a7ffc906', 'photo-1588854337221-4cf9fa96059c', 'photo-1507089947368-19c1da9775ae', 'photo-1556912167-f556f1f39fdf', 'photo-1600684388091-627109f3cd60', 'photo-1628745277862-bc0b2d68c50c', 'photo-1602028915047-37269d1a73f7'],
  bedroom: ['photo-1616594039964-ae9021a400a0', 'photo-1560185893-a55cbc8c57e8', 'photo-1566665797739-1674de7a421a', 'photo-1618221118493-9cfa1a1c00da', 'photo-1615874959474-d609969a20ed', 'photo-1618220179428-22790b461013', 'photo-1562438668-bcf0ca6578f0', 'photo-1598928636135-d146006ff4be', 'photo-1616486029423-aaa4789e8c9a', 'photo-1595526114035-0d45ed16cfbf', 'photo-1616046229478-9901c5536a45', 'photo-1556020685-ae41abfc9365'],
  bathroom: ['photo-1584622650111-993a426fbf0a', 'photo-1616537937163-387d3f079de8', 'photo-1631889993959-41b4e9c6e3c5', 'photo-1576698483491-8c43f0862543', 'photo-1620626011761-996317b8d101', 'photo-1507652313519-d4e9174996dd', 'photo-1603825491103-bd638b1873b0'],
  building: ['photo-1545324418-cc1a3fa10c00', 'photo-1580216643062-cf460548a66a', 'photo-1594484208280-efa00f96fc21', 'photo-1595330449916-e7c3e1962bd3', 'photo-1515263487990-61b07816b324', 'photo-1612637968894-660373e23b03', 'photo-1580041065738-e72023775cdc', 'photo-1460317442991-0ec209397118', 'photo-1551361415-69c87624334f', 'photo-1624204386084-dd8c05e32226', 'photo-1479839672679-a46483c0e7c8'],
  house: ['photo-1570129477492-45c003edd2be', 'photo-1598228723793-52759bba239c', 'photo-1494526585095-c41746248156', 'photo-1600596542815-ffad4c1539a9', 'photo-1580587771525-78b9dba3b914', 'photo-1583608205776-bfd35f0d9f83', 'photo-1605276374104-dee2a0ed3cd6', 'photo-1605146769289-440113cc3d00', 'photo-1602343168117-bb8ffe3e2e9f', 'photo-1568605114967-8130f3a36994', 'photo-1523217582562-09d0def993a6', 'photo-1512917774080-9991f1c4c750', 'photo-1592595896616-c37162298647', 'photo-1584738766473-61c083514bf4'],
  office: ['photo-1497366811353-6870744d04b2', 'photo-1497366754035-f200968a6e72', 'photo-1553877522-43269d4ea984', 'photo-1560264280-88b68371db39', 'photo-1497215728101-856f4ea42174', 'photo-1606857521015-7f9fcf423740', 'photo-1604328698692-f76ea9498e76', 'photo-1517048676732-d65bc937f952', 'photo-1568992687947-868a62a9f521', 'photo-1531973576160-7125cd663d86', 'photo-1541746972996-4e0b0f43e02a', 'photo-1487017159836-4e23ece2e4cf'],
  land: ['photo-1615729947596-a598e5de0ab3', 'photo-1587990754909-18ae9d92c8e8', 'photo-1624538931007-e9ce9e9ee112', 'photo-1529061498291-c978a148ee6e', 'photo-1587479281396-a369ac624104'],
}
export type PhotoPool = keyof typeof PHOTO_POOLS

/** Alt text for each pool, in the three languages. */
export const POOL_ALT: Record<PhotoPool, { hy: string; en: string; ru: string }> = {
  living: { hy: 'Հյուրասենյակ', en: 'Living room', ru: 'Гостиная' },
  kitchen: { hy: 'Խոհանոց', en: 'Kitchen', ru: 'Кухня' },
  bedroom: { hy: 'Ննջասենյակ', en: 'Bedroom', ru: 'Спальня' },
  bathroom: { hy: 'Լոգասենյակ', en: 'Bathroom', ru: 'Ванная' },
  building: { hy: 'Շենքի արտաքին տեսք', en: 'Building exterior', ru: 'Фасад здания' },
  house: { hy: 'Առանձնատան արտաքին տեսք', en: 'House exterior', ru: 'Фасад дома' },
  office: { hy: 'Գրասենյակային տարածք', en: 'Office space', ru: 'Офисное помещение' },
  land: { hy: 'Հողատարածք', en: 'Land plot', ru: 'Земельный участок' },
}

// ---------- Locations: [districtKey, region, streets: [hy, en, ru, lat, lng], price multiplier] ----------
export const LOCATIONS: [string, string, (string | number)[][], number][] = [
  ['kentron', 'yerevan', [['Աբովյան փողոց', 'Abovyan street', 'улица Абовяна', 40.1866, 44.5155], ['Տերյան փողոց', 'Teryan street', 'улица Теряна', 40.184, 44.511], ['Սարյան փողոց', 'Saryan street', 'улица Сарьяна', 40.1858, 44.505], ['Թումանյան փողոց', 'Tumanyan street', 'улица Туманяна', 40.1838, 44.514], ['Հյուսիսային պողոտա', 'Northern Avenue', 'Северный проспект', 40.183, 44.516], ['Պուշկինի փողոց', 'Pushkin street', 'улица Пушкина', 40.182, 44.508]], 1.45],
  ['arabkir', 'yerevan', [['Կոմիտասի պողոտա', 'Komitas avenue', 'проспект Комитаса', 40.205, 44.505], ['Բաղրամյան պողոտա', 'Baghramyan avenue', 'проспект Баграмяна', 40.196, 44.5], ['Կիևյան փողոց', 'Kievyan street', 'улица Киевяна', 40.199, 44.496]], 1.2],
  ['ajapnyak', 'yerevan', [['Հալաբյան փողոց', 'Halabyan street', 'улица Алабяна', 40.195, 44.472]], 0.85],
  ['avan', 'yerevan', [['Ծարավ Աղբյուրի փողոց', 'Tsarav Aghbyur street', 'улица Царав Ахбюр', 40.221, 44.577]], 0.8],
  ['davtashen', 'yerevan', [['Անաստաս Միկոյան փողոց', 'Anastas Mikoyan street', 'улица Анастаса Микояна', 40.227, 44.493]], 0.9],
  ['erebuni', 'yerevan', [['Էրեբունի փողոց', 'Erebuni street', 'улица Эребуни', 40.145, 44.53]], 0.75],
  ['kanakerZeytun', 'yerevan', [['Պարույր Սևակի փողոց', 'Paruyr Sevak street', 'улица Паруйра Севака', 40.214, 44.532]], 0.95],
  ['malatiaSebastia', 'yerevan', [['Րաֆֆու փողոց', 'Raffi street', 'улица Раффи', 40.172, 44.46]], 0.8],
  ['norNork', 'yerevan', [['Գայի պողոտա', 'Gai avenue', 'проспект Гая', 40.199, 44.56]], 0.85],
  ['shengavit', 'yerevan', [['Բագրատունյաց պողոտա', 'Bagratunyats avenue', 'проспект Багратуняц', 40.157, 44.49]], 0.8],
  ['abovyanCity', 'kotayk', [['Հանրապետության փողոց', 'Hanrapetutyan street', 'улица Анрапетутян', 40.274, 44.626]], 0.6],
  ['tsaghkadzor', 'kotayk', [['Օրբելի եղբայրների փողոց', 'Orbeli Brothers street', 'улица братьев Орбели', 40.532, 44.72]], 0.9],
]
