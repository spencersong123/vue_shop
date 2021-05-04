<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <el-form label-width="0" class="login_form" :model="loginForm" :rules="loginRules" ref="loginRef">
                <!--                 用户名-->
                <el-form-item prop="username">
                    <el-input prefix-icon="el-icon-user-solid" placeholder="请输入用户名"
                              v-model="loginForm.username"></el-input>
                </el-form-item>
                <!--                密码-->
                <el-form-item prop="password">
                    <el-input prefix-icon="el-icon-lock" placeholder="请输入密码" v-model="loginForm.password"
                              show-password></el-input>
                </el-form-item>

                <el-form-item class="btns">
                    <el-button type="primary" @click="login('loginRef')">登录</el-button>
                    <el-button type="info" @click="resetLogin('loginRef')">重置</el-button>
                </el-form-item>

            </el-form>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                loginForm: {
                    username: "admin",
                    password: "123456",
                },
                // 表单验证规则
                loginRules:{
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'},
                        {min: 3, message: '用户名长度要大于3', trigger: 'blur'}
                    ],
                    password:[
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur'}
                    ],
                }
            }
        },
        methods:{
            resetLogin(formName) {
                this.$refs[formName].resetFields();
            },
            login(formName){
                this.$refs[formName].validate(async valid =>{
                    if (!valid)
                        return;
                    const {data:res} = await this.$http.post("login", this.loginForm);
                    if(res.meta.status !== 200){
                        this.$message.error('用户名或密码有误');
                        return;
                    }
                    this.$message.success("登录成功");
                    window.sessionStorage.setItem("token", res.data.token);
                    this.$router.push("/home");
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .login_container {
        background-color: #2b4b6b;
        height: 100%;
    }

    .login_box {
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        background-color: white;
        transform: translate(-50%, -50%);

    img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }

    }
    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }

    .btns {
        display: flex;
        justify-content: flex-end;
    }
</style>