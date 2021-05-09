<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row type="flex" :gutter="10">
                <el-col>
                    <el-input placeholder="请输入搜索内容" v-model="order_query_info.query" class="search_input">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>


            <el-table :data="order_query_info.order_list" border>
                <el-table-column type="index" label="序号" width="80px" align="center"></el-table-column>
                <el-table-column prop="order_number" label="订单编号" align="center"></el-table-column>
                <el-table-column prop="order_price" label="订单价格" width="140px" align="center"></el-table-column>
                <el-table-column label="是否付款" width="100px" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="pay2typeMap[scope.row.order_pay]">{{pay2valueMap[scope.row.order_pay]}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货" width="100px" align="center"></el-table-column>
                <el-table-column label="下单时间" width="180px" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.row.update_time | dateFormat}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="date" label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="editOrder(scope.row)">编辑</el-button>
                        <el-button type="danger" @click="showWuliu(scope.row)">配置</el-button>
                    </template>
                </el-table-column>

            </el-table>

            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="order_query_info.pagenum - '0'"
                    :page-sizes="[10, 50, 100, 400]"
                    :page-size="order_query_info.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="order_query_info.total">
            </el-pagination>
        </el-card>

        <el-dialog title="物流信息" :visible.sync="showWuliuSwitch" width="50%">
            <el-timeline>
                <el-timeline-item
                        v-for="(activity, index) in wuliuList"
                        :key="index"
                        :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>

            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="showWuliuSwitch = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 订单查询结果信息
                order_query_info: {
                    query: "", pagenum: "1", pagesize: 10,
                    user_id: "", pay_status: "", is_send: "",
                    order_fapiao_title: "", order_fapiao_company: "",
                    order_fapiao_content: "", consignee_addr: "", total: 0, order_list: []
                },
                pay2typeMap: {"1": "success", "0": "danger", "2": "warning"},
                pay2valueMap: {"1": "已付款", "0": "未付款", "2": "未知"},
                wuliuList: [{
                    "time": "2018-05-10",
                    "context": "已签收,感谢使用顺丰快递",
                },
                    {
                        "time": "2018-05-09",
                        "context": "已揽件,正在出库",
                    }],
                showWuliuSwitch: false,
            }

        },
        created() {
            this.getOrderList();
        },
        methods: {
            async getOrderList() {
                const {data: res} = await this.$http.get("orders", {params: this.order_query_info});
                if (res.meta.status !== 200) {
                    return this.$message.error("获取订单信息失败");
                }
                this.order_query_info.total = res.data.total;
                this.order_query_info.order_list = res.data.goods;
            },
            handleSizeChange(newSize) {
                this.order_query_info.pagesize = newSize;
                this.getOrderList();
            },
            handleCurrentChange(currentPageNo) {
                this.order_query_info.pagenum = currentPageNo;
                this.getOrderList();
            },
            async showWuliu(orderInfo) {
                this.showWuliuSwitch = true;
            }
        },

    }
</script>

<style lang="less" scoped>
    .el-breadcrumb {
        font-size: 18px;
    }

    .el-card {
        margin-top: 20px;
    }

    .search_input {
        width: 50%;
    }

    .el-table {
        margin-top: 20px;
        margin-bottom: 20px;
    }

    .el-button {
        margin-right: 20px;
    }

</style>