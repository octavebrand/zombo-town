// ========================================
// PREBUILT_DECKS.JS - Decks pré-construits
// ========================================

export const PREBUILT_DECKS = [
    
    // ========================================
    // DECK 1 : FORTERESSE MOLLUSQUE
    // ========================================
    {
        id: 'mollusque_army',
        name: 'Empire Mollusque',
        tribe: 'Mollusque',
        description: 'Un pour tous, tous pour un.',
        color: '#4A90E2', // Bleu
        cards: [
            // Toutes les créatures Mollusques (12)
            { cardId: 'mollusque_devoue', count: 2 },
            { cardId: 'mollusque_curieux', count: 2 },
            { cardId: 'guerrier_mollusque', count: 2 },
            { cardId: 'commandant_mollusque', count: 2 },
            { cardId: 'artisan_mollusque', count: 2 },
            { cardId: 'mollusque_mutagene', count: 2 },
            { cardId: 'Mollusque Archiviste', count: 2 },
            { cardId: 'mollusque_a_mollusque', count: 2 },
            { cardId: 'mollusque_erudit', count: 2 },
            { cardId: 'mollusque_joyeux', count: 2 },
            { cardId: 'mollusque_reproducteur', count: 2 },
            
            // Neutres (5)
            { cardId: 'forteresse', count: 1 },
            { cardId: 'block_boost', count: 1 },
            { cardId: 'deluge', count: 1 },
            
            // Charmes (10)
            { cardId: 'charme_forgeron', count: 1 },
            { cardId: 'totem_flammes', count: 1 },
            { cardId: 'massif', count: 1 },
            { cardId: 'charme_vampirique', count: 1 },
            { cardId: 'charme_des_mollusques', count: 2 },
            { cardId: 'metamorphose_mollusque', count: 2 },
            { cardId: 'charme_catalyseur', count: 2 },
            { cardId: 'charme_exploration', count: 1 },
            { cardId: 'charme_cosmique', count: 1 },

            // Atouts (2)
            //{ cardId: 'usine_mollusques', count: 1 },
            { cardId: 'fortification', count: 1 },
            { cardId: 'stabilisateur', count: 1 },
            { cardId: 'coeur_enchante', count: 1 }
        ]
    },
    
    // ========================================
    // DECK 2 : BARRAGE ZIGOUILLEUR
    // ========================================
    {
        id: 'zigouilleur_missiles',
        name: 'Zigouilleurs',
        tribe: 'Zigouilleur',
        description: 'Gné, zigouiller, bombarder...',
        color: '#E74C3C', // Rouge
        cards: [
            // Toutes les créatures Zigouilleurs (11)
            { cardId: 'archiviste_zigouilleur', count: 2 },
            { cardId: 'zigouilleur_artificier', count: 2 },
            { cardId: 'ingenieur_zigouilleur', count: 2 },
            { cardId: 'zigouilleur_affame', count: 1 },
            { cardId: 'zigouilleur_adroit', count: 2 },
            { cardId: 'canonnier_zigouilleur', count: 2 },
            { cardId: 'zigouilleur_de_masse', count: 2 },
            { cardId: 'zigouilleur_kamikaze', count: 2 },
            { cardId: 'zigouilleur_des_mines', count: 2 },
            { cardId: 'zigouilleur_transformiste', count: 2 },
            { cardId: 'zigouilleur_fanatique', count: 2 },
            { cardId: 'grand_stratege_zigouilleur', count: 1 },
            { cardId: 'zigouilleur_intello', count: 2 },
            
            
            // Neutres (6)
            { cardId: 'boost_man', count: 1 },
            { cardId: 'all_boost', count: 1 },
            { cardId: 'tempete', count: 1 },
            
            // Charmes (10)
            { cardId: 'charme_forgeron', count: 1 },
            { cardId: 'totem_flammes', count: 1 },
            { cardId: 'massif', count: 1 },
            { cardId: 'charme_instabilite', count: 1 },
            { cardId: 'charme_des_zigouilleurs', count: 2 },
            { cardId: 'metamorphose_zigouilleur', count: 1 },
            { cardId: 'charme_catalyseur', count: 1 },
            { cardId: 'charme_exploration', count: 1 },
            { cardId: 'charme_cosmique', count: 1 },
            
            // Atouts (2)
            { cardId: 'petit_moteur', count: 1 },
            //{ cardId: 'usine_zigouilleurs', count: 1 },
            { cardId: 'stabilisateur', count: 1 },
            { cardId: 'arsenal', count: 1 }
        ]
    },
    
    // ========================================
    // DECK 3 : RÉSEAU TRAFIQUANT
    // ========================================
    {
        id: 'trafiquant_support',
        name: 'Réseau Trafiquant',
        tribe: 'Trafiquant',
        description: 'Contrôlez les flux.',
        color: '#F39C12', // Orange
        cards: [
            // Toutes les créatures Trafiquants (10)
            { cardId: 'trafiquant_legumes', count: 2 },
            { cardId: 'trafiquant_biens', count: 2 },
            { cardId: 'trafiquant_genereux', count: 2 },
            { cardId: 'trafiquant_reves', count: 2 },
            { cardId: 'trafiquant_influent', count: 2 },
            { cardId: 'trafiquant_lourd', count: 2 },
            { cardId: 'trafiquant_negociateur', count: 2 },
            { cardId: 'trafiquant_du_four', count: 2 },
            { cardId: 'trafiquant_de_cartes', count: 2 },
            { cardId: 'trafiquant_de_livres', count: 2 },
            
            // Neutres (7)
            { cardId: 'botte', count: 2 },
            { cardId: 'card_peon_cycle', count: 1 },
            { cardId: 'Body_stretch', count: 1 },
            { cardId: 'Renaissance', count: 1 },
            { cardId: 'Maintenance', count: 1 },
            { cardId: 'tacticien', count: 1 },
            
            // Charmes (10)
            { cardId: 'charme_forgeron', count: 1 },
            { cardId: 'totem_flammes', count: 1 },
            { cardId: 'charme_vampirique', count: 1 },
            { cardId: 'charme_instabilite', count: 1 },
            { cardId: 'charme_des_trafiquants', count: 2 },
            { cardId: 'metamorphose_trafiquant', count: 1 },
            { cardId: 'charme_catalyseur', count: 1 },
            { cardId: 'charme_exploration', count: 1 },
            { cardId: 'charme_cosmique', count: 1 },
            
            // Atouts (2)
            { cardId: 'petit_moteur', count: 1 },
            //{ cardId: 'usine_trafiquants', count: 1 },
            { cardId: 'stabilisateur', count: 1 },
            { cardId: 'coeur_enchante', count: 1 }
        ]
    },
    
    // ========================================
    // DECK 4 : LÉGION D'OMBRES
    // ========================================
    {
        id: 'ombre_tokens',
        name: 'Armée des Ombres',
        tribe: 'Ombre',
        description: 'Shadow submersion.',
        color: '#8E44AD', // Violet
        cards: [
            // Toutes les créatures Ombres (12)
            { cardId: 'ombre_studieuse', count: 2 },
            { cardId: 'maitre_ombres', count: 2 },
            { cardId: 'ombre_amplificatrice', count: 2 },
            { cardId: 'generateur_ombres', count: 2 },
            { cardId: 'ombre_persistante', count: 2 },
            { cardId: 'collecteur_ombres', count: 2 },
            { cardId: 'ombre_replicante', count: 2 },
            { cardId: 'ombre_fugace', count: 2 },
            { cardId: 'ombre_absorbante', count: 2 },
            { cardId: 'ombre_chercheuse', count: 2 },
            { cardId: 'ombre_de_vie', count: 1 },
            
            // Neutres (5)
            { cardId: 'botte', count: 1 },
            { cardId: 'card_peon_cycle', count: 1 },
            { cardId: 'Renaissance', count: 1 },
            { cardId: 'joie_communicative', count: 1 },
            { cardId: 'all_boost', count: 1 },
            
            // Charmes (10)
            { cardId: 'charme_forgeron', count: 1 },
            { cardId: 'totem_flammes', count: 1 },
            { cardId: 'massif', count: 1 },
            { cardId: 'charme_vampirique', count: 1 },
            { cardId: 'charme_des_ombres', count: 2 },
            { cardId: 'metamorphose_ombre', count: 1 },
            { cardId: 'charme_catalyseur', count: 1 },
            { cardId: 'charme_exploration', count: 1 },
            { cardId: 'charme_cosmique', count: 1 },
            
            
            // Atouts (2)
            { cardId: 'petit_moteur', count: 1 },
            { cardId: 'usine_ombres', count: 1 },
            { cardId: 'stabilisateur', count: 1 },
            { cardId: 'arsenal', count: 1 }
        ]
    },
    
    // ========================================
    // DECK 5 : CARAVANE D'ILLUSIONS
    // ========================================
    {
        id: 'illusion_versatile',
        name: 'Un monde d\'Illusions',
        tribe: 'Illusion',
        description: 'Transformation, illusion, adaptation.',
        color: '#1ABC9C', // Turquoise
        cards: [
            // Toutes les créatures Illusions (11)
            { cardId: 'illusion_simple', count: 2 },
            { cardId: 'illusion_fouineuse', count: 2 },
            { cardId: 'illusion_feu', count: 1 },
            { cardId: 'illusion_genante', count: 1 },
            { cardId: 'illusion_changeante_v1', count: 2 },
            { cardId: 'illusion_miroir', count: 1 },
            { cardId: 'illusion_polymorphe', count: 1 },
            { cardId: 'illusion_gazeuse', count: 1 },
            { cardId: 'illusion_perfide', count: 2 },
            { cardId: 'illusion_demultiplicatrice', count: 1 },
            { cardId: 'illusion_joyeuse', count: 1 },
            
            // Neutres (6)
            { cardId: 'botte', count: 1 },
            { cardId: 'Renaissance', count: 1 },
            { cardId: 'resonance_parfaite', count: 1 },
            { cardId: 'deluge', count: 1 },
            { cardId: 'all_boost', count: 1 },
            { cardId: 'tacticien', count: 1 },
            
            // Charmes (10)
            { cardId: 'charme_forgeron', count: 1 },
            { cardId: 'totem_flammes', count: 1 },
            { cardId: 'charme_instabilite', count: 1 },
            { cardId: 'charme_vampirique', count: 1 },
            { cardId: 'charme_des_illusions', count: 2 },
            { cardId: 'metamorphose_illusion', count: 1 },
            { cardId: 'charme_catalyseur', count: 1 },
            { cardId: 'charme_exploration', count: 1 },
            { cardId: 'charme_cosmique', count: 1 },
            
            // Atouts (2)
            { cardId: 'petit_moteur', count: 1 },
            { cardId: 'usine_illusions', count: 1 },
            { cardId: 'stabilisateur', count: 1 },
            { cardId: 'coeur_enchante', count: 1 }
        ]
    },
    
    // ========================================
    // DECK 6 : COLLECTION COMPLÈTE (deck actuel)
    // ========================================
    {
        id: 'all_cards',
        name: 'Collection Complète',
        tribe: 'Toutes',
        description: 'Toutes les cartes disponibles. Le deck par défaut pour explorer.',
        color: '#95A5A6', // Gris
        cards: 'all' // Flag spécial pour charger toutes les cartes
    }
];

/**
 * Récupère un deck par son ID
 */
export function getDeckById(deckId) {
    return PREBUILT_DECKS.find(deck => deck.id === deckId);
}

/**
 * Récupère tous les decks
 */
export function getAllDecks() {
    return PREBUILT_DECKS;
}
