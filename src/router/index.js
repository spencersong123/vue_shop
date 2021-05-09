import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../views/login.vue"
import Home from "../views/home.vue"
import Welcome from "../views/welcome.vue"
import UserManager from "../views/menu/user_manager.vue"
import RightManager from "../views/menu/right_manager.vue"
import RoleManager from "../views/menu/role_manager.vue"
import GoodsCategory from "../views/goods/goods_category.vue"
import CategoryArgs from "../views/goods/category_args.vue"
import GoodsList from "../views/goods/goods_list.vue"
import AddGood from "../views/goods/add_good.vue"
import Orders from "../views/orders/order_list.vue"
import Report from "../views/report/report.vue"

Vue.use(VueRouter);

  const routes = [
    {path:"/login", component:Login},
    {path:"/", redirect:"/login"},
    {path:"/home", redirect:"/welcome", component: Home, children:[
        {path:"/welcome", component:Welcome},
        {path:"/users", component:UserManager},
        {path:"/rights", component:RightManager},
        {path:"/roles", component:RoleManager},
        {path:"/categories", component:GoodsCategory},
        {path:"/params", component:CategoryArgs},
        {path:"/goods", component:GoodsList},
        {path:"/goods/add", component:AddGood},
        {path:"/orders", component:Orders},
        {path:"/reports", component:Report},
      ]},
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next)=>{
  if(to.path === "/login") {
    return next();
  }
  let token = window.sessionStorage.getItem("token");
  if(!token)
    return next("/login");
  return next();
});

export default router
