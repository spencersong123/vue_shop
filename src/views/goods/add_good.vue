<template>
    <div>
        <el-card>
            <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>商品管理</el-breadcrumb-item>
                <el-breadcrumb-item :to="{path:'/goods'}">商品列表</el-breadcrumb-item>
                <el-breadcrumb-item>添加商品</el-breadcrumb-item>
            </el-breadcrumb>

            <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>

            <el-steps :active="currentStep - '0'" finish-status="success" :align-center="true">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <el-tabs tab-position="left" v-model="currentStep"
                     :before-leave="beforeSwitch" @tab-click="tabChange">
                <el-tab-pane label="基本信息" name="0">
                    <el-form :model="addGoodInfo" label-width="80px" :rules="rules">
                        <el-form-item label="商品名称" prop="name">
                            <el-input v-model="addGoodInfo.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格">
                            <el-input v-model="addGoodInfo.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量">
                            <el-input v-model="addGoodInfo.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量">
                            <el-input v-model="addGoodInfo.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品介绍">
                            <el-input v-model="addGoodInfo.goods_introduce"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类">
                            <el-cascader v-model="selectedCategoryList" @change="handleCategoryChange"
                                         :options="allCategoryList"
                                         :props="{expandTrigger:'hover',children:'children',label:'cat_name',value:'cat_id'}">
                            </el-cascader>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <el-row v-for="arg in addGoodInfo.dynamic_args">
                        <el-col>
                            <el-row><span>{{arg.attr_name}}</span></el-row>
                            <el-row>
                                <el-tag v-for="val in arg.attr_vals" :key="val" closable>{{val}}</el-tag>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-row v-for="arg in addGoodInfo.static_attrs">
                        <el-col>
                            <el-row><span>{{arg.attr_name}}</span></el-row>
                            <el-row>
                                <el-tag v-for="val in arg.attr_vals" :key="val" closable>{{val}}</el-tag>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
<!--                    action是图片上传的后台路径,on-preview是预览的函数-->
                    <el-upload
                            :action="uploadURL"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :headers="uploadHeader"
                            :on-success="uploadSuccess"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <quill-editor v-model="addGoodInfo.goods_introduce"/>
                </el-tab-pane>
            </el-tabs>
        </el-card>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                currentStep: '0',
                addGoodInfo: {
                    "goods_name": "小米雨伞",
                    "goods_cat": "",
                    "goods_price": 35.6,
                    "goods_number": 87,
                    "goods_weight": 12.3,
                    "goods_introduce": "小米雨伞,为发烧而生",
                    "pics": {},
                    "static_attrs": [],
                    "dynamic_args": [],
                    "attrs": []
                },
                rules: {
                    "name": [{required: true, message: '请输入商品名称', trigger: 'blur'},
                        {min: 3, message: '至少3个字符', trigger: 'blur'}]
                },
                allCategoryList: [],
                selectedCategoryList: [],

                uploadURL :"http://127.0.0.1:8888/api/private/v1/upload",
                uploadHeader:{
                    Authorization:window.sessionStorage.getItem("token"),
                }
            }
        },
        computed: {
            getLastCategoryID() {
                const length = this.selectedCategoryList.length;
                return this.selectedCategoryList[length - 1];
            }
        },
        methods: {
            async getCategoryList() {
                const {data: res} = await this.$http.get("/categories", {params: {"type": 3}});
                if (res.meta.status !== 200) {
                    return this.$message.error("获取分类列表失败");
                }
                this.allCategoryList = res.data;
            },
            async handleCategoryChange() {
                const length = this.selectedCategoryList.length;
                if (length !== 3) {
                    this.selectedCategoryList = [];
                    return this.$message.error("只允许选中三级分类");
                }
                this.allCategoryList.goods_cat = this.selectedCategoryList.join(",");
            },
            async getAttrOrArgs(categoryID, sel) {
                const url = `categories/${categoryID}/attributes`;
                const {data: res} = await this.$http.get(url, {params: {"sel": sel}});
                if (res.meta.status !== 200) {
                    this.$message.error("获取数据失败");
                    return [];
                }
                return res.data;
            },

            beforeSwitch(activeName, oldName) {
                if (!this.addGoodInfo.goods_name) {
                    this.$message.error("请先填写商品名称");
                    return false;
                }
                const length = this.selectedCategoryList.length;
                if (oldName === "0" && length !== 3) {
                    this.$message.error("请先选择商品分类");
                    return false;
                }
                return true;
            },
            tabChange() {
                if (this.currentStep === '1') {
                    return this.clickGoodArgs();
                }
                if (this.currentStep === '2') {
                    return this.clickGoodAttrs();
                }

            },
            async clickGoodArgs() {
                // this.getLastCategoryID计算属性不是函数，调用时不需要加括号;this.getAttrOrArgs返回一个数组,但是在接收的时候会变成promise
                this.addGoodInfo.dynamic_args = await this.getAttrOrArgs(this.getLastCategoryID, "many");
                this.addGoodInfo.dynamic_args.forEach(dynamic_args => {
                    dynamic_args.attr_vals = dynamic_args.attr_vals?dynamic_args.attr_vals.split(" "):[];
                });
            },
            async clickGoodAttrs() {
                this.addGoodInfo.static_attrs = await this.getAttrOrArgs(this.getLastCategoryID, "only");
                this.addGoodInfo.static_attrs.forEach(static_attrs => {
                    static_attrs.attr_vals = static_attrs.attr_vals?static_attrs.attr_vals.split(" "):[];
                });
                console.log(this.addGoodInfo.static_attrs);
            },
            // 预览处理函数
            handlePreview(){

            },
            // 图片删除函数
            handleRemove(){

            },
            uploadSuccess(response, file, fileList){

            },

        },

        created() {
            this.getCategoryList();
        }
    }
</script>

<style lang="less" scoped>
    .el-breadcrumb {
        font-size: 20px;
    }

    .el-alert {
        margin-top: 20px;
        margin-bottom: 20px;
    }

    .el-steps {
        margin-top: 20px;
        margin-bottom: 20px;
    }

    .el-tag {
        margin-right: 17px;
    }

    .el-row {
        margin-bottom: 10px;
        margin-top: 10px;
    }

</style>