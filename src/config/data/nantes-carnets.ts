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
          -1.547691,
          47.21503
        ],
        [
          -1.547726,
          47.215241
        ],
        [
          -1.547829,
          47.215442
        ],
        [
          -1.547994,
          47.215622
        ],
        [
          -1.548214,
          47.215773
        ],
        [
          -1.548477,
          47.215886
        ],
        [
          -1.548771,
          47.215956
        ],
        [
          -1.54908,
          47.21598
        ],
        [
          -1.549389,
          47.215956
        ],
        [
          -1.549683,
          47.215886
        ],
        [
          -1.549946,
          47.215773
        ],
        [
          -1.550166,
          47.215622
        ],
        [
          -1.550331,
          47.215442
        ],
        [
          -1.550434,
          47.215241
        ],
        [
          -1.550469,
          47.21503
        ],
        [
          -1.550434,
          47.214819
        ],
        [
          -1.550331,
          47.214618
        ],
        [
          -1.550166,
          47.214438
        ],
        [
          -1.549946,
          47.214287
        ],
        [
          -1.549683,
          47.214174
        ],
        [
          -1.549389,
          47.214104
        ],
        [
          -1.54908,
          47.21408
        ],
        [
          -1.548771,
          47.214104
        ],
        [
          -1.548477,
          47.214174
        ],
        [
          -1.548214,
          47.214287
        ],
        [
          -1.547994,
          47.214438
        ],
        [
          -1.547829,
          47.214618
        ],
        [
          -1.547726,
          47.214819
        ],
        [
          -1.547691,
          47.21503
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
      -1.55625,
      47.21683
    ],
    "radiusMeters": 160,
    "polygon": [
      [
        [
          -1.5556,
          47.2193
        ],
        [
          -1.5546,
          47.21915
        ],
        [
          -1.55635,
          47.21455
        ],
        [
          -1.55735,
          47.21475
        ],
        [
          -1.5556,
          47.2193
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
      -1.55785,
      47.21335
    ],
    "radiusMeters": 95,
    "polygon": [
      [
        [
          -1.556594,
          47.21335
        ],
        [
          -1.556625,
          47.213541
        ],
        [
          -1.556718,
          47.213723
        ],
        [
          -1.556868,
          47.213886
        ],
        [
          -1.557067,
          47.214022
        ],
        [
          -1.557305,
          47.214124
        ],
        [
          -1.55757,
          47.214188
        ],
        [
          -1.55785,
          47.214209
        ],
        [
          -1.55813,
          47.214188
        ],
        [
          -1.558395,
          47.214124
        ],
        [
          -1.558633,
          47.214022
        ],
        [
          -1.558832,
          47.213886
        ],
        [
          -1.558982,
          47.213723
        ],
        [
          -1.559075,
          47.213541
        ],
        [
          -1.559106,
          47.21335
        ],
        [
          -1.559075,
          47.213159
        ],
        [
          -1.558982,
          47.212977
        ],
        [
          -1.558832,
          47.212814
        ],
        [
          -1.558633,
          47.212678
        ],
        [
          -1.558395,
          47.212576
        ],
        [
          -1.55813,
          47.212512
        ],
        [
          -1.55785,
          47.212491
        ],
        [
          -1.55757,
          47.212512
        ],
        [
          -1.557305,
          47.212576
        ],
        [
          -1.557067,
          47.212678
        ],
        [
          -1.556868,
          47.212814
        ],
        [
          -1.556718,
          47.212977
        ],
        [
          -1.556625,
          47.213159
        ],
        [
          -1.556594,
          47.21335
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
      -1.55985,
      47.21395
    ],
    "radiusMeters": 115,
    "polygon": [
      [
        [
          -1.56285,
          47.21345
        ],
        [
          -1.5584,
          47.21485
        ],
        [
          -1.5581,
          47.21415
        ],
        [
          -1.56245,
          47.21265
        ],
        [
          -1.56285,
          47.21345
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
      -1.55414,
      47.22006
    ],
    "radiusMeters": 105,
    "polygon": [
      [
        [
          -1.552751,
          47.22006
        ],
        [
          -1.552786,
          47.220271
        ],
        [
          -1.552889,
          47.220472
        ],
        [
          -1.553054,
          47.220652
        ],
        [
          -1.553274,
          47.220803
        ],
        [
          -1.553537,
          47.220916
        ],
        [
          -1.553831,
          47.220986
        ],
        [
          -1.55414,
          47.22101
        ],
        [
          -1.554449,
          47.220986
        ],
        [
          -1.554743,
          47.220916
        ],
        [
          -1.555006,
          47.220803
        ],
        [
          -1.555226,
          47.220652
        ],
        [
          -1.555391,
          47.220472
        ],
        [
          -1.555494,
          47.220271
        ],
        [
          -1.555529,
          47.22006
        ],
        [
          -1.555494,
          47.219849
        ],
        [
          -1.555391,
          47.219648
        ],
        [
          -1.555226,
          47.219468
        ],
        [
          -1.555006,
          47.219317
        ],
        [
          -1.554743,
          47.219204
        ],
        [
          -1.554449,
          47.219134
        ],
        [
          -1.55414,
          47.21911
        ],
        [
          -1.553831,
          47.219134
        ],
        [
          -1.553537,
          47.219204
        ],
        [
          -1.553274,
          47.219317
        ],
        [
          -1.553054,
          47.219468
        ],
        [
          -1.552889,
          47.219648
        ],
        [
          -1.552786,
          47.219849
        ],
        [
          -1.552751,
          47.22006
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
          -1.550595,
          47.24059
        ],
        [
          -1.550631,
          47.240811
        ],
        [
          -1.550739,
          47.241022
        ],
        [
          -1.550912,
          47.24121
        ],
        [
          -1.551143,
          47.241368
        ],
        [
          -1.551418,
          47.241487
        ],
        [
          -1.551726,
          47.24156
        ],
        [
          -1.55205,
          47.241585
        ],
        [
          -1.552374,
          47.24156
        ],
        [
          -1.552682,
          47.241487
        ],
        [
          -1.552957,
          47.241368
        ],
        [
          -1.553188,
          47.24121
        ],
        [
          -1.553361,
          47.241022
        ],
        [
          -1.553469,
          47.240811
        ],
        [
          -1.553505,
          47.24059
        ],
        [
          -1.553469,
          47.240369
        ],
        [
          -1.553361,
          47.240158
        ],
        [
          -1.553188,
          47.23997
        ],
        [
          -1.552957,
          47.239812
        ],
        [
          -1.552682,
          47.239693
        ],
        [
          -1.552374,
          47.23962
        ],
        [
          -1.55205,
          47.239595
        ],
        [
          -1.551726,
          47.23962
        ],
        [
          -1.551418,
          47.239693
        ],
        [
          -1.551143,
          47.239812
        ],
        [
          -1.550912,
          47.23997
        ],
        [
          -1.550739,
          47.240158
        ],
        [
          -1.550631,
          47.240369
        ],
        [
          -1.550595,
          47.24059
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
          -1.550997,
          47.22753
        ],
        [
          -1.55103,
          47.227731
        ],
        [
          -1.551128,
          47.227923
        ],
        [
          -1.551286,
          47.228094
        ],
        [
          -1.551495,
          47.228237
        ],
        [
          -1.551746,
          47.228345
        ],
        [
          -1.552026,
          47.228412
        ],
        [
          -1.55232,
          47.228435
        ],
        [
          -1.552614,
          47.228412
        ],
        [
          -1.552894,
          47.228345
        ],
        [
          -1.553145,
          47.228237
        ],
        [
          -1.553354,
          47.228094
        ],
        [
          -1.553512,
          47.227923
        ],
        [
          -1.55361,
          47.227731
        ],
        [
          -1.553643,
          47.22753
        ],
        [
          -1.55361,
          47.227329
        ],
        [
          -1.553512,
          47.227137
        ],
        [
          -1.553354,
          47.226966
        ],
        [
          -1.553145,
          47.226823
        ],
        [
          -1.552894,
          47.226715
        ],
        [
          -1.552614,
          47.226648
        ],
        [
          -1.55232,
          47.226625
        ],
        [
          -1.552026,
          47.226648
        ],
        [
          -1.551746,
          47.226715
        ],
        [
          -1.551495,
          47.226823
        ],
        [
          -1.551286,
          47.226966
        ],
        [
          -1.551128,
          47.227137
        ],
        [
          -1.55103,
          47.227329
        ],
        [
          -1.550997,
          47.22753
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
      -1.55311,
      47.2121
    ],
    "radiusMeters": 105,
    "polygon": [
      [
        [
          -1.551721,
          47.2121
        ],
        [
          -1.551756,
          47.212311
        ],
        [
          -1.551859,
          47.212512
        ],
        [
          -1.552024,
          47.212692
        ],
        [
          -1.552244,
          47.212843
        ],
        [
          -1.552508,
          47.212956
        ],
        [
          -1.552801,
          47.213026
        ],
        [
          -1.55311,
          47.21305
        ],
        [
          -1.553419,
          47.213026
        ],
        [
          -1.553712,
          47.212956
        ],
        [
          -1.553976,
          47.212843
        ],
        [
          -1.554196,
          47.212692
        ],
        [
          -1.554361,
          47.212512
        ],
        [
          -1.554464,
          47.212311
        ],
        [
          -1.554499,
          47.2121
        ],
        [
          -1.554464,
          47.211889
        ],
        [
          -1.554361,
          47.211688
        ],
        [
          -1.554196,
          47.211508
        ],
        [
          -1.553976,
          47.211357
        ],
        [
          -1.553712,
          47.211244
        ],
        [
          -1.553419,
          47.211174
        ],
        [
          -1.55311,
          47.21115
        ],
        [
          -1.552801,
          47.211174
        ],
        [
          -1.552508,
          47.211244
        ],
        [
          -1.552244,
          47.211357
        ],
        [
          -1.552024,
          47.211508
        ],
        [
          -1.551859,
          47.211688
        ],
        [
          -1.551756,
          47.211889
        ],
        [
          -1.551721,
          47.2121
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
