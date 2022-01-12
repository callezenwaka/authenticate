<template>
	<div class="header--wrapper">
		<header class="header">
      <nav class="nav" id="nav">
        <ul class="nav--list">
          <li class="nav--item logo">
            <router-link class="nav--link" to="/">
              <svg class="logo--icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
            </router-link>
          </li>
          <li class="nav--item" v-if="profile">
            <router-link class="nav--link" to="/">{{role}} Dashboard</router-link>
          </li>
          <li class="nav--item profile" v-if="profile">
            <div style="width: 3rem;">
              <svg class="profile--icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="profile--content">
              <router-link class="nav--link profile--link" to="/profile">Profile</router-link>
              <router-link class="nav--link profile--link" to="/"><a @click="onLogout">Log out</a></router-link>
            </div>
          </li>
        </ul>
      </nav>
		</header>
	</div>
</template>

<script>
// @ is an alias to /src
import { mapGetters, mapActions } from "vuex";
export default {
  name: "Header",
  computed: {
    ...mapGetters(["profile", "role"]),
  },
  methods: {
    ...mapActions(["setProfile", "setRole"]),
    async onLogout() {
      await this.setProfile(false);
      await this.setRole('');
      localStorage.removeItem('profile');
      localStorage.removeItem('role');
      if (this.$route.path != '/login') {
        this.$router.push("/login");
      }
      // this.$router.push({ name: "Login" });
    },
  },
};
</script>

<style>
.header {
  margin: 0;
  padding: 0;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
}
#nav {
  padding: 10px;
  color: #42b983;
}
.nav .nav--list {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 0.75rem;
  width: 100%;
}
.nav .nav--item {
  list-style-type: none;
  margin-left: 1rem;
}
.nav--item .nav--link {
  color: #036438;
  text-decoration: underline;
}
.nav--item .nav--link:hover {
  color: #42b983;
}
.nav--item.logo {
  flex: auto;
  display: flex;
}
.logo--icon {
  width: 2rem;
  height: 2rem;
  color: #42b983;
}
/* profile */
.profile {
  position: relative;
}
.profile--icon {
  width: 2rem;
  height: 2rem;
  color: #42b983;
}
.profile--content {
  display: none;
  flex-direction: column;
  position: absolute;
  min-width: max-content;
  /* background-color: #f9f9f9; */
  /* box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); */
  z-index: 1;
}
.profile:hover .profile--content {
  display: flex;
}
.profile--content:hover .profile--link:hover {
  color: #42b983;
}

/* mini */
@media only screen and (min-width: 481px) {
  .nav .nav--item {
    list-style-type: none;
    margin-left: 1rem;
    margin-right: 1rem;
  }
  .nav .nav--list {
    margin-left: auto;
    margin-right: auto;
    margin-top: 0rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .logo--icon {
    width: 5rem;
    height: 5rem;
  }
}
/* max */
@media only screen and (min-width: 981px) {
  .nav .nav--list {
    width: 70%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 0rem;
  }
  .logo--icon {
    width: 5rem;
    height: 5rem;
  }
}
</style>