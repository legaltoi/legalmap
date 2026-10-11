/**
 * BASE DOCUMENTAIRE HISTORIQUE, TACTIQUE & STATISTIQUE DE NANTES (CARNETS 1, 2 & 3)
 * Coordonnées GPS vérifiées OpenStreetMap / IGN.
 */

export type TacticalRiskLevel = "SANCTUAIRE" | "MODÉRÉ" | "SENSIBLE" | "ÉLEVÉ" | "CRITIQUE";

export type ProtestTensionLevel =
  | "Pacifique"
  | "Calme"
  | "Faible"
  | "Modérée"
  | "Forte"
  | "Très forte";

export interface HistoricalMilestone {
  id: string;
  dateIso: string;
  dateFormatted: string;
  year: number;
  badgeLabel: string;
  context: string;
  locationText: string;
  unionCountText: string;
  policeCountText: string;
  thirdPartyCountText: string;
  fdoTactics: string;
  weaponsUsed: string;
  medicalToll: string;
  judicialToll: string;
  sources: string;
  coordinates: [number, number]; // [lng, lat]
  sectorId: string;
}

export interface TacticalSector {
  id: string;
  name: string;
  shortName: string;
  coordinates: [number, number]; // [lng, lat]
  radiusMeters: number;
  polygon: [number, number][][]; // GeoJSON Polygon coordinates
  riskLevel: TacticalRiskLevel;
  riskScore: number; // 1 to 5
  tacticalType: string;
  color: string;
  icon: string;
  keywords: string[];
  linkedEvents: string[];
  roleAndLegal: string[];
  policeDeployment: string[];
  weaponsAndRisks: string[];
  documentedIncidents: string[];
  medicalAndLegalSupport: string[];
  flowAndTransport: string[];
  sources: string[];
}

export interface HistoricalProtest {
  id: string;
  dateIso: string;
  dateFormatted: string;
  year: number;
  cycle: string;
  title: string;
  route: string;
  policeCount: number;
  unionCount: number;
  absoluteGap: number;
  ratio: number;
  tensionLevel: ProtestTensionLevel;
  sources: string;
}

export const CARNET_1_MILESTONES: HistoricalMilestone[] = [
  {
    "id": "EVT-01",
    "dateIso": "Été 1955",
    "dateFormatted": "Été 1955",
    "year": 1955,
    "badgeLabel": "1955 • Jean Rigollet",
    "context": "Grèves ouvrières du bâtiment et de la métallurgie",
    "locationText": "Nantes, Cours des 50-Otages et centre-ville",
    "unionCountText": "Plusieurs milliers d'ouvriers mobilisés",
    "policeCountText": "Non précisé dans les synthèses publiques",
    "thirdPartyCountText": "Non disponible",
    "fdoTactics": "Forces de police d'État et maintien de l'ordre territorial",
    "weaponsUsed": "Armes à feu réglementaires de maintien de l'ordre",
    "medicalToll": "Affrontements sévères ; décès du jeune ouvrier Jean Rigollet sur le cours des 50-Otages",
    "judicialToll": "Procédures répressives et judiciaires d'époque",
    "sources": "Patrimonia Nantes Métropole (Jean-Pierre Le Crom)",
    "coordinates": [
      -1.55625,
      47.21683
    ],
    "sectorId": "cours-50-otages"
  },
  {
    "id": "EVT-02",
    "dateIso": "1984-02-01",
    "dateFormatted": "1 févr. 1984",
    "year": 1984,
    "badgeLabel": "1984 • Loi Savary (150k)",
    "context": "Manifestation interrégionale contre la loi Savary",
    "locationText": "Nantes, hypercentre et grands axes",
    "unionCountText": "150 000 manifestants selon les organisateurs",
    "policeCountText": "Non communiqué",
    "thirdPartyCountText": "Non disponible",
    "fdoTactics": "Service d'ordre préfectoral conventionnel",
    "weaponsUsed": "Armement de dotation standard (aucun usage de force cinétique documenté)",
    "medicalToll": "Défilé pacifique sans heurts (représentatif des 95 % de défilés sans violences)",
    "judicialToll": "Aucune interpellation notable",
    "sources": "Dictionnaire de Nantes ; Patrimonia Nantes Métropole",
    "coordinates": [
      -1.5554,
      47.2181
    ],
    "sectorId": "cours-50-otages"
  },
  {
    "id": "EVT-03",
    "dateIso": "2007-11-27",
    "dateFormatted": "27 nov. 2007",
    "year": 2007,
    "badgeLabel": "2007 • Rectorat (Flash-Ball)",
    "context": "Mobilisation lycéenne pour les moyens scolaires",
    "locationText": "Nantes, abords du Rectorat (quartiers Est)",
    "unionCountText": "Cortège lycéen nantais",
    "policeCountText": "Non isolé",
    "thirdPartyCountText": "Non disponible",
    "fdoTactics": "Unités territoriales de police (DDSP 44) et brigades d'intervention",
    "weaponsUsed": "Flash-Ball Superpro ; grenades lacrymogènes",
    "medicalToll": "Pierre Douillard-Lefevre (16 ans) éborgné par un tir de Flash-Ball Superpro (perte définitive de la vision)",
    "judicialToll": "Instructions pénales et administratives TGI Nantes",
    "sources": "Assemblée des blessés ; Désarmons-les ! ; dossiers judiciaires",
    "coordinates": [
      -1.55205,
      47.24059
    ],
    "sectorId": "rectorat-est"
  },
  {
    "id": "EVT-04",
    "dateIso": "2014-02-22",
    "dateFormatted": "22 févr. 2014",
    "year": 2014,
    "badgeLabel": "2014 • Anti-NDDL (Blessés LBD)",
    "context": "Manifestation nationale contre l'aéroport de NDDL",
    "locationText": "Nantes, hypercentre, Préfecture, Commerce, Cours des 50-Otages",
    "unionCountText": "Défilé massif de dizaines de milliers de participants",
    "policeCountText": "Écart significatif avec le décompte organisateurs",
    "thirdPartyCountText": "Non disponible",
    "fdoTactics": "CRS, EGM, brigades BAC, engins lanceurs d'eau, nasses",
    "weaponsUsed": "Lanceurs LBD 40, Flash-Ball, grenades DMP/DBD, grenades explosives GLI-F4",
    "medicalToll": "Multiples blessés graves ; au moins 3 manifestants éborgnés au LBD/Flash-Ball (D. Tessier, Q. Tembely, Emmanuel)",
    "judicialToll": "Multiples interpellations et comparutions immédiates (commissariat Waldeck-Rousseau)",
    "sources": "CHU de Nantes ; Défenseur des droits ; Désarmons-les !",
    "coordinates": [
      -1.55414,
      47.22006
    ],
    "sectorId": "prefecture-ceineray"
  },
  {
    "id": "EVT-05",
    "dateIso": "2017-09-21",
    "dateFormatted": "21 sept. 2017",
    "year": 2017,
    "badgeLabel": "2017 • Ordonnances Travail",
    "context": "Journée d'action intersyndicale contre les ordonnances Travail",
    "locationText": "Nantes (parcours scindé vers CHU et permanence F. de Rugy)",
    "unionCountText": "7 000 à Nantes (Saint-Nazaire : 2 500, Châteaubriant : 150, Ancenis : 100)",
    "policeCountText": "Non communiqué",
    "thirdPartyCountText": "Non disponible",
    "fdoTactics": "Cordons de gardes mobiles (EGM), BAC, charges lors de la dislocation",
    "weaponsUsed": "Jets nourris de grenades lacrymogènes, grenades de désencerclement, tirs de LBD/Flash-Ball",
    "medicalToll": "Charges policières violentes ; un manifestant blessé par LBD admis au CHU de Nantes",
    "judicialToll": "2 syndicalistes de l'UL Sud Loire placés en garde à vue pour jets de projectiles",
    "sources": "Union Départementale CGT 44 (récit du 21 septembre 2017)",
    "coordinates": [
      -1.55311,
      47.2121
    ],
    "sectorId": "chu-hotel-dieu"
  },
  {
    "id": "EVT-06",
    "dateIso": "2017-11-16",
    "dateFormatted": "16 nov. 2017",
    "year": 2017,
    "badgeLabel": "2017 • Étalonnage Eurecam",
    "context": "Mobilisation contre la politique libérale (test national de comptage)",
    "locationText": "Paris, parcours linéaire déclaré",
    "unionCountText": "40 000 selon la CGT",
    "policeCountText": "8 000 selon la police",
    "thirdPartyCountText": "8 250 selon Occurrence ; recomptage vidéo BFM TV/Le Monde/TF1 (écart max 8 %)",
    "fdoTactics": "Dispositif préfectoral standard d'encadrement",
    "weaponsUsed": "Dotation conventionnelle (pas d'usage massif d'armes de force intermédiaire)",
    "medicalToll": "Aucun blessé lourd ; cortège calme retenu pour étalonner le capteur Eurecam",
    "judicialToll": "Bilan judiciaire marginal",
    "sources": "Cabinet Occurrence ; Collectif de médias ; Le Monde ; Libération",
    "coordinates": [
      -1.55625,
      47.21683
    ],
    "sectorId": "cours-50-otages"
  },
  {
    "id": "EVT-07",
    "dateIso": "2018-03-22",
    "dateFormatted": "22 mars 2018",
    "year": 2018,
    "badgeLabel": "2018 • Controverse Occurrence",
    "context": "Journée nationale de grève fonction publique et cheminots",
    "locationText": "Paris et national, boucle déclarée",
    "unionCountText": "~500 000 selon la CGT",
    "policeCountText": "49 000 selon la police",
    "thirdPartyCountText": "47 800 selon le cabinet Occurrence",
    "fdoTactics": "Dispositif d'ordre public préfectoral sur cortège balisé",
    "weaponsUsed": "Armement intermédiaire de contrôle de foule",
    "medicalToll": "Début de la controverse technico-scientifique sur la boîte noire Eurecam",
    "judicialToll": "Procédures ordinaires de maintien de l'ordre",
    "sources": "Émile Provendier (Revue française de science politique) ; Mondes Sociaux",
    "coordinates": [
      -1.55625,
      47.21683
    ],
    "sectorId": "cours-50-otages"
  },
  {
    "id": "EVT-08",
    "dateIso": "2026-09-29",
    "dateFormatted": "29 sept. 2026",
    "year": 2026,
    "badgeLabel": "2026 • Fonction Publique",
    "context": "Grève nationale intersyndicale de la fonction publique",
    "locationText": "Nantes, centre-ville, Miroir d'eau, réseaux Naolib et Aléop",
    "unionCountText": "~5 000 selon la CFDT (Saint-Nazaire : 2 000, Châteaubriant : 200)",
    "policeCountText": "Non isolé",
    "thirdPartyCountText": "~7 000 selon l'estimation Nantes Infos",
    "fdoTactics": "Forces territoriales de police et surveillance des axes stratégiques",
    "weaponsUsed": "Dispositif dissuasif et moyens de contrôle de foule",
    "medicalToll": "Quelques tensions signalées en marge du cortège à Nantes et Saint-Nazaire",
    "judicialToll": "Contrôles d'identité préventifs ; trafic Naolib et cantines bloqués",
    "sources": "Tribune Nantaise ; Actu Nantes ; Nantes Infos",
    "coordinates": [
      -1.54908,
      47.21503
    ],
    "sectorId": "miroir-deau"
  },
  {
    "id": "EVT-09",
    "dateIso": "2026-10-06",
    "dateFormatted": "6 oct. 2026",
    "year": 2026,
    "badgeLabel": "2026 • Cortège Lycéen (18k)",
    "context": "Mobilisation lycéenne pour les moyens et conditions d'étude",
    "locationText": "Nantes, axes scolaires et rues commerçantes du centre-ville",
    "unionCountText": "Cortège autonome massif de lycéens",
    "policeCountText": "Non communiqué",
    "thirdPartyCountText": "Au moins 18 000 selon Nantes Infos (Brest : 8 000, Angers : 7 000, Saint-Nazaire : 1 000)",
    "fdoTactics": "Sécurisation préfectorale renforcée aux abords des lycées et commerces",
    "weaponsUsed": "Dispositif préventif de sécurisation",
    "medicalToll": "Défilé massif sans violences lourdes signalées",
    "judicialToll": "Délégation de manifestants reçue en sous-préfecture à Saint-Nazaire",
    "sources": "Nantes Infos ; Réseau Média Web (Brest Infos, Angers Infos)",
    "coordinates": [
      -1.55785,
      47.21335
    ],
    "sectorId": "place-du-commerce"
  }
];

export const CARNET_2_SECTORS: TacticalSector[] = [
  {
    "id": "miroir-deau",
    "name": "Miroir d'eau (Cours John-Kennedy / Château)",
    "shortName": "Miroir d'Eau",
    "coordinates": [
      -1.54908,
      47.21503
    ],
    "radiusMeters": 105,
    "polygon": [
      [
        [
          -1.55012,
          47.214665
        ],
        [
          -1.549581,
          47.214825
        ],
        [
          -1.548756,
          47.215008
        ],
        [
          -1.54815,
          47.215145
        ],
        [
          -1.547985,
          47.215365
        ],
        [
          -1.54811,
          47.215495
        ],
        [
          -1.548582,
          47.215385
        ],
        [
          -1.549406,
          47.215195
        ],
        [
          -1.549985,
          47.215035
        ],
        [
          -1.550245,
          47.214845
        ],
        [
          -1.55012,
          47.214665
        ]
      ]
    ],
    "riskLevel": "MODÉRÉ",
    "riskScore": 2,
    "tacticalType": "DÉPART & RASSEMBLEMENT",
    "color": "#38bdf8",
    "icon": "⛲",
    "keywords": [
      "Miroir d'eau",
      "Château",
      "Duchesse Anne",
      "Kennedy",
      "St-Pierre",
      "Saint-Pierre"
    ],
    "linkedEvents": [
      "EVT-08"
    ],
    "roleAndLegal": [
      "Point de départ et ralliement récurrent des cortèges déclarés",
      "Espace ouvert de rassemblement syndical et lycéen"
    ],
    "policeDeployment": [
      "Surveillance préventive des abords",
      "Présence des équipes du Renseignement Territorial (SCRT/RT)",
      "Drones de captation aérienne autorisés par arrêté"
    ],
    "weaponsAndRisks": [
      "Risque faible en phase statique initiale",
      "Contrôles et fouilles préventives aux accès"
    ],
    "documentedIncidents": [
      "Tensions lors des départs de « cortèges de tête » non déclarés",
      "Départs de marches intersyndicales massives"
    ],
    "medicalAndLegalSupport": [
      "Présence initiale des équipes de Street Medics",
      "Briefing des services d'ordre syndicaux"
    ],
    "flowAndTransport": [
      "Réseau tramway (Ligne 1) neutralisé en amont",
      "5 000 à 18 000 participants au départ selon les dates"
    ],
    "sources": [
      "Arrêtés préfectoraux (RAA)",
      "Communiqués intersyndicaux (CGT, CFDT)",
      "Presse locale (actu Nantes, Tribune Nantaise)"
    ]
  },
  {
    "id": "cours-50-otages",
    "name": "Cours des 50-Otages (Axe central Nord-Sud)",
    "shortName": "50-Otages",
    "coordinates": [
      -1.55685,
      47.21683
    ],
    "radiusMeters": 160,
    "polygon": [
      [
        [
          -1.554777,
          47.219962
        ],
        [
          -1.554902,
          47.21991
        ],
        [
          -1.555033,
          47.219866
        ],
        [
          -1.555167,
          47.219821
        ],
        [
          -1.555258,
          47.219788
        ],
        [
          -1.555347,
          47.219745
        ],
        [
          -1.555475,
          47.219665
        ],
        [
          -1.555591,
          47.219591
        ],
        [
          -1.555732,
          47.219502
        ],
        [
          -1.556013,
          47.219324
        ],
        [
          -1.556143,
          47.219234
        ],
        [
          -1.556241,
          47.219166
        ],
        [
          -1.556562,
          47.218947
        ],
        [
          -1.556581,
          47.218937
        ],
        [
          -1.556629,
          47.218894
        ],
        [
          -1.556673,
          47.21885
        ],
        [
          -1.556734,
          47.218784
        ],
        [
          -1.556777,
          47.218739
        ],
        [
          -1.55683,
          47.218666
        ],
        [
          -1.556873,
          47.2186
        ],
        [
          -1.556898,
          47.218558
        ],
        [
          -1.556926,
          47.218489
        ],
        [
          -1.556952,
          47.218416
        ],
        [
          -1.556965,
          47.218366
        ],
        [
          -1.556977,
          47.218319
        ],
        [
          -1.556981,
          47.218281
        ],
        [
          -1.556986,
          47.218229
        ],
        [
          -1.556982,
          47.218126
        ],
        [
          -1.556977,
          47.218011
        ],
        [
          -1.55697,
          47.217914
        ],
        [
          -1.556969,
          47.217907
        ],
        [
          -1.556967,
          47.217893
        ],
        [
          -1.556967,
          47.217886
        ],
        [
          -1.556941,
          47.217815
        ],
        [
          -1.557043,
          47.216996
        ],
        [
          -1.557099,
          47.217054
        ],
        [
          -1.556427,
          47.216121
        ],
        [
          -1.556396,
          47.21605
        ],
        [
          -1.556378,
          47.216
        ],
        [
          -1.556348,
          47.215934
        ],
        [
          -1.556274,
          47.215769
        ],
        [
          -1.55608,
          47.215289
        ],
        [
          -1.556056,
          47.215223
        ],
        [
          -1.556004,
          47.215121
        ],
        [
          -1.555979,
          47.215082
        ],
        [
          -1.555972,
          47.215072
        ],
        [
          -1.555841,
          47.214916
        ],
        [
          -1.55573,
          47.214794
        ],
        [
          -1.555575,
          47.214608
        ],
        [
          -1.55527,
          47.213991
        ],
        [
          -1.555207,
          47.213923
        ],
        [
          -1.555184,
          47.213898
        ],
        [
          -1.555144,
          47.213852
        ],
        [
          -1.555117,
          47.213821
        ],
        [
          -1.555106,
          47.213809
        ],
        [
          -1.554902,
          47.213575
        ],
        [
          -1.555221,
          47.213447
        ],
        [
          -1.555425,
          47.21368
        ],
        [
          -1.555435,
          47.213693
        ],
        [
          -1.555462,
          47.213723
        ],
        [
          -1.555502,
          47.213769
        ],
        [
          -1.555524,
          47.213794
        ],
        [
          -1.555618,
          47.213904
        ],
        [
          -1.555921,
          47.214517
        ],
        [
          -1.556049,
          47.214666
        ],
        [
          -1.55616,
          47.214789
        ],
        [
          -1.556294,
          47.214949
        ],
        [
          -1.556317,
          47.214979
        ],
        [
          -1.556351,
          47.215033
        ],
        [
          -1.55641,
          47.215149
        ],
        [
          -1.556437,
          47.215223
        ],
        [
          -1.55663,
          47.215701
        ],
        [
          -1.556702,
          47.21586
        ],
        [
          -1.556735,
          47.215933
        ],
        [
          -1.556755,
          47.215988
        ],
        [
          -1.556761,
          47.216013
        ],
        [
          -1.557436,
          47.21695
        ],
        [
          -1.557411,
          47.217025
        ],
        [
          -1.55731,
          47.217832
        ],
        [
          -1.557318,
          47.217807
        ],
        [
          -1.557334,
          47.217857
        ],
        [
          -1.557338,
          47.217888
        ],
        [
          -1.557339,
          47.2179
        ],
        [
          -1.557347,
          47.218001
        ],
        [
          -1.557352,
          47.218119
        ],
        [
          -1.557356,
          47.218231
        ],
        [
          -1.557351,
          47.218297
        ],
        [
          -1.557345,
          47.218351
        ],
        [
          -1.55733,
          47.218411
        ],
        [
          -1.557314,
          47.218469
        ],
        [
          -1.557284,
          47.218552
        ],
        [
          -1.55725,
          47.218635
        ],
        [
          -1.557215,
          47.218698
        ],
        [
          -1.557165,
          47.218774
        ],
        [
          -1.5571,
          47.218861
        ],
        [
          -1.557046,
          47.218919
        ],
        [
          -1.556983,
          47.218986
        ],
        [
          -1.55693,
          47.21904
        ],
        [
          -1.556863,
          47.2191
        ],
        [
          -1.556823,
          47.219126
        ],
        [
          -1.556504,
          47.219343
        ],
        [
          -1.556407,
          47.219411
        ],
        [
          -1.556269,
          47.219505
        ],
        [
          -1.555984,
          47.219686
        ],
        [
          -1.555844,
          47.219775
        ],
        [
          -1.555726,
          47.21985
        ],
        [
          -1.555583,
          47.219939
        ],
        [
          -1.555455,
          47.220001
        ],
        [
          -1.555336,
          47.220045
        ],
        [
          -1.555196,
          47.220092
        ],
        [
          -1.555081,
          47.22013
        ],
        [
          -1.55497,
          47.220176
        ],
        [
          -1.554777,
          47.219962
        ]
      ]
    ],
    "riskLevel": "ÉLEVÉ",
    "riskScore": 4,
    "tacticalType": "AXE CENTRAL & FILTRAGES",
    "color": "#f59e0b",
    "icon": "🛣️",
    "keywords": [
      "50 Otages",
      "50-Otages",
      "Cirque"
    ],
    "linkedEvents": [
      "EVT-01",
      "EVT-02",
      "EVT-04",
      "EVT-06",
      "EVT-07"
    ],
    "roleAndLegal": [
      "Axe central du parcours déclaré syndical",
      "Voie de défilement large sous contrôle"
    ],
    "policeDeployment": [
      "Barrages de barrage-filtrage aux intersections",
      "Escadrons de gendarmerie mobile (EGM) et CRS",
      "Positionnement sur points hauts pour comptage"
    ],
    "weaponsAndRisks": [
      "Salves de grenades lacrymogènes (Cougar)",
      "Tirs de LBD 40 en cas de scission de cortège",
      "Canons à eau"
    ],
    "documentedIncidents": [
      "Mort de Jean Rigollet à l'été 1955 (tir policier)",
      "Scissions répétées entre cortège de tête et carré syndical"
    ],
    "medicalAndLegalSupport": [
      "Évacuation difficile vers les rues adjacentes lors des tirs de gaz",
      "Soins d'urgence pour asphyxie et projections"
    ],
    "flowAndTransport": [
      "Paralysie totale de la Ligne 2 et des bus Naolib",
      "Calcul de jauge sur voie resserrée"
    ],
    "sources": [
      "Patrimonia Nantes (Jean-Pierre Le Crom)",
      "Question écrite AN n° 15519",
      "Base Allô Place Beauvau"
    ]
  },
  {
    "id": "place-du-commerce",
    "name": "Place du Commerce / Allées Brancas",
    "shortName": "Commerce",
    "coordinates": [
      -1.55812,
      47.2133
    ],
    "radiusMeters": 95,
    "polygon": [
      [
        [
          -1.558533,
          47.213152
        ],
        [
          -1.558486,
          47.21313
        ],
        [
          -1.558461,
          47.213117
        ],
        [
          -1.558459,
          47.213119
        ],
        [
          -1.558361,
          47.213071
        ],
        [
          -1.558352,
          47.213078
        ],
        [
          -1.558345,
          47.213074
        ],
        [
          -1.55833,
          47.213088
        ],
        [
          -1.558221,
          47.213034
        ],
        [
          -1.558235,
          47.21302
        ],
        [
          -1.558227,
          47.213016
        ],
        [
          -1.558234,
          47.213009
        ],
        [
          -1.558138,
          47.212961
        ],
        [
          -1.55814,
          47.212959
        ],
        [
          -1.558098,
          47.212937
        ],
        [
          -1.558028,
          47.213001
        ],
        [
          -1.557923,
          47.213069
        ],
        [
          -1.557564,
          47.213234
        ],
        [
          -1.55746,
          47.2133
        ],
        [
          -1.557369,
          47.213393
        ],
        [
          -1.557406,
          47.213419
        ],
        [
          -1.557421,
          47.213431
        ],
        [
          -1.557446,
          47.213416
        ],
        [
          -1.557492,
          47.213451
        ],
        [
          -1.557467,
          47.213466
        ],
        [
          -1.557476,
          47.213472
        ],
        [
          -1.557501,
          47.213457
        ],
        [
          -1.557549,
          47.213493
        ],
        [
          -1.557523,
          47.213509
        ],
        [
          -1.557533,
          47.213516
        ],
        [
          -1.557558,
          47.213501
        ],
        [
          -1.557606,
          47.213538
        ],
        [
          -1.557582,
          47.213553
        ],
        [
          -1.557586,
          47.213556
        ],
        [
          -1.557591,
          47.21356
        ],
        [
          -1.55764,
          47.213597
        ],
        [
          -1.557648,
          47.213603
        ],
        [
          -1.557696,
          47.21364
        ],
        [
          -1.557719,
          47.213657
        ],
        [
          -1.557754,
          47.213683
        ],
        [
          -1.557758,
          47.213687
        ],
        [
          -1.557814,
          47.213729
        ],
        [
          -1.557928,
          47.213663
        ],
        [
          -1.557959,
          47.213645
        ],
        [
          -1.558016,
          47.213612
        ],
        [
          -1.558021,
          47.213606
        ],
        [
          -1.558044,
          47.213598
        ],
        [
          -1.55804,
          47.213593
        ],
        [
          -1.558044,
          47.213589
        ],
        [
          -1.558031,
          47.213582
        ],
        [
          -1.558023,
          47.213578
        ],
        [
          -1.558022,
          47.213572
        ],
        [
          -1.558038,
          47.21356
        ],
        [
          -1.558047,
          47.213559
        ],
        [
          -1.558066,
          47.213571
        ],
        [
          -1.558079,
          47.21356
        ],
        [
          -1.558088,
          47.213552
        ],
        [
          -1.558081,
          47.213549
        ],
        [
          -1.558078,
          47.21355
        ],
        [
          -1.558065,
          47.213542
        ],
        [
          -1.558078,
          47.213532
        ],
        [
          -1.55805,
          47.213517
        ],
        [
          -1.558096,
          47.213473
        ],
        [
          -1.558148,
          47.213422
        ],
        [
          -1.558173,
          47.213437
        ],
        [
          -1.558188,
          47.213425
        ],
        [
          -1.55825,
          47.213376
        ],
        [
          -1.55833,
          47.213312
        ],
        [
          -1.558403,
          47.213252
        ],
        [
          -1.558382,
          47.21324
        ],
        [
          -1.558457,
          47.213183
        ],
        [
          -1.558477,
          47.213195
        ],
        [
          -1.558533,
          47.213152
        ]
      ]
    ],
    "riskLevel": "CRITIQUE",
    "riskScore": 5,
    "tacticalType": "GOULOT & RISQUE NASSE",
    "color": "#ef4444",
    "icon": "⚠️",
    "keywords": [
      "Commerce",
      "Feydeau",
      "Gloriette",
      "Bourse"
    ],
    "linkedEvents": [
      "EVT-04",
      "EVT-09"
    ],
    "roleAndLegal": [
      "Carrefour névralgique",
      "Très fréquemment inclus dans les périmètres d'interdiction par arrêté"
    ],
    "policeDeployment": [
      "Déploiement massif de CRS et d'unités mobiles",
      "Nasses et manœuvres d'encerclement tactique",
      "Fermeture des accès piétons et galeries"
    ],
    "weaponsAndRisks": [
      "Saturation d'espace clos par gaz lacrymogènes",
      "Grenades de désencerclement (DMP, GM2L)",
      "Charges de dispersion"
    ],
    "documentedIncidents": [
      "Multiples signalements de tirs tendus de LBD",
      "Échauffourées récurrentes et affrontements en fin de cortège",
      "Dégradations de mobilier urbain"
    ],
    "medicalAndLegalSupport": [
      "Postes de secours improvisés dans les commerces ouverts",
      "Permanence juridique du Barreau / SAF en alerte"
    ],
    "flowAndTransport": [
      "Nœud central Naolib totalement bloqué (L1, L2, L3)",
      "Comptages policiers contestés lors des dispersions"
    ],
    "sources": [
      "Recueils RAA Préfecture 44",
      "Archives vidéo des dispersions",
      "Collectif Désarmons-les !"
    ]
  },
  {
    "id": "royale-graslin",
    "name": "Place Royale / Quartier Graslin",
    "shortName": "Royale / Graslin",
    "coordinates": [
      -1.55848,
      47.21448
    ],
    "radiusMeters": 115,
    "polygon": [
      [
        [
          -1.558909,
          47.214253
        ],
        [
          -1.558878,
          47.214228
        ],
        [
          -1.558847,
          47.214206
        ],
        [
          -1.558803,
          47.214182
        ],
        [
          -1.558785,
          47.214174
        ],
        [
          -1.55877,
          47.214169
        ],
        [
          -1.558709,
          47.214155
        ],
        [
          -1.558651,
          47.214147
        ],
        [
          -1.558593,
          47.214139
        ],
        [
          -1.558553,
          47.214137
        ],
        [
          -1.558513,
          47.214138
        ],
        [
          -1.558457,
          47.214146
        ],
        [
          -1.558405,
          47.214145
        ],
        [
          -1.558354,
          47.214143
        ],
        [
          -1.558149,
          47.21421
        ],
        [
          -1.557911,
          47.214288
        ],
        [
          -1.557859,
          47.214321
        ],
        [
          -1.557808,
          47.214354
        ],
        [
          -1.557841,
          47.214393
        ],
        [
          -1.557875,
          47.214432
        ],
        [
          -1.55794,
          47.214526
        ],
        [
          -1.557994,
          47.214508
        ],
        [
          -1.55808,
          47.214624
        ],
        [
          -1.558025,
          47.214642
        ],
        [
          -1.558028,
          47.214646
        ],
        [
          -1.558063,
          47.214694
        ],
        [
          -1.558066,
          47.214693
        ],
        [
          -1.558134,
          47.214784
        ],
        [
          -1.558164,
          47.214824
        ],
        [
          -1.558194,
          47.214865
        ],
        [
          -1.55826,
          47.214854
        ],
        [
          -1.558326,
          47.214844
        ],
        [
          -1.558494,
          47.214787
        ],
        [
          -1.558604,
          47.21475
        ],
        [
          -1.558772,
          47.214694
        ],
        [
          -1.5588,
          47.214666
        ],
        [
          -1.558829,
          47.214638
        ],
        [
          -1.558879,
          47.214603
        ],
        [
          -1.558893,
          47.21459
        ],
        [
          -1.558923,
          47.214556
        ],
        [
          -1.558945,
          47.214523
        ],
        [
          -1.558967,
          47.214491
        ],
        [
          -1.558977,
          47.21445
        ],
        [
          -1.55898,
          47.214418
        ],
        [
          -1.558979,
          47.214388
        ],
        [
          -1.558974,
          47.214359
        ],
        [
          -1.558962,
          47.214329
        ],
        [
          -1.559155,
          47.21427
        ],
        [
          -1.559286,
          47.214225
        ],
        [
          -1.559345,
          47.214204
        ],
        [
          -1.559659,
          47.214097
        ],
        [
          -1.560332,
          47.213868
        ],
        [
          -1.56039,
          47.213848
        ],
        [
          -1.560457,
          47.213825
        ],
        [
          -1.561052,
          47.213622
        ],
        [
          -1.5611,
          47.213606
        ],
        [
          -1.561173,
          47.213581
        ],
        [
          -1.561227,
          47.213562
        ],
        [
          -1.561515,
          47.213464
        ],
        [
          -1.561778,
          47.213366
        ],
        [
          -1.561914,
          47.213367
        ],
        [
          -1.561949,
          47.213368
        ],
        [
          -1.562019,
          47.213369
        ],
        [
          -1.562024,
          47.213369
        ],
        [
          -1.562025,
          47.213354
        ],
        [
          -1.562025,
          47.213328
        ],
        [
          -1.562076,
          47.213329
        ],
        [
          -1.562078,
          47.213293
        ],
        [
          -1.562227,
          47.213295
        ],
        [
          -1.562388,
          47.213298
        ],
        [
          -1.562387,
          47.213333
        ],
        [
          -1.56244,
          47.213333
        ],
        [
          -1.562439,
          47.213361
        ],
        [
          -1.562439,
          47.213375
        ],
        [
          -1.562442,
          47.213375
        ],
        [
          -1.562492,
          47.213376
        ],
        [
          -1.562546,
          47.213377
        ],
        [
          -1.562576,
          47.213377
        ],
        [
          -1.562684,
          47.213379
        ],
        [
          -1.562689,
          47.213381
        ],
        [
          -1.56269,
          47.213336
        ],
        [
          -1.562694,
          47.213005
        ],
        [
          -1.562695,
          47.212957
        ],
        [
          -1.562562,
          47.212958
        ],
        [
          -1.562552,
          47.212928
        ],
        [
          -1.562548,
          47.212916
        ],
        [
          -1.562546,
          47.212913
        ],
        [
          -1.562544,
          47.21291
        ],
        [
          -1.562542,
          47.212907
        ],
        [
          -1.562538,
          47.212902
        ],
        [
          -1.562531,
          47.212894
        ],
        [
          -1.562525,
          47.212887
        ],
        [
          -1.562502,
          47.212861
        ],
        [
          -1.562482,
          47.212845
        ],
        [
          -1.562472,
          47.212837
        ],
        [
          -1.562462,
          47.212829
        ],
        [
          -1.562455,
          47.212824
        ],
        [
          -1.562448,
          47.21282
        ],
        [
          -1.562433,
          47.212813
        ],
        [
          -1.562425,
          47.212809
        ],
        [
          -1.562411,
          47.212803
        ],
        [
          -1.562397,
          47.212797
        ],
        [
          -1.562388,
          47.212793
        ],
        [
          -1.562381,
          47.212791
        ],
        [
          -1.562372,
          47.212788
        ],
        [
          -1.562368,
          47.212787
        ],
        [
          -1.562366,
          47.212787
        ],
        [
          -1.562364,
          47.212786
        ],
        [
          -1.56236,
          47.212786
        ],
        [
          -1.562346,
          47.212785
        ],
        [
          -1.562339,
          47.212784
        ],
        [
          -1.562337,
          47.212784
        ],
        [
          -1.562334,
          47.212784
        ],
        [
          -1.562331,
          47.212783
        ],
        [
          -1.56233,
          47.212783
        ],
        [
          -1.562328,
          47.212782
        ],
        [
          -1.562327,
          47.212781
        ],
        [
          -1.562327,
          47.212781
        ],
        [
          -1.562326,
          47.21278
        ],
        [
          -1.562326,
          47.212779
        ],
        [
          -1.562325,
          47.212779
        ],
        [
          -1.562251,
          47.212777
        ],
        [
          -1.562186,
          47.212775
        ],
        [
          -1.562141,
          47.212783
        ],
        [
          -1.56211,
          47.212793
        ],
        [
          -1.562094,
          47.212798
        ],
        [
          -1.562078,
          47.212803
        ],
        [
          -1.562077,
          47.212803
        ],
        [
          -1.562073,
          47.212805
        ],
        [
          -1.562067,
          47.212809
        ],
        [
          -1.562055,
          47.212815
        ],
        [
          -1.562032,
          47.212828
        ],
        [
          -1.562019,
          47.212838
        ],
        [
          -1.56201,
          47.212846
        ],
        [
          -1.562004,
          47.212849
        ],
        [
          -1.562003,
          47.212851
        ],
        [
          -1.562,
          47.212854
        ],
        [
          -1.561991,
          47.212862
        ],
        [
          -1.561973,
          47.212879
        ],
        [
          -1.561961,
          47.212894
        ],
        [
          -1.561955,
          47.212902
        ],
        [
          -1.561949,
          47.212909
        ],
        [
          -1.561941,
          47.212931
        ],
        [
          -1.561932,
          47.212953
        ],
        [
          -1.561861,
          47.212952
        ],
        [
          -1.561791,
          47.212951
        ],
        [
          -1.56179,
          47.212995
        ],
        [
          -1.561789,
          47.213046
        ],
        [
          -1.561788,
          47.213082
        ],
        [
          -1.561791,
          47.213083
        ],
        [
          -1.561789,
          47.213143
        ],
        [
          -1.561783,
          47.213236
        ],
        [
          -1.56178,
          47.213236
        ],
        [
          -1.561779,
          47.213256
        ],
        [
          -1.561778,
          47.213273
        ],
        [
          -1.561449,
          47.213376
        ],
        [
          -1.561162,
          47.213474
        ],
        [
          -1.561108,
          47.213492
        ],
        [
          -1.561034,
          47.213517
        ],
        [
          -1.560986,
          47.213534
        ],
        [
          -1.560392,
          47.213736
        ],
        [
          -1.560324,
          47.21376
        ],
        [
          -1.560267,
          47.21378
        ],
        [
          -1.559594,
          47.214009
        ],
        [
          -1.559279,
          47.214115
        ],
        [
          -1.559219,
          47.214137
        ],
        [
          -1.559089,
          47.214182
        ],
        [
          -1.558909,
          47.214253
        ]
      ]
    ],
    "riskLevel": "CRITIQUE",
    "riskScore": 5,
    "tacticalType": "ZONE ROUGE RAA (RUELLES)",
    "color": "#f43f5e",
    "icon": "🚫",
    "keywords": [
      "Place Royale",
      "Royale",
      "Graslin",
      "Crébillon"
    ],
    "linkedEvents": [
      "EVT-04"
    ],
    "roleAndLegal": [
      "Ruelles commerçantes étroites",
      "Zone rouge systématique dans les arrêtés d'interdiction préfectoraux"
    ],
    "policeDeployment": [
      "Verrouillage des débouchés par cordons fixes de CRS",
      "Emploi de la BAC pour interpellations ciblées",
      "Nasses sans issue d'évacuation immédiate"
    ],
    "weaponsAndRisks": [
      "Grenades assourdissantes et GM2L",
      "Tirs de balles en caoutchouc (Flash-Ball / LBD)",
      "Gaz lacrymogènes concentrés"
    ],
    "documentedIncidents": [
      "Traumatismes crâniens et contusions sévères",
      "Pratiques de nasses contestées devant le Conseil d'État",
      "Affrontements de proximité"
    ],
    "medicalAndLegalSupport": [
      "Interventions des Street Medics sous tirs de projectiles",
      "Signalements au Défenseur des droits"
    ],
    "flowAndTransport": [
      "Déviation forcée du flux de manifestants vers les quais",
      "Impossibilité de comptage par capteurs vidéo"
    ],
    "sources": [
      "Avis et rapports du Défenseur des droits",
      "Rapports d'Amnesty International et LDH",
      "Nantes Révoltée / Contre-Attaque"
    ]
  },
  {
    "id": "prefecture-ceineray",
    "name": "Préfecture de Loire-Atlantique / Quai Ceineray",
    "shortName": "Préfecture",
    "coordinates": [
      -1.55325,
      47.22028
    ],
    "radiusMeters": 105,
    "polygon": [
      [
        [
          -1.554207,
          47.220026
        ],
        [
          -1.554035,
          47.21985
        ],
        [
          -1.553893,
          47.219912
        ],
        [
          -1.553882,
          47.219897
        ],
        [
          -1.553303,
          47.220112
        ],
        [
          -1.55318,
          47.220157
        ],
        [
          -1.553154,
          47.220162
        ],
        [
          -1.553154,
          47.220162
        ],
        [
          -1.553122,
          47.220132
        ],
        [
          -1.553091,
          47.220103
        ],
        [
          -1.553085,
          47.220097
        ],
        [
          -1.552958,
          47.219969
        ],
        [
          -1.552837,
          47.21985
        ],
        [
          -1.552827,
          47.219848
        ],
        [
          -1.552795,
          47.219842
        ],
        [
          -1.55274,
          47.219832
        ],
        [
          -1.552482,
          47.21995
        ],
        [
          -1.552464,
          47.219958
        ],
        [
          -1.552404,
          47.219985
        ],
        [
          -1.552337,
          47.220016
        ],
        [
          -1.552326,
          47.220021
        ],
        [
          -1.552068,
          47.220139
        ],
        [
          -1.55205,
          47.220181
        ],
        [
          -1.552041,
          47.220203
        ],
        [
          -1.552148,
          47.220309
        ],
        [
          -1.552307,
          47.220467
        ],
        [
          -1.552339,
          47.220497
        ],
        [
          -1.552368,
          47.220523
        ],
        [
          -1.552544,
          47.220706
        ],
        [
          -1.552584,
          47.220689
        ],
        [
          -1.552717,
          47.220823
        ],
        [
          -1.552973,
          47.220706
        ],
        [
          -1.552993,
          47.220726
        ],
        [
          -1.55317,
          47.220645
        ],
        [
          -1.553151,
          47.220626
        ],
        [
          -1.553321,
          47.220552
        ],
        [
          -1.553425,
          47.220508
        ],
        [
          -1.55348,
          47.220482
        ],
        [
          -1.553607,
          47.220425
        ],
        [
          -1.553644,
          47.220408
        ],
        [
          -1.554169,
          47.220181
        ],
        [
          -1.554086,
          47.220095
        ],
        [
          -1.554079,
          47.220088
        ],
        [
          -1.554122,
          47.220067
        ],
        [
          -1.554149,
          47.220054
        ],
        [
          -1.554165,
          47.220046
        ],
        [
          -1.554171,
          47.220043
        ],
        [
          -1.554207,
          47.220026
        ]
      ]
    ],
    "riskLevel": "CRITIQUE",
    "riskScore": 5,
    "tacticalType": "ARRIVÉE & BARRAGE LOURD",
    "color": "#ef4444",
    "icon": "🏛️",
    "keywords": [
      "Préfecture",
      "Ceineray",
      "Foch",
      "St-André"
    ],
    "linkedEvents": [
      "EVT-04"
    ],
    "roleAndLegal": [
      "Point d'arrivée institutionnel du tracé officiel déposé",
      "Siège de l'autorité préfectorale"
    ],
    "policeDeployment": [
      "Dispositif statique lourd (grilles anti-émeute, camions d'intervention)",
      "Présence conjointe DIPN 44, CRS et gendarmerie"
    ],
    "weaponsAndRisks": [
      "Lances à eau haute pression",
      "Tirs de barrage lacrymogène",
      "Projectiles cinétiques à distance"
    ],
    "documentedIncidents": [
      "22 février 2014 (manif anti-NDDL) : blessures oculaires graves et manifestants éborgnés au LBD",
      "Heurts réguliers en fin de rassemblement"
    ],
    "medicalAndLegalSupport": [
      "Évacuations d'urgence directes vers le CHU (axe quais)",
      "Recensement des armes tirées (douilles, bagues GM2L)"
    ],
    "flowAndTransport": [
      "Fin officielle de la manifestation syndicale",
      "Comparaison des bilans de participation (RT vs organisateurs)"
    ],
    "sources": [
      "Dossiers judiciaires de l'Assemblée des blessés",
      "Bilans officiels de la Préfecture 44",
      "Enquêtes IGPN"
    ]
  },
  {
    "id": "rectorat-est",
    "name": "Rectorat / Quartiers Est",
    "shortName": "Rectorat",
    "coordinates": [
      -1.55205,
      47.24059
    ],
    "radiusMeters": 110,
    "polygon": [
      [
        [
          -1.552863,
          47.240738
        ],
        [
          -1.552825,
          47.24069
        ],
        [
          -1.552758,
          47.240604
        ],
        [
          -1.552742,
          47.240585
        ],
        [
          -1.552554,
          47.240657
        ],
        [
          -1.552523,
          47.240619
        ],
        [
          -1.552394,
          47.240669
        ],
        [
          -1.552403,
          47.240681
        ],
        [
          -1.552263,
          47.240735
        ],
        [
          -1.552242,
          47.240708
        ],
        [
          -1.552321,
          47.240679
        ],
        [
          -1.552206,
          47.240538
        ],
        [
          -1.552254,
          47.240521
        ],
        [
          -1.552161,
          47.240406
        ],
        [
          -1.552081,
          47.240437
        ],
        [
          -1.551952,
          47.240277
        ],
        [
          -1.551931,
          47.240286
        ],
        [
          -1.55194,
          47.240297
        ],
        [
          -1.551796,
          47.240353
        ],
        [
          -1.551957,
          47.240554
        ],
        [
          -1.551651,
          47.24067
        ],
        [
          -1.551721,
          47.240759
        ],
        [
          -1.551851,
          47.24071
        ],
        [
          -1.551831,
          47.240686
        ],
        [
          -1.551953,
          47.240639
        ],
        [
          -1.552,
          47.240699
        ],
        [
          -1.552066,
          47.240675
        ],
        [
          -1.552114,
          47.240736
        ],
        [
          -1.552126,
          47.240732
        ],
        [
          -1.552141,
          47.240752
        ],
        [
          -1.552067,
          47.24078
        ],
        [
          -1.552118,
          47.240844
        ],
        [
          -1.552199,
          47.240812
        ],
        [
          -1.552266,
          47.240894
        ],
        [
          -1.552388,
          47.240847
        ],
        [
          -1.55236,
          47.240809
        ],
        [
          -1.552461,
          47.24077
        ],
        [
          -1.552535,
          47.240863
        ],
        [
          -1.552554,
          47.240856
        ],
        [
          -1.552678,
          47.240808
        ],
        [
          -1.552863,
          47.240738
        ]
      ]
    ],
    "riskLevel": "ÉLEVÉ",
    "riskScore": 4,
    "tacticalType": "SECTEUR ÉDUCATIF",
    "color": "#a855f7",
    "icon": "🎓",
    "keywords": [
      "Rectorat",
      "Lycée",
      "Michelet"
    ],
    "linkedEvents": [
      "EVT-03"
    ],
    "roleAndLegal": [
      "Secteur ciblé lors des mobilisations éducatives et lycéennes"
    ],
    "policeDeployment": [
      "Unités territoriales de police et CDI / BAC",
      "Contrôles d'accès des abords"
    ],
    "weaponsAndRisks": [
      "Flash-Ball / LBD 40",
      "Grenades lacrymogènes de dispersion"
    ],
    "documentedIncidents": [
      "27 novembre 2007 : Pierre Douillard-Lefevre (lycéen de 16 ans) éborgné par un tir de Flash-Ball"
    ],
    "medicalAndLegalSupport": [
      "Prise en charge ophtalmologique d'urgence",
      "Suivi par le comité de soutien aux blessés"
    ],
    "flowAndTransport": [
      "Cortèges spontanés ou non déclarés en semaine",
      "Comptages parcellaires"
    ],
    "sources": [
      "Jurisprudence administrative et pénale",
      "Enquêtes de presse (Mediapart, Presse Océan)",
      "Désarmons-les !"
    ]
  },
  {
    "id": "police-waldeck-rousseau",
    "name": "Hôtel de Police Waldeck-Rousseau",
    "shortName": "Hôtel de Police",
    "coordinates": [
      -1.55232,
      47.22753
    ],
    "radiusMeters": 100,
    "polygon": [
      [
        [
          -1.552276,
          47.227067
        ],
        [
          -1.552206,
          47.22699
        ],
        [
          -1.552201,
          47.226998
        ],
        [
          -1.552176,
          47.226981
        ],
        [
          -1.552182,
          47.226974
        ],
        [
          -1.552134,
          47.226923
        ],
        [
          -1.552021,
          47.227008
        ],
        [
          -1.551799,
          47.227179
        ],
        [
          -1.551757,
          47.227212
        ],
        [
          -1.551515,
          47.227399
        ],
        [
          -1.551438,
          47.227352
        ],
        [
          -1.551459,
          47.227336
        ],
        [
          -1.5515,
          47.227304
        ],
        [
          -1.551719,
          47.227133
        ],
        [
          -1.55146,
          47.226979
        ],
        [
          -1.55124,
          47.227151
        ],
        [
          -1.551378,
          47.227232
        ],
        [
          -1.551337,
          47.227264
        ],
        [
          -1.5512,
          47.227184
        ],
        [
          -1.550851,
          47.227457
        ],
        [
          -1.550979,
          47.227533
        ],
        [
          -1.551111,
          47.22761
        ],
        [
          -1.551068,
          47.227644
        ],
        [
          -1.551102,
          47.227665
        ],
        [
          -1.551152,
          47.227685
        ],
        [
          -1.550907,
          47.227878
        ],
        [
          -1.55085,
          47.227925
        ],
        [
          -1.550759,
          47.227994
        ],
        [
          -1.551035,
          47.228023
        ],
        [
          -1.551046,
          47.228015
        ],
        [
          -1.551064,
          47.228027
        ],
        [
          -1.551102,
          47.227992
        ],
        [
          -1.551239,
          47.227889
        ],
        [
          -1.551219,
          47.227877
        ],
        [
          -1.551385,
          47.227746
        ],
        [
          -1.551411,
          47.227726
        ],
        [
          -1.55143,
          47.227737
        ],
        [
          -1.551685,
          47.227536
        ],
        [
          -1.551692,
          47.227531
        ],
        [
          -1.551673,
          47.227519
        ],
        [
          -1.551692,
          47.227504
        ],
        [
          -1.551712,
          47.227516
        ],
        [
          -1.551965,
          47.227316
        ],
        [
          -1.551973,
          47.227309
        ],
        [
          -1.551954,
          47.227298
        ],
        [
          -1.551973,
          47.227283
        ],
        [
          -1.551993,
          47.227294
        ],
        [
          -1.5522,
          47.22712
        ],
        [
          -1.552276,
          47.227067
        ]
      ]
    ],
    "riskLevel": "SENSIBLE",
    "riskScore": 3,
    "tacticalType": "COMMANDEMENT & GAV",
    "color": "#6366f1",
    "icon": "🚓",
    "keywords": [
      "Waldeck-Rousseau",
      "Police"
    ],
    "linkedEvents": [
      "EVT-04"
    ],
    "roleAndLegal": [
      "Cœur du commandement opérationnel de la DIPN 44",
      "Lieu central de garde à vue"
    ],
    "policeDeployment": [
      "Protection périmétrique renforcée",
      "Cellule de commandement du directeur du service d'ordre"
    ],
    "weaponsAndRisks": [
      "Moyens de rétention, armement défensif statique"
    ],
    "documentedIncidents": [
      "Rassemblements spontanés de soutien aux interpellés",
      "Traitement des procédures de comparution immédiate"
    ],
    "medicalAndLegalSupport": [
      "Interventions des avocats du SAF et de la permanence pénale",
      "Suivi des gardes à vue par les caisses de solidarité"
    ],
    "flowAndTransport": [
      "Comptabilisation administrative du bilan judiciaire (gardes à vue, interpellations)"
    ],
    "sources": [
      "Bilans du Parquet de Nantes",
      "Communiqués des syndicats de police (Alliance, SGP-FO, UNSA)"
    ]
  },
  {
    "id": "chu-hotel-dieu",
    "name": "CHU de Nantes (Hôtel-Dieu)",
    "shortName": "CHU Hôtel-Dieu",
    "coordinates": [
      -1.55425,
      47.21165
    ],
    "radiusMeters": 105,
    "polygon": [
      [
        [
          -1.556441,
          47.211535
        ],
        [
          -1.556439,
          47.211526
        ],
        [
          -1.556434,
          47.211512
        ],
        [
          -1.556422,
          47.211488
        ],
        [
          -1.556412,
          47.211476
        ],
        [
          -1.556405,
          47.211469
        ],
        [
          -1.556314,
          47.211372
        ],
        [
          -1.556295,
          47.211351
        ],
        [
          -1.55614,
          47.211167
        ],
        [
          -1.555952,
          47.210942
        ],
        [
          -1.555936,
          47.210927
        ],
        [
          -1.555887,
          47.210882
        ],
        [
          -1.555706,
          47.210628
        ],
        [
          -1.555689,
          47.210605
        ],
        [
          -1.555686,
          47.21059
        ],
        [
          -1.555679,
          47.210562
        ],
        [
          -1.555651,
          47.210451
        ],
        [
          -1.555643,
          47.210416
        ],
        [
          -1.555616,
          47.210268
        ],
        [
          -1.555508,
          47.209794
        ],
        [
          -1.555457,
          47.209564
        ],
        [
          -1.555439,
          47.20955
        ],
        [
          -1.555135,
          47.20934
        ],
        [
          -1.555009,
          47.209327
        ],
        [
          -1.554655,
          47.209288
        ],
        [
          -1.554603,
          47.209282
        ],
        [
          -1.55455,
          47.209276
        ],
        [
          -1.554385,
          47.209257
        ],
        [
          -1.550559,
          47.20882
        ],
        [
          -1.550355,
          47.208922
        ],
        [
          -1.550406,
          47.208971
        ],
        [
          -1.550361,
          47.208995
        ],
        [
          -1.550561,
          47.209187
        ],
        [
          -1.550714,
          47.209332
        ],
        [
          -1.551007,
          47.20961
        ],
        [
          -1.551076,
          47.209676
        ],
        [
          -1.55111,
          47.209708
        ],
        [
          -1.551295,
          47.209872
        ],
        [
          -1.55135,
          47.20992
        ],
        [
          -1.551603,
          47.210142
        ],
        [
          -1.551767,
          47.210288
        ],
        [
          -1.552349,
          47.210805
        ],
        [
          -1.552617,
          47.211041
        ],
        [
          -1.552798,
          47.211199
        ],
        [
          -1.552814,
          47.211212
        ],
        [
          -1.553255,
          47.211608
        ],
        [
          -1.553276,
          47.211611
        ],
        [
          -1.553629,
          47.211925
        ],
        [
          -1.55367,
          47.21193
        ],
        [
          -1.553858,
          47.211951
        ],
        [
          -1.554227,
          47.211992
        ],
        [
          -1.554301,
          47.212
        ],
        [
          -1.554326,
          47.212002
        ],
        [
          -1.554384,
          47.21201
        ],
        [
          -1.554398,
          47.212011
        ],
        [
          -1.554472,
          47.212002
        ],
        [
          -1.554609,
          47.212015
        ],
        [
          -1.554686,
          47.212025
        ],
        [
          -1.554743,
          47.212044
        ],
        [
          -1.554763,
          47.21205
        ],
        [
          -1.554812,
          47.212055
        ],
        [
          -1.555251,
          47.211935
        ],
        [
          -1.555305,
          47.21192
        ],
        [
          -1.555668,
          47.211802
        ],
        [
          -1.556333,
          47.211584
        ],
        [
          -1.556361,
          47.211575
        ],
        [
          -1.556377,
          47.211571
        ],
        [
          -1.556394,
          47.211567
        ],
        [
          -1.556411,
          47.211562
        ],
        [
          -1.55643,
          47.211554
        ],
        [
          -1.556437,
          47.211549
        ],
        [
          -1.55644,
          47.211543
        ],
        [
          -1.556441,
          47.211535
        ]
      ]
    ],
    "riskLevel": "SANCTUAIRE",
    "riskScore": 1,
    "tacticalType": "URGENCES & SOINS",
    "color": "#10b981",
    "icon": "🏥",
    "keywords": [
      "CHU",
      "Hôtel-Dieu",
      "Moncousu"
    ],
    "linkedEvents": [
      "EVT-04",
      "EVT-05"
    ],
    "roleAndLegal": [
      "Pôle hospitalier d'urgence sanitaire à proximité immédiate du tracé"
    ],
    "policeDeployment": [
      "Présence ponctuelle d'officiers de police judiciaire (réquisitions / contrôles)"
    ],
    "weaponsAndRisks": [
      "Sans objet (lieu sanctuarisé de soins)"
    ],
    "documentedIncidents": [
      "Afflux massif de blessés lors des samedis de mobilisation",
      "Traumatismes faciaux, énucléations, plaies balistiques"
    ],
    "medicalAndLegalSupport": [
      "Urgences ophtalmologiques et chirurgie maxillo-faciale",
      "Signalements de contentieux sur le secret médical"
    ],
    "flowAndTransport": [
      "Transmission des données sanitaires anonymisées à l'ARS"
    ],
    "sources": [
      "Données ARS Pays de la Loire",
      "Bilans syndicaux hospitaliers (CGT CHU, SUD Santé)",
      "Revues médicales d'urgence"
    ]
  }
];

export const CARNET_3_PROTESTS: HistoricalProtest[] = [
  {
    "id": "NTE-001",
    "dateIso": "2023-01-19",
    "dateFormatted": "19 janv. 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 1 - Front unitaire initial",
    "route": "Commerce -> 50 Otages -> Préfecture -> Miroir d'eau",
    "policeCount": 25000,
    "unionCount": 42000,
    "absoluteGap": 17000,
    "ratio": 1.68,
    "tensionLevel": "Modérée",
    "sources": "Ouest-France, Presse Océan, CGT 44"
  },
  {
    "id": "NTE-002",
    "dateIso": "2023-01-31",
    "dateFormatted": "31 janv. 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 2 - Amplification du mouvement",
    "route": "Miroir d'eau -> Cours St-Pierre -> 50 Otages -> Commerce",
    "policeCount": 28000,
    "unionCount": 65000,
    "absoluteGap": 37000,
    "ratio": 2.32,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, FSU 44"
  },
  {
    "id": "NTE-003",
    "dateIso": "2023-02-07",
    "dateFormatted": "7 févr. 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 3 - Semaine d'actions ciblées",
    "route": "Miroir d'eau -> Place Bretagne -> 50 Otages",
    "policeCount": 11000,
    "unionCount": 30000,
    "absoluteGap": 19000,
    "ratio": 2.73,
    "tensionLevel": "Faible",
    "sources": "France 3 Pays de la Loire, CGT 44"
  },
  {
    "id": "NTE-004",
    "dateIso": "2023-02-11",
    "dateFormatted": "11 févr. 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 4 - Samedi unitaire familial",
    "route": "Miroir d'eau -> Duchesse Anne -> 50 Otages",
    "policeCount": 25000,
    "unionCount": 60000,
    "absoluteGap": 35000,
    "ratio": 2.4,
    "tensionLevel": "Calme",
    "sources": "Ouest-France, Place Publique"
  },
  {
    "id": "NTE-005",
    "dateIso": "2023-02-16",
    "dateFormatted": "16 févr. 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 5 - Maintien de la pression",
    "route": "Commerce -> Quai de la Fosse -> Gloriette",
    "policeCount": 8000,
    "unionCount": 20000,
    "absoluteGap": 12000,
    "ratio": 2.5,
    "tensionLevel": "Faible",
    "sources": "Presse Océan, France Bleu Loire Océan"
  },
  {
    "id": "NTE-006",
    "dateIso": "2023-03-07",
    "dateFormatted": "7 mars 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 6 - France à l'arrêt",
    "route": "Miroir d'eau -> Préfecture -> 50 Otages -> Gloriette",
    "policeCount": 25000,
    "unionCount": 75000,
    "absoluteGap": 50000,
    "ratio": 3.0,
    "tensionLevel": "Forte",
    "sources": "Intersyndicale 44, Ouest-France"
  },
  {
    "id": "NTE-007",
    "dateIso": "2023-03-11",
    "dateFormatted": "11 mars 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 7 - Samedi de grève et blocages",
    "route": "Miroir d'eau -> Commerce -> Place Bretagne",
    "policeCount": 8500,
    "unionCount": 20000,
    "absoluteGap": 11500,
    "ratio": 2.35,
    "tensionLevel": "Modérée",
    "sources": "France 3, Presse Océan"
  },
  {
    "id": "NTE-008",
    "dateIso": "2023-03-15",
    "dateFormatted": "15 mars 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 8 - Commission Mixte Paritaire",
    "route": "Commerce -> 50 Otages -> Préfecture",
    "policeCount": 15000,
    "unionCount": 40000,
    "absoluteGap": 25000,
    "ratio": 2.67,
    "tensionLevel": "Forte",
    "sources": "Rapport AN n°1824, Mediacités"
  },
  {
    "id": "NTE-009",
    "dateIso": "2023-03-23",
    "dateFormatted": "23 mars 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 9 - Riposte au 49.3 (Pic historique)",
    "route": "Miroir d'eau -> 50 Otages -> Cirque -> Commerce",
    "policeCount": 25000,
    "unionCount": 80000,
    "absoluteGap": 55000,
    "ratio": 3.2,
    "tensionLevel": "Très forte",
    "sources": "Rapport AN n°1824, AFP, Mediacités"
  },
  {
    "id": "NTE-010",
    "dateIso": "2023-03-28",
    "dateFormatted": "28 mars 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 10 - Poursuite post-49.3",
    "route": "Miroir d'eau -> Bretagne -> 50 Otages",
    "policeCount": 12000,
    "unionCount": 40000,
    "absoluteGap": 28000,
    "ratio": 3.33,
    "tensionLevel": "Forte",
    "sources": "Rapport AN n°1824, Ouest-France"
  },
  {
    "id": "NTE-011",
    "dateIso": "2023-04-06",
    "dateFormatted": "6 avr. 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 11 - Attente décision Conseil Const.",
    "route": "Commerce -> Gloriette -> 50 Otages",
    "policeCount": 15000,
    "unionCount": 50000,
    "absoluteGap": 35000,
    "ratio": 3.33,
    "tensionLevel": "Forte",
    "sources": "France 3, CGT 44"
  },
  {
    "id": "NTE-012",
    "dateIso": "2023-04-13",
    "dateFormatted": "13 avr. 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 12 - Veille de décision constitutionnelle",
    "route": "Miroir d'eau -> 50 Otages -> Préfecture",
    "policeCount": 10000,
    "unionCount": 25000,
    "absoluteGap": 15000,
    "ratio": 2.5,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, France Bleu"
  },
  {
    "id": "NTE-013",
    "dateIso": "2023-06-06",
    "dateFormatted": "6 juin 2023",
    "year": 2023,
    "cycle": "Retraites 2023",
    "title": "JNA 14 - Dernière journée unitaire interpro",
    "route": "Miroir d'eau -> Commerce -> Gloriette",
    "policeCount": 8500,
    "unionCount": 30000,
    "absoluteGap": 21500,
    "ratio": 3.53,
    "tensionLevel": "Faible",
    "sources": "Préfecture 44, Ouest-France"
  },
  {
    "id": "NTE-014",
    "dateIso": "2019-12-05",
    "dateFormatted": "5 déc. 2019",
    "year": 2019,
    "cycle": "Retraites 2019-2020",
    "title": "Grève reconductible régimes spéciaux",
    "route": "Commerce -> 50 Otages -> Préfecture -> Place Royale",
    "policeCount": 19000,
    "unionCount": 30000,
    "absoluteGap": 11000,
    "ratio": 1.58,
    "tensionLevel": "Forte",
    "sources": "Ouest-France, CGT 44, Presse Océan"
  },
  {
    "id": "NTE-015",
    "dateIso": "2019-12-10",
    "dateFormatted": "10 déc. 2019",
    "year": 2019,
    "cycle": "Retraites 2019-2020",
    "title": "Deuxième journée de grève générale",
    "route": "Miroir d'eau -> 50 Otages -> Commerce",
    "policeCount": 7000,
    "unionCount": 15000,
    "absoluteGap": 8000,
    "ratio": 2.14,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, France 3"
  },
  {
    "id": "NTE-016",
    "dateIso": "2019-12-17",
    "dateFormatted": "17 déc. 2019",
    "year": 2019,
    "cycle": "Retraites 2019-2020",
    "title": "Mobilisation avant vacances fin d'année",
    "route": "Commerce -> CHU -> 50 Otages -> Préfecture",
    "policeCount": 14000,
    "unionCount": 25000,
    "absoluteGap": 11000,
    "ratio": 1.79,
    "tensionLevel": "Modérée",
    "sources": "Ouest-France, France Bleu"
  },
  {
    "id": "NTE-017",
    "dateIso": "2020-01-09",
    "dateFormatted": "9 janv. 2020",
    "year": 2020,
    "cycle": "Retraites 2019-2020",
    "title": "Rentrée sociale contre retraite par points",
    "route": "Miroir d'eau -> 50 Otages -> Préfecture",
    "policeCount": 14000,
    "unionCount": 26000,
    "absoluteGap": 12000,
    "ratio": 1.86,
    "tensionLevel": "Forte",
    "sources": "France 3, CGT 44"
  },
  {
    "id": "NTE-018",
    "dateIso": "2020-01-16",
    "dateFormatted": "16 janv. 2020",
    "year": 2020,
    "cycle": "Retraites 2019-2020",
    "title": "Journée d'action intersyndicale de janvier",
    "route": "Commerce -> Place Bretagne -> Cirque",
    "policeCount": 8000,
    "unionCount": 15000,
    "absoluteGap": 7000,
    "ratio": 1.88,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, Ouest-France"
  },
  {
    "id": "NTE-019",
    "dateIso": "2020-01-24",
    "dateFormatted": "24 janv. 2020",
    "year": 2020,
    "cycle": "Retraites 2019-2020",
    "title": "Adoption projet de loi Conseil ministres",
    "route": "Miroir d'eau -> Gloriette -> 50 Otages",
    "policeCount": 10000,
    "unionCount": 20000,
    "absoluteGap": 10000,
    "ratio": 2.0,
    "tensionLevel": "Modérée",
    "sources": "Ouest-France, CGT 44"
  },
  {
    "id": "NTE-020",
    "dateIso": "2016-03-09",
    "dateFormatted": "9 mars 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Appel initial jeunesse et syndicats",
    "route": "Commerce -> Préfecture -> 50 Otages",
    "policeCount": 4500,
    "unionCount": 10000,
    "absoluteGap": 5500,
    "ratio": 2.22,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, Ouest-France"
  },
  {
    "id": "NTE-021",
    "dateIso": "2016-03-24",
    "dateFormatted": "24 mars 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Mobilisation lycéenne et étudiante",
    "route": "Commerce -> Foch -> 50 Otages",
    "policeCount": 3500,
    "unionCount": 8000,
    "absoluteGap": 4500,
    "ratio": 2.29,
    "tensionLevel": "Modérée",
    "sources": "France 3, UNEF Nantes"
  },
  {
    "id": "NTE-022",
    "dateIso": "2016-03-31",
    "dateFormatted": "31 mars 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Grève générale - Mobilisation record",
    "route": "Commerce -> 50 Otages -> Préfecture -> Bouffay",
    "policeCount": 9000,
    "unionCount": 35000,
    "absoluteGap": 26000,
    "ratio": 3.89,
    "tensionLevel": "Très forte",
    "sources": "France 3, CGT 44, Presse Océan"
  },
  {
    "id": "NTE-023",
    "dateIso": "2016-04-09",
    "dateFormatted": "9 avr. 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Manifestation du samedi interpro",
    "route": "Commerce -> Île Feydeau -> 50 Otages",
    "policeCount": 4000,
    "unionCount": 10000,
    "absoluteGap": 6000,
    "ratio": 2.5,
    "tensionLevel": "Forte",
    "sources": "Ouest-France, Presse Océan"
  },
  {
    "id": "NTE-024",
    "dateIso": "2016-04-28",
    "dateFormatted": "28 avr. 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Journée nationale d'action interpro",
    "route": "Commerce -> Préfecture -> Cours St-Pierre",
    "policeCount": 8500,
    "unionCount": 20000,
    "absoluteGap": 11500,
    "ratio": 2.35,
    "tensionLevel": "Très forte",
    "sources": "Le Monde, Presse Océan"
  },
  {
    "id": "NTE-025",
    "dateIso": "2016-05-12",
    "dateFormatted": "12 mai 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Riposte au recours à l'article 49.3",
    "route": "Commerce -> 50 Otages -> Cirque",
    "policeCount": 2500,
    "unionCount": 6000,
    "absoluteGap": 3500,
    "ratio": 2.4,
    "tensionLevel": "Forte",
    "sources": "Presse Océan, Ouest-France"
  },
  {
    "id": "NTE-026",
    "dateIso": "2016-05-19",
    "dateFormatted": "19 mai 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Routiers et dockers en convergence",
    "route": "Miroir d'eau -> Pont Cheviré -> Préfecture",
    "policeCount": 2500,
    "unionCount": 8000,
    "absoluteGap": 5500,
    "ratio": 3.2,
    "tensionLevel": "Forte",
    "sources": "Ouest-France, Télénantes"
  },
  {
    "id": "NTE-027",
    "dateIso": "2016-05-26",
    "dateFormatted": "26 mai 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Blocage des ponts et dépôts carburant",
    "route": "Commerce -> Pont Anne de Bretagne -> 50 Otages",
    "policeCount": 5500,
    "unionCount": 18000,
    "absoluteGap": 12500,
    "ratio": 3.27,
    "tensionLevel": "Très forte",
    "sources": "France 3, CGT 44, Mediacités"
  },
  {
    "id": "NTE-028",
    "dateIso": "2016-06-14",
    "dateFormatted": "14 juin 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Journée nationale - Départs vers Paris",
    "route": "Commerce -> Préfecture",
    "policeCount": 4000,
    "unionCount": 15000,
    "absoluteGap": 11000,
    "ratio": 3.75,
    "tensionLevel": "Forte",
    "sources": "Presse Océan, Ouest-France"
  },
  {
    "id": "NTE-029",
    "dateIso": "2016-06-28",
    "dateFormatted": "28 juin 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Vote du texte au Sénat",
    "route": "Commerce -> 50 Otages",
    "policeCount": 1200,
    "unionCount": 3000,
    "absoluteGap": 1800,
    "ratio": 2.5,
    "tensionLevel": "Faible",
    "sources": "AFP, Ouest-France"
  },
  {
    "id": "NTE-030",
    "dateIso": "2016-09-15",
    "dateFormatted": "15 sept. 2016",
    "year": 2016,
    "cycle": "Loi Travail 2016",
    "title": "Ultime journée contre loi promulguée",
    "route": "Commerce -> Préfecture -> Miroir d'eau",
    "policeCount": 2400,
    "unionCount": 6000,
    "absoluteGap": 3600,
    "ratio": 2.5,
    "tensionLevel": "Modérée",
    "sources": "France 3 Régions, CGT 44"
  },
  {
    "id": "NTE-031",
    "dateIso": "2014-02-22",
    "dateFormatted": "22 févr. 2014",
    "year": 2014,
    "cycle": "NDDL & Grand Ouest",
    "title": "Grande opposition aéroport (500 tracteurs)",
    "route": "Cours St-Pierre -> 50 Otages -> Préfecture",
    "policeCount": 20000,
    "unionCount": 55000,
    "absoluteGap": 35000,
    "ratio": 2.75,
    "tensionLevel": "Très forte",
    "sources": "Presse Océan, Ouest-France, ACIPA"
  },
  {
    "id": "NTE-032",
    "dateIso": "2016-02-27",
    "dateFormatted": "27 févr. 2016",
    "year": 2016,
    "cycle": "NDDL & Grand Ouest",
    "title": "Occupation pont de Cheviré et périphérique",
    "route": "Périphérique Ouest -> Pont de Cheviré",
    "policeCount": 15000,
    "unionCount": 45000,
    "absoluteGap": 30000,
    "ratio": 3.0,
    "tensionLevel": "Forte",
    "sources": "Ouest-France, Coordination NDDL"
  },
  {
    "id": "NTE-033",
    "dateIso": "2018-02-10",
    "dateFormatted": "10 févr. 2018",
    "year": 2018,
    "cycle": "NDDL & Grand Ouest",
    "title": "Rassemblement festif suite abandon aéroport",
    "route": "ZAD Notre-Dame-des-Landes & Nantes",
    "policeCount": 10000,
    "unionCount": 20000,
    "absoluteGap": 10000,
    "ratio": 2.0,
    "tensionLevel": "Pacifique",
    "sources": "France 3, Presse Océan"
  },
  {
    "id": "NTE-034",
    "dateIso": "2018-11-17",
    "dateFormatted": "17 nov. 2018",
    "year": 2018,
    "cycle": "Gilets Jaunes",
    "title": "Acte 1 - Blocages périphériques et axes majeurs",
    "route": "Atlantis -> Porte d'Armor -> Prairie de Mauves",
    "policeCount": 5000,
    "unionCount": 10000,
    "absoluteGap": 5000,
    "ratio": 2.0,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, Le Nombre Jaune"
  },
  {
    "id": "NTE-035",
    "dateIso": "2018-12-01",
    "dateFormatted": "1 déc. 2018",
    "year": 2018,
    "cycle": "Gilets Jaunes",
    "title": "Acte 3 - Entrée en force au centre-ville",
    "route": "Commerce -> Préfecture -> Place Royale",
    "policeCount": 2500,
    "unionCount": 6000,
    "absoluteGap": 3500,
    "ratio": 2.4,
    "tensionLevel": "Très forte",
    "sources": "Ouest-France, France 3"
  },
  {
    "id": "NTE-036",
    "dateIso": "2019-01-12",
    "dateFormatted": "12 janv. 2019",
    "year": 2019,
    "cycle": "Gilets Jaunes",
    "title": "Acte 9 - Mobilisation nationale rentrée",
    "route": "Commerce -> Château -> 50 Otages",
    "policeCount": 2600,
    "unionCount": 5500,
    "absoluteGap": 2900,
    "ratio": 2.12,
    "tensionLevel": "Forte",
    "sources": "Le Nombre Jaune, Mediacités"
  },
  {
    "id": "NTE-037",
    "dateIso": "2019-02-09",
    "dateFormatted": "9 févr. 2019",
    "year": 2019,
    "cycle": "Gilets Jaunes",
    "title": "Acte 13 - Cortège sauvage et barricades",
    "route": "Miroir d'eau -> Place Graslin -> Commerce",
    "policeCount": 1800,
    "unionCount": 3500,
    "absoluteGap": 1700,
    "ratio": 1.94,
    "tensionLevel": "Forte",
    "sources": "Ouest-France, Presse Océan"
  },
  {
    "id": "NTE-038",
    "dateIso": "2019-04-20",
    "dateFormatted": "20 avr. 2019",
    "year": 2019,
    "cycle": "Gilets Jaunes",
    "title": "Acte 23 - Ultimatum avant annonces président",
    "route": "Gare Sud -> CHU -> Place du Bouffay",
    "policeCount": 1500,
    "unionCount": 3200,
    "absoluteGap": 1700,
    "ratio": 2.13,
    "tensionLevel": "Forte",
    "sources": "Presse Océan, Le Nombre Jaune"
  },
  {
    "id": "NTE-039",
    "dateIso": "2019-09-14",
    "dateFormatted": "14 sept. 2019",
    "year": 2019,
    "cycle": "Gilets Jaunes",
    "title": "Acte 44 - Appel national unitaire à Nantes",
    "route": "Commerce -> Rue de Strasbourg -> Préfecture",
    "policeCount": 1800,
    "unionCount": 3800,
    "absoluteGap": 2000,
    "ratio": 2.11,
    "tensionLevel": "Très forte",
    "sources": "Rapport AN, Mediacités, Le Nombre Jaune"
  },
  {
    "id": "NTE-040",
    "dateIso": "2018-09-08",
    "dateFormatted": "8 sept. 2018",
    "year": 2018,
    "cycle": "Climat & Écologie",
    "title": "Première Marche pour le Climat (Post-Hulot)",
    "route": "Place Royale -> Commerce -> Miroir d'eau",
    "policeCount": 3500,
    "unionCount": 4000,
    "absoluteGap": 500,
    "ratio": 1.14,
    "tensionLevel": "Pacifique",
    "sources": "Presse Océan, Ouest-France"
  },
  {
    "id": "NTE-041",
    "dateIso": "2018-10-13",
    "dateFormatted": "13 oct. 2018",
    "year": 2018,
    "cycle": "Climat & Écologie",
    "title": "Deuxième Marche citoyenne pour le climat",
    "route": "Nefs Île de Nantes -> Commerce",
    "policeCount": 4500,
    "unionCount": 6000,
    "absoluteGap": 1500,
    "ratio": 1.33,
    "tensionLevel": "Pacifique",
    "sources": "France 3, Alternatiba Nantes"
  },
  {
    "id": "NTE-042",
    "dateIso": "2019-03-16",
    "dateFormatted": "16 mars 2019",
    "year": 2019,
    "cycle": "Climat & Écologie",
    "title": "La Marche du Siècle (Record climat)",
    "route": "Miroir d'eau -> Cours St-André -> 50 Otages",
    "policeCount": 9000,
    "unionCount": 10500,
    "absoluteGap": 1500,
    "ratio": 1.17,
    "tensionLevel": "Pacifique",
    "sources": "Ouest-France, Youth for Climate"
  },
  {
    "id": "NTE-043",
    "dateIso": "2019-05-24",
    "dateFormatted": "24 mai 2019",
    "year": 2019,
    "cycle": "Climat & Écologie",
    "title": "Grève mondiale Fridays For Future",
    "route": "Place Graslin -> Commerce -> Préfecture",
    "policeCount": 3000,
    "unionCount": 4500,
    "absoluteGap": 1500,
    "ratio": 1.5,
    "tensionLevel": "Pacifique",
    "sources": "Presse Océan, Ouest-France"
  },
  {
    "id": "NTE-044",
    "dateIso": "2019-09-21",
    "dateFormatted": "21 sept. 2019",
    "year": 2019,
    "cycle": "Climat & Écologie",
    "title": "Convergence Climat & Justice Sociale",
    "route": "Commerce -> Île de Nantes -> Miroir d'eau",
    "policeCount": 2500,
    "unionCount": 4500,
    "absoluteGap": 2000,
    "ratio": 1.8,
    "tensionLevel": "Modérée",
    "sources": "France 3 Pays de la Loire"
  },
  {
    "id": "NTE-045",
    "dateIso": "2021-03-28",
    "dateFormatted": "28 mars 2021",
    "year": 2021,
    "cycle": "Climat & Écologie",
    "title": "Marche pour une Vraie Loi Climat",
    "route": "Miroir d'eau -> Place Royale -> 50 Otages",
    "policeCount": 2000,
    "unionCount": 3500,
    "absoluteGap": 1500,
    "ratio": 1.75,
    "tensionLevel": "Pacifique",
    "sources": "Ouest-France, Presse Océan"
  },
  {
    "id": "NTE-046",
    "dateIso": "2016-05-01",
    "dateFormatted": "1 mai 2016",
    "year": 2016,
    "cycle": "1er Mai Syndical",
    "title": "1er Mai sous tensions Loi Travail",
    "route": "Commerce -> Gloriette -> 50 Otages",
    "policeCount": 2800,
    "unionCount": 6000,
    "absoluteGap": 3200,
    "ratio": 2.14,
    "tensionLevel": "Forte",
    "sources": "Presse Océan, CGT 44"
  },
  {
    "id": "NTE-047",
    "dateIso": "2017-05-01",
    "dateFormatted": "1 mai 2017",
    "year": 2017,
    "cycle": "1er Mai Syndical",
    "title": "1er Mai d'entre-deux-tours présidentiel",
    "route": "Gare SNCF -> Cours St-Pierre -> Commerce",
    "policeCount": 3000,
    "unionCount": 6500,
    "absoluteGap": 3500,
    "ratio": 2.17,
    "tensionLevel": "Calme",
    "sources": "Ouest-France, FSU 44"
  },
  {
    "id": "NTE-048",
    "dateIso": "2018-05-01",
    "dateFormatted": "1 mai 2018",
    "year": 2018,
    "cycle": "1er Mai Syndical",
    "title": "1er Mai intersyndical unitaire",
    "route": "Miroir d'eau -> 50 Otages -> Préfecture",
    "policeCount": 3200,
    "unionCount": 7000,
    "absoluteGap": 3800,
    "ratio": 2.19,
    "tensionLevel": "Modérée",
    "sources": "France 3, Presse Océan"
  },
  {
    "id": "NTE-049",
    "dateIso": "2019-05-01",
    "dateFormatted": "1 mai 2019",
    "year": 2019,
    "cycle": "1er Mai Syndical",
    "title": "1er Mai avec jonction Gilets Jaunes",
    "route": "Commerce -> 50 Otages -> Miroir d'eau",
    "policeCount": 4500,
    "unionCount": 12000,
    "absoluteGap": 7500,
    "ratio": 2.67,
    "tensionLevel": "Forte",
    "sources": "Ouest-France, UD CGT 44"
  },
  {
    "id": "NTE-050",
    "dateIso": "2021-05-01",
    "dateFormatted": "1 mai 2021",
    "year": 2021,
    "cycle": "1er Mai Syndical",
    "title": "1er Mai déconfinement progressif",
    "route": "Miroir d'eau -> 50 Otages -> Préfecture",
    "policeCount": 2200,
    "unionCount": 5000,
    "absoluteGap": 2800,
    "ratio": 2.27,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, CGT 44"
  },
  {
    "id": "NTE-051",
    "dateIso": "2022-05-01",
    "dateFormatted": "1 mai 2022",
    "year": 2022,
    "cycle": "1er Mai Syndical",
    "title": "1er Mai post-élection présidentielle",
    "route": "Gare Nord -> Cours St-Pierre -> Commerce",
    "policeCount": 3500,
    "unionCount": 8500,
    "absoluteGap": 5000,
    "ratio": 2.43,
    "tensionLevel": "Calme",
    "sources": "Ouest-France, France 3"
  },
  {
    "id": "NTE-052",
    "dateIso": "2023-05-01",
    "dateFormatted": "1 mai 2023",
    "year": 2023,
    "cycle": "1er Mai Syndical",
    "title": "1er Mai unitaire Retraites (Pic historique)",
    "route": "Miroir d'eau -> 50 Otages -> Préfecture -> Commerce",
    "policeCount": 17500,
    "unionCount": 80000,
    "absoluteGap": 62500,
    "ratio": 4.57,
    "tensionLevel": "Très forte",
    "sources": "Préfecture 44, UD CGT 44, Ouest-France"
  },
  {
    "id": "NTE-053",
    "dateIso": "2024-05-01",
    "dateFormatted": "1 mai 2024",
    "year": 2024,
    "cycle": "1er Mai Syndical",
    "title": "1er Mai pour les salaires et la paix",
    "route": "Miroir d'eau -> Cours St-André -> 50 Otages",
    "policeCount": 3800,
    "unionCount": 9500,
    "absoluteGap": 5700,
    "ratio": 2.5,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, Ouest-France"
  },
  {
    "id": "NTE-054",
    "dateIso": "2020-03-08",
    "dateFormatted": "8 mars 2020",
    "year": 2020,
    "cycle": "Droits des Femmes (8 Mars)",
    "title": "Grève féministe internationale 2020",
    "route": "Place Royale -> Commerce -> Bouffay",
    "policeCount": 1500,
    "unionCount": 2500,
    "absoluteGap": 1000,
    "ratio": 1.67,
    "tensionLevel": "Pacifique",
    "sources": "Ouest-France, AG Féministe 44"
  },
  {
    "id": "NTE-055",
    "dateIso": "2021-03-08",
    "dateFormatted": "8 mars 2021",
    "year": 2021,
    "cycle": "Droits des Femmes (8 Mars)",
    "title": "Cortège féministe mesures barrières",
    "route": "Miroir d'eau -> Place Graslin -> Commerce",
    "policeCount": 1200,
    "unionCount": 2000,
    "absoluteGap": 800,
    "ratio": 1.67,
    "tensionLevel": "Pacifique",
    "sources": "Presse Océan, Planning Familial 44"
  },
  {
    "id": "NTE-056",
    "dateIso": "2022-03-08",
    "dateFormatted": "8 mars 2022",
    "year": 2022,
    "cycle": "Droits des Femmes (8 Mars)",
    "title": "Grève féministe égalité salariale",
    "route": "Place Royale -> 50 Otages -> Miroir d'eau",
    "policeCount": 1800,
    "unionCount": 3500,
    "absoluteGap": 1700,
    "ratio": 1.94,
    "tensionLevel": "Pacifique",
    "sources": "Ouest-France, CGT 44"
  },
  {
    "id": "NTE-057",
    "dateIso": "2023-03-08",
    "dateFormatted": "8 mars 2023",
    "year": 2023,
    "cycle": "Droits des Femmes (8 Mars)",
    "title": "Convergence 8 Mars & Retraites",
    "route": "Miroir d'eau -> Commerce -> Préfecture",
    "policeCount": 2800,
    "unionCount": 6000,
    "absoluteGap": 3200,
    "ratio": 2.14,
    "tensionLevel": "Calme",
    "sources": "France 3, Intersyndicale 44"
  },
  {
    "id": "NTE-058",
    "dateIso": "2024-03-08",
    "dateFormatted": "8 mars 2024",
    "year": 2024,
    "cycle": "Droits des Femmes (8 Mars)",
    "title": "Célébration inscription IVG Constitution",
    "route": "Place Royale -> 50 Otages -> Miroir d'eau",
    "policeCount": 2200,
    "unionCount": 5000,
    "absoluteGap": 2800,
    "ratio": 2.27,
    "tensionLevel": "Pacifique",
    "sources": "Presse Océan, AG Féministe"
  },
  {
    "id": "NTE-059",
    "dateIso": "2020-11-21",
    "dateFormatted": "21 nov. 2020",
    "year": 2020,
    "cycle": "Libertés Publiques & Sécurité",
    "title": "Contre proposition loi Sécurité Globale",
    "route": "Place Graslin -> Commerce -> Préfecture",
    "policeCount": 2000,
    "unionCount": 4000,
    "absoluteGap": 2000,
    "ratio": 2.0,
    "tensionLevel": "Forte",
    "sources": "Presse Océan, LDH Nantes"
  },
  {
    "id": "NTE-060",
    "dateIso": "2020-11-28",
    "dateFormatted": "28 nov. 2020",
    "year": 2020,
    "cycle": "Libertés Publiques & Sécurité",
    "title": "Marche des Libertés (Affaire Zecler)",
    "route": "Miroir d'eau -> 50 Otages -> Commerce",
    "policeCount": 3500,
    "unionCount": 7000,
    "absoluteGap": 3500,
    "ratio": 2.0,
    "tensionLevel": "Forte",
    "sources": "Ouest-France, Mediacités"
  },
  {
    "id": "NTE-061",
    "dateIso": "2020-12-05",
    "dateFormatted": "5 déc. 2020",
    "year": 2020,
    "cycle": "Libertés Publiques & Sécurité",
    "title": "Deuxième Marche des Libertés",
    "route": "Commerce -> Préfecture -> Miroir d'eau",
    "policeCount": 3000,
    "unionCount": 5000,
    "absoluteGap": 2000,
    "ratio": 1.67,
    "tensionLevel": "Forte",
    "sources": "France 3, Place Publique"
  },
  {
    "id": "NTE-062",
    "dateIso": "2021-01-16",
    "dateFormatted": "16 janv. 2021",
    "year": 2021,
    "cycle": "Libertés Publiques & Sécurité",
    "title": "Rassemblement unitaire associations",
    "route": "Miroir d'eau -> Gloriette -> 50 Otages",
    "policeCount": 1200,
    "unionCount": 2500,
    "absoluteGap": 1300,
    "ratio": 2.08,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, LDH 44"
  },
  {
    "id": "NTE-063",
    "dateIso": "2021-07-17",
    "dateFormatted": "17 juil. 2021",
    "year": 2021,
    "cycle": "Anti-Pass Sanitaire",
    "title": "Première manif contre pass sanitaire",
    "route": "Place Royale -> Commerce -> Gare Nord",
    "policeCount": 1600,
    "unionCount": 3000,
    "absoluteGap": 1400,
    "ratio": 1.88,
    "tensionLevel": "Calme",
    "sources": "Ouest-France, Presse Océan"
  },
  {
    "id": "NTE-064",
    "dateIso": "2021-07-31",
    "dateFormatted": "31 juil. 2021",
    "year": 2021,
    "cycle": "Anti-Pass Sanitaire",
    "title": "Troisième samedi de mobilisation été",
    "route": "Miroir d'eau -> Préfecture -> 50 Otages",
    "policeCount": 3800,
    "unionCount": 6000,
    "absoluteGap": 2200,
    "ratio": 1.58,
    "tensionLevel": "Modérée",
    "sources": "France 3, Ouest-France"
  },
  {
    "id": "NTE-065",
    "dateIso": "2021-08-07",
    "dateFormatted": "7 août 2021",
    "year": 2021,
    "cycle": "Anti-Pass Sanitaire",
    "title": "Pic estival anti-pass sanitaire",
    "route": "Place Royale -> 50 Otages -> Commerce",
    "policeCount": 4600,
    "unionCount": 7500,
    "absoluteGap": 2900,
    "ratio": 1.63,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, Ouest-France"
  },
  {
    "id": "NTE-066",
    "dateIso": "2021-08-21",
    "dateFormatted": "21 août 2021",
    "year": 2021,
    "cycle": "Anti-Pass Sanitaire",
    "title": "Mobilisation avant rentrée scolaire",
    "route": "Miroir d'eau -> CHU -> Commerce",
    "policeCount": 3000,
    "unionCount": 5000,
    "absoluteGap": 2000,
    "ratio": 1.67,
    "tensionLevel": "Calme",
    "sources": "France Bleu Loire Océan"
  },
  {
    "id": "NTE-067",
    "dateIso": "2021-09-11",
    "dateFormatted": "11 sept. 2021",
    "year": 2021,
    "cycle": "Anti-Pass Sanitaire",
    "title": "Rentrée sociale des anti-pass",
    "route": "Commerce -> Préfecture -> Gloriette",
    "policeCount": 1800,
    "unionCount": 3000,
    "absoluteGap": 1200,
    "ratio": 1.67,
    "tensionLevel": "Faible",
    "sources": "Ouest-France, Presse Océan"
  },
  {
    "id": "NTE-068",
    "dateIso": "2019-08-03",
    "dateFormatted": "3 août 2019",
    "year": 2019,
    "cycle": "Hommage Steve Caniço",
    "title": "Marche blanche suite découverte corps",
    "route": "Quai Wilson -> Hangar Bananes -> Préfecture",
    "policeCount": 1700,
    "unionCount": 3500,
    "absoluteGap": 1800,
    "ratio": 2.06,
    "tensionLevel": "Forte",
    "sources": "Mediacités, Ouest-France, France 3"
  },
  {
    "id": "NTE-069",
    "dateIso": "2019-10-12",
    "dateFormatted": "12 oct. 2019",
    "year": 2019,
    "cycle": "Hommage Steve Caniço",
    "title": "Rassemblement pour vérité et justice",
    "route": "Place Royale -> Commerce -> Quai Wilson",
    "policeCount": 1000,
    "unionCount": 2000,
    "absoluteGap": 1000,
    "ratio": 2.0,
    "tensionLevel": "Modérée",
    "sources": "Presse Océan, Mediacités"
  },
  {
    "id": "NTE-070",
    "dateIso": "2024-06-15",
    "dateFormatted": "15 juin 2024",
    "year": 2024,
    "cycle": "Front Populaire 2024",
    "title": "Mobilisation unitaire post-dissolution",
    "route": "Miroir d'eau -> 50 Otages -> Préfecture -> Commerce",
    "policeCount": 15000,
    "unionCount": 25000,
    "absoluteGap": 10000,
    "ratio": 1.67,
    "tensionLevel": "Modérée",
    "sources": "Ouest-France, Intersyndicale 44"
  },
  {
    "id": "NTE-071",
    "dateIso": "2024-06-20",
    "dateFormatted": "20 juin 2024",
    "year": 2024,
    "cycle": "Front Populaire 2024",
    "title": "Deuxième rassemblement campagne",
    "route": "Place Bretagne -> Commerce -> Miroir d'eau",
    "policeCount": 3500,
    "unionCount": 6000,
    "absoluteGap": 2500,
    "ratio": 1.71,
    "tensionLevel": "Calme",
    "sources": "Presse Océan, France 3"
  },
  {
    "id": "NTE-072",
    "dateIso": "2006-03-28",
    "dateFormatted": "28 mars 2006",
    "year": 2006,
    "cycle": "Contrat Première Embauche (CPE)",
    "title": "Grève intergénérationnelle anti-CPE",
    "route": "Commerce -> 50 Otages -> Préfecture -> Place Royale",
    "policeCount": 20000,
    "unionCount": 45000,
    "absoluteGap": 25000,
    "ratio": 2.25,
    "tensionLevel": "Forte",
    "sources": "Presse Océan, Archives Patrimonia"
  },
  {
    "id": "NTE-073",
    "dateIso": "2006-04-04",
    "dateFormatted": "4 avr. 2006",
    "year": 2006,
    "cycle": "Contrat Première Embauche (CPE)",
    "title": "Apogée mobilisation avant retrait CPE",
    "route": "Miroir d'eau -> 50 Otages -> Cours St-Pierre",
    "policeCount": 23000,
    "unionCount": 55000,
    "absoluteGap": 32000,
    "ratio": 2.39,
    "tensionLevel": "Très forte",
    "sources": "Ouest-France, Archives CGT 44"
  },
  {
    "id": "NTE-074",
    "dateIso": "2010-10-12",
    "dateFormatted": "12 oct. 2010",
    "year": 2010,
    "cycle": "Retraites 2010 (Woerth)",
    "title": "Journée blocage interprofessionnel",
    "route": "Commerce -> 50 Otages -> Préfecture -> Saupin",
    "policeCount": 25000,
    "unionCount": 70000,
    "absoluteGap": 45000,
    "ratio": 2.8,
    "tensionLevel": "Forte",
    "sources": "Ouest-France, Presse Océan, CGT 44"
  },
  {
    "id": "NTE-075",
    "dateIso": "2010-10-19",
    "dateFormatted": "19 oct. 2010",
    "year": 2010,
    "cycle": "Retraites 2010 (Woerth)",
    "title": "Record historique mobilisation 2010",
    "route": "Miroir d'eau -> Foch -> 50 Otages -> Commerce",
    "policeCount": 28000,
    "unionCount": 75000,
    "absoluteGap": 47000,
    "ratio": 2.68,
    "tensionLevel": "Forte",
    "sources": "France 3, Ouest-France, Intersyndicale"
  }
];
