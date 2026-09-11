PLAYERSEX_FEMALE = 0
PLAYERSEX_MALE = 1

local increasingItems = {[416] = 417, [426] = 425, [446] = 447, [3216] = 3217, [3202] = 3215}
local decreasingItems = {[417] = 416, [425] = 426, [447] = 446, [3217] = 3216, [3215] = 3202}
local depots = {2589, 2590, 2591, 2592}

local function doPlayerMoveBack(cid, position, fromPosition)
doTeleportThing(cid, fromPosition, FALSE)
doSendMagicEffect(position, CONST_ME_MAGIC_BLUE)
end

local creatureFunc = {isPlayer, isMonster, isNpc}
function onStepIn(cid, item, position, fromPosition)
if(not increasingItems[item.itemid]) then
return TRUE
end

if(isPlayer(cid) ~= TRUE or isPlayerGhost(cid) ~= TRUE) then
doTransformItem(item.uid, increasingItems[item.itemid])
end

if(item.actionid >= 501 and item.actionid <= 503) then
local f = creatureFunc[item.actionid-500]
if(f(cid) ~= TRUE) then
doPlayerMoveBack(cid, position, fromPosition)
end

return TRUE
end

if(item.actionid == 504 and isPlayer(cid) == TRUE) then
doPlayerMoveBack(cid, position, fromPosition)
return TRUE
end

if(item.actionid >= 506 and item.actionid <= 508) then
local f = creatureFunc[item.actionid-505]
if(f(cid) == TRUE) then
doPlayerMoveBack(cid, position, fromPosition)
end

return TRUE
end

if(isPlayer(cid) ~= TRUE) then
return TRUE
end

if(item.actionid == 500 and isPremium(cid) ~= TRUE) then
doPlayerMoveBack(cid, position, fromPosition)
doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "Premium account required to enter.")
return TRUE
end

local gender = item.actionid - 400
if(gender == PLAYERSEX_FEMALE or gender == PLAYERSEX_MALE) then
local playerSex = getPlayerSex(cid)
if(playerSex ~= gender) then
local tmp = {"females", "males"}
doPlayerMoveBack(cid, position, fromPosition)
doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "Only " .. tmp[gender+ 1] .. " can enter.")
end

return TRUE
end

local skull = item.actionid - 300
if(skull >= 0 and skull <= 50) then
local playerSkull = getCreatureSkullType(cid)
if(skull == 0 and playerSkull ~= SKULL_NONE) then
doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "Only players without skull can enter.")
doPlayerMoveBack(cid, position, fromPosition)
elseif(playerSkull ~= skull) then
local skulls = {"yellow", "green", "white", "red"}
doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "Only players with " .. skulls[playerSkull] .. " skull can enter.")
doPlayerMoveBack(cid, position, fromPosition)
end

return TRUE
end

local group = item.actionid - 200
if(group >= 0 and group <= 50) then
local playerGroup = getPlayerGroupId(cid)
if(playerGroup < group) then
doPlayerMoveBack(cid, position, fromPosition)
local tmp = getGroupInfo(group)
if(tmp ~= FALSE) then
doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "Only " .. tmp.name .. "s can enter.")
end
end

return TRUE
end

local vocation = item.actionid - 100
if(vocation >= 0 and vocation <= 50) then
local playerVocation = getVocationInfo(getPlayerVocation(cid))
if(playerVocation.id ~= vocation and playerVocation.fromVocation ~= vocation) then
local tmp = getVocationInfo(vocation)
if(tmp ~= FALSE) then
doPlayerMoveBack(cid, position, fromPosition)
doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "Only " .. tmp.name .. "s can enter.")
end
end

return TRUE
end

if(item.actionid > 1000) then
if(getPlayerLevel(cid) < item.actionid - 1000) then
doPlayerSendCancel(cid, "You need " .. item.actionid - 1000 .. " level to enter here.")
doPlayerMoveBack(cid, position, fromPosition)
end
elseif(getTileInfo(position).protection) then
local depotPos = getPlayerLookPos(cid)
depotPos.stackpos = 3 -- ground = 0, table = 1, depot should be 2
--local depot = getThingFromPos(depotPos)
local depot
for i = 0, #depots do
depot = getTileItemById(depotPos, depots)
if(depot.uid > 0) then
break
end
end

if(depot.uid > 0 and isInArray(depots, depot.itemid) == TRUE) then
local depotItems = getPlayerDepotItems(cid, getDepotId(depot.uid))
if(depotItems < 2) then
doPlayerSendTextMessage(cid, MESSAGE_STATUS_DEFAULT, "Your depot contains 1 item.")
else
doPlayerSendTextMessage(cid, MESSAGE_STATUS_DEFAULT, "Your depot contains " .. depotItems .. " items.")
end
end
end

return TRUE
end

function onStepOut(cid, item, position, fromPosition)
if(decreasingItems[item.itemid] ~= nil) then
if(isPlayer(cid) ~= TRUE or isPlayerGhost(cid) ~= TRUE) then
doTransformItem(item.uid, decreasingItems[item.itemid])
end
end

return TRUE
end