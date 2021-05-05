<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>

            <!--            添加角色对话框-->
            <el-dialog title="添加角色" :visible.sync="addRoleDialogSwitch">
                <el-form :model="addRoleInfo" label-width="100px">
                    <el-form-item label="角色名">
                        <el-input v-model="addRoleInfo.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述">
                        <el-input v-model="addRoleInfo.roleDesc"></el-input>
                    </el-form-item>
                </el-form>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="addRoleDialogSwitch = false">取 消</el-button>
                    <el-button type="primary" @click="addRole">确定添加</el-button>
                </span>
            </el-dialog>

            <!--            编辑角色对话框-->
            <el-dialog title="编辑角色" :visible.sync="editRoleDialogSwitch">
                <el-form :model="editRoleInfo" label-width="100px">
                    <el-form-item label="角色名">
                        <el-input v-model="editRoleInfo.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述">
                        <el-input v-model="editRoleInfo.roleDesc"></el-input>
                    </el-form-item>
                </el-form>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="editRoleDialogSwitch = false">取 消</el-button>
                    <el-button type="primary" @click="editRole">确定修改</el-button>
                </span>
            </el-dialog>

            <el-dialog title="分配权限" :visible.sync="deliverRightDialogSwitch">
                <el-tree :data="allRightsInfo"
                         show-checkbox
                         node-key="id"
                         ref="deliverRightTree"
                         default-expand-all
                         :default-checked-keys="roleRightInfo"
                         :props="defaultProps">
                </el-tree>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="deliverRightDialogSwitch = false">取 消</el-button>
                    <el-button type="primary" @click="deliverRightSubmit">确定分配</el-button>
                </span>
            </el-dialog>


            <!--            添加角色按钮-->
            <el-button type="primary" @click="addRoleDialogSwitch = true">添加角色</el-button>

            <!--            角色列表-->
            <el-table :data="roleList" style="width: 100%" border highlight-current-row>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="(items1, i1) in scope.row.children" :key="items1.id"
                                :class="['bdbottom','vcenter',i1===0?'bdtop':'']">
                            <!--                            渲染一级权限-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightByID(scope.row.id, items1.id)">{{items1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i></el-col>
                            <!--                            渲染二级、三级权限-->
                            <el-col :span="19">
                                <el-row v-for="(items2, i2) in items1.children" :key="items2.id"
                                        :class="['vcenter',i2===0?'':'bdtop']">
                                    <el-col :span="6">
                                        <el-tag type="success" closable
                                                @close="removeRightByID(scope.row.id, items2.id)">{{items2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i></el-col>
                                    <el-col :span="18">
                                        <el-tag class="rgap" type="warning" closable v-for="items3 in items2.children"
                                                :key="items3.id" @close="removeRightByID(scope.row.id,items3.id)">
                                            {{items3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="序号" width="80px" align='center'></el-table-column>
                <el-table-column prop="roleName" label="角色名称" align='center'></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述" align='center'></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-row :gutter="60">
                            <el-col :span="6">
                                <el-button type="primary" icon="el-icon-edit" @click="editRoleClick(scope.row.id)">编辑
                                </el-button>
                            </el-col>
                            <el-col :span="6">
                                <el-button type="danger" icon="el-icon-delete"
                                           @click="deleteRole(scope.row.id, scope.row.roleName)">删除
                                </el-button>
                            </el-col>
                            <el-col :span="6">
                                <el-button type="success" icon="el-icon-s-tools" @click="deliverRightClick(scope.row)">
                                    分配权限
                                </el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 当前角色列表
                roleList: [],

                // 添加角色、编辑角色、分配权限对话框的开关
                addRoleDialogSwitch: false,
                editRoleDialogSwitch: false,
                deliverRightDialogSwitch: false,

                // 添加角色的默认信息
                addRoleInfo: {"roleName": "spencer", "roleDesc": "角色描述"},
                editRoleInfo: {},

                // 某个角色拥有的所有权限(用于权限分配时)
                roleRightInfo: [],
                // 所有的权限列表
                allRightsInfo: [],
                // 即将分配权限的角色的id
                roleID : '',

                // el-tree组件中映射
                defaultProps: {
                    children: 'children',
                    label: 'authName'
                }
            }
        },
        methods: {
            async getRoleList() {
                const {data: res} = await this.$http.get("roles");
                this.roleList = res.data;
            },
            async addRole() {
                const {data: res} = await this.$http.post("roles", this.addRoleInfo);
                if (res.meta.status !== 201) {
                    this.$message.error("添加角色失败!");
                    return;
                }
                this.$message.success("添加角色成功!");
                this.getRoleList();
                this.addRoleDialogSwitch = false;
            },
            async editRoleClick(roleID) {
                const {data: res} = await this.$http.get("roles/" + roleID);
                if (res.meta.status !== 200) {
                    this.$message.error("获取角色失败!");
                    return;
                }
                this.editRoleDialogSwitch = true;
                this.editRoleInfo = res.data;
            },

            async editRole() {
                const {data: res} = await this.$http.put("roles/" + this.editRoleInfo.roleId, this.editRoleInfo);
                if (res.meta.status !== 200) {
                    this.$message.error("修改角色失败");
                    return;
                }
                this.$message.success("修改角色成功!");
                this.editRoleDialogSwitch = false;
                this.getRoleList();
            },
            deleteRole(id, roleName) {
                this.$confirm(`此操作将永久删除${roleName}角色, 是否继续?`, '删除角色', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const {data: res} = await this.$http.delete("roles/" + id);
                    if (res.meta.status !== 200) {
                        this.$message.error("删除失败!");
                        return;
                    }
                    this.$message.success("删除成功!");
                    this.getRoleList();
                }).catch(() => {
                    this.$message.info("已取消删除");
                });
            },
            async removeRightByID(rolesId, rightId) {
                const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (confirmResult !== "confirm") {
                    this.$message.info("已取消删除");
                    return;
                }
                console.log(rolesId, rightId);
                const {data: res} = await this.$http.delete("roles/" + rolesId + "/rights/" + rightId);
                if (res.meta.status !== 200) {
                    this.$message.error("删除失败")
                }
                this.getRoleList();
                this.$message.success("删除成功!");
            },
            async deliverRightClick(roleInfo) {
                // 首先获取所有权限列表
                const {data: res} = await this.$http.get("rights/tree");
                if (res.meta.status !== 200) {
                    this.$message.error("获取权限失败!");
                    return;
                }
                this.roleRightInfo = [];
                this.getAllLeafNode(roleInfo);
                this.roleID = roleInfo.id;
                this.allRightsInfo = res.data;
                this.deliverRightDialogSwitch = true;
            },
            getAllLeafNode(node){
                // 没有children属性,说明是叶子节点
                if(!node.children){
                    this.roleRightInfo.push(node.id);
                    return;
                }
                node.children.forEach(item=>{
                    this.getAllLeafNode(item);
                })
            },
            async deliverRightSubmit(){
                const treeRef = this.$refs.deliverRightTree;
                const checkedKeys = [...treeRef.getHalfCheckedKeys(),...treeRef.getCheckedKeys()]
                const rightList = checkedKeys.join(",");
                const{data:res} = await this.$http.post(`roles/${this.roleID}/rights`,{"rids":rightList})
                if (res.meta.status !== 200) {
                    this.$message.error("分配权限失败!");
                    return;
                }
                this.$message.success("分配权限成功!");
                this.getRoleList();
                this.deliverRightDialogSwitch = false;
            }
        },


        created() {
            this.getRoleList();
        }

    }
</script>

<style lang="less" scoped>
    .el-breadcrumb {
        font-size: 18px;
    }

    .el-card {
        margin-top: 20px;
    }

    .el-table {
        margin-top: 20px;
    }

    .el-tag {
        margin-top: 7px;
        margin-bottom: 7px;
        margin-right: 3px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }

    .rgap {
        margin-right: 20px;
    }


</style>