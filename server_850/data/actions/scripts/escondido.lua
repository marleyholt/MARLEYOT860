function onUse(cid, item, frompos, item2, topos)
if item.uid == 7964 then
if item.itemid == 1444 then

 nplayer1pos = {x=35, y=35, z=7}

 doTeleportThing(cid,nplayer1pos)

end
end
return 1
end