	-- LeozeraRox Server Config

	-- Account manager
	accountManager = "yes"
	namelockManager = "yes"
	newPlayerChooseVoc = "yes"
	newPlayerSpawnPosX = 160
	newPlayerSpawnPosY = 51
	newPlayerSpawnPosZ = 7
	newPlayerTownId = 1
	newPlayerLevel = 8
	newPlayerMagicLevel = 0
	generateAccountNumber = "no"

	-- Unjustified kills
	redSkullLength = 1 * 24 * 60 * 60
	blackSkullLength = 2 * 24 * 60 * 60
	dailyFragsToRedSkull = 3
	weeklyFragsToRedSkull = 5
	monthlyFragsToRedSkull = 10
	dailyFragsToBlackSkull = dailyFragsToRedSkull
	weeklyFragsToBlackSkull = weeklyFragsToRedSkull
	monthlyFragsToBlackSkull = monthlyFragsToRedSkull
	dailyFragsToBanishment = dailyFragsToRedSkull
	weeklyFragsToBanishment = weeklyFragsToRedSkull
	monthlyFragsToBanishment = monthlyFragsToRedSkull
	blackSkulledDeathHealth = 40
	blackSkulledDeathMana = 0
	useBlackSkull = "yes"
	advancedFragList = "no"

	-- Banishments
	notationsToBan = 3
	warningsToFinalBan = 4
	warningsToDeletion = 5
	banLength = 7 * 24 * 60 * 60
	finalBanLength = 30 * 24 * 60 * 60
	ipBanishmentLength = 1 * 24 * 60 * 60
	broadcastBanishments = "yes"
	maxViolationCommentSize = 200
	autoBanishUnknownBytes = "no"

	-- Battle
	worldType = "pvp"
	protectionLevel = 30
	pvpTileIgnoreLevelAndVocationProtection = "yes"
	pzLocked = 60 * 1000
	criticalHitChance = 7
	criticalHitMultiplier = 1
	displayCriticalHitNotify = "yes"
	removeWeaponAmmunition = "no"
	removeWeaponCharges = "yes"
	removeRuneCharges = "no"
	whiteSkullTime = 5 * 60 * 1000
	noDamageToSameLookfeet = "no"
	showHealingDamage = "no"
	showHealingDamageForMonsters = "no"
	fieldOwnershipDuration = 5 * 1000
	stopAttackingAtExit = "no"
	oldConditionAccuracy = "no"
	loginProtectionPeriod = 10 * 1000
	deathLostPercent = 10
	stairhopDelay = 2 * 1000
	pushCreatureDelay = 2 * 1000
	deathContainerId = 1987
	gainExperienceColor = 215
	addManaSpentInPvPZone = "yes"
	squareColor = 0

	-- Experience from players
	experienceFromKilledPlayers = "no"
	minLevelThresholdForKilledPlayer = 0.9
	maxLevelThresholdForKilledPlayer = 1.1

	-- Connection config
	worldId = 0
	ip = "127.0.0.1"
	bindOnlyConfiguredIpAddress = "no"
	loginPort = 7171
	gamePort = 7172
	adminPort = 7171
	statusPort = 7171
	loginTries = 10
	retryTimeout = 5 * 1000
	loginTimeout = 60 * 1000
	maxPlayers = 239
	motd = "Welcome to the Styller! For Highscores: !rank"
	displayOnOrOffAtCharlist = "no"
	onePlayerOnlinePerAccount = "yes"
	allowClones = "no"
	serverName = "Styller 8.50"
	loginMessage = "Welcome to the Styller! For Highscores: !rank"
	statusTimeout = 5 * 60 * 1000
	replaceKickOnLogin = "yes"
	forceSlowConnectionsToDisconnect = "no"
	loginOnlyWithLoginServer = "no"
	premiumPlayerSkipWaitList = "no"

	-- Database
	sqlType = "mysql"
	sqlHost = "localhost"
	sqlPort = 3306
	sqlUser = "marleyot"
	sqlPass = "marley22"
	sqlDatabase = "styller"
	sqlFile = ""
	sqlKeepAlive = 0
	mysqlReadTimeout = 10
	mysqlWriteTimeout = 10
	passwordType = "plain"

	-- Deathlist
	deathListEnabled = "yes"
	deathListRequiredTime = 1 * 60 * 1000
	deathAssistCount = 20
	maxDeathRecords = 5

	-- Guilds
	ingameGuildManagement = "yes"
	levelToFormGuild = 20
	premiumDaysToFormGuild = 0
	guildNameMinLength = 4
	guildNameMaxLength = 20

	-- Highscores
	highscoreDisplayPlayers = 10
	updateHighscoresAfterMinutes = 5

	-- Houses
	buyableAndSellableHouses = "yes"
	houseNeedPremium = "yes"
	bedsRequirePremium = "yes"
	levelToBuyHouse = 20
	housesPerAccount = 0
	houseRentAsPrice = "no"
	housePriceAsRent = "no"
	housePriceEachSquare = 5000
	houseRentPeriod = "never"
	guildHalls = "no"

	-- Item usage
	timeBetweenActions = 200
	timeBetweenExActions = 1000
	checkCorpseOwner = "yes"
	hotkeyAimbotEnabled = "yes"
	maximumDoorLevel = 500

	-- Map
	mapName = "Styller"
	mapAuthor = "Léo"
	randomizeTiles = "yes"
	useHouseDataStorage = "yes"
	storeTrash = "no"
	cleanProtectedZones = "yes"
	mailboxDisabledTowns = "-1"

	-- Startup
	defaultPriority = "high"
	niceLevel = 5
	coresUsed = "-1"
	optimizeDatabaseAtStartup = "yes"
	removePremiumOnInit = "yes"
	confirmOutdatedVersion = "no"

	-- Muted buffer
	maxMessageBuffer = 4
	bufferMutedOnSpellFailure = "no"

	-- Miscellaneous
	dataDirectory = "data/"
	allowChangeOutfit = "yes"
	allowChangeColors = "yes"
	allowChangeAddons = "yes"
	disableOutfitsForPrivilegedPlayers = "no"
	bankSystem = "yes"
	saveGlobalStorage = "yes"
	displaySkillLevelOnAdvance = "no"
	spellNameInsteadOfWords = "no"
	emoteSpells = "yes"
	promptExceptionTracerErrorBox = "yes"
	storePlayerDirection = "no"

	-- Ghost mode
	ghostModeInvisibleEffect = "no"
	ghostModeSpellEffects = "yes"

	-- Limits
	idleWarningTime = 59 * 60 * 1000
	idleKickTime = 60 * 60 * 1000
	expireReportsAfterReads = 1
	playerQueryDeepness = 2
	maxItemsPerPZTile = 0
	maxItemsPerHouseTile = 0

	-- Premium-related
	freePremium = "no"
	premiumForPromotion = "yes"

	-- Blessings
	blessingsOnlyPremium = "yes"
	blessingReductionBase = 30
	blessingReductionDecreament = 5
	eachBlessReduction = 8

	-- Rates
	experienceStages = "no"
	rateExperience = 100.0
	rateSkill = 120.0
	rateMagic = 80.0
	rateLoot = 3.0
	rateSpawn = 1

	-- Stamina
	rateStaminaLoss = 1
	rateStaminaGain = 1000 / 3
	rateStaminaThresholdGain = 4
	staminaRatingLimitTop = 41 * 60
	staminaRatingLimitBottom = 14 * 60
	rateStaminaAboveNormal = 1.5
	rateStaminaUnderNormal = 0.5
	staminaThresholdOnlyPremium = "yes"

	-- Party
	experienceShareRadiusX = 30
	experienceShareRadiusY = 30
	experienceShareRadiusZ = 1
	experienceShareLevelDifference = 2 / 3
	extraPartyExperienceLimit = 20
	extraPartyExperiencePercent = 20
	experienceShareActivity = 2 * 60 * 1000

	-- Global save
	globalSaveEnabled = "no"
	globalSaveHour = 3
	shutdownAtGlobalSave = "yes"
	cleanMapAtGlobalSave = "no"

	-- Spawns
	deSpawnRange = 2
	deSpawnRadius = 50

	-- Summons
	maxPlayerSummons = 2
	teleportAllSummons = "no"
	teleportPlayerSummons = "no"

	-- Status
	ownerName = "Styller Soft 8.50"
	ownerEmail = ""
	url = ""
	location = "Brazil"
	displayGamemastersWithOnlineCommand = "no"

	-- Logs
	adminLogsEnabled = "no"
	displayPlayersLogging = "yes"
	prefixChannelLogs = ""
	runFile = ""
	outLogName = ""
	errorLogName = ""
	truncateLogsOnStartup = "no"
