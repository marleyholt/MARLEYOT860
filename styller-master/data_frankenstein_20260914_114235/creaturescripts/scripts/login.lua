function onLogin(player)
    local loginStr = "Bem vindo ao MARLEYOT (Modo de Segurança Ativado)!"
    player:sendTextMessage(MESSAGE_STATUS_DEFAULT, loginStr)
    return true
end
