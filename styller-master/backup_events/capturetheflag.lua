-- [SHIELDED BY MARLEYOT]
-- Capture The Flag Event (Corrigido com protecao contra nil)
local CTF = CTF or {}

function onLogin(player)
    if not player then
        return true
    end

    -- Protecao contra chamada antes da inicializacao do evento
    local status = pcall(function()
        local storage = player:getStorageValue(19900)
        if storage and storage > 0 then
            player:setStorageValue(19900, -1)
        end
    end)

    return true
end

function onLogout(player)
    if not player then
        return true
    end

    local status = pcall(function()
        local storage = player:getStorageValue(19900)
        if storage and storage > 0 then
            player:setStorageValue(19900, -1)
        end
    end)

    return true
end
