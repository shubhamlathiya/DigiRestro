const {handleAuthRedirect, setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");
const mongoose = require("mongoose");
module.exports = {
    viewCompany: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            // Set default company and check if it's already set
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            console.log("Company Id in session dashboard: " + companyId);

            const companies = await companySchema.find({user_id: userId, deleted: false});

            const companyIds = companies.map(company => company._id);

            const companyDetailsWithBranchCount = await companySchema.aggregate([{
                $match: {_id: {$in: companyIds}} // Match companies with specified user_id and not deleted
            }, {
                $lookup: {
                    from: "branch", localField: "_id", foreignField: "company_id", as: "branches" // Lookup all branches associated with the company
                }
            }, {
                $addFields: {
                    totalBranch: {$size: "$branches"} // Add a field to store the total number of branches
                }
            }, {
                $project: {
                    _id: 1,
                    company_name: 1,
                    legal_name: 1,
                    user_id: 1,
                    deleted: 1,
                    created_at: 1,
                    updated_at: 1,
                    deleted_at: 1,
                    company_logo: 1,
                    totalBranch: 1
                }
            }]);

            // console.log(companyDetailsWithBranchCount)

            res.render(`${appPath}/company/master-company.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                companies: companyDetailsWithBranchCount,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo, // isDefaultCompanySet: isDefaultCompanySet, // Add this line to pass the information to the view
            });

        } catch (error) {
            console.error("Error in /company/master-company:", error);
            res.status(500).send("Internal Server Error");
        }
    }, addCompany: async (req, res) => {
        try {
            const {company_name, legal_name} = req.body;
            // console.log(req.file)
            const logoPath = req.file ? '/uploads/' + req.file.filename : '';

            console.log("Stored Path in Database: " + logoPath);
            console.log(logoPath);
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            // console.log("add company: " + userId)

            // console.log(logoPath)
            const newCompany = new companySchema({
                company_logo: logoPath,
                company_name: company_name,
                legal_name: legal_name,
                user_id: new mongoose.Types.ObjectId(userId),
            });

            const result = await newCompany.save();

            // console.log(result);
            if (!result) {
                console.log("data can't insert into database")
            } else {
                console.log("Company added successfully")
            }
            res.redirect("/company/manage-company")
            // res.status(201).json({message: 'Company added successfully'});
        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Internal Server Error'});
        }

    }, updateCompany: async (req, res) => {
        try {

            const userId = await tokenController.getUserID(req, res);
            const companyId = req.session.selectedCompanyId;

            console.log(req.body);

            const existingData = await companySchema.find({
                $and: [{company_name: req.body.company_name}, {legal_name: req.body.legal_name}, {user_id: new mongoose.Types.ObjectId(userId)}]
            });

            if (!_.isEmpty(existingData)) {
                console.log("Error: Company with similar data already exists");
                res.redirect("/company/manage-company");
            } else {
                const result = await companySchema.updateOne({_id: new mongoose.Types.ObjectId(req.body.company_id)}, {
                    $set: {
                        company_name: req.body.company_name, legal_name: req.body.legal_name
                    },
                });

                console.log(result);

                if (result.modifiedCount > 0) {
                    // console.log("Data updated successfully");
                    res.redirect("/company/manage-company");
                } else {
                    console.log("Error: Company with the given _id not found or no changes were made");
                }
            }
        } catch (error) {
            console.error("Error in update-Company:", error);
        }
    }, deleteCompany: async (req, res) => {
        try {
            const companyId = req.query.id;
            const userId = await tokenController.getUserID(req, res);

            console.log(companyId)
            const company = await companySchema.updateOne({_id: new mongoose.Types.ObjectId(companyId)}, {
                $set: {
                    deleted: true, deleted_at: new Date()
                }
            });
            if (company.acknowledged === true) {

                await setDefaultCompany(userId, req);

                const formattedCompanies = await fetchAndFormatCompanies(userId, req);

                // let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);


                res.status(200).json({success: true, message: 'company deleted successfully'});
            } else {
                res.status(404).json({success: false, message: 'company not found'});
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    }
}