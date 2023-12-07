<template>
  <div>
    <v-card
      elevation="1"
      class="h-16 rounded-0 d-flex align-center"
    >
      <div 
        v-if="smAndUp"
      >
        <v-btn 
          v-for="localRoute in router.getRoutes()"
          :key="localRoute.path"
          @click="navLinkClick(localRoute)"
          flat
          class="ma-2"
          :style="{
            background: localRoute.path === currentRoute ? gray : '',
            color: localRoute.path === currentRoute ? textSelected : textPrimary, 
          }"
        >
          {{ localRoute.name }}
        </v-btn>
      </div>
      <v-spacer>
      </v-spacer>
      <v-btn
        class="mx-4"
        :style="{ 
          background: blue, 
          color: white 
        }"
        prepend-icon="mdi-plus"
      >New</v-btn>
      <v-btn 
        size="small" 
        flat 
        icon="mdi-bell-outline"
        :style="{
          color: textPrimary,
        }"
      ></v-btn>
      <v-avatar class="mx-4 mr-8">
        <v-img
          src="https://cdn.vuetifyjs.com/images/john.jpg"
          alt=""
        ></v-img>
      </v-avatar>
    </v-card>
      <!-- <ul class=navbar>
        <li><a href="home.html">Home</a></li>
      
        <li><a href="expenses.html">Expenses</a></li>
      
        <li><a href="timesheets.html">Timesheets</a></li>
      
        <li><a href="timesheets.html">Approvals</a></li>
      
        <li class="dropdown">
          <a href="profile" class="dropbtn">O</a>
          <div class="dropdown-content">
            <a href="#">Profile</a>
            <a href="#">Settings</a>
            <a href="#">Log Out</a>
          </div>
        </li>
      </ul>
      <hr> -->
    <div v-if="smAndDown">
      <v-navigation-drawer>
        <v-list-item title="My Application" subtitle="Vuetify"></v-list-item>
        <v-divider></v-divider>
        <v-list-item link title="List Item 1"></v-list-item>
        <v-list-item link title="List Item 2"></v-list-item>
        <v-list-item link title="List Item 3"></v-list-item>
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useDisplay } from 'vuetify'
import { useColorPalette } from '../stores/useUserInterfaceStore'

const { smAndDown, smAndUp } = useDisplay()
const { gray, blue, white, textPrimary, textSelected } = useColorPalette()

const router = useRouter()
const route = useRoute()
const currentRoute = computed(() => {
  return route.path
})

const navLinkClick = (route: RouteRecordRaw) => {
  router.push(route.path)
}
</script>

<style scoped>
.navbar {
  list-style-type: none;
  font-family: Arial;
  font-weight: bold;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #ffffff;
}

.navbar li {
  float: left;
}

li a,
.dropbtn {
  display: inline-block;
  color: black;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

li a:hover,
.dropdown:hover .dropbtn {
  background-color: #dedede;
}

li.dropdown {
  display: inline-block;
  float: right;
  direction: rtl;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #ffffff;
  min-width: 100px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: right;
}

.dropdown-content a:hover {
  background-color: #dedede;
}

.dropdown:hover .dropdown-content {
  display: block;
}

#divfont {
  font-family: Arial;
  font-size: 15px;
  color: black;
}

hr {
  height: 2px;
  border: none;
  background-color: #dedede;
  margin-top: 0px
}
</style>
../stores/useUserInterfaceStore