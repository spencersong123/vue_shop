<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-button type="primary" @click="addCategoryClick">添加分类</el-button>
            <el-table :data="categoryList" border style="width: 100%" :tree-props="{children: 'children'}"
                      row-key="cat_id">
                <el-table-column type="index" label="序号" width="80px" align="center"></el-table-column>
                <el-table-column prop="cat_name" label="分类名称" align="center"></el-table-column>
                <el-table-column label="是否有效" align="center">
                    <template slot-scope="scope">
                        <div class="largeLogo">

                            <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: green"></i>
                            <i class="el-icon-error" v-else style="color: red"></i>
                        </div>

                    </template>

                </el-table-column>
                <el-table-column label="排序" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="level2styleMap[scope.row.cat_level]">{{level2nameMap[scope.row.cat_level]}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="editCategoryClick(scope.row)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" @click="deleteCategory(scope.row)">删除</el-button>
                    </template>
                </el-table-column>

            </el-table>

            <el-pagination @size-change="handleSizeChange($event)" @current-change="handleCurrentChange($event)"
                           :current-page.sync="currentPageNum"
                           :page-size="pageSize"
                           :page-sizes="[2,5,10,20,50,100,500]"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="categoryTotalCnt">
            </el-pagination>

            <el-dialog title="添加分类" :visible.sync="addCategorySwitch">
                <el-form :model="addCategoryInfo" label-width="80px">
                    <el-form-item label="分类名称:">
                        <el-input v-model="addCategoryInfo.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类:">
                        <el-cascader
                                v-model="addCategoryPid"
                                clearable
                                filterable
                                ref="categoryRef"
                                :options="secondLevelCategoryList"
                                :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',checkStrictly:true }">
                        </el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addCategorySwitch = false">取消</el-button>
                    <el-button type="primary" @click="addCategorySubmit">确定</el-button>
                </span>
            </el-dialog>
            <el-dialog title="分类编辑" :visible.sync="editCategorySwitch">
                <el-form :model="editCategoryInfo" label-width="80px">
                    <el-form-item label="分类名称:">
                        <el-input v-model="editCategoryInfo.cat_name"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editCategorySwitch = false">取消</el-button>
                    <el-button type="primary" @click="editCategorySubmit">确定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                categoryList: [],
                level2nameMap: {0: "一级", 1: "二级", 2: "三级"},
                level2styleMap: {0: "", 1: "success", 2: "warning"},
                categoryTotalCnt: 0,
                currentPageNum: 0,
                pageSize: 5,
                addCategorySwitch: false,
                editCategorySwitch: false,
                secondLevelCategoryList: [],
                addCategoryInfo: {cat_pid: 0, cat_name: "", cat_level: 0},
                addCategoryPid: "",
                editCategoryInfo:{},
            }
        },
        methods: {
            async getCategoryList(firstReq, typeList) {
                let paramInfo = {}; // 第一次调用不需要传入参数
                if (this.pageSize <= 0) {
                    this.pageSize = 5;
                }
                // 判断是否是第一次请求(由于currentPageNum有可能发生变化,当分页信息加载之后会异步改变currentPageNum)
                if (!firstReq) {
                    paramInfo["pagenum"] = this.currentPageNum;
                    paramInfo["pagesize"] = this.pageSize;
                }
                if (!typeList) {
                    paramInfo["type"] = typeList
                }
                const {data: res} = await this.$http.get("/categories", {params: paramInfo});
                if (res.meta.status !== 200) {
                    this.$message.error("获取分类列表失败!");
                    return;
                }
                if (firstReq) {
                    this.categoryTotalCnt = res.data.length; // 第一次调用才需要初始化
                    this.currentPageNum = 1;
                } else {
                    this.categoryList = res.data.result;
                }
            },
            handleSizeChange(newSize) {
                this.pageSize = newSize;
                this.getCategoryList(false);
            },
            handleCurrentChange(newPageNo) {
                this.currentPageNum = newPageNo;
                this.getCategoryList(false);
            },
            async addCategoryClick() {
                const {data: res} = await this.$http.get("/categories", {params: {"type": 2}});
                if (res.meta.status !== 200) {
                    this.$message.error("获取分类失败");
                    return;
                }
                this.secondLevelCategoryList = res.data;
                this.addCategorySwitch = true;
            },
            async addCategorySubmit() {
                const selectNodeList = this.$refs["categoryRef"].getCheckedNodes();
                // 未选中任何父节点,则添加到一级分类
                if (selectNodeList.length > 0) {
                    const firstNode = selectNodeList[0];
                    this.addCategoryInfo.cat_pid = firstNode.data.cat_id;
                    this.addCategoryInfo.cat_level = firstNode.data.cat_level + 1;
                }
                const {data: res} = await this.$http.post("categories", this.addCategoryInfo);
                if (res.meta.status !== 201) {
                    this.$message.error("添加分类失败");
                    return;
                }
                this.$message.success("添加分类成功");
                this.addCategorySwitch = false;
                this.getCategoryList(false);
            },
            async deleteCategory(category) {

                const confirm = await this.$confirm(`此操作将永久删除${category.cat_name}分类, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (confirm !== "confirm") {
                    this.$message.info(`已取消删除${category.cat_name}分类`);
                    return;
                }
                const {data: res} = await this.$http.delete("categories/" + category.cat_id);
                if (res.meta.status !== 200) {
                    this.$message.error("删除分类失败");
                    return;
                }
                this.$message.success("删除分类成功");
                this.getCategoryList(false);
            },
            async editCategoryClick(category){
                this.editCategoryInfo = category;
                this.editCategorySwitch = true;
            },
            async editCategorySubmit(){
                const {data:res} = await this.$http.put("categories/"+this.editCategoryInfo.cat_id,
                    {"cat_name":this.editCategoryInfo.cat_name});
                if (res.meta.status !== 200){
                    this.$message.error("编辑分类失败");
                    return;
                }
                this.$message.success("编辑成功");
                this.getCategoryList(false);
                this.editCategorySwitch = false;
            }
        },
        created() {
            this.getCategoryList(true);
            this.getCategoryList(false);
        }
    }
</script>

<style lang="less" scoped>
    .el-breadcrumb {
        font-size: 20px;
    }

    .el-card {
        margin-top: 20px;
    }

    .largeLogo {
        align-items: center;
        font-size: 30px;
    }

    .el-table {
        margin-top: 20px;
    }

    .el-pagination{
        margin-top: 20px;
    }
</style>