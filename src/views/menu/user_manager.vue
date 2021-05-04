<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row type="flex" :gutter="10">
                <el-col>
                    <el-input placeholder="请输入搜索内容" v-model="queryInfo.query">
                        <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
                    </el-input>
                </el-col>
                <el-col>
                    <el-button type="primary" @click="addUserClick">添加用户</el-button>
                </el-col>
            </el-row>

            <el-table :data="userInfoList" style="width: 100%" border highlight-current-row>
                <el-table-column type="index"></el-table-column>

                <el-table-column prop="role_name" label="角色名" width="140px" align='center'></el-table-column>
                <el-table-column prop="username" label="用户名" width="140px" align='center'></el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="140px" align='center'></el-table-column>
                <el-table-column prop="mobile" label="联系电话" align='center'></el-table-column>
                <el-table-column prop="email" label="邮箱" align='center'></el-table-column>
                <el-table-column label="状态" align="center" width="100px">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state"
                                   @change="statusChangeHandler($event, scope)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-row :gutter="60">
                            <el-col :span="6">
                                <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
                                    <el-button type="primary" icon="el-icon-edit" size="mini"
                                               @click="editUser(scope.row.id)"></el-button>
                                </el-tooltip>
                            </el-col>
                            <el-col :span="6">
                                <!--                                <el-tooltip class="item" effect="dark" content="删除" placement="top-start">-->
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                           @click="deleteUser(scope.row.id, scope.row.username)"></el-button>
                                <!--                                </el-tooltip>-->
                            </el-col>
                            <el-col :span="6">
                                <el-tooltip class="item" effect="dark" content="分配权限" placement="top-start">
                                    <el-button type="success" icon="el-icon-s-tools" size="mini"></el-button>
                                </el-tooltip>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>

            <!--            分页相关信息-->
            <el-pagination
                    @size-change="handleUserSizeChange"
                    @current-change="handleUserCurrentChange"
                    :current-page="this.queryInfo.pagenum"
                    :page-sizes="[2, 3, 5, 10]"
                    :page-size="this.queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="this.queryInfo.totalCnt">
            </el-pagination>
        </el-card>

        <el-dialog title="添加用户" :visible.sync="userAddSwitch">
            <el-form :model="userAddInfo" ref="userAddRef" label-width="100px" :rules="userAddRule">

                <el-form-item label="用户名" prop="username">
                    <el-input v-model="userAddInfo.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="userAddInfo.password" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="联系电话" prop="mobile">
                    <el-input v-model="userAddInfo.mobile"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userAddInfo.email"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="addUserSubmit('userAddRef')">确认添加</el-button>
                    <el-button @click="resetAddUserForm('userAddRef')" type="warning">重置</el-button>
                </el-form-item>
            </el-form>

        </el-dialog>

        <el-dialog title="编辑用户" :visible.sync="userEditSwitch">
            <el-form :model="userEditInfo" ref="userEditRef" label-width="100px" :rules="userAddRule">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="userEditInfo.username"></el-input>
                </el-form-item>

                <el-form-item label="联系电话" prop="mobile">
                    <el-input v-model="userEditInfo.mobile"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userEditInfo.email"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="editUserSubmit('userEditRef')">确认修改</el-button>
                    <el-button @click="resetEditUserForm('userEditRef')" type="warning">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>


    </div>

</template>

<script>
    export default {
        data() {
            return {
                searchContent: "",
                queryInfo: {
                    query: "",
                    pagenum: 1,
                    pagesize: 10,
                    totalCnt: 0,
                },
                userInfoList: [],
                userAddInfo: {
                    username: "spencers",
                    password: "sbz13871719153",
                    mobile: "13871719153",
                    email: "1028495632@qq.com",
                },
                userAddSwitch: false,
                userAddRule: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'},
                        {min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'change'},
                        {min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {min: 10, max: 15, message: '长度在 10 到 15 个字符', trigger: 'change'},
                        {min: 10, max: 15, message: '长度在 10 到 15 个字符', trigger: 'blur'}
                    ],
                    mobile: [{
                        pattern: /^0{0,1}(13[0-9]|15[7-9]|153|156|18[7-9])[0-9]{8}$/,
                        message: '手机号格式不对', trigger: 'change'
                    }],
                    email: [{
                        pattern: /^([0-9A-Za-z\-_.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g,
                        message: "请输入正确的邮箱",
                        trigger: "change"
                    }]
                },
                userEditInfo: {},
                userEditSwitch: false,

            }
        },
        async created() {
            this.getUserList();
        },
        methods: {
            async getUserList() {
                const {data: res} = await this.$http.get("users", {params: this.queryInfo});
                if (res.meta.status !== 200) {
                    this.$message.error("获取用户失败");
                    return;
                }
                this.userInfoList = res.data.users;
                this.queryInfo = {
                    pagenum: res.data.pagenum,
                    totalCnt: res.data.total,
                    pagesize: this.queryInfo.pagesize
                };
            },
            addUserClick() {
                this.userAddSwitch = true;
            },
            resetAddUserForm(formRef) {
                this.$refs[formRef].resetField();
            },
            addUserSubmit(formRef) {
                this.$refs[formRef].validate(async valid => {
                    if (!valid) {
                        this.$message.error("信息填写有误,请根据校验规则重新填写");
                        return;
                    }
                    const {data: res} = await this.$http.post("/users", this.userAddInfo);
                    console.log(res);
                    if (res.meta.status !== 201) {
                        this.$message.error("添加失败,请稍后再试");
                        return;
                    }
                    this.$message.success("添加用户成功");
                    this.userAddSwitch = false;
                    this.getUserList();
                })
            },
            handleUserSizeChange(newSize) {
                this.queryInfo.pagesize = newSize;
                this.getUserList();
            },
            handleUserCurrentChange(newPageNo) {
                this.queryInfo.pagenum = newPageNo;
                this.getUserList();
            },
            async statusChangeHandler(newStatus, scope) {
                let id = scope.row.id;
                const {data: res} = await this.$http.put("users/" + id + "/state/" + newStatus);
                if (res.meta.status !== 200) {
                    this.$message.error("修改状态失败,请稍后重试!");
                    scope.row.mg_state = !newStatus;
                    return;
                }
                this.$message.success("修改状态成功!");
            },
            async editUser(id) {
                const {data: res} = await this.$http.get("users/" + id);
                if (res.meta.status !== 200) {
                    this.$message.error("网络有误,请稍后再试!");
                    return;
                }
                this.userEditInfo = res.data;
                this.userEditSwitch = true;
            },
            editUserSubmit(userEditRef) {
                this.$refs[userEditRef].validate(async valid => {
                    if (!valid) {
                        this.$message.error("表单有未验证通过的项,请检查并修改完成后再提交!");
                        return;
                    }
                    const {data: res} = await this.$http.put("/users/" + this.userEditInfo.id, this.userEditInfo);
                    if (res.meta.status !== 200) {
                        this.$message.error("修改用户失败!");
                        return;
                    }
                    this.$message.success("修改用户成功");
                    this.getUserList();
                    this.userEditSwitch = false;
                });
            },
            resetEditUserForm(userEditRef) {
                console.log(this.$refs[userEditRef]);
                this.$refs[userEditRef].resetFields();
                this.$message.success("重置表单成功");
            },
            deleteUser(id, username) {
                this.$confirm(`此操作将永久删除${username}用户, 是否继续?`, '删除用户', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const {data: res} = await this.$http.delete("users/" + id);
                    if (res.meta.status !== 200) {
                        this.$message.error("删除失败!");
                        return;
                    }
                    this.$message.success("删除成功!");
                    this.getUserList();
                }).catch(() => {
                    this.$message.info("已取消删除");
                });
            },
            search(){
                this.getUserList();
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-card {
        margin-top: 20px;
    }

    .el-breadcrumb {
        font-size: 18px;
    }

    .el-table {
        margin-top: 20px;
    }

    .el-input {
        width: 80%;
    }

    .el-pagination {
        padding-top: 30px;
    }
</style>