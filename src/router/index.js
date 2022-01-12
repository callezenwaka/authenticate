import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { guest: true },
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// router.beforeEach((to, from, next) => {
//   let profile = localStorage.getItem('profile');
//   let role = localStorage.getItem('role');
// 	const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
// 	if (requiresAuth && !role && !profile) {
// 		next({ name: "Home" });
// 	} else {
// 		next();
// 	}
// });

export default router
