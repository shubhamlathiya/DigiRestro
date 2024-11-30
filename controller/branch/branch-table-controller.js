const tokenController = require("../token-controller");
const mongoose = require("mongoose");
module.exports = {
    viewTable: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const areas = await areaSchema.find({
                branch_id: new mongoose.Types.ObjectId(branchId), is_active: true, deleted: false
            });

            const table = await tableOfAreaSchema.find({
                area_id: {$in: areas.map(area => area._id)}, deleted: false
            });

            function getAreaName(areaId) {
                const foundArea = areas.find(area => area._id.toString() === areaId.toString());
                return foundArea ? foundArea.area_name : 'N/A';
            }

            // console.log(table)

            res.render(`${appPath}/branch/master-table.ejs`, {
                area: areas, getAreaName: getAreaName, tables: table
            });

        } catch (error) {
            console.error("Error in /branch/viewTables:", error);
        }

    }, addTable: async (req, res) => {
        try {
            const branchId = await tokenController.getBranchID(req, res);

            const existingData = await tableOfAreaSchema.find({
                $and: [{table_name: req.body.table_name}, {branch_id: new mongoose.Types.ObjectId(branchId)}]
            });

            if (!_.isEmpty(existingData)) {
                console.log("Error: Tables with similar data already exists");
                res.redirect("/branch/master-table");
            } else {
                const newTable = new tableOfAreaSchema({
                    table_name: req.body.table_name,
                    capacity: req.body.capacity,
                    area_id: new mongoose.Types.ObjectId(req.body.area_id)
                });

                const result = await newTable.save();

                if (!result) {
                    console.log("data can't insert into database")
                } else {
                    console.log("table added successfully")
                }
                res.redirect("/branch/master-table")
            }
        } catch (error) {
            console.error("Error in /branch/addTable:", error);
        }

    }, updateTableOfArea: async (req, res) => {

        // const branchId = await tokenController.getBranchID(req, res);

        console.log(req.body)

        const existingData = await tableOfAreaSchema.find({
            $and: [{table_name: req.body.table_name}, {capacity: req.body.capacity}, {area_id: new mongoose.Types.ObjectId(req.body.area_id)}]
        });

        console.log("1")
        if (!_.isEmpty(existingData)) {
            console.log("Error: Tables with similar data already exists");
            // const error = "Error: Tables with similar data already exists";
            res.redirect("/branch/master-table");
        } else {

            console.log("2")
            const result = await tableOfAreaSchema.updateOne({_id: new mongoose.Types.ObjectId(req.body.table_id)}, {
                $set: {
                    table_name: req.body.table_name,
                    capacity: req.body.capacity,
                    area_id: new mongoose.Types.ObjectId(req.body.area_id)
                },
            });

            console.log(result);

            if (result.modifiedCount > 0) {
                // console.log("Data updated successfully");
                res.redirect("/branch/master-table");
            } else {
                console.log("Error: Tables with the given _id not found or no changes were made");
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
            const result = await tableOfAreaSchema.updateOne({_id: new mongoose.Types.ObjectId(req.query.id)}, {$set: {is_active: newValue}});

            // console.log(result);

            if (result.modifiedCount === 1) {
                res.redirect("/branch/master-table");
            } else {
                console.log(`Tables with ID ${req.query.id} not found or no changes needed.`);
                res.redirect("/branch/master-table");
            }

            // res.redirect("/company/manage-category");
        } catch (error) {
            console.error("Error updating Tables:", error);
            res.status(500).send("Internal Server Error");
        }
    }, deleteTables: async (req, res) => {
        try {
            const tableId = req.query.id;

            const table = await tableOfAreaSchema.updateOne({_id: new mongoose.Types.ObjectId(tableId)}, {
                $set: {
                    is_active: false,
                    deleted: true
                }
            })
            if (table.acknowledged === true) {
                res.status(200).json({success: true, message: 'table deleted successfully'});
            } else {
                res.status(404).json({success: false, message: 'table not found'});
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    }

}