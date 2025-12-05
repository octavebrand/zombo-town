// ========================================
// BOARDLINES.JS - Système de lignes visuelles
// ========================================

export class BoardLinesRenderer {
   
    constructor(gameManager) {
        this.gm = gameManager;
        this.svg = null;
    }

    ensureSVGExists() {
        // Si SVG déjà créé, ne rien faire
        if (this.svg && document.getElementById('boardLines')) {
            return;
        }
        
        // Créer SVG
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.id = 'boardLines';
        this.svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;

        const boardElement = document.getElementById('board');
        if (boardElement) {
            boardElement.appendChild(this.svg);
        } else {
            console.error('❌ Board element introuvable');
        }
    }

    render() {
        // S'assurer que le SVG existe
        this.ensureSVGExists();
        
        if (!this.svg) return;
        
        // Clear previous lines
        this.svg.innerHTML = '';
        
        // 1. Lignes voisinage (vertes)
        this.renderNeighborLines();
        
        // 2. Lignes value flow vers entités
        this.renderValueFlowLines();

    }
    
    renderNeighborLines() {
        const allSlots = this.gm.board.getAllSlots();
        const drawnPairs = new Set(); // Éviter doublons
        
        allSlots.forEach(slot => {
            slot.neighbors.forEach(neighborId => {
                const neighbor = this.gm.board.getSlot(neighborId);
                if (!neighbor) return;
                
                // Créer paire unique (alphabétique pour éviter doublons)
                const pair = [slot.id, neighborId].sort().join('-');
                if (drawnPairs.has(pair)) return;
                drawnPairs.add(pair);
                
                // Vérifier si bonus actif
                const hasBonus = (slot.card && this.hasBonusEffect(slot.card)) || 
                                (neighbor.card && this.hasBonusEffect(neighbor.card));
                
                this.drawLine(
                    slot.position.x, slot.position.y,
                    neighbor.position.x, neighbor.position.y,
                    hasBonus ? 'neighbor-active' : 'neighbor-inactive'
                );
            });
        });
    }
    
    renderValueFlowLines() {
        // DMG slots → entité DAMAGE
        this.gm.board.slots.damage.forEach(slot => {
            this.drawLine(
                slot.position.x, slot.position.y,
                50, 40, 
                slot.card ? 'flow-damage-active' : 'flow-damage-inactive'
            );
        });
        
        // BLOCK slots → entité BLOCK
        this.gm.board.slots.block.forEach(slot => {
            this.drawLine(
                slot.position.x, slot.position.y,
                26, 40, 
                slot.card ? 'flow-block-active' : 'flow-block-inactive'
            );
        });
        
        // STATE slots → entité STATE
        this.gm.board.slots.state.forEach(slot => {
            this.drawLine(
                slot.position.x, slot.position.y,
                74, 40, 
                slot.card ? 'flow-state-active' : 'flow-state-inactive'
            );
        });
        
        // SHARED slots → Plusieurs entités avec couleurs différentes
        this.gm.board.slots.shared.forEach(slot => {
            const hasCard = !!slot.card;
            
            // shared_1 → BLOCK (26, 35) et DAMAGE (50, 35)
            if (slot.id === 'shared_1') {
                this.drawLine(slot.position.x, slot.position.y, 26, 40, 
                    hasCard ? 'flow-block-active' : 'flow-block-inactive');
                this.drawLine(slot.position.x, slot.position.y, 50, 40, 
                    hasCard ? 'flow-damage-active' : 'flow-damage-inactive');
            }
            
            // shared_2 → DAMAGE (50, 35) et STATE (74, 35)
            if (slot.id === 'shared_2') {
                this.drawLine(slot.position.x, slot.position.y, 50, 40, 
                    hasCard ? 'flow-damage-active' : 'flow-damage-inactive');
                this.drawLine(slot.position.x, slot.position.y, 74, 40, 
                    hasCard ? 'flow-state-active' : 'flow-state-inactive');
            }
        });
    }
    
    drawLine(x1, y1, x2, y2, className) {
        // Obtenir les dimensions du SVG pour convertir % en pixels
        const svgRect = this.svg.getBoundingClientRect();
        const width = svgRect.width;
        const height = svgRect.height;
        
        // Convertir % en pixels
        const px1 = (x1 / 100) * width;
        const py1 = (y1 / 100) * height;
        const px2 = (x2 / 100) * width;
        const py2 = (y2 / 100) * height;
        
        // Calculer le point milieu
        const midX = (px1 + px2) / 2;
        const midY = (py1 + py2) / 2;
        
        // Créer un offset perpendiculaire pour la courbe
        const dx = px2 - px1;
        const dy = py2 - py1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Amplitude de la courbe (ajuste entre 1 et 5)
        const curveIntensity = 2;
        const perpX = (-dy / length) * curveIntensity;
        const perpY = (dx / length) * curveIntensity;
        
        // Point de contrôle
        const ctrlX = midX + perpX;
        const ctrlY = midY + perpY;
        
        // Créer le path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Courbe quadratique (maintenant en pixels)
        const d = `M ${px1} ${py1} Q ${ctrlX} ${ctrlY} ${px2} ${py2}`;
        path.setAttribute('d', d);
        path.setAttribute('class', className);
        path.setAttribute('fill', 'none');
        
        // Styles
        const styles = {
            'neighbor-inactive': { 
                stroke: 'rgba(255, 255, 255, 0.06)',
                width: 1.5, 
                dasharray: '2,4'
            },
            'neighbor-active': { 
                stroke: 'rgba(0, 255, 0, 0.4)', 
                width: 3,
                dasharray: '0'
            },
            'flow-damage-inactive': { 
                stroke: 'rgba(255, 69, 0, 0.04)', 
                width: 1.5,
                dasharray: '2,4'
            },
            'flow-damage-active': { 
                stroke: 'rgba(255, 69, 0, 0.5)', 
                width: 3,
                dasharray: '0'
            },
            'flow-block-inactive': { 
                stroke: 'rgba(65, 105, 225, 0.04)', 
                width: 1.5,
                dasharray: '2,4'
            },
            'flow-block-active': { 
                stroke: 'rgba(65, 105, 225, 0.5)', 
                width: 3,
                dasharray: '0'
            },
            'flow-state-inactive': { 
                stroke: 'rgba(255, 215, 0, 0.04)', 
                width: 1.5,
                dasharray: '2,4'
            },
            'flow-state-active': { 
                stroke: 'rgba(255, 215, 0, 0.5)', 
                width: 3,
                dasharray: '0'
            }
        };
        
        const style = styles[className];
        if (style) {
            path.setAttribute('stroke', style.stroke);
            path.setAttribute('stroke-width', style.width);
            path.setAttribute('stroke-dasharray', style.dasharray);
            path.setAttribute('stroke-linecap', 'round');
        }
        
        // Transition smooth
        path.style.transition = 'all 0.3s ease';
        
        this.svg.appendChild(path);
    }
    
    hasBonusEffect(card) {
        if (!card.effect) return false;
        const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
        return effects.some(e => e.type === 'bonus_neighbors' || e.type === 'penalty_neighbors');
    }
}