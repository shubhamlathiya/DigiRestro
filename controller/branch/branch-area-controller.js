const tokenController = require("../token-controller");
const mongoose = require("mongoose");
module.exports = {
    viewArea: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const areas = await areaSchema.find({
                branch_id: new mongoose.Types.ObjectId(branchId), deleted: false
            });

            res.render(`${appPath}/branch/master-area.ejs`, {
                area: areas
            });

        } catch (error) {
            console.error("Error in /branch/viewBranch:", error);
        }
    }, addArea: async (req, res) => {
        try {

            const branchId = await tokenController.getBranchID(req, res);

            const existingData = await areaSchema.find({
                $and: [{area_name: req.body.area_name}, {deleted: true}, {branch_id: new mongoose.Types.ObjectId(branchId)}]
            });

            if (!_.isEmpty(existingData)) {
                console.log("Error: area with similar data already exists");
                res.redirect("/branch/master-area");
            } else {
                const newArea = new areaSchema({
                    area_name: req.body.area_name, branch_id: new mongoose.Types.ObjectId(branchId)
                });

                const result = await newArea.save();

                if (!result) {
                    console.log("data can't insert into database")
                } else {
                    console.log("area added successfully")
                }
                res.redirect("/branch/master-area")
            }
        } catch (error) {
            console.error("Error in /branch/addArea:", error);
        }
    }, updateArea: async (req, res) => {

        const branchId = await tokenController.getBranchID(req, res);

        console.log(req.body)

        const existingData = await areaSchema.find({
            $and: [{area_name: req.body.area_name}, {branch_id: new mongoose.Types.ObjectId(branchId)}]
        });

        if (!_.isEmpty(existingData)) {
            console.log("Error: area with similar data already exists");
            res.redirect("/branch/master-area");
        } else {
            const result = await areaSchema.updateOne({_id: new mongoose.Types.ObjectId(req.body.area_id)}, {
                $set: {
                    area_name: req.body.area_name,
                },
            });

            console.log(result);

            if (result.modifiedCount > 0) {
                // console.log("Data updated successfully");
                res.redirect("/branch/master-area");
            } else {
                console.log("Error: area with the given _id not found or no changes were made");
            }
        }
    }, activeAndDeactive: async (req, res) => {
        // console.log(req.query.id);
        // console.log(req.query.value);

        let newValue;
        if (req.query.value === 'true') {
            newValue = false;
        } else {
            newValue = true;
        }


        // console.log("New Value: " + newValue);

        try {
            const result = await areaSchema.updateOne({_id: new mongoose.Types.ObjectId(req.query.id)}, {$set: {is_active: newValue}});

            // console.log(result);

            if (result.modifiedCount === 1) {
                res.redirect("/branch/master-area");
            } else {
                console.log(`area with ID ${req.query.id} not found or no changes needed.`);
                res.redirect("/branch/master-area");
            }

            // res.redirect("/company/manage-category");
        } catch (error) {
            console.error("Error updating area:", error);
            res.status(500).send("Internal Server Error");
        }
    }, deleteArea: async (req, res) => {
        try {
            const areaId = req.query.id;

            const area = await areaSchema.updateOne({_id: new mongoose.Types.ObjectId(areaId)}, {
                $set: {
                    is_active: false, deleted: true
                }
            })
            if (area.acknowledged === true) {
                res.status(200).json({success: true, message: 'area deleted successfully'});
            } else {
                res.status(404).json({success: false, message: 'area not found'});
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    }
}