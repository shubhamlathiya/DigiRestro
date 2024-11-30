module.exports = {
    bind_Url: function () {
        app.get("/company/today", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId || req.body.companyId;


                const branches = await branchSchema.find({company_id: companyId}, {_id: 1}).exec();

                const currentDate = new Date();
                const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
                const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

                // const yesterday = new Date(currentDate);
                // yesterday.setDate(currentDate.getDate() - 1);

                // const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
                // const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);

                let totalRevenue = 0;
                // let totalRevenueYesterday = 0;
                // let totalRevenueToday = 0;

                for (const branch of branches) {
                    const branchId = branch._id;

                    // const ordersYesterday = await orderSchema.aggregate([{
                    //     $match: {
                    //         branch_id: branchId, created_at: { $gte: startOfYesterday, $lte: endOfYesterday }
                    //     }
                    // }, {
                    //     $group: {
                    //         _id: null, total_price: { $sum: '$total_price' }
                    //     }
                    // }]).exec();
                    //
                    // totalRevenueYesterday += ordersYesterday.length > 0 ? ordersYesterday[0].total_price : 0;

                    const ordersToday = await orderSchema.aggregate([{
                        $match: {
                            branch_id: branchId, created_at: {$gte: startOfDay, $lte: endOfDay}
                        }
                    }, {
                        $group: {
                            _id: null, total_price: {$sum: '$total_price'}
                        }
                    }]).exec();

                    totalRevenue += ordersToday.length > 0 ? ordersToday[0].total_price : 0;
                }

                // console.log(totalRevenueYesterday)
                // console.log(totalRevenue)
                // let percentageChange;

                // if (totalRevenueYesterday !== 0) {
                //     percentageChange = ((totalRevenueToday - totalRevenueYesterday) / totalRevenueYesterday) * 100;
                // } else {
                //     percentageChange = totalRevenueToday !== 0 ? 100 : 0; // If yesterday's revenue is zero, check if today's revenue is also zero
                // }

                // console.log(percentageChange);

                res.status(200).send({
                    success: true, message: 'Today\'s total revenue retrieved successfully', revenueData: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching today's total revenue:", error);
                res.status(500).send("Error fetching today's total revenue");
            }
        });

        app.get("/company/currentWeek", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;

                const branches = await branchSchema.find({company_id: companyId}, {_id: 1}).exec();

                const currentDate = new Date();
                const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
                const firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDayOfWeek)); // First day of the current week
                const lastDayOfWeek = new Date(firstDayOfWeek);
                lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6); // Last day of the current week

                let totalRevenue = 0;

                for (const branch of branches) {
                    const branchId = branch._id;

                    const ordersCurrentWeek = await orderSchema.aggregate([{
                        $match: {
                            branch_id: branchId, created_at: {$gte: firstDayOfWeek, $lte: lastDayOfWeek}
                        }
                    }, {
                        $group: {
                            _id: null, total_price: {$sum: '$total_price'}
                        }
                    }]).exec();

                    totalRevenue += ordersCurrentWeek.length > 0 ? ordersCurrentWeek[0].total_price : 0;
                }

                res.status(200).send({
                    success: true,
                    message: 'Current week\'s total revenue retrieved successfully',
                    revenueData: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching current week's total revenue:", error);
                res.status(500).send("Error fetching current week's total revenue");
            }
        });

        app.get("/company/currentMonth", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;

                const branches = await branchSchema.find({company_id: companyId}, {_id: 1}).exec();

                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0); // Start of current month
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59); // End of current month

                // console.log(startOfMonth)
                // console.log(endOfMonth)
                let totalRevenue = 0;

                for (const branch of branches) {
                    const branchId = branch._id;

                    const ordersLastMonth = await orderSchema.aggregate([{
                        $match: {
                            branch_id: branchId, created_at: {$gte: startOfMonth, $lte: endOfMonth}
                        }
                    }, {
                        $group: {
                            _id: null, total_price: {$sum: '$total_price'}
                        }
                    }]).exec();

                    totalRevenue += ordersLastMonth.length > 0 ? ordersLastMonth[0].total_price : 0;
                }

                res.status(200).send({
                    success: true,
                    message: 'Last month\'s total revenue retrieved successfully',
                    revenueData: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching last month's total revenue:", error);
                res.status(500).send("Error fetching last month's total revenue");
            }
        });

        app.get("/company/currentYear", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId;

                const branches = await branchSchema.find({company_id: companyId}, {_id: 1}).exec();

                const currentDate = new Date();
                const startOfYear = new Date(currentDate.getFullYear(), 0, 1, 0, 0, 0); // Start of current year
                const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59); // End of current year

                let totalRevenue = 0;

                for (const branch of branches) {
                    const branchId = branch._id;

                    const ordersCurrentYear = await orderSchema.aggregate([{
                        $match: {
                            branch_id: branchId, created_at: {$gte: startOfYear, $lte: endOfYear}
                        }
                    }, {
                        $group: {
                            _id: null, total_price: {$sum: '$total_price'}
                        }
                    }]).exec();

                    totalRevenue += ordersCurrentYear.length > 0 ? ordersCurrentYear[0].total_price : 0;
                }

                res.status(200).send({
                    success: true,
                    message: 'Current year\'s total revenue retrieved successfully',
                    revenueData: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching current year's total revenue:", error);
                res.status(500).send("Error fetching current year's total revenue");
            }
        });

        app.get("/company/allBranchesRevenue", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId || req.body.companyId;


                const branches = await branchSchema.find({company_id: companyId}, {branch_name: 1, _id: 1}).exec();

                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth() + 1; // Adding 1 to get month number starting from 1
                const monthWiseTotals = [];

                for (const branch of branches) {
                    const branchId = branch._id;
                    const branchName = branch.branch_name;
                    const branchMonthWiseTotals = new Array(currentMonth).fill(0); // Initialize array with zeros until current month

                    for (let month = 1; month <= currentMonth; month++) {
                        const startOfMonth = new Date(currentYear, month - 1, 1);
                        const endOfMonth = new Date(currentYear, month, 0);

                        const ordersInMonth = await orderSchema.aggregate([{
                            $match: {
                                branch_id: branchId, created_at: {$gte: startOfMonth, $lt: endOfMonth}
                            }
                        }, {$group: {_id: null, total_price: {$sum: '$total_price'}}},]).exec();

                        const total_price = ordersInMonth.length > 0 ? ordersInMonth[0].total_price : 0;
                        branchMonthWiseTotals[month - 1] = total_price;
                    }

                    monthWiseTotals.push({name: `${branchName}`, data: branchMonthWiseTotals});
                }

                // console.log(monthWiseTotals);
                res.status(200).send({success: true, message: 'Data retrieved successfully', monthWiseTotals});
            } catch (error) {
                console.error("Error fetching revenue:", error);
                res.status(500).send("Error fetching revenue");
            }
        });

        app.get("/company/paymentMode", async (req, res) => {
            try {
                const companyId = req.session.selectedCompanyId || req.body.companyId;


                // Fetch available branches
                const branches = await branchSchema.find({company_id: companyId}, {branch_name: 1, _id: 1}).exec();

                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth() + 1;

                const paymentModes = {
                    1: "online", 2: "card", 3: "cash", 4: "other"
                };

                const paymentMode = [];

                for (const modeNumber in paymentModes) {
                    const modeName = paymentModes[modeNumber];
                    const modeData = {name: modeName, data: new Array(currentMonth).fill(0)}; // Initialize mode data for each month

                    for (let month = 1; month <= currentMonth; month++) {
                        const startOfMonth = new Date(currentYear, month - 1, 1);
                        const endOfMonth = new Date(currentYear, month, 0);

                        const ordersInMonth = await orderSchema.aggregate([{
                            $match: {
                                payment_mode: parseInt(modeNumber),
                                created_at: {$gte: startOfMonth, $lt: endOfMonth},
                                branch_id: {$in: branches.map(branch => branch._id)} // Filter orders by available branches
                            }
                        }, {$group: {_id: null, total_price: {$sum: '$total_price'}}}]).exec();

                        const total_price = ordersInMonth.length > 0 ? ordersInMonth[0].total_price : 0;
                        modeData.data[month - 1] = total_price;
                    }

                    paymentMode.push(modeData);
                }

                // console.log(paymentMode);
                res.status(200).send({success: true, message: 'Data retrieved successfully', paymentMode});
            } catch (error) {
                console.error("Error fetching revenue:", error);
                res.status(500).send("Error fetching revenue");
            }
        });
    }
}
