const {setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");
const tokenController = require("../token-controller");
module.exports = {
    manageOrder: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);

            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            const branches = await branchSchema.find({company_id: new mongoose.Types.ObjectId(companyId)})
                .select('_id gst_no branch_name');

            // console.log(branches)

            res.render(`${appPath}/company/manage-order.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo,
                branches: branches
            });

        } catch (error) {
            console.error("Error managing order:", error);
            res.status(500).json({message: 'Internal server error'});
        }

    },
        fetchOrder: async (req, res) => {
        try {
            const branchId = req.params.id;

            const orders = await orderSchema.find({ branch_id: new mongoose.Types.ObjectId(branchId), deleted: false })
                .populate({
                    path: 'table_id',
                    select: 'table_name'
                })
                .select('-_id bill_no table_id total_price payment_mode created_at');

            // console.log(orders)
            res.json(orders);
            // console.log(orders)
            // res.render(`${appPath}/branch/manage-order.ejs`, {orders});
        } catch (error) {
            console.error("Error managing order:", error);
            res.status(500).json({message: 'Internal server error'});
        }
    },
}