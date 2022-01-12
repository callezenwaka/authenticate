<template>
  <div class="footer--wrapper">
    <footer class="footer">
      <div class="footer--items">
        <div class="logo--item">
          <svg class="logo--icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
					</svg>
          <div class="logo--link" to="/">
            <span class="logo--text">Motionstreak © {{ new Date().getFullYear() }} | A Portfolio Company</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Footer",
};
</script>

<style scoped>
/* footer */
.footer {
  font-family: inherit;
  padding-top: 36px;
  padding-bottom: 36px;
  width: 100%;
}
.footer--items {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 0;
  font-family: inherit;
}
.logo--item {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-shrink: 0;
  font-family: inherit;
  min-width: 0;
  max-width: 100%;
}
.logo--icon {
  width: 2rem;
  height: 2rem;
}
.logo--link {
  align-self: center;
}
.logo--text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 700;
  font-size: xx-small;
}
.footer--item {
  position: relative;
  display: flex;
  align-self: stretch;
  flex-shrink: 0;
  flex-direction: column;
  font-family: inherit;
  /*min-width: 550px;*/
  max-width: 100%;
  margin-top: 1rem;
}
.footer--lists {
  font-family: inherit;
  flex-wrap: wrap;
  justify-content: center;
  display: flex;
  align-items: stretch;
  flex-direction: row;
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.footer--list {
  margin: 0;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  font-family: inherit;
  flex-basis: 0px;
}
.dark-mode-toggle {
  vertical-align: middle;
}
.dark-mode-toggle-icon {
  height: 1.5rem;
  width: 1.5rem;
  fill: rgba(55, 65, 81, 1);
}
.sr-only {
  display: none;
}
/* Wider screen */
@media screen and (min-width: 481px) {
  .footer {
    font-size: initial;
  }
  .footer--items {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    flex-wrap: nowrap;
    align-items: stretch;
    justify-content: center;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 0;
    font-family: inherit;
  }
  .footer--item {
    position: relative;
    display: flex;
    align-self: center;
    flex-shrink: 0;
    flex-direction: column;
    font-family: inherit;
    /*min-width: 550px;*/
    max-width: 100%;
    margin-top: 0;
  }
  .footer--lists {
    font-family: inherit;
    flex-wrap: nowrap;
    justify-content: flex-start;
    display: flex;
    align-items: center;
    flex-direction: row;
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  .footer--list {
    margin-left: 1rem;
    margin-right: 1rem;
    font-family: inherit;
  }
  .logo--text {
    margin-left: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 700;
    font-size: initial;
  }
}
</style>