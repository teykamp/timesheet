<template>
  <div>
    <v-card
      elevation="1"
      class="h-16 rounded-0 d-flex align-center"
    >
      <v-avatar v-if="smAndUp"
        class="mx-10"
        size="x-large"
        color="info"
        icon="mdi-clock-outline"
      >
      </v-avatar>
      <v-btn
        v-if="xs"
        @click="showDrawer = !showDrawer"
        class="ml-4"
        flat
        icon="mdi-menu">
      </v-btn>
      
      <Teleport to="body">
        <v-navigation-drawer
          v-model="showDrawer"
          location="bottom"
          temporary
        >
          <v-list-item title="My Application" subtitle="Vuetify"></v-list-item>
          <v-divider></v-divider>
          <v-list-item link title="List Item 1"></v-list-item>
          <v-list-item link title="List Item 2"></v-list-item>
          <v-list-item link title="List Item 3"></v-list-item>
        </v-navigation-drawer>
      </Teleport>

      <div 
        v-if="mdAndUp"
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

      <v-menu
        v-model="showProfileMenu"
        :close-on-content-click="false"
        location="end"
      >
      <!-- this should create a dialog from the bottom on mobile -->
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            flat 
            v-bind="props"
            class="mx-4 mr-8"
          >
            <v-avatar>
              <v-img
                src="https://cdn.vuetifyjs.com/images/john.jpg"
                alt=""
              ></v-img>
            </v-avatar>
          </v-btn>
        </template>

        <!-- menuBox -->
        <v-card min-width="300">
          <v-list>
            <v-list-item
              prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
              title="John Leider"
              subtitle="Founder of Vuetify"
            >
              <template v-slot:append>
                <v-btn
                  variant="text"
                  icon="mdi-heart"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list>
            <v-list-item>
              <v-switch
                color="purple"
                label="Enable messages"
                hide-details
              ></v-switch>
            </v-list-item>

            <v-list-item>
              <v-switch
                color="purple"
                label="Enable hints"
                hide-details
              ></v-switch>
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              variant="text"
              @click="showProfileMenu = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="showProfileMenu = false"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
      <!-- end menuBox -->
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useDisplay } from 'vuetify'
import { useColorPalette } from '../stores/useUserInterfaceStore'

const { smAndDown, mdAndUp, smAndUp, xs } = useDisplay()
const { gray, blue, white, textPrimary, textSelected } = useColorPalette()

const router = useRouter()
const route = useRoute()
const currentRoute = computed(() => {
  return route.path
})

const navLinkClick = (route: RouteRecordRaw) => {
  router.push(route.path)
}

const showProfileMenu = ref(false)
const showDrawer = ref(false)
</script>