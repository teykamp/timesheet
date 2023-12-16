<template>
  <div>
    <div class="row">

<div class="mainBody">
  <div class="floater">
    <div>
  </div>
    <div class="placeholder" style="height:300px;">PLACEHOLDER IMAGE</div>
    <p>Timesheet is a versatile application for management of stuff and things</p>
    </div>
</div>

<div class="rightSide">
  <div class="floater">
    <div class="placeholder" style="height:400px; margin-top: 0px;">PLACEHOLDER IMAGE</div>
  </div>
</div>

</div>

<div class="footer">
  <hr>
  <p>eykamp and shotgunfacelift on GitHub</p>
</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGoogleUserData } from '../stores/useDataStore'

const { getGoogleProfileDataFromGoogle } = useGoogleUserData()

onMounted(() => {
  getGoogleProfileDataFromGoogle()
})
</script>

<style scoped>
  * {box-sizing: border-box;}

body {
  font-family: Arial;
  padding: 10px;
  background: #ffffff;
}

.mainBody {   
  float: left;
  width: 80%;
}

.rightSide {
  float: left;
  width: 20%;
  background-color: #ffffff;
  padding-left: 20px;
}

.placeholder {
  background-color: #dedede;
  width: 100%;
  padding: 25px;
  text-align: center;
}

.floater {
  background-color: white;
  padding: 20px;
}

.row::after {
  content: "";
  display: table;
  clear: both;
}

.footer {
  padding: 20px;
  text-align: left;
  background: #ffffff;
}

hr {
  height: 2px;
  border: none;
  background-color: #dedede;
  margin-top: 0px
}
</style>