import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../views/login.vue"
import Home from "../views/home.vue"

Vue.use(VueRouter);

  const routes = [
    {path:"/login", component:Login},
    {path:"/", redirect:"/login"},
    {path:"/home", component: Home},
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
