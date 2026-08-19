import pool from '../config/postgres.js';
import { v4 as uuidv4 } from 'uuid';

/*
====================================================
Generate Application Number
====================================================
*/

export const generateApplicationNumber = async () => {

    const year = new Date().getFullYear();

    const query = `

        SELECT COUNT(*) AS total

        FROM cpay.registration;

    `;

    const result = await pool.query(query);

    const count = Number(result.rows[0].total) + 1;

    return `CPAY${year}${count.toString().padStart(6,'0')}`;

};

/*
====================================================
Create Registration
====================================================
*/

export const createRegistration = async (data) => {

    const {

        applicationNumber,

        userId,

        registrationTypeId,

        userTypeId

    } = data;

    const query = `

        INSERT INTO cpay.registration

        (

            application_number,

            user_id,

            registration_type_id,

            user_type_id,

            application_status,

            current_step,

            created_at,

            updated_at

        )

        VALUES

        (

            $1,

            $2,

            $3,

            $4,

            'DRAFT',

            1,

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )

        RETURNING *;

    `;

    const result = await pool.query(

        query,

        [

            applicationNumber,

            userId,

            registrationTypeId,

            userTypeId

        ]

    );

    return result.rows[0];

};

/*
====================================================
Save Personal Details
====================================================
*/

export const savePersonalDetails = async (data) => {

    const {

        userId,

        fullName,

        gender,

        aadhaarNumber,

        panNumber,

        email,

        mobileNumber

    } = data;

    const query = `

        INSERT INTO cpay.individual_details

        (

            user_id,

            full_name,

            gender,

            aadhaar_number,

            pan_number,

            email,

            mobile_number,

            created_at,

            updated_at

        )

        VALUES

        (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )

        ON CONFLICT (user_id)

        DO UPDATE SET

            full_name = EXCLUDED.full_name,

            gender = EXCLUDED.gender,

            aadhaar_number = EXCLUDED.aadhaar_number,

            pan_number = EXCLUDED.pan_number,

            email = EXCLUDED.email,

            mobile_number = EXCLUDED.mobile_number,

            updated_at = CURRENT_TIMESTAMP;

    `;

    await pool.query(query, [

        userId,

        fullName,

        gender,

        aadhaarNumber,

        panNumber,

        email,

        mobileNumber

    ]);

    if (fullName || email) {
        await pool.query(
            "UPDATE cpay.users SET email = COALESCE($2, email), username = COALESCE($3, username), updated_at = CURRENT_TIMESTAMP WHERE user_id = $1",
            [userId, email || null, fullName || null]
        );
    }

};

/*
====================================================
Save Organization Details
====================================================
*/

export const saveOrganizationDetails = async (data) => {

    const {

        userId,

        organizationName,

        registrationNumber,

        gstNumber,

        panNumber,

        email,

        mobileNumber

    } = data;

    const query = `

        INSERT INTO cpay.organization_details
        (

            user_id,

            organization_name,

            registration_number,

            gst_number,

            pan_number,

            email,

            mobile_number,

            created_at,

            updated_at

        )

        VALUES
        (

            $1,$2,$3,$4,$5,$6,$7,

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )

        ON CONFLICT (user_id)

        DO UPDATE SET

            organization_name = EXCLUDED.organization_name,

            registration_number = EXCLUDED.registration_number,

            gst_number = EXCLUDED.gst_number,

            pan_number = EXCLUDED.pan_number,

            email = EXCLUDED.email,

            mobile_number = EXCLUDED.mobile_number,

            updated_at = CURRENT_TIMESTAMP;

    `;

    await pool.query(query,[

        userId,

        organizationName,

        registrationNumber,

        gstNumber,

        panNumber,

        email,

        mobileNumber

    ]);

};

export const saveGovernmentDetails = async(data)=>{

    const{

        userId,

        departmentName,

        divisionName,

        managerName,

        managerId,

        panNumber,

        email,

        mobileNumber

    }=data;

    const query=`

        INSERT INTO cpay.government_details
        (

            user_id,

            department_name,

            division_name,

            manager_name,

            manager_id,

            pan_number,

            email,

            mobile_number,

            created_at,

            updated_at

        )

        VALUES
        (

            $1,$2,$3,$4,$5,$6,$7,$8,

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )

        ON CONFLICT(user_id)

        DO UPDATE SET

            department_name=EXCLUDED.department_name,

            division_name=EXCLUDED.division_name,

            manager_name=EXCLUDED.manager_name,

            manager_id=EXCLUDED.manager_id,

            pan_number=EXCLUDED.pan_number,

            email=EXCLUDED.email,

            mobile_number=EXCLUDED.mobile_number,

            updated_at=CURRENT_TIMESTAMP;

    `;

    await pool.query(query,[

        userId,

        departmentName,

        divisionName,

        managerName,

        managerId,

        panNumber,

        email,

        mobileNumber

    ]);

};

/*
====================================================
Save Address Details
====================================================
*/

export const saveAddressDetails = async (data) => {

    const {
        registrationId,
        stateId,
        districtId,
        mandalId,
        villageId,
        pincode
    } = data;

    const query = `
        INSERT INTO cpay.address_details
        (
            registration_id,
            state_id,
            district_id,
            mandal_id,
            village_id,
            pincode,
            created_at,
            updated_at
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (registration_id)
        DO UPDATE SET
            state_id = EXCLUDED.state_id,
            district_id = EXCLUDED.district_id,
            mandal_id = EXCLUDED.mandal_id,
            village_id = EXCLUDED.village_id,
            pincode = EXCLUDED.pincode,
            updated_at = CURRENT_TIMESTAMP;
    `;

    await pool.query(query, [
        registrationId,
        stateId,
        districtId,
        mandalId,
        villageId,
        pincode
    ]);
};

/*
====================================================
Save Land Details
====================================================
*/

export const saveLandDetails = async (data) => {

    const {

        registrationId,

        userId,

        landTypeId,

        surveyNumber,

        subDivisionNumber,

        totalArea,

        unitId,

        latitude,

        longitude,

        photoId,

        mongoPhotoId

    } = data;

    const actualPhotoId = photoId || mongoPhotoId;

    const query = `

        INSERT INTO cpay.land_details
        (

            registration_id,

            user_id,

            land_type_id,

            survey_number,

            sub_division_number,

            total_area,

            unit_id,

            latitude,

            longitude,

            photo_id,

            mongo_photo_id,

            geo_verified,

            is_active,

            created_at,

            updated_at

        )

        VALUES
        (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $10,

            FALSE,

            TRUE,

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )

        RETURNING *;

    `;

    const result = await pool.query(

        query,

        [

            registrationId,

            userId,

            landTypeId,

            surveyNumber,

            subDivisionNumber,

            totalArea,

            unitId,

            latitude,

            longitude,

            actualPhotoId

        ]

    );

    return result.rows[0];

};

/*
====================================================
Save Plantation Details
====================================================
*/

export const savePlantationDetails = async (data) => {

    const {

        registrationId,

        landId,

        plantationCategoryId,

        speciesName,

        numberOfPlants,

        plantationAge,

        plantationArea,

        areaUnitId,

        remarks,

        plantSpeciesId,

        smallTreeCount = 0,
        mediumTreeCount = 0,
        largeTreeCount = 0,
        biomassFactor = 1.00,
        mangroveAreaHa = 0,
        small_tree_count,
        medium_tree_count,
        large_tree_count,
        biomass_factor,
        mangrove_area_ha

    } = data;

    const finalSmall = small_tree_count !== undefined && small_tree_count !== null ? Number(small_tree_count) : Number(smallTreeCount || 0);
    const finalMed = medium_tree_count !== undefined && medium_tree_count !== null ? Number(medium_tree_count) : Number(mediumTreeCount || 0);
    const finalLg = large_tree_count !== undefined && large_tree_count !== null ? Number(large_tree_count) : Number(largeTreeCount || 0);
    const finalBiomass = biomass_factor !== undefined && biomass_factor !== null ? Number(biomass_factor) : Number(biomassFactor || 1.00);
    const finalMangrove = mangrove_area_ha !== undefined && mangrove_area_ha !== null ? Number(mangrove_area_ha) : Number(mangroveAreaHa || 0);

    // Delete existing records first to prevent constraint issues on one-to-many schema
    await pool.query("DELETE FROM cpay.plantation_details WHERE registration_id = $1", [registrationId]);

    const query = `

        INSERT INTO cpay.plantation_details
        (

            plantation_id,

            registration_id,

            land_id,

            plantation_category_id,

            number_of_plants,

            plantation_age,

            plantation_area,

            area_unit_id,

            remarks,

            plant_species_id,

            small_tree_count,

            medium_tree_count,

            large_tree_count,

            biomass_factor,

            mangrove_area_ha,

            created_at,

            updated_at

        )

        VALUES
        (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $11,

            $12,

            $13,

            $14,

            $15,

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )
        RETURNING *;

    `;

    const result = await pool.query(

        query,

        [

            uuidv4(),

            registrationId,

            landId,

            plantationCategoryId,

            numberOfPlants,

            plantationAge,

            plantationArea,

            areaUnitId,

            remarks,

            plantSpeciesId,

            finalSmall,

            finalMed,

            finalLg,

            finalBiomass,

            finalMangrove

        ]

    );

    return result.rows[0];

};

/*
====================================================
Save Aquaculture Details
====================================================
*/

export const saveAquacultureDetails = async (data) => {

    const {

        registrationId,

        landId,

        aquacultureType,

        fishSpeciesId,

        prawnSpeciesId,

        stockQuantity,

        cultureDays,

        pondArea,

        areaUnitId,

        feedConsumed,

        feedUnitId,

        fcr,

        remarks,

        cropsPerYear,
        netBiomassGain,
        feedCrudeProtein,
        feedCarbonContent,
        dobProportion,
        dobEF,
        gncEF,
        nRetentionEfficiency,
        cRetentionEfficiency,
        n2oN_EF,
        gwpCH4,
        gwpN2O,
        dieselEF,
        dieselBaseline,
        dieselImproved,
        baselineAnaerobicFraction,
        improvedAnaerobicFraction,
        fcrImprovement,
        measuredCH4Baseline,
        measuredCH4Improved,
        measuredN2OBaseline,
        measuredN2OImproved

    } = data;

    // Delete existing aquaculture details first to support draft overwrites
    await pool.query("DELETE FROM cpay.aquaculture_details WHERE registration_id = $1", [registrationId]);

    const query = `

        INSERT INTO cpay.aquaculture_details
        (

            aquaculture_id,

            registration_id,

            land_id,

            aquaculture_type,

            fish_species_id,

            prawn_species_id,

            stock_quantity,

            culture_days,

            pond_area,

            area_unit_id,

            feed_consumed,

            feed_unit_id,

            fcr,

            remarks,

            crops_per_year,
            net_biomass_gain,
            feed_crude_protein,
            feed_carbon_content,
            dob_proportion,
            dob_emission_factor,
            gnc_emission_factor,
            n_retention_efficiency,
            c_retention_efficiency,
            n2o_n_emission_factor,
            gwp_ch4,
            gwp_n2o,
            diesel_emission_factor,
            diesel_baseline,
            diesel_improved,
            baseline_anaerobic_fraction,
            improved_anaerobic_fraction,
            fcr_improvement,
            measured_ch4_baseline,
            measured_ch4_improved,
            measured_n2o_baseline,
            measured_n2o_improved,

            created_at,

            updated_at

        )

        VALUES
        (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $11,

            $12,

            $13,

            $14,

            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )
        RETURNING *;

    `;

    const result = await pool.query(query, [

        uuidv4(),

        registrationId,

        landId,

        aquacultureType,

        fishSpeciesId,

        prawnSpeciesId,

        stockQuantity,

        cultureDays,

        pondArea,

        areaUnitId,

        feedConsumed,

        feedUnitId,

        fcr,

        remarks,

        cropsPerYear !== undefined ? Number(cropsPerYear) : 1.5,
        netBiomassGain !== undefined ? Number(netBiomassGain) : 198.0,
        feedCrudeProtein !== undefined ? Number(feedCrudeProtein) : 0.28,
        feedCarbonContent !== undefined ? Number(feedCarbonContent) : 0.40,
        dobProportion !== undefined ? Number(dobProportion) : 0.9091,
        dobEF !== undefined ? Number(dobEF) : 0.4,
        gncEF !== undefined ? Number(gncEF) : 1.2,
        nRetentionEfficiency !== undefined ? Number(nRetentionEfficiency) : 0.25,
        cRetentionEfficiency !== undefined ? Number(cRetentionEfficiency) : 0.22,
        n2oN_EF !== undefined ? Number(n2oN_EF) : 0.0060,
        gwpCH4 !== undefined ? Number(gwpCH4) : 28.0,
        gwpN2O !== undefined ? Number(gwpN2O) : 265.0,
        dieselEF !== undefined ? Number(dieselEF) : 3.0,
        dieselBaseline !== undefined ? Number(dieselBaseline) : 2000.0,
        dieselImproved !== undefined ? Number(dieselImproved) : 1600.0,
        baselineAnaerobicFraction !== undefined ? Number(baselineAnaerobicFraction) : 0.20,
        improvedAnaerobicFraction !== undefined ? Number(improvedAnaerobicFraction) : 0.08,
        fcrImprovement !== undefined ? Number(fcrImprovement) : 0.10,
        measuredCH4Baseline !== undefined && measuredCH4Baseline !== null ? Number(measuredCH4Baseline) : null,
        measuredCH4Improved !== undefined && measuredCH4Improved !== null ? Number(measuredCH4Improved) : null,
        measuredN2OBaseline !== undefined && measuredN2OBaseline !== null ? Number(measuredN2OBaseline) : null,
        measuredN2OImproved !== undefined && measuredN2OImproved !== null ? Number(measuredN2OImproved) : null

    ]);

    return result.rows[0];

};

/*
====================================================
Save Carbon Calculation
====================================================
*/

export const saveCarbonCalculation = async (data) => {

    const {

        registrationId,

        annualCarbonSequestration,

        carbonCredits,

        carbonRate,

        estimatedValue

    } = data;

    const query = `

        INSERT INTO cpay.carbon_calculation
        (

            calculation_id,

            registration_id,

            land_id,

            estimated_co2,

            carbon_credits,

            market_rate,

            market_value,

            calculated_at,

            source_type,

            formula_version,

            created_at,

            updated_at

        )

        VALUES
        (

            $1,

            $2,

            (SELECT land_id FROM cpay.land_details WHERE registration_id = $2 LIMIT 1),

            $3,

            $4,

            $5,

            $6,

            CURRENT_TIMESTAMP,

            'WIZARD',

            '1.0',

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )

        ON CONFLICT (registration_id)

        DO UPDATE SET

            estimated_co2 = EXCLUDED.estimated_co2,

            carbon_credits = EXCLUDED.carbon_credits,

            market_rate = EXCLUDED.market_rate,

            market_value = EXCLUDED.market_value,

            calculated_at = CURRENT_TIMESTAMP,

            updated_at = CURRENT_TIMESTAMP

        RETURNING *;

    `;

    const result = await pool.query(

        query,

        [

            uuidv4(),

            registrationId,

            annualCarbonSequestration,

            carbonCredits,

            carbonRate,

            estimatedValue

        ]

    );

    return result.rows[0];

};

/*
====================================================
Get Plantation Details
====================================================
*/

export const getPlantationDetails = async (registrationId) => {

    const query = `

        SELECT

            pd.number_of_plants,

            pd.plantation_age,

            pc.category_name,

            ps.carbon_factor

        FROM cpay.plantation_details pd

        INNER JOIN cpay.plantation_categories pc

            ON pd.plantation_category_id = pc.plantation_category_id

        INNER JOIN cpay.plant_species ps

            ON pd.plant_species_id = ps.plant_species_id

        WHERE pd.registration_id = $1

        LIMIT 1;

    `;

    const result = await pool.query(query,[registrationId]);

    return result.rows[0];

};

/*
====================================================
Get Current Carbon Rate
====================================================
*/

export const getCurrentCarbonRate = async () => {

    const query = `

        SELECT

            rate_per_credit AS carbon_rate

        FROM cpay.carbon_rate_master

        WHERE is_active = TRUE

        ORDER BY created_at DESC

        LIMIT 1;

    `;

    const result = await pool.query(query);

    return result.rows[0];

};

/*
====================================================
Save Consent
====================================================
*/

export const saveConsent = async (data) => {

    const {

        registrationId,

        consentAccepted,

        declarationAccepted

    } = data;

    const query = `

        INSERT INTO cpay.consent_details
        (

            consent_id,

            registration_id,

            accept_terms,

            accept_privacy,

            accept_declaration,

            consent_date,

            ip_address,

            declaration_version,

            created_at,

            updated_at

        )

        VALUES
        (

            $1,

            $2,

            $3,

            TRUE,

            $4,

            CURRENT_TIMESTAMP,

            '127.0.0.1',

            '1.0',

            CURRENT_TIMESTAMP,

            CURRENT_TIMESTAMP

        )

        ON CONFLICT (registration_id)

        DO UPDATE SET

            accept_terms = EXCLUDED.accept_terms,

            accept_privacy = EXCLUDED.accept_privacy,

            accept_declaration = EXCLUDED.accept_declaration,

            consent_date = CURRENT_TIMESTAMP,

            updated_at = CURRENT_TIMESTAMP
        RETURNING *;

    `;

    const result = await pool.query(query, [

        uuidv4(),

        registrationId,

        consentAccepted,

        declarationAccepted

    ]);

    return result.rows[0];

};

/*
====================================================
Registration Preview Helper Functions
====================================================
*/

export const getIndividualDetails = async (registrationId) => {
    const query = `
        SELECT ind.* FROM cpay.individual_details ind
        JOIN cpay.registration r ON r.user_id = ind.user_id
        WHERE r.registration_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

export const getOrganizationDetails = async (registrationId) => {
    const query = `
        SELECT org.* FROM cpay.organization_details org
        JOIN cpay.registration r ON r.user_id = org.user_id
        WHERE r.registration_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

export const getGovernmentDetails = async (registrationId) => {
    const query = `
        SELECT gov.* FROM cpay.government_details gov
        JOIN cpay.registration r ON r.user_id = gov.user_id
        WHERE r.registration_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

export const getAddressDetails = async (registrationId) => {
    const query = `
        SELECT 
            ad.*,
            s.state_name,
            d.district_name,
            m.mandal_name,
            v.village_name
        FROM cpay.address_details ad
        LEFT JOIN cpay.states s ON ad.state_id = s.state_id
        LEFT JOIN cpay.districts d ON ad.district_id = d.district_id
        LEFT JOIN cpay.mandals m ON ad.mandal_id = m.mandal_id
        LEFT JOIN cpay.villages v ON ad.village_id = v.village_id
        WHERE ad.registration_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

export const getLandDetails = async (registrationId) => {
    const query = `
        SELECT 
            ld.*,
            lt.land_type_name,
            u.unit_name,
            u.unit_symbol
        FROM cpay.land_details ld
        LEFT JOIN cpay.land_types lt ON ld.land_type_id = lt.land_type_id
        LEFT JOIN cpay.units u ON ld.unit_id = u.unit_id
        WHERE ld.registration_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

export const getPlantationDetailsPreview = async (registrationId) => {
    const query = `
        SELECT 
            pd.*,
            pc.category_name as plantation_category_name,
            u.unit_name as area_unit_name,
            ps.common_name as plant_species_name
        FROM cpay.plantation_details pd
        LEFT JOIN cpay.plantation_categories pc ON pd.plantation_category_id = pc.plantation_category_id
        LEFT JOIN cpay.units u ON pd.area_unit_id = u.unit_id
        LEFT JOIN cpay.plant_species ps ON pd.plant_species_id = ps.plant_species_id
        WHERE pd.registration_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

export const getAquacultureDetailsPreview = async (registrationId) => {
    const query = `
        SELECT 
            ad.*,
            fs.species_name as fish_species_name,
            ps.species_name as prawn_species_name,
            u1.unit_name as area_unit_name,
            u2.unit_name as feed_unit_name
        FROM cpay.aquaculture_details ad
        LEFT JOIN cpay.fish_species fs ON ad.fish_species_id = fs.fish_species_id
        LEFT JOIN cpay.prawn_species ps ON ad.prawn_species_id = ps.prawn_species_id
        LEFT JOIN cpay.units u1 ON ad.area_unit_id = u1.unit_id
        LEFT JOIN cpay.units u2 ON ad.feed_unit_id = u2.unit_id
        WHERE ad.registration_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

export const getCarbonCalculation = async (registrationId) => {
    const query = `
        SELECT * FROM cpay.carbon_calculation
        WHERE registration_id = $1
        ORDER BY calculated_at DESC
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

export const getConsentDetails = async (registrationId) => {
    const query = `
        SELECT * FROM cpay.consent_details
        WHERE registration_id = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [registrationId]);
    return result.rows[0];
};

/*
====================================================
Registration Preview (Enterprise Version)
====================================================
*/

export const getRegistrationPreview = async (registrationId) => {

    /*
    ============================================
    Step 1 : Registration Information
    ============================================
    */

    const registrationQuery = `

        SELECT

            r.registration_id,

            r.application_number,

            r.application_status,

            r.current_step,

            ut.user_type_name

        FROM cpay.registration r

        INNER JOIN cpay.user_types ut

            ON r.user_type_id = ut.user_type_id

        WHERE r.registration_id = $1;

    `;

    const registrationResult = await pool.query(

        registrationQuery,

        [registrationId]

    );

    if (registrationResult.rows.length === 0) {

        return null;

    }

    const registration = registrationResult.rows[0];

    /*
    ============================================
    Step 2 : Applicant Details
    ============================================
    */

    let applicant = {};

    const uTypeUpper = (registration.user_type_name || '').toUpperCase();

    switch (uTypeUpper) {

        case "INDIVIDUAL":

        case "INDIVIDUALS":

        case "SELLER":

        case "FARMER":

        case "FPO":

            applicant = await getIndividualDetails(registrationId);

            break;

        case "ORGANIZATION":

        case "NGO":

        case "COMMUNITY":

            applicant = await getOrganizationDetails(registrationId);

            break;

        case "GOVERNMENT":

        case "PUBLIC_SECTOR":

            applicant = await getGovernmentDetails(registrationId);

            break;

        default:

            applicant = (await getIndividualDetails(registrationId)) ||
                        (await getOrganizationDetails(registrationId)) ||
                        (await getGovernmentDetails(registrationId)) ||
                        {};

    }

    if (!applicant || Object.keys(applicant).length === 0) {
        applicant = (await getIndividualDetails(registrationId)) ||
                    (await getOrganizationDetails(registrationId)) ||
                    (await getGovernmentDetails(registrationId)) ||
                    {};
    }

    /*
    ============================================
    Step 3 : Address
    ============================================
    */

    const address = await getAddressDetails(registrationId);

    /*
    ============================================
    Step 4 : Land
    ============================================
    */

    const land = await getLandDetails(registrationId);

    /*
    ============================================
    Step 5 : Plantation
    ============================================
    */

    const plantation = await getPlantationDetailsPreview(registrationId);

    /*
    ============================================
    Step 6 : Aquaculture
    ============================================
    */

    const aquaculture = await getAquacultureDetailsPreview(registrationId);

    /*
    ============================================
    Step 7 : Carbon Calculation
    ============================================
    */

    const carbon = await getCarbonCalculation(registrationId);

    /*
    ============================================
    Step 8 : Consent
    ============================================
    */

    const consent = await getConsentDetails(registrationId);

    /*
    ============================================
    Final Response
    ============================================
    */

    return {

        registration,

        applicant,

        address,

        land,

        plantation,

        aquaculture,

        carbon,

        consent

    };

};

/*
====================================================
Get Registration
====================================================
*/

export const getRegistrationById = async (

    registrationId

) => {

    const query = `

        SELECT

            registration_id,

            application_status

        FROM cpay.registration

        WHERE registration_id = $1;

    `;

    const result = await pool.query(

        query,

        [

            registrationId

        ]

    );

    return result.rows[0];

};

/*
====================================================
Submit Registration
====================================================
*/

export const submitRegistration = async (

    registrationId

) => {

    const query = `

        UPDATE cpay.registration

        SET

            application_status='SUBMITTED',

            submitted_at=CURRENT_TIMESTAMP,

            updated_at=CURRENT_TIMESTAMP,

            current_step=8

        WHERE registration_id=$1;

    `;

    await pool.query(

        query,

        [

            registrationId

        ]

    );

};

/*
====================================================
Application History
====================================================
*/

export const addApplicationHistory = async (

    data

) => {

    const {

        registrationId,

        status,

        remarks,

        updatedBy

    } = data;

    const query = `

        INSERT INTO cpay.application_status_history
        (

            history_id,

            registration_id,

            current_status,

            previous_status,

            remarks,

            changed_by,

            changed_at

        )

        VALUES
        (

            $1,

            $2,

            $3,

            'DRAFT',

            $4,

            $5,

            CURRENT_TIMESTAMP

        );

    `;

    await pool.query(

        query,

        [

            uuidv4(),

            registrationId,

            status,

            remarks,

            updatedBy

        ]

    );

};

/*
====================================================
Get Registration By User ID
====================================================
*/

export const getRegistrationByUserId = async (userId) => {

    const query = `
        SELECT * FROM cpay.registration
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];

};

/*
====================================================
Update Current Step
====================================================
*/

export const updateCurrentStep = async (registrationId, step) => {

    const query = `
        UPDATE cpay.registration
        SET current_step = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE registration_id = $1;
    `;

    await pool.query(query, [registrationId, step]);

};
