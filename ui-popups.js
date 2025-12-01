// ========================================
// UI-POPUPS.JS - Gestion des popups et modales
// ========================================

import { SHOP_REWARDS } from './shopRewards.js';

export class UIPopups {
    constructor(uiManager) {
        this.ui = uiManager;
        this.gm = uiManager.gm;
    }

    // ========================================
    // FORTRESS REWARDS
    // ========================================

    showFortressRewardPopup() {
        const availableTiers = this.gm.fortressSystem.getAvailableTiers();
        if (availableTiers.length === 0) return;
        
        const popup = document.getElementById('popup');
        popup.style.display = 'flex';
        
        availableTiers.sort((a, b) => b.threshold - a.threshold);
        
        let content = `
            <div style="text-align: center; width: 100%;">
                <h2 style="color: #FFD700; margin-bottom: 20px;">🛡️ Récompenses Fortress</h2>
                <p style="color: #4A90E2; font-size: 18px; margin-bottom: 30px;">
                    Points actuels: ${this.gm.fortressSystem.meter}
                </p>
                <div style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
        `;
        
        availableTiers.forEach(tier => {
            content += `
                <button class="fortress-tier-btn" data-tier="${tier.id}" style="
                    padding: 20px;
                    font-size: 18px;
                    background: rgba(74, 144, 226, 0.3);
                    border: 3px solid #4A90E2;
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                    width: 100%;
                ">
                    <strong>${tier.name}</strong><br>
                    <span style="font-size: 14px; opacity: 0.8;">Coût: ${tier.cost} points</span>
                </button>
            `;
        });
        
        content += `
                </div>
                <button id="closeFortressPopup" style="
                    margin-top: 25px;
                    padding: 15px 40px;
                    background: rgba(139, 0, 0, 0.5);
                    border: 2px solid #8B0000;
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Fermer
                </button>
            </div>
        `;
        
        popup.innerHTML = content;
        
        availableTiers.forEach(tier => {
            const btn = popup.querySelector(`[data-tier="${tier.id}"]`);
            if (btn) {
                btn.onclick = () => this.handleTierSelection(tier.id);
            }
        });
        
        document.getElementById('closeFortressPopup').onclick = () => {
            popup.style.display = 'none';
        };
    }

    handleTierSelection(tierId) {
        if (tierId === 'lv4') {
            document.getElementById('popup').style.display = 'none';
            this.ui.interactions.selectCardToProtectFortress();
        } else if (tierId === 'lv5') {
            document.getElementById('popup').style.display = 'none';
            this.ui.interactions.selectEnemyToDestroyFortress();
        } else {
            this.gm.fortressSystem.claimReward(tierId);
            document.getElementById('popup').style.display = 'none';
            this.ui.render();
        }
    }

    // ========================================
    // FUSION SYSTEM
    // ========================================

    showFusionPopup() {
        const popup = document.getElementById('popup');
        const availableTiers = this.gm.fusionSystem.getAvailableFusionTiers();
        
        if (availableTiers.length === 0) {
            this.gm.log(`⚠️ Pas assez de tokens pour fusionner`);
            return;
        }
        
        popup.style.display = 'flex';
        popup.innerHTML = `
            <div style="background: rgba(20, 20, 30, 0.98); padding: 30px; border-radius: 20px; border: 3px solid #8B45FF; max-width: 600px;">
                <h2 style="text-align: center; color: #8B45FF; margin-bottom: 20px; text-shadow: 0 0 10px rgba(139, 69, 255, 0.5);">
                    🌑 FUSION DES OMBRES
                </h2>
                
                <div style="color: #DDD; text-align: center; margin-bottom: 20px; font-size: 14px;">
                    Tokens Ombre disponibles : <span style="color: #8B45FF; font-weight: bold;">${this.gm.fusionSystem.countShadowTokensOnBoard()}</span><br>
                    Fusion Level : <span style="color: #FFD700; font-weight: bold;">${this.gm.fusionSystem.fusionLevel}</span> 
                    <span style="color: #AAA;">(+${this.gm.fusionSystem.getTokenValueBonus()} value aux tokens)</span>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
                    ${availableTiers.map(tier => `
                        <button class="fusion-tier-btn" data-tier-id="${tier.id}" style="
                            padding: 15px;
                            background: linear-gradient(135deg, rgba(139, 69, 255, 0.3) 0%, rgba(90, 45, 145, 0.3) 100%);
                            border: 2px solid #8B45FF;
                            border-radius: 12px;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="text-align: left;">
                                    <div style="font-weight: bold; color: #FFF; font-size: 16px; margin-bottom: 5px;">
                                        ${tier.name}
                                    </div>
                                    <div style="font-size: 13px; color: #DDD; margin-bottom: 8px;">
                                        ${tier.createCard().description}
                                    </div>
                                    <div style="font-size: 12px; color: #AAA;">
                                        Value : <span style="color: #FFD700;">${tier.createCard().value}</span> | 
                                        Rarity : <span style="color: #FF69B4;">${tier.createCard().rarity}</span>
                                    </div>
                                </div>
                                <div style="text-align: center; padding: 0 15px;">
                                    <div style="font-size: 24px; color: #8B45FF;">⚡</div>
                                    <div style="font-size: 12px; color: #AAA; margin-top: 5px;">
                                        ${tier.requiredTokens} tokens
                                    </div>
                                </div>
                            </div>
                        </button>
                    `).join('')}
                </div>
                
                <button id="fusion-cancel-btn" style="
                    width: 100%;
                    padding: 12px;
                    background: rgba(200, 50, 50, 0.3);
                    border: 2px solid #C83232;
                    border-radius: 8px;
                    color: #FFF;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    ❌ Annuler
                </button>
            </div>
        `;
        
        // Handlers pour chaque tier
        availableTiers.forEach(tier => {
            const btn = popup.querySelector(`[data-tier-id="${tier.id}"]`);
            if (btn) {
                btn.onmouseover = () => {
                    btn.style.background = 'linear-gradient(135deg, rgba(139, 69, 255, 0.5) 0%, rgba(90, 45, 145, 0.5) 100%)';
                    btn.style.transform = 'scale(1.02)';
                    btn.style.boxShadow = '0 0 20px rgba(139, 69, 255, 0.5)';
                };
                btn.onmouseout = () => {
                    btn.style.background = 'linear-gradient(135deg, rgba(139, 69, 255, 0.3) 0%, rgba(90, 45, 145, 0.3) 100%)';
                    btn.style.transform = 'scale(1)';
                    btn.style.boxShadow = 'none';
                };
                btn.onclick = () => {
                    popup.style.display = 'none';
                    this.gm.fusionSystem.fuseShadowTokens(tier.id);
                };
            }
        });
        
        // Handler bouton annuler
        const cancelBtn = document.getElementById('fusion-cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                popup.style.display = 'none';
            };
        }
    }

    // ========================================
    // SHOP
    // ========================================

    showShopPopup() {
        const popup = document.getElementById('popup');
        if (!popup) return;
        
        popup.style.display = 'flex';
        
        popup.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                padding: 30px;
                border-radius: 15px;
                border: 3px solid #FFD700;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <h2 style="color: #FFD700; text-align: center; margin-bottom: 30px;">
                    🛒 Boutique de Marchandises
                </h2>
                
                <div style="
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    ${this.renderShopTier('tier1', 5)}
                    ${this.renderShopTier('tier2', 10)}
                    ${this.renderShopTier('tier3', 15)}
                </div>
                
                <button id="closeShop" style="
                    width: 100%;
                    margin-top: 30px;
                    padding: 15px;
                    background: rgba(139, 0, 0, 0.5);
                    border: 2px solid #8B0000;
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Fermer
                </button>
            </div>
        `;
        
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
            const buyButton = popup.querySelector(`#buy-${tier}`);
            if (buyButton && !buyButton.disabled) {
                buyButton.onclick = () => this.buyShopReward(tier);
            }
        });
        
        popup.querySelector('#closeShop').onclick = () => {
            popup.style.display = 'none';
        };
    }

    renderShopTier(tier, price) {
        const rewards = SHOP_REWARDS[tier];
        const canAfford = this.gm.marchandises >= price;
        
        return `
            <div style="
                flex: 1;
                min-width: 200px;
                background: rgba(0, 0, 0, 0.5);
                padding: 20px;
                border-radius: 12px;
                border: 2px solid ${canAfford ? '#FFD700' : '#666'};
            ">
                <h3 style="color: #FFD700; text-align: center; margin-bottom: 15px;">
                    ${tier === 'tier1' ? 'Commune' : tier === 'tier2' ? 'Uncommon' : 'Rare'}
                </h3>
                
                <div style="
                    text-align: center;
                    font-size: 24px;
                    color: #FFD700;
                    margin-bottom: 15px;
                    font-weight: bold;
                ">
                    🛒 ${price}
                </div>
                
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 15px;
                    max-height: 200px;
                    overflow-y: auto;
                ">
                    ${rewards.map(card => `
                        <div style="
                            padding: 10px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 8px;
                            border-left: 3px solid ${this.getRarityColor(card.rarity)};
                        ">
                            <div style="font-size: 13px; font-weight: bold; color: ${this.getRarityColor(card.rarity)};">
                                ${card.name}
                            </div>
                            <div style="font-size: 10px; color: #888; margin-top: 3px;">
                                ${card.description}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="font-size: 11px; color: #888; margin-bottom: 10px;">
                    Carte aléatoire parmi ${rewards.length}
                </div>
                
                <button id="buy-${tier}" ${!canAfford ? 'disabled' : ''} style="
                    padding: 10px 20px;
                    background: ${canAfford ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#444'};
                    border: 2px solid ${canAfford ? '#FFD700' : '#666'};
                    border-radius: 8px;
                    color: ${canAfford ? '#000' : '#666'};
                    font-weight: bold;
                    cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                    width: 100%;
                ">
                    Acheter
                </button>
            </div>
        `;
    }

    getRarityColor(rarity) {
        switch(rarity) {
            case 'Commune': return '#aaa';
            case 'Uncommon': return '#4CAF50';
            case 'Rare': return '#2196F3';
            case 'Mythique': return '#9C27B0';
            default: return '#fff';
        }
    }

    buyShopReward(tier) {
        const prices = { tier1: 5, tier2: 10, tier3: 15 };
        const price = prices[tier];
        
        if (this.gm.marchandises < price) {
            this.gm.log(`⚠️ Pas assez de marchandises (besoin de ${price})`);
            return;
        }
        
        if (this.gm.hand.length >= 10) {
            this.gm.log(`⚠️ Main pleine ! Impossible d'acheter.`);
            return;
        }
        
        this.gm.marchandises -= price;
        this.gm.giveRandomShopReward(tier);
        
        document.getElementById('popup').style.display = 'none';
        this.ui.render();
    }

    // ========================================
    // ATOUTS SELECTION
    // ========================================

    showAtoutSelectionPopup(slotId) {
        if (this.gm.availableAtouts.length === 0) {
            this.gm.log('❌ Aucun atout disponible');
            return;
        }
        
        const popup = document.createElement('div');
        popup.className = 'popup-overlay';
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        popup.innerHTML = `
            <div class="popup-content" style="
                background: linear-gradient(135deg, #000000ff 0%, #16213e 100%);
                padding: 30px;
                border-radius: 15px;
                border: 3px solid #2ECC71;
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.9);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <h3 style="
                    color: #2ECC71;
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 24px;
                    text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
                ">Lequel ?</h3>
                
                <div class="atout-grid" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                ">
                    ${this.gm.availableAtouts.map((atout, index) => `
                        <div class="atout-choice" data-index="${index}" style="
                            padding: 20px;
                            border: 3px solid #2ECC71;
                            border-radius: 12px;
                            cursor: pointer;
                            background: linear-gradient(135deg, #1e3a1e 0%, #2d5a2d 100%);
                            transition: all 0.3s ease;
                            text-align: center;
                        ">
                            <div style="
                                font-weight: bold;
                                margin-bottom: 10px;
                                color: #2ECC71;
                                font-size: 16px;
                            ">
                                ${atout.name}
                            </div>
                            <div style="
                                font-size: 13px;
                                color: #ccc;
                                margin-bottom: 10px;
                                line-height: 1.4;
                            ">
                                ${atout.description}
                            </div>
                            <div style="
                                margin-top: 10px;
                                font-size: 12px;
                                color: #FFD700;
                                font-weight: bold;
                            ">
                                ${atout.rarity}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button id="cancelAtout" style="
                    width: 100%;
                    margin-top: 20px;
                    padding: 12px;
                    background: rgba(201, 6, 6, 0.08);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                ">Annuler</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Hover effects
        popup.querySelectorAll('.atout-choice').forEach(choice => {
            choice.addEventListener('mouseenter', () => {
                choice.style.transform = 'scale(1.05) translateY(-5px)';
                choice.style.borderColor = '#FFD700';
                choice.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.4)';
            });
            choice.addEventListener('mouseleave', () => {
                choice.style.transform = 'scale(1) translateY(0)';
                choice.style.borderColor = '#2ECC71';
                choice.style.boxShadow = 'none';
            });
        });
        
        // Click handlers
        popup.querySelectorAll('.atout-choice').forEach(choice => {
            choice.onclick = () => {
                const index = parseInt(choice.dataset.index);
                const result = this.gm.placeAtoutOnSlot(index, slotId);
                
                if (result.success) {
                    document.body.removeChild(popup);
                    this.ui.render();
                }
            };
        });
        
        popup.querySelector('#cancelAtout').onclick = () => {
            document.body.removeChild(popup);
        };
        
        popup.onclick = (e) => {
            if (e.target === popup) {
                document.body.removeChild(popup);
            }
        };
    }

    // ========================================
    // CARD TOOLTIP
    // ========================================

    showCardTooltip(card, mouseX, mouseY, slotId = null) {
        const tooltip = document.getElementById('cardTooltip');
        if (!tooltip) return;
        
        // Construire contenu
        let effectText = '';
        if (card.effect) {
            const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
            effectText = effects.map(eff => {
                switch(eff.type) {
                    case 'maxxer_dmg': return `Maxxer DMG +${eff.value}`;
                    case 'maxxer_block': return `Maxxer BLOCK +${eff.value}`;
                    case 'maxxer_all': return `Tous maxxers +${eff.value}`;
                    case 'maxxer_any': return `Maxxer slot +${eff.value}`;
                    case 'bonus_neighbors': return `Voisins +${eff.value}`;
                    case 'penalty_neighbors': return `Voisins ${eff.value}`;
                    case 'instant_draw': return `📥 Pioche ${eff.value} (immédiat)`;
                    case 'instant_all_slots_bonus': return `All slots +${eff.value}`;
                    case 'heal': return `Heal ${eff.value}`;
                    case 'draw': return `Pioche ${eff.value}`;
                    case 'instant_destroy_enemy': return `Détruit enemy ciblé`;
                    case 'instant_protect_ally': return `Protège la créature ciblée ce tour ci`;
                    case 'atout_draw_eot': return `Pioche ${eff.value} fin de tour (max ${eff.max_hand} main)`;
                    case 'atout_token_on_discard': return `Crée jeton ${eff.tag} quand ${eff.tag} défaussé`;
                    case 'atout_maxxer_start': return `Maxxers débutent à ${eff.start}, ne peuvent pas augmenter`;
                    case 'atout_damage_eot': return `Dégâts +${eff.value} fin de tour`;
                    case 'atout_block_eot': return `Blocage +${eff.value} fin de tour`;
                    case 'atout_heal_on_charm_played' : return `Heal ${eff.value} quand un charme est joué`;
                    case 'instant_missiles':
                        return `${eff.count} missiles ×${eff.value} sur ${eff.targetTypes.join('/')}`;
                    case 'instant_distribute':
                        const occupiedText = eff.onlyOccupied ? ' (slots occupés)' : '';
                        return `Distribue ${eff.value} sur ${eff.targetTypes.join('/')}${occupiedText}`;
                    case 'aura_tribal':
                        if (eff.includesSelf) {
                            return `Toutes ${eff.tag}s +${eff.value}`;
                        } else {
                            return `Autres ${eff.tag}s +${eff.value}`;
                        }
                    case 'gain_goods': return `+${eff.value} marchandises`;
                    case 'count_tribal':
                        if (eff.includesSelf) {
                            return `+${eff.value} par ${eff.tag} (inclus soi-même)`;
                        } else {
                            return `+${eff.value} par autre ${eff.tag}`;
                        }
                    case 'instant_discover':
                        if (eff.filter && eff.filter.tag) {
                            return `Discover ${eff.filter.tag}`;
                        }
                        return `Discover ${eff.pool}`;
                    case 'instant_transform_neighbor':
                        if (eff.filter && eff.filter.tag) {
                            return `Transform voisin en ${eff.filter.tag}`;
                        }
                        return `Transform voisin`;
                    case 'instant_transform_random_to_mythic':
                        return `Transform créature aléatoire en Mythique`;
                    case 'instant_devour_neighbors':
                        return `Dévore voisins (×${eff.multiplier} value)`;
                    case 'instant_create_token':
                        return `Crée jeton en main`;
                    case 'instant_create_token_on_neighbors':
                        return `Crée jetons sur voisins vides`;
                    case 'on_discard_create_token':
                        return `Crée jeton à la défausse`;
                    case 'on_discard_create_token_same_slot':
                        return `Crée jeton sur même slot (défausse)`;
                    case 'on_discard_create_creature_same_slot':
                        if (eff.filter && eff.filter.tag) {
                            return `Crée ${eff.filter.tag} aléatoire sur même slot (défausse)`;
                        } else if (eff.filter && eff.filter.rarity) {
                            return `Crée créature ${eff.filter.rarity} aléatoire sur même slot (défausse)`;
                        }
                        return `Crée créature aléatoire sur même slot (défausse)`;
                    case 'on_discard_draw':
                        return `Draw ${eff.value} à la défausse`;
                    case 'bonus_per_discard':
                        return `+${eff.value} par ${eff.tag} défaussé au tour précédent`;
                    case 'charm_boost_creature': return `Créature +${eff.value}`;
                    case 'charm_boost_neighbors': return `Voisins +${eff.value}`;
                    case 'charm_penalty_neighbors': return `Voisins ${eff.value}`;
                    case 'charm_maxxer_slot': return `Maxxer +${eff.value}`;
                    case 'charm_random_boost': return `Créature +${eff.min} à +${eff.max}`;
                    case 'charm_heal_on_discard': return `Heal ${eff.value} à la défausse`;
                    default: return eff.type;
                }
            }).join('<br>');
        }
        
        // Slots compatibles (pour cartes joueur)
        let slotsText = '';
        if (card.slotTypes) {
            const slotNames = {
                damage: 'DMG',
                block: 'BLOCK',
                shared: 'SHARED',
                player: 'PLAYER',
                enemy: 'ENEMY',
                state: 'STATE'
            };
            
            if (card.slotTypes.length === 1) {
                slotsText = `<div style="color: #FF6347; font-size: 12px; margin: 5px 0;">${slotNames[card.slotTypes[0]]} only</div>`;
            }
        }
        
        // Cartes ennemies (avec effets boost + onDeath + timer)
        let enemyEffectText = '';
        if (card.currentHp !== undefined) {
            let effectsList = [];
            
            if (card.effect) {
                const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
                effects.forEach(eff => {
                    if (eff.type === 'boost_damage') effectsList.push(`+${eff.value} 🔥 Dégâts ennemi`);
                    if (eff.type === 'boost_block') effectsList.push(`+${eff.value} 🛡️ Blocage ennemi`);
                });
            }
            
            if (card.onDeath) {
                switch(card.onDeath.type) {
                    case 'draw':
                        effectsList.push(`💀 Draw ${card.onDeath.value} au death`);
                        break;
                    case 'add_rare_card':
                        effectsList.push(`💀 Rare au death`);
                        break;
                    case 'heal':
                        effectsList.push(`💀 Heal ${card.onDeath.value} au death`);
                        break;
                }
            }
            
            if (card.timer && card.turnPlaced !== null) {
                const turnsElapsed = this.gm.turnNumber - card.turnPlaced;
                const turnsRemaining = card.timer.turns - turnsElapsed;
                
                if (turnsRemaining > 0) {
                    const effect = card.timer.effect;
                    let effectDesc = '';
                    if (effect.type === 'damage_player') effectDesc = `${effect.value} DMG au joueur`;
                    if (effect.type === 'heal_enemy') effectDesc = `Heal ${effect.value} au boss`;
                    effectsList.push(`⏰ Dans ${turnsRemaining} tours: ${effectDesc}`);
                }
            }
            
            if (effectsList.length > 0) {
                enemyEffectText = effectsList.join('<br>');
            }
        }
        
        // Equipements (charmes)
        let equipmentSection = '';
        if (slotId) {
            const slot = this.gm.board.getSlot(slotId);
            if (slot && slot.equipments.length > 0) {
                equipmentSection = `
                    <hr style="border-color: #FFD700; margin: 10px 0;">
                    <div style="font-size: 12px; color: #FFD700; font-weight: bold; margin-bottom: 5px;">
                        ⚙️ Charmes (${slot.equipments.length})
                    </div>
                `;
                
                slot.equipments.forEach(eq => {
                    equipmentSection += `
                        <div style="font-size: 11px; color: #AED581; margin: 3px 0; line-height: 1.4;">
                            • ${eq.name}: ${eq.description}
                        </div>
                    `;
                });
            }
        }
        
        tooltip.innerHTML = `
            <div style="font-size: 16px; font-weight: bold; color: #FFD700; margin-bottom: 8px;">
                ${card.name}
            </div>
            ${card.currentHp !== undefined ? `
                <div style="font-size: 14px; color: #FF6347; margin: 5px 0;">
                    HP: ${card.currentHp}/${card.maxHp}
                </div>
            ` : `
                <div style="font-size: 20px; color: #AED581; margin: 5px 0;">
                    Value: ${card.value || 0}
                </div>
            `}
            ${slotsText}
            ${effectText ? `
                <div style="font-size: 12px; color: #AED581; margin: 8px 0; line-height: 1.4;">
                    ${effectText}
                </div>
            ` : ''}
            ${enemyEffectText ? `
                <div style="font-size: 12px; color: #FFD700; margin: 8px 0; line-height: 1.4;">
                    ${enemyEffectText}
                </div>
            ` : ''}
            ${equipmentSection}
            ${card.rarity ? `
                <div style="font-size: 11px; color: #888; margin-top: 8px;">
                    ${card.rarity}
                </div>
            ` : ''}
        `;
        
        tooltip.style.left = `${mouseX + 15}px`;
        tooltip.style.top = `${mouseY + 15}px`;
        tooltip.style.display = 'block';
    }

    hideCardTooltip() {
        const tooltip = document.getElementById('cardTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
}