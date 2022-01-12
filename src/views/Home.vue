<template>
	<div>
    <Header></Header>
		<div class="login">
			<form class="login--form" @submit.prevent="onLogin">
				<div class="login--header">
					<h2 class="login--title">Log in to your account</h2>
				</div>
				<div v-if="!!validations.length" class="validations">
					<ul style="text-align: left;"><li style="list-style-type: disc;" v-for="(validation, index) in validations" :key="index">{{validation}}</li></ul>
				</div>
				<div class="login--item">
					<label class="login--label" for="email">Email: </label>
					<input class="login--input" type="email" name="email" id="email" v-model="user.email" @blur="onBlur($event)" placeholder="Enter your email" required />
				</div>
				<div class="login--item">
					<label class="login--label" for="password">Password: </label>
					<input class="login--input" type="password" name="password" id="password" v-model="user.password" @blur="onBlur($event)" placeholder="Enter your password" required />
				</div>
        <div class="login--item">
            <label class="login--label" for="role">Role: </label>
            <select v-model="user.role" name="role" id="role" ref="role" class="login--input">
              <option value="" selected disabled>Select role</option>
              <option v-for="(role, index) in roles" :value='role' :key="index">{{ role }}</option>
            </select>
          </div>
				<div class="forget--password" v-if="user.email">
					<!-- <router-link :to="'/reset/password?email=' + user.email">&nbsp;Forgot Password?</router-link> -->
          <router-link to='/'>&nbsp;Forgot Password?</router-link>
				</div>
				<div class="login--item">
					<button class="login--button" :class="{isValid: isValid}" :disabled="!isValid" type="submit">Login</button>
				</div>
				<div class="login--option">
					<span class="">Don't have an account?</span>
					<router-link class="auth--link" to="/register">&nbsp;Sign Up</router-link>
				</div>
			</form>
		</div>
		<Main></Main>
		<Footer></Footer> 
	</div>
</template>

<script>
// @ is an alias to /src
import Header from "@/components/partials/Header.vue";
import Footer from "@/components/partials/Footer.vue";
import Main from "@/components/partials/Main.vue";
import { mapActions } from "vuex";
export default {
  name: "Home",
  components: {
    Header,
    Footer,
    Main,
  },
  data() {
    return {
      validations: [],
      roles: ["Sales", "Services", "Engineering", "Finance", "Operations", "Marketing", "Legal", "Sourcing", "Recruiting", "Audit", "Compliance"],
      user: {
        email: "",
        password: "",
        role: '',
      },
    };
  },
  computed: {
    isValid() {
      return this.user.email !== "" && this.user.password !== "" && this.user.role !== "";
    },
  },
  methods: {
    ...mapActions(["setProfile", "setRole"]),
    onBlur(event) {
      event.target.style.borderColor = event.target.value
        ? "rgba(229,231,235, 1)"
        : "rgba(255, 0, 0, 1)";
    },
    validate() {
      // Empty Errors container
      this.validations = [];
      // Check If Email Is Empty
      if (!this.user.email) {
        this.validations.push("Email is required!");
      }
      // Check If Password Is Empty
      if (!this.user.password) {
        this.validations.push("Password is required!");
      }
      // Check If Role Is Empty
      if (!this.user.role) {
        this.validations.push("Role is required!");
      }
      // Clear error messages on the page
      setTimeout(() => (this.validations = []), 5000);
      // If No Errors Return True
      if (this.validations.length) {
        return false;
      }
      return true;
    },
    async onLogin() {
      if (!this.validate()) return;
      try {
        await this.setProfile(true);
        await this.setRole(this.user.role)
        localStorage.setItem('profile', true);
        localStorage.setItem('role', this.user.role);
        this.$router.push({ name: "Home" });
      } catch (error) {
        console.log(error);
        // this.setMessage({ text: error.message, status: false });
      }
    },
  },
};
</script>

<style scoped>
/* login */
.login {
  padding: 1rem;
  width: 100%;
  /* background-image: url("../assets/login.svg"); */
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  transition: all 500ms linear;
}
.login--form {
  width: 100%;
  margin: 50px auto;
}
.login--title {
  text-align: center;
  margin: 2rem 0;
}
.validations {
  display: flex;
  justify-content: center;
  color: #ff0000;
  padding: 0.5rem;
  border-radius: 5px;
}
.login--item {
  display: flex;
  flex-direction: column;
  border: none;
  margin: 0px 0px 20px;
  padding: 0px;
}
.login--label {
  font-size: 14px;
  color: rgb(61, 79, 88);
  position: relative;
  height: 16px;
  /*width: 36px;*/
  text-align: left;
  font-weight: bold;
  line-height: 16px;
  letter-spacing: 0.02em;
}
.login--input {
  background-color: rgb(255, 255, 255);
  border: 1px solid rgba(229, 231, 235, 1);
  border-radius: 4px;
  height: 52px;
  width: 100%;
  font-size: 16px;
  line-height: 24px;
  margin-top: 5px;
  padding-left: 12px;
  padding-right: 12px;
  transition: border-color 150ms ease-in-out 0s;
}
.login--button {
  position: relative;
  background-color: transparent;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  -webkit-box-align: stretch;
  height: 45px;
  width: 100%;
  font-size: 18px;
  margin-top: 48px;
  margin-bottom: 5px;
  border-radius: 4px;
  text-decoration: none;
  cursor: not-allowed;
  z-index: 0;
  /* appearance: none; */
  transition: all 150ms ease-in-out 0s;
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%);
}
.login--button.isValid {
  cursor: pointer;
  background-color: rgba(209, 213, 219, 1);
}
.login--button.isValid:hover {
  opacity: 0.5;
}
.login--option {
  margin: 15px;
  color: rgb(33, 49, 60);
  font-size: 15px;
  display: inline;
  text-align: start;
  display: block;
  text-align: center;
}
.forget--password {
  display: inline-block;
  text-align: right;
  margin-top: 20px;
  width: 300px;
  width: calc(100vw - 32px);
  width: 100%;
}
.forget--password a {
  text-decoration: none;
  color: rgb(0, 124, 173);
  cursor: pointer;
  font-size: 15px;
}
.auth--link {
  text-decoration: none;
  color: rgb(0, 124, 173);
}

/* mini */
@media only screen and (min-width: 481px) {
  .login--form {
    width: 410px;
    margin: 0 auto;
  }
}
/* max */
@media only screen and (min-width: 981px) {
}
</style>