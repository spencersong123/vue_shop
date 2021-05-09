<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-input placeholder="请输入内容" v-model="goodInfo.query" class="input-with-select" clearable @clear="getGoodList">
                <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
            </el-input>
            <el-button type="primary" class="addGoodButton" @click="addGoodClick">添加商品</el-button>

            <el-table :data="goodList" border style="width: 100%">
                <el-table-column type="index" label="序号" align="center" width="80px"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称" align="center"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格" align="center"></el-table-column>
                <el-table-column prop="goods_number" label="商品数量" align="center"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" align="center"></el-table-column>
                <el-table-column label="创建时间" align="center">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="small">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteGood(scope.row)">删除</el-button>
                    </template>
                </el-table-column>

            </el-table>

            <el-pagination @size-change="handleSizeChange($event)" @current-change="handlePageChange($event)"
                    :current-page="goodInfo.pagenum"
                    :page-sizes="[5, 30, 100, 300, 800]"
                    :page-size="goodInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="goodInfo.total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 商品列表中相关参数
                goodInfo: {"query":"",pagenum:1, pagesize:5,total:0},
                // 待添加的商品信息
                addGoodInfo:{},
                // 所有商品列表
                goodList: [],
                // 商品列表分页当前页
                currentPageNo:1,
            }
        },
        methods: {
            async getGoodList() {
                const{data:res} = await this.$http.get("goods", {params:this.goodInfo});
                if(res.meta.status !== 200) {
                    console.log(res);
                    return this.$message.error("获取商品失败");
                }
                this.goodInfo.total = res.data.total;
                this.goodList = res.data.goods;
            },
            handleSizeChange(newSize){
                this.goodInfo.pagesize = newSize;
                this.getGoodList();
            },
            handlePageChange(newPageNo){
                this.goodInfo.pagenum = newPageNo;
                this.getGoodList();
            },
            async deleteGood(good){
                const{confirm} = await this.$confirm(`此操作将永久删除${good.goods_name}商品, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (confirm !== "confirm") {
                    return this.$message.info("已取消删除");
                }
                const{data:res} = await this.$http.delete("goods/"+good.good_id);
                if (res.meta.status !== 201) {
                    return this.$message.error("删除失败");
                }
                this.$message.success("删除成功!");
            },
            addGoodClick(){
                this.$router.push("/goods/add");
            }
        },
        created() {
            this.getGoodList();
        }
    }
</script>

<style lang="less" scoped>
    .el-breadcrumb {
        font-size: 20px;
        margin-bottom: 20px;
    }

    .el-tabs {
        margin-top: 20px;
    }
    .input-with-select{
        width: 50%;
        margin-right: 40px;
        margin-bottom: 20px;
    }
    .el-pagination{
        margin-top: 20px;
    }
</style>