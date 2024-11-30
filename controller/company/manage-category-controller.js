const {setDefaultCompany, fetchAndFormatCompanies, handleAuthRedirect} = require("./company-helper");
const mongoose = require("mongoose");
module.exports = {
    viewCategory: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            console.log("Company Id in session category: " + companyId)

            try {
                const foodCategoryCounts = await foodCategorySchema.aggregate([{
                    $match: {
                        company_id: new mongoose.Types.ObjectId(companyId),
                        deleted: {$ne: true}
                    }
                }, {
                    $lookup: {
                        from: "food_sub_category", let: {categoryId: "$_id"}, pipeline: [{
                            $match: {
                                $expr: {$eq: ["$food_category_id", "$$categoryId"]}
                            }
                        }, {
                            $group: {
                                _id: null, count: {$sum: 1}
                            }
                        }], as: "subCategoryCount"
                    }
                }, {
                    $project: {
                        _id: "$_id",
                        category_name: "$category_name",
                        is_active: "$is_active",
                        count: {$ifNull: [{$arrayElemAt: ["$subCategoryCount.count", 0]}, 0]}
                    }
                }]);

                // console.log(foodCategoryCounts);

                res.render(`${appPath}/company/master-category.ejs`, {
                    formattedCompanies: formattedCompanies,
                    foodCategory: foodCategoryCounts,
                    companyId: companyId,
                    selectedLegalName: req.session.selectedLegalName,
                    selectedCompanyLogo: req.session.selectedCompanyLogo,
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({error: 'Internal Server Error'});
            }
        } catch (error) {
            console.error("Error in manage-category: ", error);
        }
    }, addCategory: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);

            const companyId = req.session.selectedCompanyId;
            const categoryName = req.body.category_name;

            const existingData = await foodCategorySchema.find({
                $and: [{category_name: req.body.category_name}, {company_id: companyId}]
            });

            if (!_.isEmpty(existingData)) {
                console.log("Error: Category with similar data already exists");
            } else {
                // If data doesn't exist, create and save the new category
                const newCategory = new foodCategorySchema({
                    category_name: categoryName, company_id: companyId,
                });

                const result = await newCategory.save();

                if (!result) {
                    console.log("Error: Failed to save category");
                    return res.status(500).send("Failed to save category");
                }
            }

            // Redirect or render as needed
            res.redirect("/company/manage-category");

        } catch (error) {
            console.error("Error in add-category:", error);
        }
    }, updateCategory: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            const companyId = req.session.selectedCompanyId;

            console.log("Company ID: " + companyId);
            console.log("User ID: " + userId);

            console.log(req.body);

            const existingData = await foodCategorySchema.find({
                $and: [{category_name: req.body.category_name}, {company_id: new mongoose.Types.ObjectId(companyId)}]
            });

            if (!_.isEmpty(existingData)) {
                console.log("Error: food Category with similar data already exists");
                res.redirect("/company/manage-category");
            } else {
                const result = await foodCategorySchema.updateOne({_id: new mongoose.Types.ObjectId(req.body.category_id)}, {
                    $set: {
                        category_name: req.body.category_name,
                    },
                });

                console.log(result);

                if (result.modifiedCount > 0) {
                    // console.log("Data updated successfully");
                    res.redirect("/company/manage-category");
                } else {
                    console.log("Error: food Category with the given _id not found or no changes were made");
                }
            }
        } catch (error) {
            console.error("Error in update-category:", error);
        }
    },
    activeAndDeactive: async (req, res) => {
        console.log(req.query.id);
        console.log(req.query.value);

        let newValue;
        if (req.query.value === 'true') {
            newValue = false;
        } else {
            newValue = true;
        }

        // console.log("New Value: " + newValue);

        try {
            const result = await foodCategorySchema.updateOne({_id: new mongoose.Types.ObjectId(req.query.id)}, {$set: {is_active: newValue}});

            // console.log(result);

            if (result.modifiedCount === 1) {
                res.redirect("/company/manage-category");
            } else {
                console.log(`Category with ID ${req.query.id} not found or no changes needed.`);
                res.redirect("/company/manage-category");
            }

            // res.redirect("/company/manage-category");
        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const categoryId = req.query.id;

            const category = await foodCategorySchema.updateOne({_id: new mongoose.Types.ObjectId(categoryId)}, {
                $set: {
                    is_active: false, deleted: true
                }
            })
            if (category.acknowledged === true) {
                res.status(200).json({success: true, message: 'category deleted successfully'});
            } else {
                res.status(404).json({success: false, message: 'category not found'});
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    }
}