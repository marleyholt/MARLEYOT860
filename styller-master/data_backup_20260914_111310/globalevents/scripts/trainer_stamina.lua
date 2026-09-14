-- Sistema de Recuperacao de Stamina no Treino (MARLEYOT TFS 1.5)
-- Adaptado para a API moderna OOP Game.getPlayers()

local config = {
    staminaGainMinutes = 1, -- Minutos de stamina adicionados por ciclo
    maxStaminaMinutes = 42 * 60, -- Stamina maxima: 42 horas (2520 minutos)
    onlyOnTrainers = false, -- Se true, checa se esta sobre piso especial ou atacando
    targetTrainerNames = {"Trainer", "Training Monk", "Target Dummy"}
}

function onThink(interval, lastExecution)
    local players = Game.getPlayers()
    if not players or #players == 0 then
        return true
    end

    for _, player in ipairs(players) do
        if player and player:isPlayer() then
            local currentStamina = player:getStamina() -- Retorna stamina em minutos
            if currentStamina < config.maxStaminaMinutes then
                local canRegen = true

                if config.onlyOnTrainers then
                    local target = player:getTarget()
                    if not target or not target:isMonster() then
                        canRegen = false
                    else
                        local targetName = target:getName():lower()
                        local isTrainer = false
                        for _, name in ipairs(config.targetTrainerNames) do
                            if targetName == name:lower() then
                                isTrainer = true
                                break
                            end
                        end
                        if not isTrainer then
                            canRegen = false
                        end
                    end
                end

                if canRegen then
                    local newStamina = math.min(config.maxStaminaMinutes, currentStamina + config.staminaGainMinutes)
                    player:setStamina(newStamina)
                end
            end
        end
    end

    return true
end
