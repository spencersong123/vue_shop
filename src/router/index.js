import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../views/login.vue"
import Home from "../views/home.vue"
import Welcome from "../views/welcome.vue"
import UserManager from "../views/menu/user_manager.vue"

Vue.use(VueRouter);

  const routes = [
    {path:"/login", component:Login},
    {path:"/", redirect:"/login"},
    {path:"/home", redirect:"/welcome", component: Home, children:[
        {path:"/welcome", component:Welcome},
        {path:"/users", component:UserManager},
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
