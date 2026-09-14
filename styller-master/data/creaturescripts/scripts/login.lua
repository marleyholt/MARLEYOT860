function onLogin(player)
    if not player then return true end
    
    pcall(function()
        player:sendTextMessage(MESSAGE_STATUS_DEFAULT, "Bem vindo ao MARLEYOT (Blindagem Maxima Ativa)!")
    end)
    
    pcall(function()
        player:registerEvent("PlayerDeath")
        player:registerEvent("DropLoot")
    end)
    
    return true
end
