module.exports = {
  thisMonthCompany: async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const companyDetails = await companySchema.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "userDetails",
              },
            },
            {
              $unwind: "$userDetails", // Unwind the userDetails array
            },
            {
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
                ownerName: "$userDetails.name", // Project the user_name field from userDetails
              },
            },
            {
              $sort: { created_at: -1 },
            },
          ]);

          const branchDetails = await branchSchema.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
              $lookup: {
                from: "company",
                localField: "company_id",
                foreignField: "_id",
                as: "comDetails",
              },
            },
            {
              $unwind: "$comDetails", // Unwind the userDetails array
            },
            {
              $project: {
                _id: 1,
                branch_name: 1,
                country: 1,
                state: 1,
                city: 1,
                street_address: 1,
                pin_code: 1,
                deleted: 1,
                created_at: 1,
                updated_at: 1,
                deleted_at: 1,
                comName: "$comDetails.company_name", // Project the user_name field from userDetails
              },
            },
            {
              $sort: { created_at: -1 },
            },
          ]);
      console.log(branchDetails);
      res.render(`${appPath}/admin/tps-reports.ejs`, { companyDetails, branchDetails });
    } catch (error) {
      // res.send("viewProfile error:" , error);
      console.log("viewProfile error: ", error);
    }
  },
};
