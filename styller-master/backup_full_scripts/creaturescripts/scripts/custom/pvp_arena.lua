-- Safe PVP Arena OnLogin / OnLogout
function onLogin(player)
    if not player then
        return true
    end

    local storage = player:getStorageValue(50001)
    if storage and storage > 0 then
        -- Se estiver marcado dentro da arena ao logar, desmarcar com seguranca
        player:setStorageValue(50001, 0)
    end
    return true
end

function onLogout(player)
    if not player then
        return true
    end

    local storage = player:getStorageValue(50001)
    if storage and storage > 0 then
        player:setStorageValue(50001, 0)
    end
    return true
end
