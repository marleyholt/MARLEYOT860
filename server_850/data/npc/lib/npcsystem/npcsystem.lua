
-- Polyfills for NpcSystem in TFS 0.4
if not isItemRune then
    function isItemRune(itemid)
        if isRune then return isRune(itemid) end
        if getItemInfo then
            local info = getItemInfo(itemid)
            if info and info.type == ITEM_TYPE_RUNE then return true end
        end
        return (itemid >= 2260 and itemid <= 2316)
    end
end

if not isItemFluidContainer then
    function isItemFluidContainer(itemid)
        if isFluidContainer then return isFluidContainer(itemid) end
        return false
    end
end

if not getItemDescriptionsById then
    function getItemDescriptionsById(itemid)
        if getItemInfo then
            local info = getItemInfo(itemid)
            if info then
                return {
                    name = info.name or '',
                    plural = info.plural or info.name or '',
                    article = info.article or '',
                    description = info.description or '',
                    special = '',
                    text = '',
                    writer = '',
                    date = ''
                }
            end
        end
        return {name = '', plural = '', article = '', description = '', special = '', text = '', writer = '', date = ''}
    end
end

if not getItemDescriptions then
    function getItemDescriptions(uid)
        local item = getThing(uid)
        if item and item.itemid and item.itemid > 0 then
            return getItemDescriptionsById(item.itemid)
        end
        return {name = '', plural = '', article = '', description = '', special = '', text = '', writer = '', date = ''}
    end
end

-- Advanced NPC System (Created by Jiddo),
-- Modified by Talaturen.

if(NpcSystem == nil) then
	-- Loads the underlying classes of the npcsystem.
	dofile(getDataDir() .. 'npc/lib/npcsystem/keywordhandler.lua')
	dofile(getDataDir() .. 'npc/lib/npcsystem/queue.lua')
	dofile(getDataDir() .. 'npc/lib/npcsystem/npchandler.lua')
	dofile(getDataDir() .. 'npc/lib/npcsystem/modules.lua')

	-- Global npc constants:

	-- Keyword nestling behavior. For more information look at the top of keywordhandler.lua
	KEYWORD_BEHAVIOR = BEHAVIOR_NORMAL_EXTENDED

	-- Greeting and unGreeting keywords. For more information look at the top of modules.lua
	FOCUS_GREETWORDS = {'hi', 'hello', 'hey'}
	FOCUS_FAREWELLWORDS = {'bye', 'farewell', 'cya'}

	-- The word for requesting trade window. For more information look at the top of modules.lua
	SHOP_TRADEREQUEST = {'offer', 'trade'}

	-- The word for accepting/declining an offer. CAN ONLY CONTAIN ONE FIELD! For more information look at the top of modules.lua
	SHOP_YESWORD = {'yes'}
	SHOP_NOWORD = {'no'}

	-- Pattern used to get the amount of an item a player wants to buy/sell.
	PATTERN_COUNT = '%d+'

	-- Talkdelay behavior. For more information, look at the top of npchandler.lua.
	NPCHANDLER_TALKDELAY = TALKDELAY_ONTHINK

	-- Conversation behavior. For more information, look at the top of npchandler.lua.
	NPCHANDLER_CONVBEHAVIOR = CONVERSATION_PRIVATE

	-- Constant strings defining the keywords to replace in the default messages.
	--	For more information, look at the top of npchandler.lua...
	TAG_PLAYERNAME = '|PLAYERNAME|'
	TAG_ITEMCOUNT = '|ITEMCOUNT|'
	TAG_TOTALCOST = '|TOTALCOST|'
	TAG_ITEMNAME = '|ITEMNAME|'
	TAG_QUEUESIZE = '|QUEUESIZE|'

	NpcSystem = {}

	-- Gets an npcparameter with the specified key. Returns nil if no such parameter is found.
	function NpcSystem.getParameter(key)
		local ret = getNpcParameter(tostring(key))
		if((type(ret) == 'number' and ret == 0) or ret == nil) then
			return nil
		else
			return ret
		end
	end

	-- Parses all known parameters for the npc. Also parses parseable modules.
	function NpcSystem.parseParameters(npcHandler)
		local ret = NpcSystem.getParameter('idletime')
		if(ret ~= nil) then
			npcHandler.idleTime = tonumber(ret)
		end
		local ret = NpcSystem.getParameter('talkradius')
		if(ret ~= nil) then
			npcHandler.talkRadius = tonumber(ret)
		end
		local ret = NpcSystem.getParameter('message_greet')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_GREET, ret)
		end
		local ret = NpcSystem.getParameter('message_farewell')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_FAREWELL, ret)
		end
		local ret = NpcSystem.getParameter('message_decline')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_DECLINE, ret)
		end
		local ret = NpcSystem.getParameter('message_needmorespace')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_NEEDMORESPACE, ret)
		end
		local ret = NpcSystem.getParameter('message_needspace')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_NEEDSPACE, ret)
		end
		local ret = NpcSystem.getParameter('message_sendtrade')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_SENDTRADE, ret)
		end
		local ret = NpcSystem.getParameter('message_noshop')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_NOSHOP, ret)
		end
		local ret = NpcSystem.getParameter('message_oncloseshop')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_ONCLOSESHOP, ret)
		end
		local ret = NpcSystem.getParameter('message_onbuy')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_ONBUY, ret)
		end
		local ret = NpcSystem.getParameter('message_onsell')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_ONSELL, ret)
		end
		local ret = NpcSystem.getParameter('message_missingmoney')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_MISSINGMONEY, ret)
		end
		local ret = NpcSystem.getParameter('message_needmoney')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_NEEDMONEY, ret)
		end
		local ret = NpcSystem.getParameter('message_missingitem')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_MISSINGITEM, ret)
		end
		local ret = NpcSystem.getParameter('message_needitem')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_NEEDITEM, ret)
		end
		local ret = NpcSystem.getParameter('message_idletimeout')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_IDLETIMEOUT, ret)
		end
		local ret = NpcSystem.getParameter('message_walkaway')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_WALKAWAY, ret)
		end
		local ret = NpcSystem.getParameter('message_alreadyfocused')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_ALREADYFOCUSED, ret)
		end
		local ret = NpcSystem.getParameter('message_placedinqueue')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_PLACEDINQUEUE, ret)
		end
		local ret = NpcSystem.getParameter('message_buy')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_BUY, ret)
		end
		local ret = NpcSystem.getParameter('message_sell')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_SELL, ret)
		end
		local ret = NpcSystem.getParameter('message_bought')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_BOUGHT, ret)
		end
		local ret = NpcSystem.getParameter('message_sold')
		if(ret ~= nil) then
			npcHandler:setMessage(MESSAGE_SOLD, ret)
		end

		-- Parse modules.
		for parameter, module in pairs(Modules.parseableModules) do
			local ret = NpcSystem.getParameter(parameter)
			if(ret ~= nil) then
				local number = tonumber(ret)
				if(number ~= 0 and module.parseParameters ~= nil) then
					local instance = module:new()
					npcHandler:addModule(instance)
					instance:parseParameters()
				end
			end
		end
	end
end
