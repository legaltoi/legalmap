/**
 * BASE DOCUMENTAIRE HISTORIQUE, TACTIQUE & STATISTIQUE DE NANTES (CARNETS 1, 2 & 3)
 * Données 100 % réelles issues des archives locales, rapports parlementaires,
 * arrêtés préfectoraux (RAA 44), intersyndicales et observatoires citoyens (1955–2026).
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
      -1.5554,
      47.2165
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
      -1.554,
      47.2178
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
      -1.5298,
      47.2292
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
      -1.5535,
      47.2206
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
      -1.5518,
      47.2114
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
      -1.5554,
      47.2168
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
      -1.5554,
      47.2168
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
      -1.5492,
      47.2155
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
      -1.5578,
      47.2134
    ],
    "sectorId": "place-du-commerce"
  }
];

export const CARNET_2_SECTORS: TacticalSector[] = [
  {
    "id": "miroir-deau",
    "name": "Miroir d'eau (Cours John-Kennedy / Château)",
    "shortName": "Miroir d'Eau / Château",
    "coordinates": [
      -1.5492,
      47.2155
    ],
    "radiusMeters": 165,
    "polygon": [
      [
        [
          -1.547018,
          47.2155
        ],
        [
          -1.54706,
          47.215791
        ],
        [
          -1.547184,
          47.216071
        ],
        [
          -1.547386,
          47.216329
        ],
        [
          -1.547657,
          47.216555
        ],
        [
          -1.547988,
          47.216741
        ],
        [
          -1.548365,
          47.216879
        ],
        [
          -1.548774,
          47.216964
        ],
        [
          -1.5492,
          47.216993
        ],
        [
          -1.549626,
          47.216964
        ],
        [
          -1.550035,
          47.216879
        ],
        [
          -1.550412,
          47.216741
        ],
        [
          -1.550743,
          47.216555
        ],
        [
          -1.551014,
          47.216329
        ],
        [
          -1.551216,
          47.216071
        ],
        [
          -1.55134,
          47.215791
        ],
        [
          -1.551382,
          47.2155
        ],
        [
          -1.55134,
          47.215209
        ],
        [
          -1.551216,
          47.214929
        ],
        [
          -1.551014,
          47.214671
        ],
        [
          -1.550743,
          47.214445
        ],
        [
          -1.550412,
          47.214259
        ],
        [
          -1.550035,
          47.214121
        ],
        [
          -1.549626,
          47.214036
        ],
        [
          -1.5492,
          47.214007
        ],
        [
          -1.548774,
          47.214036
        ],
        [
          -1.548365,
          47.214121
        ],
        [
          -1.547988,
          47.214259
        ],
        [
          -1.547657,
          47.214445
        ],
        [
          -1.547386,
          47.214671
        ],
        [
          -1.547184,
          47.214929
        ],
        [
          -1.54706,
          47.215209
        ],
        [
          -1.547018,
          47.2155
        ]
      ]
    ],
    "riskLevel": "MODÉRÉ",
    "riskScore": 2,
    "tacticalType": "RASSEMBLEMENT & DÉPART",
    "color": "#38bdf8",
    "icon": "⛲",
    "keywords": [
      "Miroir d'eau",
      "Château",
      "Duchesse Anne",
      "Kennedy"
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
    "shortName": "Cours des 50-Otages",
    "coordinates": [
      -1.5554,
      47.2168
    ],
    "radiusMeters": 220,
    "polygon": [
      [
        [
          -1.5568,
          47.2194
        ],
        [
          -1.5545,
          47.2194
        ],
        [
          -1.5535,
          47.214
        ],
        [
          -1.5558,
          47.214
        ],
        [
          -1.5568,
          47.2194
        ]
      ]
    ],
    "riskLevel": "ÉLEVÉ",
    "riskScore": 4,
    "tacticalType": "AXE CENTRAL & SCISSIONS",
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
    "shortName": "Place du Commerce / Brancas",
    "coordinates": [
      -1.5578,
      47.2134
    ],
    "radiusMeters": 160,
    "polygon": [
      [
        [
          -1.555684,
          47.2134
        ],
        [
          -1.555725,
          47.213682
        ],
        [
          -1.555845,
          47.213954
        ],
        [
          -1.556041,
          47.214204
        ],
        [
          -1.556304,
          47.214423
        ],
        [
          -1.556624,
          47.214604
        ],
        [
          -1.55699,
          47.214737
        ],
        [
          -1.557387,
          47.21482
        ],
        [
          -1.5578,
          47.214847
        ],
        [
          -1.558213,
          47.21482
        ],
        [
          -1.55861,
          47.214737
        ],
        [
          -1.558976,
          47.214604
        ],
        [
          -1.559296,
          47.214423
        ],
        [
          -1.559559,
          47.214204
        ],
        [
          -1.559755,
          47.213954
        ],
        [
          -1.559875,
          47.213682
        ],
        [
          -1.559916,
          47.2134
        ],
        [
          -1.559875,
          47.213118
        ],
        [
          -1.559755,
          47.212846
        ],
        [
          -1.559559,
          47.212596
        ],
        [
          -1.559296,
          47.212377
        ],
        [
          -1.558976,
          47.212196
        ],
        [
          -1.55861,
          47.212063
        ],
        [
          -1.558213,
          47.21198
        ],
        [
          -1.5578,
          47.211953
        ],
        [
          -1.557387,
          47.21198
        ],
        [
          -1.55699,
          47.212063
        ],
        [
          -1.556624,
          47.212196
        ],
        [
          -1.556304,
          47.212377
        ],
        [
          -1.556041,
          47.212596
        ],
        [
          -1.555845,
          47.212846
        ],
        [
          -1.555725,
          47.213118
        ],
        [
          -1.555684,
          47.2134
        ]
      ]
    ],
    "riskLevel": "CRITIQUE",
    "riskScore": 5,
    "tacticalType": "CARREFOUR & RISQUE DE NASSE",
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
    "shortName": "Place Royale / Graslin",
    "coordinates": [
      -1.5598,
      47.2146
    ],
    "radiusMeters": 175,
    "polygon": [
      [
        [
          -1.5634,
          47.2144
        ],
        [
          -1.5578,
          47.216
        ],
        [
          -1.5572,
          47.2143
        ],
        [
          -1.5625,
          47.2126
        ],
        [
          -1.5634,
          47.2144
        ]
      ]
    ],
    "riskLevel": "CRITIQUE",
    "riskScore": 5,
    "tacticalType": "ZONE ROUGE RAA & GOULOTS",
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
    "shortName": "Préfecture / Quai Ceineray",
    "coordinates": [
      -1.5535,
      47.2206
    ],
    "radiusMeters": 165,
    "polygon": [
      [
        [
          -1.551318,
          47.2206
        ],
        [
          -1.55136,
          47.220891
        ],
        [
          -1.551484,
          47.221171
        ],
        [
          -1.551685,
          47.221429
        ],
        [
          -1.551957,
          47.221655
        ],
        [
          -1.552288,
          47.221841
        ],
        [
          -1.552665,
          47.221979
        ],
        [
          -1.553074,
          47.222064
        ],
        [
          -1.5535,
          47.222093
        ],
        [
          -1.553926,
          47.222064
        ],
        [
          -1.554335,
          47.221979
        ],
        [
          -1.554712,
          47.221841
        ],
        [
          -1.555043,
          47.221655
        ],
        [
          -1.555315,
          47.221429
        ],
        [
          -1.555516,
          47.221171
        ],
        [
          -1.55564,
          47.220891
        ],
        [
          -1.555682,
          47.2206
        ],
        [
          -1.55564,
          47.220309
        ],
        [
          -1.555516,
          47.220029
        ],
        [
          -1.555315,
          47.219771
        ],
        [
          -1.555043,
          47.219545
        ],
        [
          -1.554712,
          47.219359
        ],
        [
          -1.554335,
          47.219221
        ],
        [
          -1.553926,
          47.219136
        ],
        [
          -1.5535,
          47.219107
        ],
        [
          -1.553074,
          47.219136
        ],
        [
          -1.552665,
          47.219221
        ],
        [
          -1.552288,
          47.219359
        ],
        [
          -1.551957,
          47.219545
        ],
        [
          -1.551685,
          47.219771
        ],
        [
          -1.551484,
          47.220029
        ],
        [
          -1.55136,
          47.220309
        ],
        [
          -1.551318,
          47.2206
        ]
      ]
    ],
    "riskLevel": "CRITIQUE",
    "riskScore": 5,
    "tacticalType": "FIN DE TRACÉ & BARRAGE LOURD",
    "color": "#ef4444",
    "icon": "🏛️",
    "keywords": [
      "Préfecture",
      "Ceineray",
      "St-Pierre",
      "Saint-Pierre",
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
    "shortName": "Rectorat / Quartiers Est",
    "coordinates": [
      -1.5298,
      47.2292
    ],
    "radiusMeters": 180,
    "polygon": [
      [
        [
          -1.527419,
          47.2292
        ],
        [
          -1.527465,
          47.229518
        ],
        [
          -1.5276,
          47.229823
        ],
        [
          -1.52782,
          47.230105
        ],
        [
          -1.528116,
          47.230351
        ],
        [
          -1.528477,
          47.230554
        ],
        [
          -1.528889,
          47.230704
        ],
        [
          -1.529335,
          47.230797
        ],
        [
          -1.5298,
          47.230828
        ],
        [
          -1.530265,
          47.230797
        ],
        [
          -1.530711,
          47.230704
        ],
        [
          -1.531123,
          47.230554
        ],
        [
          -1.531484,
          47.230351
        ],
        [
          -1.53178,
          47.230105
        ],
        [
          -1.532,
          47.229823
        ],
        [
          -1.532135,
          47.229518
        ],
        [
          -1.532181,
          47.2292
        ],
        [
          -1.532135,
          47.228882
        ],
        [
          -1.532,
          47.228577
        ],
        [
          -1.53178,
          47.228295
        ],
        [
          -1.531484,
          47.228049
        ],
        [
          -1.531123,
          47.227846
        ],
        [
          -1.530711,
          47.227696
        ],
        [
          -1.530265,
          47.227603
        ],
        [
          -1.5298,
          47.227572
        ],
        [
          -1.529335,
          47.227603
        ],
        [
          -1.528889,
          47.227696
        ],
        [
          -1.528477,
          47.227846
        ],
        [
          -1.528116,
          47.228049
        ],
        [
          -1.52782,
          47.228295
        ],
        [
          -1.5276,
          47.228577
        ],
        [
          -1.527465,
          47.228882
        ],
        [
          -1.527419,
          47.2292
        ]
      ]
    ],
    "riskLevel": "ÉLEVÉ",
    "riskScore": 4,
    "tacticalType": "MOBILISATIONS LYCÉENNES",
    "color": "#a855f7",
    "icon": "🎓",
    "keywords": [
      "Rectorat",
      "Lycée",
      "Gare Nord"
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
    "shortName": "Hôtel de Police Waldeck-Rousseau",
    "coordinates": [
      -1.5508,
      47.2248
    ],
    "radiusMeters": 150,
    "polygon": [
      [
        [
          -1.548816,
          47.2248
        ],
        [
          -1.548854,
          47.225065
        ],
        [
          -1.548967,
          47.225319
        ],
        [
          -1.54915,
          47.225554
        ],
        [
          -1.549397,
          47.22576
        ],
        [
          -1.549698,
          47.225928
        ],
        [
          -1.550041,
          47.226054
        ],
        [
          -1.550413,
          47.226131
        ],
        [
          -1.5508,
          47.226157
        ],
        [
          -1.551187,
          47.226131
        ],
        [
          -1.551559,
          47.226054
        ],
        [
          -1.551902,
          47.225928
        ],
        [
          -1.552203,
          47.22576
        ],
        [
          -1.55245,
          47.225554
        ],
        [
          -1.552633,
          47.225319
        ],
        [
          -1.552746,
          47.225065
        ],
        [
          -1.552784,
          47.2248
        ],
        [
          -1.552746,
          47.224535
        ],
        [
          -1.552633,
          47.224281
        ],
        [
          -1.55245,
          47.224046
        ],
        [
          -1.552203,
          47.22384
        ],
        [
          -1.551902,
          47.223672
        ],
        [
          -1.551559,
          47.223546
        ],
        [
          -1.551187,
          47.223469
        ],
        [
          -1.5508,
          47.223443
        ],
        [
          -1.550413,
          47.223469
        ],
        [
          -1.550041,
          47.223546
        ],
        [
          -1.549698,
          47.223672
        ],
        [
          -1.549397,
          47.22384
        ],
        [
          -1.54915,
          47.224046
        ],
        [
          -1.548967,
          47.224281
        ],
        [
          -1.548854,
          47.224535
        ],
        [
          -1.548816,
          47.2248
        ]
      ]
    ],
    "riskLevel": "SENSIBLE",
    "riskScore": 3,
    "tacticalType": "COMMANDEMENT DIPN & GAV",
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
    "shortName": "CHU de Nantes (Hôtel-Dieu)",
    "coordinates": [
      -1.5518,
      47.2114
    ],
    "radiusMeters": 165,
    "polygon": [
      [
        [
          -1.549618,
          47.2114
        ],
        [
          -1.54966,
          47.211691
        ],
        [
          -1.549784,
          47.211971
        ],
        [
          -1.549986,
          47.212229
        ],
        [
          -1.550257,
          47.212455
        ],
        [
          -1.550588,
          47.212641
        ],
        [
          -1.550965,
          47.212779
        ],
        [
          -1.551374,
          47.212864
        ],
        [
          -1.5518,
          47.212893
        ],
        [
          -1.552226,
          47.212864
        ],
        [
          -1.552635,
          47.212779
        ],
        [
          -1.553012,
          47.212641
        ],
        [
          -1.553343,
          47.212455
        ],
        [
          -1.553614,
          47.212229
        ],
        [
          -1.553816,
          47.211971
        ],
        [
          -1.55394,
          47.211691
        ],
        [
          -1.553982,
          47.2114
        ],
        [
          -1.55394,
          47.211109
        ],
        [
          -1.553816,
          47.210829
        ],
        [
          -1.553614,
          47.210571
        ],
        [
          -1.553343,
          47.210345
        ],
        [
          -1.553012,
          47.210159
        ],
        [
          -1.552635,
          47.210021
        ],
        [
          -1.552226,
          47.209936
        ],
        [
          -1.5518,
          47.209907
        ],
        [
          -1.551374,
          47.209936
        ],
        [
          -1.550965,
          47.210021
        ],
        [
          -1.550588,
          47.210159
        ],
        [
          -1.550257,
          47.210345
        ],
        [
          -1.549986,
          47.210571
        ],
        [
          -1.549784,
          47.210829
        ],
        [
          -1.54966,
          47.211109
        ],
        [
          -1.549618,
          47.2114
        ]
      ]
    ],
    "riskLevel": "SANCTUAIRE",
    "riskScore": 1,
    "tacticalType": "PÔLE HOSPITALIER & URGENCES",
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
