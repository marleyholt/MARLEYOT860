local monsters = {
--name = storage
["demon"] = 45004,
["demon"] = 45004,
["demon"] = 45004,
["demon"] = 45004,
["demon"] = 45004
}

function onKill(cid, target)
if(isPlayer(target) ~= TRUE) then
local name = getCreatureName(target)
local monster = monsters[string.lower(name)]
if(monster) then
local killedMonsters = getPlayerStorageValue(cid, monster)
if(killedMonsters == -1) then
killedMonsters = 1
end
if(name == "demon") and getPlayerStorageValue(cid, 86669) == 2 then
doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "You have killed " .. killedMonsters .. " of 500 demons's.")
setPlayerStorageValue(cid, monster, killedMonsters + 1)
if getPlayerStorageValue(cid, 45004)>=5 then
setPlayerStorageValue(cid, 86669, 3)

doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "You have killed enought demons's.")
end

end
end
return TRUE
end
end