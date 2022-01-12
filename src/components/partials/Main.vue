<template>
  <div class="main--wrapper">
    <div class="main--help">
			<span>Need support? Call: <a href="`tel:${+234 803 000 0000}`" class="auth--link">&nbsp;+234 803 000 0000</a></span>
		</div>
		<div class="main--or"><span>or</span></div>
    <div class="main--help">
      <router-link class="auth--link" to="/">Open a ticket</router-link>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Main",
  computed: {},
  methods: {},
};
</script>

<style scoped>
/* main */
.main--wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 0.5rem;
}

.main--help {
  margin: 15px;
  color: rgb(33, 49, 60);
  font-size: 15px;
  display: inline;
  text-align: start;
  display: block;
  text-align: center;
}
.main--or {
  margin: 20px 0px;
  position: relative;
  text-align: center;
  width: 298px;
  width: calc(100vw - 32px);
  width: 100%;
}
.main--or::before {
  display: inline-block;
  border-top: 1px solid rgb(184, 196, 194);
  content: "";
  margin: 0px auto;
  position: absolute;
  height: 0px;
  inset: 50% 0px 0px;
  transform: translateY(-50%);
  width: 300px;
}
.main--or span {
  background: rgb(255, 255, 255);
  background-color: rgba(243, 244, 246, 1);
  padding: 0px 10px;
  font-size: 14px;
  font-weight: normal;
  line-height: 16px;
  color: rgb(93, 108, 116);
  text-align: center;
  position: inherit;
}
/* social--media */
.social--media--list--wrapper {
  color: rgb(255, 255, 255);
  display: flex;
  flex-direction: row;
  font-family: Ember, sans-serif;
  font-size: 10px;
  justify-content: space-between;
  line-height: 11.5px;
  list-style: none outside none;
  margin: 0;
  padding: 20px 0;
  text-rendering: optimizelegibility;
  visibility: visible;
  -webkit-box-direction: normal;
  -webkit-box-orient: horizontal;
  -webkit-box-pack: justify;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.social--media .social--media--list--wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  line-height: 11.5px;
  list-style: none outside none;
  margin: 0;
  visibility: visible;
  padding: 24px 0;
}
/* social--media--list */
.social--media--list--item {
  color: rgb(255, 255, 255);
  display: block;
  flex-shrink: 0;
  font-family: Ember, sans-serif;
  font-size: 10px;
  height: 40px;
  line-height: 11.5px;
  list-style: none outside none;
  text-align: left;
  text-rendering: optimizelegibility;
  visibility: visible;
  width: 40px;
  -webkit-box-direction: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.social--media .social--media--list--item {
  display: block;
  flex-shrink: 0;
  height: 40px;
  list-style: none outside none;
  text-align: left;
  visibility: visible;
  width: 40px;
}
.social--media .social--media--list--wrapper .social--media--list--item {
  margin: 8px;
}
/* social--media--link */
.social--link {
  background-color: rgba(229, 231, 235, 1);
  border-radius: 50%;
  box-sizing: border-box;
  color: rgb(255, 255, 255);
  cursor: pointer;
  display: block;
  font-family: Ember, sans-serif;
  font-size: 10px;
  height: 40px;
  line-height: 10px;
  list-style: none outside none;
  padding: 10px;
  position: relative;
  text-align: left;
  text-decoration-color: rgb(255, 255, 255);
  text-decoration-line: none;
  text-decoration-style: solid;
  text-rendering: optimizelegibility;
  width: 40px;
  -webkit-box-direction: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.social--link:hover {
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%);
}
.social--media a {
  font-size: 14px;
  color: #006efa;
}
.social--media a,
.social--media a:active,
.social--media a:hover,
.social--media a:visited,
.social--media a:disabled {
  text-decoration: none;
  font-weight: bold;
}
.social--media .social--link {
  border-radius: 50%;
  box-sizing: border-box;
  display: block;
  height: 40px;
  line-height: 10px;
  list-style: none outside none;
  padding: 10px;
  position: relative;
  width: 40px;
}
/* svg */
.social--icon {
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: block;
  fill: rgba(55, 65, 81, 1);
  font-family: Ember, sans-serif;
  font-size: 10px;
  height: 20px;
  line-height: 10px;
  list-style: none outside none;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
  text-align: left;
  text-rendering: optimizelegibility;
  width: 20px;
  -webkit-box-direction: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.social--media .social--icon {
  box-sizing: border-box;
  cursor: pointer;
  display: block;
  height: 20px;
  list-style: none outside none;
  position: relative;
  width: 20px;
}
.auth--link {
  text-decoration: none;
  color: rgb(0, 124, 173);
}
</style>