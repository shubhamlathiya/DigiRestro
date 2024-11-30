const {setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");

module.exports = {
    companyprofileDetails: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            const usersData = await usersSchema
                .find({_id: userId})
                .select("name email_id mobile_no");
            // res.send(usersData);
            // console.log(usersData);
            res.render(`${appPath}/company/profile.ejs`, {
                usersData, formattedCompanies: formattedCompanies,
                companyId: companyId, selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo
            });
        } catch (error) {
            // res.send("viewProfile error:" , error);
            console.log("viewProfile error: ", error);
        }
    },
    companyFetchUserName: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            const userName = await usersSchema.find({_id: userId}).select("name");
            // console.log(userName[0].name);
            res.status(200).send({
                success: true,
                userName: userName[0].name.toString(),
            });
        } catch (error) {
            console.log("fetchUserName error: ", error);
        }
    },
    companyUpdateProfileDetails: async (req, res) => {
        const userId = await tokenController.getUserID(req, res);
        const updateUsersData = await usersSchema.updateOne(
            {_id: userId},
            {
                $set: {
                    name: req.body.name,
                    email_id: req.body.email_id,
                    mobile_no: req.body.mobile_no
                },
            }
        );
        // res.send(usersData);
        if (updateUsersData.acknowledged) {
            res.redirect("/company/profile");
        } else {
            console.log("Data is ont update");
        }
        // console.log(req.body);
    },
};
