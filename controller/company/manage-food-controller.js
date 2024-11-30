const {handleAuthRedirect, setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");
const mongoose = require("mongoose");
module.exports = {
    viewFood: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            console.log("Company Id in session master-food: " + companyId)

            // Fetch food categories for the company
            const foodCategories = await foodCategorySchema.find({
                company_id: new mongoose.Types.ObjectId(companyId), is_active: true
            });

            // console.log("foodCategories: " +foodCategories)

            // Fetch food subcategories based on food categories
            const foodSubCategories = await foodSubCategorySchema.find({
                food_category_id: {$in: foodCategories.map(category => category._id)}, is_active: true
            });

            // console.log("foodSubCategories: " +foodSubCategories)

            // Fetch food items based on food subcategories
            const foodItems = await foodItemSchema.find({
                food_sub_category_id: {$in: foodSubCategories.map(subCategory => subCategory._id)}
            });

            // console.log("fooditem: " +foodItems)

            // Fetch food sub items based on food items
            const foodSubItems = await foodSubItemSchema.find({
                food_item_id: {$in: foodItems.map(item => item._id)}
            });

            // console.log("foodsubitem: " + foodSubItems)

            res.render(`${appPath}/company/master-food.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                foodSubCategories: foodSubCategories,
                foodItems: foodItems,
                foodSubItems: foodSubItems,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo,
            });

        } catch (error) {
            console.error("Error in /company/master-food:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    addFoodItem: async (req, res) => {
        try {

            const foodItemData = {
                item_name: req.body.item_name,
                description: req.body.description,
                food_sub_category_id: new mongoose.Types.ObjectId(req.body.food_sub_category_id),
                food_type: req.body.food_type === 'Veg' ? 1 : (req.body.food_type === 'Egg' ? 2 : 3),
                is_active: true,
            };

            const newFoodItem = new foodItemSchema(foodItemData);
            const savedFoodItem = await newFoodItem.save();

            // console.log(savedFoodItem);

            for (let i = 1; i <= parseInt(req.body.no_of_sub_food); i++) {
                const subItemData = {
                    sub_item_name: req.body[`sub_item_name_${i}`],
                    price: parseFloat(req.body[`price_${i}`]),
                    food_item_id: new mongoose.Types.ObjectId(savedFoodItem._id),
                    is_active: true,
                };

                const newFoodSubItem = new foodSubItemSchema(subItemData);
                await newFoodSubItem.save();
                // console.log(newFoodSubItem);
            }

            // console.log('Data inserted successfully');
            res.redirect("/company/manage-food");

        } catch (error) {
            console.error("Error in /company/add-food-item:", error);
            res.status(500).send("Internal Server Error");
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
            const result = await foodItemSchema.updateOne({_id: new mongoose.Types.ObjectId(req.query.id)}, {$set: {is_active: newValue}});

            // console.log(result);

            if (result.modifiedCount === 1) {
                res.redirect("/company/manage-food");
            } else {
                console.log(`food Item with ID ${req.query.id} not found or no changes needed.`);
                res.redirect("/company/manage-food");
            }

            // res.redirect("/company/manage-category");
        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}