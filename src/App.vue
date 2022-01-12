<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
*,
::after,
::before,
html,
body {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html,
body {
  height: 100%;
  width: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: xx-small;
}
#nav {
  padding: 30px;
}
#nav a {
  font-weight: bold;
  /* color: #2c3e50; */
}
ul {
  padding: 0;
  margin: 0;
  list-style-type: none;
}
/* mini */
@media only screen and (min-width: 481px) {
  #app {
    font-size: initial;
  }
}
/* max */
@media only screen and (min-width: 981px) {
}
</style>