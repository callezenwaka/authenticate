import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    profile: false,
    role: '',
  },
  getters: {
    profile: state => state.profile,
    role: state => state.role,
  },
  actions: {
    async setProfile(context, payload) {
			context.commit('SET_PROFILE', payload);
		},
    async setRole(context, payload) {
			context.commit('SET_ROLE', payload);
		},
  },
  mutations: {
    SET_PROFILE(state, profile) {
			state.profile = profile;
		},
    SET_ROLE(state, role) {
			state.role = role;
		},
  },
  modules: {
  }
})
