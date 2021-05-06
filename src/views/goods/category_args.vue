<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品参数</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert title="只允许为三级分类添加属性" type="warning" show-icon :closable="false"></el-alert>
            <span>选择商品分类:</span>
            <el-cascader v-model="selectedCategory" @change="changeSelect" :options="allCategoryList"
                         :props="{ expandTrigger: 'hover', children:'children', label:'cat_name', value:'cat_id'}">

            </el-cascader>

            <el-tabs v-model="activeName" @tab-click="changeSelect">
                <el-tab-pane label="动态参数" name="dynamic">
                    <el-button type="primary" :disabled="selectedCategory.length!==3" @click="attrAddDialogSwitch=true">
                        添加参数
                    </el-button>
                    <el-table :data="dynamicArgList">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="item in scope.row.attr_vals" closable>{{item}}</el-tag>
                                <el-button class="button-new-tag" size="small">+ new tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="序号" align="center"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
                        <el-table-column label="操作" align="center">
                            <template slot-scope="scope">
                                <el-button icon="el-icon-edit" type="primary" @click="editAttrClick(scope.row)">编辑
                                </el-button>
                                <el-button icon="el-icon-delete" type="danger" @click="deleteAttr(scope.row)">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="static">
                    <el-button type="primary" :disabled="selectedCategory.length!==3" @click="attrAddDialogSwitch=true">
                        添加属性
                    </el-button>
                    <el-table :data="staticAttrList">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="item in scope.row.attr_vals" closable>{{item}}</el-tag>
                                <el-button class="button-new-tag" size="small">+ new tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="序号" align="center"></el-table-column>
                        <el-table-column label="属性名称" align="center" prop="attr_name"></el-table-column>
                        <el-table-column>
                            <template slot-scope="scope">
                                <el-button icon="el-icon-edit" type="primary" @click="editAttrClick(scope.row)">编辑
                                </el-button>
                                <el-button icon="el-icon-delete" type="danger" @click="deleteAttr(scope.row)">删除
                                </el-button>
                            </template>
                        </el-table-column>

                    </el-table>
                </el-tab-pane>
            </el-tabs>

            <el-dialog :visible.sync="attrAddDialogSwitch" @close="closeAddDialog">
                <span>参数/属性名称</span>
                <el-input v-model="attrName"></el-input>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="attrAddDialogSwitch = false">取 消</el-button>
                    <el-button type="primary" @click="addAttrOrArgs">确定添加</el-button>
                </span>
            </el-dialog>

            <el-dialog :visible.sync="attrEditDialogSwitch" @close="attrEditDialogSwitch=false">
                <el-form v-model="editAttr">
                    <el-form-item label="参数/属性名称">
                        <el-input v-model="editAttr.attr_name"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="attrEditDialogSwitch = false" type="warning">取 消</el-button>
                    <el-button type="primary" @click="editAttrOrArgs">确定修改</el-button>
                </span>
            </el-dialog>


        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activeName: "static",
                allCategoryList: [],

                // 级联选择器选择的节点
                selectedCategory: [],

                // 静态属性列表
                staticAttrList: [],
                // 动态参数列表
                dynamicArgList: [],
                // 添加参数或属性的名称
                attrName: "",
                attrAddDialogSwitch: false,
                attrEditDialogSwitch: false,
                // 编辑的参数信息
                editAttr: {},

            }
        },
        created() {
            this.getAllCategory();
        },
        methods: {
            // 获取所有商品分类(具体到3级)
            async getAllCategory() {
                const {data: res} = await this.$http.get("/categories");
                if (res.meta.status !== 200) {
                    this.$message.error("获取分类数据失败");
                    return;
                }
                this.allCategoryList = res.data;
            },
            async changeSelect() {
                const length = this.selectedCategory.length;
                if (length !== 3) {
                    this.$message.error("未选中三级分类,请重新选择");
                    this.selectedCategory = [];
                    return;
                }
                const selectNode = this.selectedCategory[length - 1];
                const sel = this.activeName === "static" ? "only" : "many";
                const {data: res} = await this.$http.get(`categories/${selectNode}/attributes`, {params: {sel}});
                if (res.meta.status !== 200) {
                    this.$message.error("获取分类参数失败");
                    return;
                }
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
                });
                if (this.activeName === "static") {
                    this.staticAttrList = res.data;
                } else {
                    this.dynamicArgList = res.data;
                }
            },
            async deleteAttr(attrInfo) {
                const length = this.selectedCategory.length;
                if (length !== 3) {
                    this.$message.error("未选中三级分类,请重新选择");
                    this.selectedCategory = [];
                    return;
                }
                const confirm = await this.$confirm(`此操作将永久删除${attrInfo.attr_name}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (confirm !== "confirm") {
                    this.$message.info(`已取消删除${attrInfo.attr_name}`);
                    return;
                }

                const selectNode = this.selectedCategory[length - 1];
                const {data: res} = await this.$http.delete(`categories/${selectNode}/attributes/${attrInfo.attr_id}`);
                if (res.meta.status !== 200) {
                    this.$message.error("删除失败");
                    return;
                }
                this.changeSelect();
                this.$message.success("删除成功!");
            },
            editAttrClick(attrInfo) {
                this.editAttr = attrInfo;
                this.attrEditDialogSwitch = true;
            },

            async addAttrOrArgs() {
                const length = this.selectedCategory.length;
                if (length !== 3) {
                    this.$message.error("未选中三级分类,请重新选择");
                    this.selectedCategory = [];
                    return;
                }
                const selectNode = this.selectedCategory[length - 1];
                const sel = this.activeName === "static" ? "only" : "many";
                const {data: res} = await this.$http.post(`categories/${selectNode}/attributes`, {
                    "attr_name": this.attrName,
                    "attr_sel": sel
                });
                if (res.meta.status !== 201) {
                    this.$message.error("添加失败");
                    return;
                }
                this.$message.success("添加成功");
                this.attrAddDialogSwitch = false;
                this.changeSelect();
            },
            closeAddDialog() {
                this.attrName = "";
            },
            async editAttrOrArgs() {
                const length = this.selectedCategory.length;
                if (length !== 3) {
                    this.$message.error("未选中三级分类,请重新选择");
                    this.selectedCategory = [];
                    return;
                }
                const selectNode = this.selectedCategory[length - 1];
                const sel = this.activeName === "static" ? "only" : "many";
                const {data: res} = await this.$http.put(`categories/${selectNode}/attributes/${this.editAttr.attr_id}`, {
                    "attr_name": this.editAttr.attr_name,
                    "attr_sel": sel
                });
                if (res.meta.status !== 200) {
                    this.$message.error("更新失败");
                    return;
                }
                this.$message.success("更新成功");
                this.attrEditDialogSwitch = false;
            }
        }

    }
</script>

<style lang="less" scoped>
    .el-breadcrumb {
        font-size: 20px;
        margin-bottom: 20px;
    }

    .el-alert {
        margin-bottom: 20px;
    }

    .el-tabs {
        margin-top: 20px;
    }

    .el-cascader {
        margin-left: 20px;
    }

    .el-tag {
        margin-right: 14px;
    }
</style>