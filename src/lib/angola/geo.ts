import { RouteError } from '@/lib/route-error';
import { normalizeLookupKey, titleCase } from '@/lib/angola/shared';

export type AngolaMunicipality = {
  name: string;
  communes: string[];
};

export type AngolaProvince = {
  name: string;
  capital: string;
  municipalities: AngolaMunicipality[];
};

const seatOnly = (name: string) => [name];

const PROVINCES: AngolaProvince[] = [
  {
    name: 'Bengo',
    capital: 'Caxito',
    municipalities: ['Ambriz', 'Bula Atumba', 'Dande', 'Dembos-Quibaxe', 'Nambuangongo', 'Pango Aluquem'].map((name) => ({
      name,
      communes:
        name === 'Dande'
          ? ['Barra do Dande', 'Caxito', 'Mabubas', 'Quicabo', 'Úcua']
          : seatOnly(name),
    })),
  },
  {
    name: 'Benguela',
    capital: 'Benguela',
    municipalities: ['Balombo', 'Baia Farta', 'Benguela', 'Bocoio', 'Caimbambo', 'Catumbela', 'Chongoroi', 'Cubal', 'Ganda', 'Lobito'].map((name) => ({
      name,
      communes:
        name === 'Benguela'
          ? ['Benguela', 'Babaera', 'Calohanga', 'Estombela']
          : name === 'Lobito'
            ? ['Canjala', 'Egipto Praia', 'Lobito', 'Vale do Liro']
            : seatOnly(name),
    })),
  },
  {
    name: 'Bie',
    capital: 'Kuito',
    municipalities: ['Andulo', 'Camacupa', 'Catabola', 'Chinguar', 'Chitembo', 'Cuemba', 'Cunhinga', 'Kuito', "N'harea"].map((name) => ({
      name,
      communes: seatOnly(name),
    })),
  },
  {
    name: 'Cabinda',
    capital: 'Cabinda',
    municipalities: ['Belize', 'Buco-Zau', 'Cabinda', 'Cacongo'].map((name) => ({
      name,
      communes:
        name === 'Cabinda'
          ? ['Cabinda', 'Cote', 'Lande', 'Tando Zinze']
          : seatOnly(name),
    })),
  },
  {
    name: 'Cuando',
    capital: 'Mavinga',
    municipalities: [
      { name: 'Cuito Cuanavale', communes: ['Cuito Cuanavale', 'Lupire'] },
      { name: 'Dima', communes: ['Cunjamba', 'Cutuile'] },
      { name: 'Dirico', communes: ['Dirico', 'Xamavera'] },
      { name: 'Luengue', communes: ['Luengue'] },
      { name: 'Luiana', communes: ['Luiana'] },
      { name: 'Mavinga', communes: ['Mavinga', 'Cunjamba', 'Cutuile', 'Luengue'] },
      { name: 'Mucusso', communes: ['Mucusso'] },
      { name: 'Rivungo', communes: ['Rivungo'] },
      { name: 'Xipundo', communes: ['Xipundo'] },
    ],
  },
  {
    name: 'Cubango',
    capital: 'Menongue',
    municipalities: [
      'Caiundo',
      'Calai',
      'Chinguanja',
      'Cuangar',
      'Cuchi',
      'Cutato',
      'Longa',
      'Mavengue',
      'Menongue',
      'Nancova',
      'Savate',
    ].map((name) => ({
      name,
      communes:
        name === 'Cuangar'
          ? ['Cuangar', 'Bondo', 'Savate']
          : name === 'Menongue'
            ? ['Menongue', 'Cueio', 'Missombo']
            : seatOnly(name),
    })),
  },
  {
    name: 'Cuanza Norte',
    capital: "N'dalatando",
    municipalities: ['Ambaca', 'Banga', 'Bolongongo', 'Cambambe', 'Cazengo', 'Golungo Alto', 'Gonguembo', 'Lucala', 'Quiculungo', 'Samba Caju'].map((name) => ({
      name,
      communes: seatOnly(name),
    })),
  },
  {
    name: 'Cuanza Sul',
    capital: 'Sumbe',
    municipalities: ['Amboim', 'Cassongue', 'Cela', 'Waku Kungo', 'Conda', 'Ebo', 'Libolo', 'Mussende', 'Quibala', 'Quilenda', 'Seles', 'Sumbe'].map((name) => ({
      name,
      communes:
        name === 'Sumbe'
          ? ['Gangula', 'Gungo', 'Sumbe']
          : seatOnly(name),
    })),
  },
  {
    name: 'Cunene',
    capital: 'Ondjiva',
    municipalities: ['Cahama', 'Cuanhama', 'Curoca', 'Cuvelai', 'Namacunde', 'Ombadja'].map((name) => ({
      name,
      communes: seatOnly(name),
    })),
  },
  {
    name: 'Huambo',
    capital: 'Huambo',
    municipalities: ['Bailundo', 'Caala', 'Catchiungo', 'Ekunha', 'Huambo', 'Londuimbali', 'Longonjo', 'Mungo', 'Tchicala-Tcholoanga', 'Tchindjenje', 'Ucuma'].map((name) => ({
      name,
      communes:
        name === 'Huambo'
          ? ['Huambo', 'Calenga', 'Chipipa']
          : seatOnly(name),
    })),
  },
  {
    name: 'Huila',
    capital: 'Lubango',
    municipalities: ['Caconda', 'Caluquembe', 'Chiange', 'Chibia', 'Chicomba', 'Chipindo', 'Gambos', 'Humpata', 'Jamba', 'Kuvango', 'Lubango', 'Matala', 'Quilengues', 'Quipungo'].map((name) => ({
      name,
      communes:
        name === 'Lubango'
          ? ['Arimba', 'Huíla', 'Lubango', 'Tchibia']
          : seatOnly(name),
    })),
  },
  {
    name: 'Icolo e Bengo',
    capital: 'Catete',
    municipalities: [
      { name: 'Bom Jesus', communes: ['Bom Jesus'] },
      { name: 'Cabiri', communes: ['Cabiri', 'Caculo Cahango'] },
      { name: 'Cabo Ledo', communes: ['Cabo Ledo'] },
      { name: 'Calumbo', communes: ['Calumbo'] },
      { name: 'Catete', communes: ['Catete', 'Calomboloca'] },
      { name: 'Quicama', communes: ['Mumbondo', 'Muxima', 'Quicama'] },
      { name: 'Sequele', communes: ['Sequele'] },
    ],
  },
  {
    name: 'Luanda',
    capital: 'Luanda',
    municipalities: [
      'Belas',
      'Cacuaco',
      'Camama',
      'Cazenga',
      'Hoji ya Henda',
      'Ingombota',
      'Kilamba',
      'Kilamba Kiaxi',
      'Maianga',
      'Mulenvos',
      'Mussulo',
      'Rangel',
      'Samba',
      'Sambizanga',
      'Talatona',
      'Viana',
    ].map((name) => ({
      name,
      communes:
        name === 'Belas'
          ? ['Benfica', 'Mussulo', 'Ramiro']
          : name === 'Ingombota'
            ? ['Ingombota', 'Kinaxixi', 'Maculusso']
            : name === 'Talatona'
              ? ['Cidade Universitaria', 'Talatona']
              : name === 'Viana'
                ? ['Baia', 'Calumbo', 'Viana', 'Zango']
                : seatOnly(name),
    })),
  },
  {
    name: 'Lunda Norte',
    capital: 'Dundo',
    municipalities: ['Cambulo', 'Capenda-Camulemba', 'Caungula', 'Chitato', 'Cuango', 'Cuilo', 'Lovua', 'Lubalo', 'Lucapa', 'Xa-Muteba'].map((name) => ({
      name,
      communes: seatOnly(name),
    })),
  },
  {
    name: 'Lunda Sul',
    capital: 'Saurimo',
    municipalities: ['Cacolo', 'Dala', 'Muconda', 'Saurimo'].map((name) => ({
      name,
      communes:
        name === 'Saurimo'
          ? ['Mona Quimbundo', 'Saurimo']
          : seatOnly(name),
    })),
  },
  {
    name: 'Malanje',
    capital: 'Malanje',
    municipalities: ['Cacuso', 'Calandula', 'Cambundi-Catembo', 'Cangandala', 'Caombo', 'Cunda-dia-Baze', 'Kiwaba Nzoji', 'Luquembo', 'Malanje', 'Marimba', 'Massango', 'Mucari', 'Quela', 'Quirima'].map((name) => ({
      name,
      communes:
        name === 'Malanje'
          ? ['Malanje', 'Camapango', 'Quizenga']
          : seatOnly(name),
    })),
  },
  {
    name: 'Moxico',
    capital: 'Luena',
    municipalities: [
      { name: 'Alto Cuito', communes: ['Tempue'] },
      { name: 'Camanongue', communes: ['Camanongue'] },
      { name: 'Cangamba', communes: ['Cangamba', 'Cangombe', 'Cassamba', 'Muie'] },
      { name: 'Cangumbe', communes: ['Cangumbe'] },
      { name: 'Chiume', communes: ['Chiume'] },
      { name: 'Leua', communes: ['Leua', 'Liangongo'] },
      { name: 'Lucusse', communes: ['Lucusse'] },
      { name: 'Luena', communes: ['Cachipoque', 'Cangumbe', 'Lucusse', 'Luena', 'Lutuai'] },
      { name: 'Lumbala Nguimbo', communes: ['Lumbala Nguimbo', 'Mussuma', 'Ninda', 'Sessa'] },
      { name: 'Lutembo', communes: ['Lutembo'] },
      { name: 'Lutuai', communes: ['Lutuai', 'Muangai'] },
      { name: 'Ninda', communes: ['Ninda'] },
    ],
  },
  {
    name: 'Moxico Leste',
    capital: 'Cazombo',
    municipalities: [
      { name: 'Caianda', communes: ['Caianda'] },
      { name: 'Cameia', communes: ['Cameia', 'Lumeje'] },
      { name: 'Cazombo', communes: ['Cazombo', 'Lumbala Caquengue'] },
      { name: 'Lago Dilolo', communes: ['Lago Dilolo'] },
      { name: 'Lovua do Zambeze', communes: ['Lovua do Zambeze'] },
      { name: 'Luacano', communes: ['Lago Dilolo', 'Luacano'] },
      { name: 'Luau', communes: ['Luau'] },
      { name: 'Macondo', communes: ['Calunda', 'Macondo'] },
      { name: 'Nana Candundo', communes: ['Nana Candundo'] },
    ],
  },
  {
    name: 'Namibe',
    capital: 'Mocamedes',
    municipalities: ['Bibala', 'Camacuio', 'Mocamedes', 'Tombua', 'Virei'].map((name) => ({
      name,
      communes:
        name === 'Mocamedes'
          ? ['Bentiaba', 'Lucira', 'Mocamedes']
          : seatOnly(name),
    })),
  },
  {
    name: 'Uige',
    capital: 'Uige',
    municipalities: ['Ambuila', 'Bembe', 'Buengas', 'Bungo', 'Cangola', 'Damba', 'Mucaba', 'Negage', 'Puri', 'Quimbele', 'Quitexe', 'Santa Cruz', 'Sanza Pombo', 'Songo', 'Uige', 'Maquela do Zombo'].map((name) => ({
      name,
      communes:
        name === 'Uige'
          ? ['Cangola', 'Quimbele', 'Uige']
          : seatOnly(name),
    })),
  },
  {
    name: 'Zaire',
    capital: "M'Banza Kongo",
    municipalities: ['Cuimba', "M'Banza Kongo", 'Noqui', "N'Zeto", 'Soyo', 'Tomboco'].map((name) => ({
      name,
      communes:
        name === 'Soyo'
          ? ['Pedra do Feitico', 'Quinfuquena', 'Soyo']
          : seatOnly(name),
    })),
  },
];

const provinceIndex = new Map(PROVINCES.map((province) => [normalizeLookupKey(province.name), province]));

const municipalityIndex = new Map(
  PROVINCES.flatMap((province) =>
    province.municipalities.map((municipality) => [
      `${normalizeLookupKey(municipality.name)}::${normalizeLookupKey(province.name)}`,
      { province, municipality },
    ]),
  ),
);

export function listAngolaProvinces() {
  return PROVINCES.map((province) => ({
    name: province.name,
    slug: slugify(province.name),
    capital: province.capital,
    municipalityCount: province.municipalities.length,
  }));
}

export function listAngolaMunicipalities(provinceName?: string) {
  const province = provinceName ? findProvince(provinceName) : null;
  const provinces = province ? [province] : PROVINCES;

  return provinces.flatMap((entry) =>
    entry.municipalities.map((municipality) => ({
      name: municipality.name,
      slug: slugify(municipality.name),
      province: entry.name,
      communeCount: municipality.communes.length,
    })),
  );
}

export function listAngolaCommunes(municipalityName: string, provinceName?: string) {
  if (!municipalityName) {
    throw new RouteError('MISSING_QUERY_PARAMETER', 'The "municipality" query parameter is required.', 400, {
      field: 'municipality',
    });
  }

  const match = findMunicipality(municipalityName, provinceName);

  return {
    municipality: match.municipality.name,
    province: match.province.name,
    coverage: match.municipality.communes.length > 1 ? 'curated' : 'seat-only',
    communes: match.municipality.communes.map((name) => ({
      name,
      slug: slugify(name),
    })),
  };
}

export function findProvince(name: string) {
  const province = provinceIndex.get(normalizeLookupKey(name));

  if (!province) {
    throw new RouteError('PROVINCE_NOT_FOUND', 'No Angolan province matched the supplied query.', 404, {
      field: 'province',
      value: name,
    });
  }

  return province;
}

export function findMunicipality(name: string, provinceName?: string) {
  const normalizedMunicipality = normalizeLookupKey(name);

  if (provinceName) {
    const province = findProvince(provinceName);
    const direct = municipalityIndex.get(
      `${normalizedMunicipality}::${normalizeLookupKey(province.name)}`,
    );

    if (direct) {
      return direct;
    }
  }

  const matches = Array.from(municipalityIndex.entries()).filter(([key]) =>
    key.startsWith(`${normalizedMunicipality}::`),
  );

  if (matches.length === 1) {
    return matches[0][1];
  }

  if (matches.length > 1) {
    throw new RouteError(
      'AMBIGUOUS_MUNICIPALITY',
      'The supplied municipality name exists in more than one matching context. Add the province query parameter.',
      400,
      {
        field: 'municipality',
        value: name,
      },
    );
  }

  throw new RouteError('MUNICIPALITY_NOT_FOUND', 'No Angolan municipality matched the supplied query.', 404, {
    field: 'municipality',
    value: name,
  });
}

export function getGeoSearchIndex() {
  return PROVINCES.flatMap((province) => [
    {
      type: 'province' as const,
      label: province.name,
      province: province.name,
    },
    ...province.municipalities.map((municipality) => ({
      type: 'municipality' as const,
      label: municipality.name,
      province: province.name,
      municipality: municipality.name,
    })),
    ...province.municipalities.flatMap((municipality) =>
      municipality.communes.map((commune) => ({
        type: 'commune' as const,
        label: commune,
        province: province.name,
        municipality: municipality.name,
        commune,
      })),
    ),
  ]);
}

function slugify(value: string) {
  return normalizeLookupKey(value).replace(/\s+/g, '-');
}

export function normalizeProvinceName(value: string) {
  return titleCase(value)
    .replace('Mocamedes', 'Mocamedes')
    .replace('Uige', 'Uige');
}
