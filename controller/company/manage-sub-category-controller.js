const {setDefaultCompany, fetchAndFormatCompanies, handleAuthRedirect} = require("./company-helper");
const mongoose = require("mongoose");
module.exports = {
    viewSubCategory: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);


            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            console.log("Company Id in session sub-category: " + companyId)

            const foodCategories = await foodCategorySchema.find({
                company_id: new mongoose.Types.ObjectId(companyId), is_active: true
            });


            const result = await foodCategorySchema.aggregate([{
                $match: {
                    company_id: new mongoose.Types.ObjectId(companyId), is_active: true
                }
            }, {
                $lookup: {
                    from: "food_sub_category",
                    localField: "_id",
                    foreignField: "food_category_id",
                    as: "foodSubCategories"
                }
            }, {
                $unwind: "$foodSubCategories"
            }, {
                $lookup: {
                    from: "food_item",
                    localField: "foodSubCategories._id",
                    foreignField: "food_sub_category_id",
                    as: "foodItems"
                }
            }, {
                $lookup: {
                    from: "food_category",
                    localField: "foodSubCategories.food_category_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
                {
                    $match: {
                        "foodSubCategories.deleted": {$ne: true},
                        "category.deleted": {$ne: true},
                        "foodItems.deleted": {$ne: true},
                    }
                },
                {
                    $project: {
                        _id: "$foodSubCategories._id",
                        category_name: {$arrayElemAt: ["$category.category_name", 0]},
                        food_category_id: {$arrayElemAt: ["$category._id", 0]},
                        sub_category_name: "$foodSubCategories.sub_category_name",
                        is_active: "$foodSubCategories.is_active",
                        totalFood: {$size: "$foodItems"}
                    }
                }]);


            console.log(result)

            res.render(`${appPath}/company/master-sub-category.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                foodSubCategories: result,
                foodCategories: foodCategories,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo,
            });
        } catch (error) {
            console.error("Error in manage-sub-category: ", error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    },
    addSubCategory: async (req, res) => {
        try {
            // console.log(req.body);

            const existingData = await foodSubCategorySchema.find({
                $and: [{sub_category_name: req.body.sub_category_name}, {food_category_id: req.body.food_category_id}]
            });

            if (!_.isEmpty(existingData)) {
                console.log("Error: Sub Category with similar data already exists");
            } else {
                const newSubCategory = new foodSubCategorySchema(req.body);
                const result = await newSubCategory.save();

                // console.log(result);

                if (!result) {
                    console.log("Error: Failed to save Sub category");
                    return res.status(500).send("Failed to save Sub category");
                }
            }

            // Redirect or render as needed
            res.redirect("/company/manage-sub-category");
        } catch (error) {
            console.error("Error in /company/add-sub-category:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    updateSubCategory: async (req, res) => {
        try {
            console.log(req.body);

            const existingData = await foodCategorySchema.find({
                $and: [{sub_category_name: req.body.sub_category_name}, {food_category_id: new mongoose.Types.ObjectId(req.body.food_category_id)}]
            });

            if (!_.isEmpty(existingData)) {
                console.log("error: food Category with similar data already exists");
                res.redirect("/company/manage-category");
            } else {
                const result = await foodSubCategorySchema.updateOne({_id: new mongoose.Types.ObjectId(req.body.food_sub_category_id)}, {
                    $set: {
                        sub_category_name: req.body.sub_category_name,
                        food_category_id: new mongoose.Types.ObjectId(req.body.food_category_id)
                    }
                });

                console.log(result);

                if (result.modifiedCount > 0) {
                    console.log("Data updated successfully");
                    res.redirect("/company/manage-sub-category");
                } else {
                    console.log("Error: food Category with the given _id not found or no changes were made");
                    res.redirect("/company/manage-sub-category");
                }
            }

        } catch (error) {
            console.error("Error in /company/update-sub-category:", error);
            res.status(500).send("Internal Server Error");
        }
    }, activeAndDeactive: async (req, res) => {
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
            const result = await foodSubCategorySchema.updateOne({_id: new mongoose.Types.ObjectId(req.query.id)}, {$set: {is_active: newValue}});

            // console.log(result);

            if (result.modifiedCount === 1) {
                res.redirect("/company/manage-sub-category");
            } else {
                console.log(`Sub Category with ID ${req.query.id} not found or no changes needed.`);
                res.redirect("/company/manage-sub-category");
            }
            // res.redirect("/company/manage-category");
        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    deleteSubCategory: async (req, res) => {
        try {
            const subcategoryId = req.query.id;

            const subCategory = await foodSubCategorySchema.updateOne({_id: new mongoose.Types.ObjectId(subcategoryId)}, {
                $set: {
                    is_active: false, deleted: true
                }
            })
            if (subCategory.acknowledged === true) {
                res.status(200).json({success: true, message: 'Sub category deleted successfully'});
            } else {
                res.status(404).json({success: false, message: 'Sub category not found'});
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    }
}