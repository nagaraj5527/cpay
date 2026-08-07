import * as registrationService from '../services/registration.service.js';

export const startRegistration = async (req, res) => {

    try {

        const result = await registrationService.startRegistration(
            req.user,
            req.body
        );

        return res.status(201).json(result);

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=========================================================
Save Personal Details
=========================================================
*/

export const savePersonalDetails = async (req, res) => {

    try {

        const result = await registrationService.savePersonalDetails(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=========================================================
Save Organization Details
=========================================================
*/

export const saveOrganizationDetails = async (req, res) => {

    try {

        const result = await registrationService.saveOrganizationDetails(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Organization Details Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const saveGovernmentDetails = async (req,res)=>{

    try{

        const result = await registrationService.saveGovernmentDetails(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    }catch(error){

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

/*
=========================================================
Save Address Details
=========================================================
*/

export const saveAddressDetails = async (req, res) => {

    try {

        const result = await registrationService.saveAddressDetails(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Save Address Details Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=========================================================
Save Land Details
=========================================================
*/

export const saveLandDetails = async (req, res) => {

    try {

        const result = await registrationService.saveLandDetails(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Save Land Details Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Internal Server Error"

        });

    }

};

/*
=========================================================
Save Plantation Details
=========================================================
*/

export const savePlantationDetails = async (req, res) => {

    try {

        const result = await registrationService.savePlantationDetails(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Save Plantation Details Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Internal Server Error"

        });

    }

};

/*
=========================================================
Save Aquaculture Details
=========================================================
*/

export const saveAquacultureDetails = async (req, res) => {

    try {

        const result = await registrationService.saveAquacultureDetails(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Save Aquaculture Details Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Internal Server Error"

        });

    }

};

/*
=========================================================
Save Carbon Calculation
=========================================================
*/

export const saveCarbonCalculation = async (req, res) => {

    try {

        const result = await registrationService.saveCarbonCalculation(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Carbon Calculation Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Internal Server Error"

        });

    }

};

/*
=========================================================
Save Consent
=========================================================
*/

export const saveConsent = async (req, res) => {

    try {

        const result = await registrationService.saveConsent(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Save Consent Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Internal Server Error"

        });

    }

};

/*
=========================================================
Preview Registration
=========================================================
*/

export const previewRegistration = async (req, res) => {

    try {

        const result = await registrationService.previewRegistration(

            req.user,

            req.params.registrationId

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Preview Registration Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Internal Server Error"

        });

    }

};

/*
=========================================================
Final Submit
=========================================================
*/

export const submitRegistration = async (req, res) => {

    try {

        const result = await registrationService.submitRegistration(

            req.user,

            req.body

        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("Submit Registration Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Internal Server Error"

        });

    }

};

/*
=========================================================
Get Logged In User's Active Registration
=========================================================
*/

export const getUserRegistration = async (req, res) => {

    try {

        const result = await registrationService.getUserRegistrationStatus(req.user);

        return res.status(200).json(result);

    } catch (error) {

        console.error("Get User Registration Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message || "Internal Server Error"

        });

    }

};

export const getPincodeDetails = async (req, res) => {
    try {
        const result = await registrationService.getPincodeDetails(req.params.pincode);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Pincode Details Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getLandWeather = async (req, res) => {
    try {
        const result = await registrationService.getLandWeather(req.params.registrationId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Land Weather Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const calculateCarbonLive = async (req, res) => {
    try {
        const result = await registrationService.calculateCarbonLive(req.user, req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Calculate Carbon Live Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const syncParcels = async (req, res) => {
    try {
        const result = await registrationService.syncParcels(req.user, req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Sync Parcels Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getParcelsList = async (req, res) => {
    try {
        const result = await registrationService.getParcelsList(req.user, req.params.registrationId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Parcels List Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const submitFullRegistration = async (req, res) => {
    try {
        const result = await registrationService.submitFullRegistration(req.user, req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Submit Full Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getUserAssets = async (req, res) => {
    try {
        const result = await registrationService.getUserAssets(req.user);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get User Assets Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const addAsset = async (req, res) => {
    try {
        const result = await registrationService.addAsset(req.user, req.body);
        return res.status(201).json(result);
    } catch (error) {
        console.error("Add Asset Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getReport = async (req, res) => {
    try {
        const result = await registrationService.getReportData(req.user, req.params.registrationId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Get Report Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const submitBuyerRegistration = async (req, res) => {
    try {
        const result = await registrationService.submitBuyerRegistration(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Submit Buyer Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const checkSurvey = async (req, res) => {
    try {
        const survey = req.query.survey || req.query.surveyNumber;
        const subDiv = req.query.subDivision || req.query.subDivisionNumber || '';
        const result = await registrationService.checkSurvey(req.user, survey, subDiv);
        if (result.exists) {
            return res.status(409).json({
                success: false,
                exists: true,
                message: result.message
            });
        }
        return res.status(200).json({
            success: true,
            exists: false,
            message: result.message
        });
    } catch (error) {
        console.error("Check Survey Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};


