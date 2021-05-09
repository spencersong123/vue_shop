<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>

        </el-card>
    </div>
</template>

<script>
    export default {
        name: "report"
    }
</script>

<style lang="less" scoped>
    .el-breadcrumb{
        font-size: 20px;
    }
    .el-card {
        margin-top: 20px;
    }
</style>