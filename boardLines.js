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
                50, 40, // Position entité DAMAGE
                slot.card ? 'flow-damage-active' : 'flow-damage-inactive'
            );
        });
        
        // BLOCK slots → entité BLOCK
        this.gm.board.slots.block.forEach(slot => {
            this.drawLine(
                slot.position.x, slot.position.y,
                26, 40, // Position entité BLOCK
                slot.card ? 'flow-block-active' : 'flow-block-inactive'
            );
        });
        
        // STATE slots → entité STATE
        this.gm.board.slots.state.forEach(slot => {
            this.drawLine(
                slot.position.x, slot.position.y,
                74, 40, // Position entité STATE
                slot.card ? 'flow-state-active' : 'flow-state-inactive'
            );
        });
        
        // SHARED slots → Plusieurs entités avec couleurs différentes
        this.gm.board.slots.shared.forEach(slot => {
            const hasCard = !!slot.card;
            
            // shared_1 → BLOCK (26, 40) et DAMAGE (50, 40)
            if (slot.id === 'shared_1') {
                this.drawLine(slot.position.x, slot.position.y, 26, 40, 
                    hasCard ? 'flow-block-active' : 'flow-block-inactive');
                this.drawLine(slot.position.x, slot.position.y, 50, 40, 
                    hasCard ? 'flow-damage-active' : 'flow-damage-inactive');
            }
            
            // shared_2 → DAMAGE (50, 40) et STATE (74, 40)
            if (slot.id === 'shared_2') {
                this.drawLine(slot.position.x, slot.position.y, 50, 40, 
                    hasCard ? 'flow-damage-active' : 'flow-damage-inactive');
                this.drawLine(slot.position.x, slot.position.y, 74, 40, 
                    hasCard ? 'flow-state-active' : 'flow-state-inactive');
            }
        });
    }
    
    drawLine(x1, y1, x2, y2, className) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', `${x1}%`);
        line.setAttribute('y1', `${y1}%`);
        line.setAttribute('x2', `${x2}%`);
        line.setAttribute('y2', `${y2}%`);
        line.setAttribute('class', className);
        
        // 🆕 Style selon classe
        const styles = {
            'neighbor-inactive': { stroke: 'rgba(255, 255, 255, 0.2)', width: 3 },
            'neighbor-active': { stroke: '#00FF00', width: 6 },
            'flow-damage-inactive': { stroke: 'rgba(255, 255, 255, 0.15)', width: 3 },
            'flow-damage-active': { stroke: '#FF4500', width: 6 },
            'flow-block-inactive': { stroke: 'rgba(255, 255, 255, 0.15)', width: 3 },
            'flow-block-active': { stroke: '#4169E1', width: 6 },
            'flow-state-inactive': { stroke: 'rgba(255, 255, 255, 0.15)', width: 3 },
            'flow-state-active': { stroke: '#FFD700', width: 6 }
        };
        
        const style = styles[className];
        if (style) {
            line.setAttribute('stroke', style.stroke);
            line.setAttribute('stroke-width', style.width);
        }
        
        this.svg.appendChild(line);
    }
    
    hasBonusEffect(card) {
        if (!card.effect) return false;
        const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
        return effects.some(e => e.type === 'bonus_neighbors' || e.type === 'penalty_neighbors');
    }
}