const {handleAuthRedirect, setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");
const mongoose = require("mongoose");
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY
});


module.exports = {
    viewBranch: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);
            //
            // const branch = await branchSchema.find({company_id: new mongoose.Types.ObjectId(companyId)})

            const result = await branchSchema.aggregate([{
                $match: {"company_id": new mongoose.Types.ObjectId(companyId)}
            }, {
                $lookup: {
                    from: "purchase_subscription",
                    localField: "_id",
                    foreignField: "branch_id",
                    as: "purchase_subscription"
                }
            }, {
                $unwind: {
                    path: "$purchase_subscription", preserveNullAndEmptyArrays: true
                }
            }, {
                $sort: {"purchase_subscription._id": -1}
            }, {
                $group: {
                    _id: {
                        _id: "$_id",
                        country: "$country",
                        state: "$state",
                        city: "$city",
                        street_address: "$street_address",
                        pin_code: "$pin_code",
                        gst_no: "$gst_no",
                        branch_name: "$branch_name",
                    },
                    plan_id: {$first: "$purchase_subscription.plan_id"},
                    is_active: {$first: "$purchase_subscription.is_active"},
                    start_date: {$first: "$purchase_subscription.start_date"},
                    end_date: {$first: "$purchase_subscription.end_date"}
                }
            }, {
                $project: {
                    "_id": "$_id._id",
                    "country": "$_id.country",
                    "state": "$_id.state",
                    "city": "$_id.city",
                    "street_address": "$_id.street_address",
                    "pin_code": "$_id.pin_code",
                    "gst_no": "$_id.gst_no",
                    "branch_name": "$_id.branch_name",
                    "plan_id": 1,
                    "is_active": 1,
                    "start_date": 1,
                    "end_date": 1
                }
            }]);

            // console.log(result);


            const subscriptions = await subscriptionSchema.find({is_active: true});


            // console.log("Company Id in session branch: " + companyId)

            res.render(`${appPath}/company/master-branch.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                subscriptions: subscriptions,
                branch: result,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo,
            });
        } catch (error) {
            console.error("Error in /company/manage-branch:", error);
            res.status(500).send("Internal Server Error");
        }
    }, addBranch: async (req, res) => {
        try {

            console.log(req.body)

            const existingData = await usersSchema.find({
                $or: [{email_id: req.body.email_id}, {mobile_no: req.body.mobile_no}]
            });

            // console.log(existingData)

            if (!_.isEmpty(existingData)) {
                console.log("error: this branch  with similar data already exists");
            } else {

                const subscriptions = await subscriptionSchema.find({_id: new mongoose.Types.ObjectId(req.body.subscriptions_id)});
                //
                console.log(subscriptions)


                const amount = subscriptions[0].price * 100
                const options = {
                    amount: amount, currency: 'INR', receipt: req.body.email_id
                }

                razorpayInstance.orders.create(options, (err, order) => {
                    if (!err) {
                        res.status(200).send({
                            success: true,
                            msg: 'Subscriptions Created',
                            order_id: order.id,
                            amount: amount,
                            key_id: process.env.RAZORPAY_ID_KEY,
                        });
                    } else {
                        res.status(400).send({success: false, msg: 'Something went wrong!'});
                    }
                });
            }
        } catch (error) {
            console.log(error.message);
        }

    }, insertBranchData: async (req, res) => {

        console.log(req.body)

        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);

        const newCustomer = new usersSchema({
            name: req.body.name,
            mobile_no: req.body.mobile_no,
            email_id: req.body.email_id,
            password: req.body.password,
            role_name: 'B'
        });

        const savedCustomer = await newCustomer.save();

        let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

        const newBranch = new branchSchema({
            branch_name: req.body.branch_name,
            country: req.body.country_id,
            state: req.body.state_id,
            city: req.body.city_id,
            street_address: req.body.street_address,
            pin_code: req.body.pin_code,
            gst_no: req.body.gst_no,
            company_id: companyId,
            user_id: savedCustomer._id,
        });

        const savedBranch = await newBranch.save();

        const subscriptions = await subscriptionSchema.find({_id: new mongoose.Types.ObjectId(req.body.subscriptions_id)});
        //
        console.log(subscriptions[0].duration)

        const startDate = new Date();
        const endDate = new Date();

        endDate.setMonth(endDate.getMonth() + subscriptions[0].duration);
        // purchaseSubscriptionSchema
        const newPurchaseSubscription = new purchaseSubscriptionSchema({
            plan_id: new mongoose.Types.ObjectId(req.body.subscriptions_id),
            branch_id: new mongoose.Types.ObjectId(savedBranch._id),
            duration: subscriptions[0].duration,
            price: subscriptions[0].price,
            start_date: startDate,
            end_date: endDate
        });

        const savePurchaseSubscription = await newPurchaseSubscription.save();

        res.json({success: true});
    },
    fetchBranch : async (req, res) => {
        const branch_id = req.params.id;
        const result = await branchSchema.findOne({_id: new mongoose.Types.ObjectId(branch_id)});
        console.log(result);
        res.json(result);

    }
}