<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="box-card">
            <el-table :data="rightList" style="width: 100%" border highlight-current-row height="600px">
                <el-table-column type="index" label="序号" width="80px" align='center'></el-table-column>

                <el-table-column prop="authName" label="权限名称" align='center'></el-table-column>
                <el-table-column prop="path" label="路径" align='center'></el-table-column>
                <el-table-column label="权限等级" align='center'>
                    <template slot-scope="scope">
                        <el-tag :type="level2typeMap[scope.row.level]">{{level2nameMap[scope.row.level]}}</el-tag>
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
                rightList:[],
                level2typeMap:{0:"",1:"success",2:"warning",},
                level2nameMap:{0:"一级",1:"二级",2:"三级"},
            }
        },

        created(){
            this.getRightList();
        },

        methods: {
            async getRightList(){
                const{data:res} = await this.$http.get("rights/list");
                if (res.meta.status !== 200) {
                    this.$message.error("获取权限失败!");
                    return;
                }
                this.rightList = res.data;
            }
        },
    }
</script>

<style lang="less" scoped>
    .el-breadcrumb {
        font-size: 18px;
    }
    .el-card{
        margin-top: 20px;
    }
</style>