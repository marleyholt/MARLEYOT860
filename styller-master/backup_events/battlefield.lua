-- [SHIELDED BY MARLEYOT]
dofile('data/lib/custom/battlefield.lua')

function onLogin(player)
local storageVal = player:getStorageValue(BATTLEFIELD.storage)
if storageVal and storageVal > 0 then
0)
er:getTown():getTemplePosition())
end
return true
end

function onLogout(player)
local storageVal = player:getStorageValue(BATTLEFIELD.storage)
if storageVal and storageVal > 0 then
dCancelMessage("You can not logout in event!")
():sendMagicEffect(CONST_ME_POFF)
 false
end
return true
end

function battlefield_removeAllPlayers()
for _, player in ipairs(Game.getPlayers()) do
= player:getStorageValue(BATTLEFIELD.storage)
and storageVal > 0 then
er:getGuid())
d
end
end

local function battlefield_winners(team)
for _, winner in ipairs(Game.getPlayers()) do
ner:getStorageValue(BATTLEFIELD.storage) == team then
ner:sendTextMessage(MESSAGE_INFO_DESCR, "Congratulations, your team won the battlefield event.")
ner:addItem(BATTLEFIELD.reward[1], BATTLEFIELD.reward[2])
ner:getGuid())
d
end

Game.broadcastMessage("The BattleEvent is finish, team ".. BATTLEFIELD.teamsBattlefield[team].color .." win.", MESSAGE_STATUS_WARNING)
battlefield_checkGate()

print(">>> BattleField Event was finished.")

addEvent(battlefield_removeAllPlayers, 3000)
end

function onPrepareDeath(player, killer)
if killer then
= player:getStorageValue(BATTLEFIELD.storage)
and team > 0 then
dTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "You are dead in battlefield event!")
er:getGuid())

ersTeam(team) == 0 then
ners((team == 1) and 2 or 1)
d
d
end
return true
end
