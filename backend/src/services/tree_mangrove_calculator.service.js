/**
 * Tree & Mangrove Carbon Sequestration Calculator Service
 * Verra VCS (VM0047 ARR v1.1 & VM0033 Blue Carbon v2.1), UNFCCC-CDM, IPCC Aligned
 * Authoritative reference model matching Carbon_Calculator_Trees_Mangroves.xlsx
 */

// Universal Constants
export const UniversalConstants = {
    CARBON_FRACTION_BIOMASS: 0.47,          // CF (IPCC 2006 GL Vol.4)
    CO2_TO_CARBON_RATIO: 44 / 12,           // 3.66667 (Fixed molecular ratio)
    ALLOMETRIC_A: -2.134,                   // Brown 1997, tropical AGB coefficient a
    ALLOMETRIC_B: 2.530,                   // Brown 1997, tropical AGB coefficient b
    ROOT_TO_SHOOT_TREE: 0.24,               // R (IPCC 2006 Table 4.4)
    ROOT_TO_SHOOT_MANGROVE: 0.39,           // R_m (Komiyama 2005 / IPCC Wetlands)
    MANGROVE_AGB_DENSITY: 150.0,            // t d.m./ha (Literature mean)
    MANGROVE_SOIL_C_STOCK: 386.0,           // t C/ha (Atwood 2017 / IPCC Tier-1)
    TREE_SIZE_DBH: {
        SMALL: 10.0,     // cm (Under ~15 cm)
        MEDIUM: 25.0,    // cm (~15 - 30 cm)
        LARGE: 45.0      // cm (Over ~30 cm)
    }
};

/**
 * Calculate Aboveground Biomass (AGB) in kg dry matter for a single representative tree
 * Formula: AGB_kg = EXP( a + b * LN(DBH) ) * biomass_factor
 */
export const calculateSingleTreeAGB = (dbhCm, biomassFactor = 1.0) => {
    const a = UniversalConstants.ALLOMETRIC_A;
    const b = UniversalConstants.ALLOMETRIC_B;
    const agbKg = Math.exp(a + (b * Math.log(dbhCm))) * Number(biomassFactor || 1.0);
    return parseFloat(agbKg.toFixed(4));
};

/**
 * Calculate CO2e per tree in tonnes
 * Formula: CO2e_per_tree_t = (AGB_kg / 1000) * (1 + R) * CF * (44/12)
 */
export const calculateSingleTreeCO2e = (dbhCm, biomassFactor = 1.0) => {
    const agbKg = calculateSingleTreeAGB(dbhCm, biomassFactor);
    const R = UniversalConstants.ROOT_TO_SHOOT_TREE;
    const CF = UniversalConstants.CARBON_FRACTION_BIOMASS;
    const RATIO = UniversalConstants.CO2_TO_CARBON_RATIO;
    const co2eTonnes = (agbKg / 1000.0) * (1.0 + R) * CF * RATIO;
    return parseFloat(co2eTonnes.toFixed(4));
};

/**
 * Perform complete Verra VM0047/VM0033 Trees & Mangroves Carbon Sequestration calculation
 */
export const calculateTreeMangroveCarbon = (input = {}) => {
    const landType = input.landType || 'Open Land';
    const smallTreeCount = Math.max(0, parseInt(input.smallTreeCount || 0, 10));
    const mediumTreeCount = Math.max(0, parseInt(input.mediumTreeCount || 0, 10));
    const largeTreeCount = Math.max(0, parseInt(input.largeTreeCount || 0, 10));
    const mangroveAreaHa = Math.max(0, parseFloat(input.mangroveAreaHa || 0));
    const biomassFactor = Math.max(0.1, parseFloat(input.biomassFactor || 1.0));
    const creditRateInr = Math.max(1, parseFloat(input.creditRateInr || 120));

    // 1. Single tree factors (tCO2e per tree)
    const smallPerTreeTonnes = calculateSingleTreeCO2e(UniversalConstants.TREE_SIZE_DBH.SMALL, biomassFactor);   // ~0.0857 t
    const mediumPerTreeTonnes = calculateSingleTreeCO2e(UniversalConstants.TREE_SIZE_DBH.MEDIUM, biomassFactor); // ~0.8710 t
    const largePerTreeTonnes = calculateSingleTreeCO2e(UniversalConstants.TREE_SIZE_DBH.LARGE, biomassFactor);   // ~3.8535 t

    // 2. Category totals (tCO2e)
    const smallTreeCO2e = smallTreeCount * smallPerTreeTonnes;
    const mediumTreeCO2e = mediumTreeCount * mediumPerTreeTonnes;
    const largeTreeCO2e = largeTreeCount * largePerTreeTonnes;
    const totalTreesCount = smallTreeCount + mediumTreeCount + largeTreeCount;
    const totalTreesCO2e = smallTreeCO2e + mediumTreeCO2e + largeTreeCO2e;

    // 3. Mangrove Blue Carbon Standing Stock
    const Rm = UniversalConstants.ROOT_TO_SHOOT_MANGROVE;
    const CF = UniversalConstants.CARBON_FRACTION_BIOMASS;
    const RATIO = UniversalConstants.CO2_TO_CARBON_RATIO;
    const agbDensity = UniversalConstants.MANGROVE_AGB_DENSITY;
    const soilCStock = UniversalConstants.MANGROVE_SOIL_C_STOCK;

    // Biomass C (t C) = Area * AGB_density * (1 + R_m) * CF
    const mangroveBiomassCarbonTonnes = mangroveAreaHa * agbDensity * (1.0 + Rm) * CF; // Area * 97.995
    // Soil C (t C) = Area * soil_C_stock
    const mangroveSoilCarbonTonnes = mangroveAreaHa * soilCStock; // Area * 386
    // Total Carbon (t C)
    const mangroveTotalCarbonTonnes = mangroveBiomassCarbonTonnes + mangroveSoilCarbonTonnes; // Area * 483.995
    // Total Mangrove CO2e (t) = Total C * 44/12
    const totalMangroveCO2e = mangroveTotalCarbonTonnes * RATIO; // Area * 1774.6483

    // 4. Combined Portfolio Totals
    const totalCO2eStored = totalTreesCO2e + totalMangroveCO2e;
    const totalCarbonCredits = totalCO2eStored; // 1 tCO2e = 1 Carbon Credit
    const portfolioValueInr = totalCarbonCredits * creditRateInr;

    return {
        landType,
        biomassFactor,
        treeInventory: {
            small: {
                count: smallTreeCount,
                dbhCm: UniversalConstants.TREE_SIZE_DBH.SMALL,
                agbPerTreeKg: calculateSingleTreeAGB(UniversalConstants.TREE_SIZE_DBH.SMALL, biomassFactor),
                co2ePerTreeTonnes: parseFloat(smallPerTreeTonnes.toFixed(3)), // 0.086 t
                totalCO2eTonnes: parseFloat(smallTreeCO2e.toFixed(2))
            },
            medium: {
                count: mediumTreeCount,
                dbhCm: UniversalConstants.TREE_SIZE_DBH.MEDIUM,
                agbPerTreeKg: calculateSingleTreeAGB(UniversalConstants.TREE_SIZE_DBH.MEDIUM, biomassFactor),
                co2ePerTreeTonnes: parseFloat(mediumPerTreeTonnes.toFixed(3)), // 0.871 t
                totalCO2eTonnes: parseFloat(mediumTreeCO2e.toFixed(2))
            },
            large: {
                count: largeTreeCount,
                dbhCm: UniversalConstants.TREE_SIZE_DBH.LARGE,
                agbPerTreeKg: calculateSingleTreeAGB(UniversalConstants.TREE_SIZE_DBH.LARGE, biomassFactor),
                co2ePerTreeTonnes: parseFloat(largePerTreeTonnes.toFixed(3)), // 3.852 t
                totalCO2eTonnes: parseFloat(largeTreeCO2e.toFixed(2))
            },
            totalCount: totalTreesCount,
            totalCO2eTonnes: parseFloat(totalTreesCO2e.toFixed(2))
        },
        mangroveDetails: {
            areaHa: mangroveAreaHa,
            biomassCarbonTonnes: parseFloat(mangroveBiomassCarbonTonnes.toFixed(2)),
            soilCarbonTonnes: parseFloat(mangroveSoilCarbonTonnes.toFixed(2)),
            totalCarbonTonnes: parseFloat(mangroveTotalCarbonTonnes.toFixed(2)),
            co2ePerHaTonnes: parseFloat((483.995 * RATIO).toFixed(1)), // ~1774.6 tCO2e/ha
            totalCO2eTonnes: parseFloat(totalMangroveCO2e.toFixed(2))
        },
        summary: {
            totalTreesCO2eTonnes: parseFloat(totalTreesCO2e.toFixed(2)),
            totalMangroveCO2eTonnes: parseFloat(totalMangroveCO2e.toFixed(2)),
            totalCO2eStoredTonnes: parseFloat(totalCO2eStored.toFixed(2)),
            totalCarbonCredits: parseFloat(totalCarbonCredits.toFixed(2)),
            creditRateInr,
            portfolioValueInr: Math.round(portfolioValueInr)
        }
    };
};
