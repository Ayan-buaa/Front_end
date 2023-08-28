<template>
    <div @dblclick="dbTest()">
        <el-input class="title-input"
            v-focus
            v-if="isChecked"
            v-model="title"
            @blur="inputStred()"
            @keyup.native.13="inputStred()"
        />
        <div v-else>{{title}}</div>
        </div>
</template>

<script>
export default {
        data(){
            return{
                title:'name',
                isChecked:false,
            }
        },
        methods:{
            dbTest(){ 
                this.$data.isChecked= true;

            },
            inputStred(){
                this.$data.isChecked=false;
                this.$emit("getMsg", this.$data.title);
            }
        },
    }
</script>

<style scoped> 
::v-deep *{
    text-align: center;
    font-size: 30px;
}
.title-input{
    width:200px;
};
</style> 