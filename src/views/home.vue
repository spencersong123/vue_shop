<template>
    <el-container>
        <el-header>
            <div>
                <img class="logoImg" src="../assets/logo.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <div>
                <el-button type="warning" @click="logout">登出</el-button>
            </div>
        </el-header>
        <el-container>
            <!--            侧边栏菜单-->
            <el-aside :width="menuCollapse?'64px':'200px'">
                <div class="toggle-button" @click="switchMenu">|||</div>
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened
                         :collapse="menuCollapse" :collapse-transition="false" router>
                    <el-submenu :index="menu.id+''" v-for="menu in menuList" :key="menu.id">
                        <template slot="title">
                            <i class="el-icon-star-off"></i>
                            <span>{{menu.authName}}</span>
                        </template>
                        <el-menu-item :index="subMenu.path" v-for="subMenu in menu.children" :key="subMenu.id">
                            <i class="el-icon-menu"></i>
                            <span>{{subMenu.authName}}</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        data() {
            return {
                // 左侧菜单数据
                menuList: [],
                menuCollapse:false,
            }
        },
        created() {
            this.getMenuList();
        },
        methods: {
            // 登出
            logout() {
                window.sessionStorage.clear();
                this.$router.push("/");
            },
            // 获取菜单接口
            async getMenuList() {
                const {data: res} = await this.$http.get("menus");
                if (res.meta.status !== 200) {
                    this.$message.error("获取菜单栏失败");
                    return;
                }
                this.menuList = res.data;
            },

            switchMenu(){
                this.menuCollapse = !this.menuCollapse;
            },
        }
    }
</script>

<style lang="less" scoped>
    .logoImg {
        width: 40px;
        height: 40px;
    }

    .el-container {
        height: 100%;

    }

    .el-header {
        background: #373d41;
        display: flex;
        justify-content: space-between;

    > div {
        display: flex;
        align-items: center;

    > span {
        margin-left: 40px;
        color: white;
        font-size: 20px;
    }

    }
    }

    .el-aside {
        background: #333744;
    }

    .el-main {
        background: #eaedf1;
    }

    .el-button {
        margin-top: 10px;
    }
    .el-aside{
        .el-menu{
            border-right: none;
        }
    }
    .toggle-button{
        background: #4A5064;
        color: white;
        text-align: center;
        letter-spacing: 0.4em;
        cursor: pointer;
    }

</style>