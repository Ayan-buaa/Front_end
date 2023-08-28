<template>
  <div id="item-design">
    <div class="canvas-mark" ref="canvasMask">
      <div ref="select" class="select-border" v-if="this.$data.currentComponent">
        <el-button type="danger" ref="delete" icon="el-icon-close" class="delete-button" circle 
        v-if="this.$data.currentComponent!=this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]]" @click="remove()"></el-button>
      </div>
      <div ref="range" class="circle" v-if="this.$data.currentTool && this.$data.currentTool.size!=undefined"></div>
      <div ref="canvasBack" class="canvas">
        <canvas ref="tempCanvas" :class="$data.currentTool?'temp-canvas1':'temp-canvas2'" fillStyle="rgba(255,255,255,0)">
        </canvas>
        <canvas v-for="canva in canvasList" class="main-canvas" :ref="'canvas' + canva.id">
        </canvas>
      </div>
    </div>
    <el-row class="title">
      <el-col :span="2" class="gap1">

      </el-col>
      <el-col :span="8" class="gap1">
        <el-popconfirm
        @confirm="reset()"
        confirm-button-text='清除'
        cancel-button-text='取消'
        icon="el-icon-info"
        icon-color="red"
        title="确定清空当前画布吗？（此操作不可逆）"
      >
        <el-button slot="reference" :disabled="this.$data.selected || this.$data.canvasIndexList.length <= 0" type="danger" @click="changeCurrentTool(null)">清空画布</el-button>
      </el-popconfirm>
      <el-popconfirm
        class="gap3"
        @confirm="removeAllComponents()"
        confirm-button-text='清除'
        cancel-button-text='取消'
        icon="el-icon-info"
        icon-color="red"
        title="确定清空所有组件吗？（此操作不可逆）"
      >
        <el-button slot="reference" :disabled="this.$data.selected || this.$data.canvasIndexList.length <= 0" type="danger" @click="changeCurrentTool(null)">清空组件</el-button>
      </el-popconfirm>
      <el-popconfirm
        @confirm="deletePage()"
        confirm-button-text='删除'
        cancel-button-text='取消'
        icon="el-icon-info"
        icon-color="red"
        title="确定删除当前页面吗？（此操作不可逆）"
      >
        <el-button slot="reference" :disabled="this.$data.selected || this.$data.canvasIndexList.length <= 0" type="danger" icon="el-icon-delete"></el-button>
      </el-popconfirm>
      <el-popover
        class="gap3"
        placement="bottom"
        width="50"
        height="100"
        trigger="click"
      >
        <el-row class="gap2"><el-button type="info" @click="downloadOne()">下载此页</el-button></el-row>
        <el-row class="gap2"><el-button type="info" @click="downloadAll()">下载全部</el-button></el-row>
        <el-button slot="reference" :disabled="this.$data.selected || this.$data.canvasIndexList.length <= 0" type="info" icon="el-icon-download"></el-button>
      </el-popover>
      </el-col>
      <el-col :span="4">
      <DoubleClick :title="this.$data.title" class="title-content" @getMsg="getTitle"/>
      </el-col>
      <el-col :span="6" class="gap1">
        <el-button type="primary" icon="el-icon-plus" :disabled="this.$data.selected" @click="newPage()"></el-button>
        <el-button type="primary" icon="el-icon-back" @click="switchPage($data.currentCanvasIndex-1)" :disabled="$data.currentCanvasIndex<=0"></el-button>
        <el-popover
        class="gap3"
        placement="bottom"
        width="50"
        height="100"
        trigger="manual"
        v-model="selected"
      >
        <el-row class="gap2"><el-button type="primary" @click="swapPage()">交换</el-button></el-row>
        <el-row class="gap2"><el-button type="primary" @click="insertPage()">插入</el-button></el-row>
        <el-button slot="reference" type="primary" @click="selectPage()" :disabled="this.$data.canvasIndexList.length <= 0">{{selected?"取消":"选择"}}</el-button>
      </el-popover>
        <el-button type="primary" icon="el-icon-right" @click="switchPage($data.currentCanvasIndex+1)" :disabled="$data.currentCanvasIndex>=$data.canvasIndexList.length-1"></el-button>
    </el-col>
    <el-col :span="3" class="gap1">
      <span class="page-num">第{{currentCanvasIndex + 1}}页 , 共{{canvasIndexList.length}}页</span>
    </el-col>
    <el-col :span="1" class="gap1">
      <el-color-picker @change="updateBorderColor()" v-model="borderColor"></el-color-picker>
    </el-col>
    </el-row>
    <el-container class="workplace">
    <el-aside width="300px" class="tools"> 
    <div v-for="item in items" class="tool">
      <p class="label">{{item.label}}</p>
      <el-divider></el-divider>
      <button class="toolkit" v-for="tool in item.tools" @click="changeCurrentTool(tool.props)">
        <div :class="$data.currentTool==tool.props?'tool-selected':'tool-plain'">
        <img class="tool-icon" :src="tool.url">
        <p class="tool-name">{{tool.props.name}}</p></div>
      </button>
    </div>
    <div v-for="dragtool in dragTools" class="tool">
      <p class="label">{{dragtool.label}}</p>
      <el-divider></el-divider>
        <button class="toolkit drag-tool" v-for="tool in dragtool.tools" @dblclick="startDrag(tool.props)">
        <div>
        <img class="tool-icon" :src="tool.url">
        <p class="tool-name">{{tool.props.name}}</p></div>
        </button>
    </div>
    </el-aside>
    <div class="editor" v-if="this.$data.currentTool"> 
      <el-row class="props-title">{{this.$data.currentTool.name}}</el-row>
      <el-divider></el-divider>
      <el-row class="props-row" v-if="currentTool.size != undefined">
        <el-col class="props-label" :span="4">
          <span>粗细</span>
        </el-col>
        <el-col :span="18">
          <el-slider v-model="currentTool.size" :min="1" :max="50" @change="updateToolSize()"></el-slider>
        </el-col>
      </el-row>
      <el-row class="props-row"></el-row>
      <el-row class="props-row" v-if="currentTool.color != undefined">
        <el-col :span="4">
        <span class="props-label">颜色</span>
        </el-col>
        <el-col :span="4">
        <el-color-picker size="mini" v-model="currentTool.color"></el-color-picker>
      </el-col>
      </el-row>
    </div>
    <div class="editor" v-else-if="this.$data.currentComponent"> 
      <el-row class="props-title">{{this.$data.currentComponent.name}}</el-row>
      <el-divider></el-divider>
      <el-row class="props-row" v-if="currentComponent.locationX != undefined && currentComponent.locationY != undefined">
        <el-col class="props-label" :span="4">
          <span>X</span>
        </el-col>
        <el-col :span="8">
          <el-input-number @change="updateCurrentComponent()" class="props-num" v-model="currentComponent.locationX" controls-position="right"></el-input-number>
        </el-col>
        <el-col class="props-label" :span="4">
          <span>Y</span>
        </el-col>
        <el-col :span="8">
          <el-input-number @change="updateCurrentComponent()" class="props-num" v-model="currentComponent.locationY" controls-position="right"></el-input-number>
        </el-col>
      </el-row>
      <el-row class="props-row" v-if="currentComponent.width != undefined && currentComponent.height != undefined">
        <el-col class="props-label" :span="4">
          <span>高度</span>
        </el-col>
        <el-col :span="8">
          <el-input-number @change="updateCurrentComponent()" class="props-num" v-model="currentComponent.height" controls-position="right" :min="2"></el-input-number>
        </el-col>
        <el-col class="props-label" :span="4">
          <span>宽度</span>
        </el-col>
        <el-col :span="8">
          <el-input-number @change="updateCurrentComponent()" class="props-num"  v-model="currentComponent.width" controls-position="right" :min="2"></el-input-number>
        </el-col>
      </el-row>
      <el-row class="props-row"></el-row>
      <el-row class="props-row" v-if="currentComponent.color != undefined">
        <el-col :span="4">
        <span class="props-label">颜色</span>
        </el-col>
        <el-col :span="4">
        <el-color-picker @change="updateCurrentComponent()" size="mini" v-model="currentComponent.color"></el-color-picker>
      </el-col>
      </el-row>
    </div>
    </el-container>
  </div>
</template>

<script setup>
import DoubleClick from '../components/DoubleClick.vue'
import html2Canvas from 'html2canvas';
</script>

<script>
const axios = require('axios');
export default {
  data() {
    return {
      config:{
        headers:{
          'Content-Type': 'application/json',
          'Authorization' : 'Token 752b7d9c1c60c9d528644928e3d428ec1040d749',
        }
      },
      recting:false,
      isDrop:false,
      mousedown:false,
      upX:false,
      upY:false,
      downX:false,
      downY:false,
      isOnOff:false,
      oldX:0,
      oldY:0,
      distX:0,
      distY:0,
      distdX:0,
      distdY:0,
      distuX:0,
      distuY:0,
      title:'name',
      downloadIndex:0,
      selectedIndex:0,
      selected:false,
      currentComponent:null,
      currentTool:null,
      borderColor:'#000000',
      currentCanvasIndex:-1,
      canvasList:[],
      canvasIndexList:[],
      defaultCanvas:{
        id:'',
        name:'画布',
        locationX:0,
        locationY:0,
        height:480,
        width:720,
        color:'#FFAAAA',
        ref:'',
        mainCanvas:'',
        components:[],
      },
      items:[
        {
          label:'基本工具',
          tools:[{
            url:require('../assets/img/pencil.png'),
            props:{
              id:'pencil',
              name:'铅笔',
              size:10,
              color:'#FA0A0F',
            }},{
            url:require('../assets/img/rect.png'),
            props:{
              id:'rect',
              name:'矩形',
              size:10,
              color:'#FFFFFF',
            }},{
            url:require('../assets/img/eraser.png'),
            props:{
              id:'eraser',
              name:'橡皮',
              size:10,
            }},
        ]},
      ],
      dragTools:[{
        label:'图标',
        tools:[{
            ref:'drag1',
            url:require('../assets/img/pencil.png'),
            props:{
              url:require('../assets/img/pencil.png'),
              id:'pencil',
              name:'铅笔',
              width:200,
              height:200,
            }
          }]
      },{
        label:'图标',
        tools:[{
            ref:'drag2',
            url:require('../assets/img/pencil.png'),
            props:{
              url:require('../assets/img/pencil.png'),
              id:'pencil',
              name:'铅笔',
              width:200,
              height:200,
            }
        }]
      }]
    }
  },
  mounted() {
    //this.getToken();
    this.getCanvas();
    const canvas = this.$refs.tempCanvas;
    canvas.width = window.outerWidth;
    canvas.height = window.outerHeight;
    if(this.$data.currentCanvasIndex>=0){
      const mCanvas = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      mCanvas.ref=this.$refs.canvasBack;     //-----
      mCanvas.mainCanvas = this.$refs["canvas" + mCanvas.id][0];//-----
      mCanvas.mainCanvas.width = window.outerWidth;
      mCanvas.mainCanvas.height = window.outerHeight;
    }
    canvas.addEventListener('mousemove', (event) => {
        if(this.$data.selected)return;
          if(!this.$data.currentTool)return;
          if(!this.$data.isOnOff == true)return;
          const ctx = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].mainCanvas.getContext('2d');
          const tctx = this.$refs.tempCanvas.getContext('2d');
          ctx.strokeStyle = this.$data.currentTool.color;
          ctx.lineWidth = this.$data.currentTool.size;
          let newX = event.pageX - this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX;
          let newY = event.pageY - this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY;
          switch(this.$data.currentTool.id)
          {
            case 'eraser':
              ctx.strokeStyle = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].color;
            case 'pencil':

              ctx.beginPath();
              ctx.moveTo(this.$data.oldX, this.$data.oldY);
              ctx.lineTo(newX, newY);
              ctx.lineCap = 'round';
              ctx.stroke();
              ctx.closePath();

              break;
            case 'rect':
              tctx.strokeStyle = this.$data.currentTool.color;
              tctx.lineWidth = this.$data.currentTool.size;
              tctx.clearRect(this.$data.distX - tctx.lineWidth, this.$data.distY- tctx.lineWidth
                          , this.$data.oldX-this.$data.distX + 2*tctx.lineWidth, this.$data.oldY-this.$data.distY + 2*tctx.lineWidth);
              tctx.clearRect(this.$data.distX + tctx.lineWidth, this.$data.distY+ tctx.lineWidth
                          , this.$data.oldX-this.$data.distX - 2*tctx.lineWidth, this.$data.oldY-this.$data.distY - 2*tctx.lineWidth);
              tctx.clearRect(this.$data.distX + tctx.lineWidth, this.$data.distY- tctx.lineWidth
                          , this.$data.oldX-this.$data.distX - 2*tctx.lineWidth, this.$data.oldY-this.$data.distY + 2*tctx.lineWidth);
              tctx.clearRect(this.$data.distX - tctx.lineWidth, this.$data.distY+ tctx.lineWidth
                          , this.$data.oldX-this.$data.distX + 2*tctx.lineWidth, this.$data.oldY-this.$data.distY - 2*tctx.lineWidth);
              tctx.strokeRect(this.$data.distX, this.$data.distY, newX-this.$data.distX, newY-this.$data.distY);
              break;
          }
          this.$data.oldX = newX;
          this.$data.oldY = newY;
    }, false);
    canvas.addEventListener('mousedown', (event) => {
        if(this.$data.selected)return;
          if(!this.$data.currentTool){
            if(document.body.style.cursor != "default")return;
            this.$data.currentComponent = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
            this.updateCurrentComponent();
            return; }
          this.$data.isOnOff = true;
          this.$data.oldX = event.pageX - this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX;
          this.$data.oldY = event.pageY - this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY;
          switch(this.$data.currentTool.id)
          {
            case 'pencil':
              break;
            case 'rect':
              this.$data.distX = event.pageX - this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX;
              this.$data.distY = event.pageY - this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY;
              this.$data.recting = true;
              break;
            default:
              console.log("defaultadd");
          }  
    }, true);
    canvas.addEventListener('mouseup', (event) =>{
        if(this.$data.selected)return;
        if(!this.$data.currentTool)return;
        const ctx = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].mainCanvas.getContext('2d');
        const tctx = this.$refs.tempCanvas.getContext('2d');
        let newX = event.pageX - this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX;
        let newY = event.pageY - this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY;
        switch(this.$data.currentTool.id){
          case 'pencil':
            break;
          case 'rect':
            ctx.strokeStyle = this.$data.currentTool.color;
            ctx.lineWidth = this.$data.currentTool.size;
              tctx.clearRect(this.$data.distX - tctx.lineWidth, this.$data.distY- tctx.lineWidth
                          , this.$data.oldX-this.$data.distX + 2*tctx.lineWidth, this.$data.oldY-this.$data.distY + 2*tctx.lineWidth);
              tctx.clearRect(this.$data.distX + tctx.lineWidth, this.$data.distY+ tctx.lineWidth
                          , this.$data.oldX-this.$data.distX - 2*tctx.lineWidth, this.$data.oldY-this.$data.distY - 2*tctx.lineWidth);
              tctx.clearRect(this.$data.distX + tctx.lineWidth, this.$data.distY- tctx.lineWidth
                          , this.$data.oldX-this.$data.distX - 2*tctx.lineWidth, this.$data.oldY-this.$data.distY + 2*tctx.lineWidth);
              tctx.clearRect(this.$data.distX - tctx.lineWidth, this.$data.distY+ tctx.lineWidth
                          , this.$data.oldX-this.$data.distX + 2*tctx.lineWidth, this.$data.oldY-this.$data.distY - 2*tctx.lineWidth);
            ctx.strokeRect(this.$data.distX, this.$data.distY, newX-this.$data.distX, newY-this.$data.distY);
            break;
        }
            this.$data.isOnOff = false;
            this.$data.recting = false;
    }, false);
    window.onmousedown=(event) => {
      if(!this.$data.currentComponent)return;
      this.$data.mousedown = true;
      var r = 5;
      var minX = this.$data.currentComponent.locationX;
      var maxX = this.$data.currentComponent.locationX + this.$data.currentComponent.width;
      var minY = this.$data.currentComponent.locationY;
      var maxY = this.$data.currentComponent.locationY + this.$data.currentComponent.height;
      if(this.$data.currentComponent.ref != this.$refs.canvasBack){
        minX += this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX;
        maxX += this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX;
        minY += this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY;
        maxY += this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY;
      }
      if(event.pageX<minX-r)return;
      if(event.pageY<minY-r)return;
      if(event.pageX>maxX+r)return;
      if(event.pageY>maxY+r)return;
      this.$data.downX = (event.pageX>=maxX-r && event.pageX<=maxX+r);
      this.$data.downY = (event.pageY>=maxY-r && event.pageY<=maxY+r);
      this.$data.upX = (event.pageX>=minX-r && event.pageX<=minX+r && !(this.$data.downX));
      this.$data.upY = (event.pageY>=minY-r && event.pageY<=minY+r && !(this.$data.downY));
      this.$data.isDrop=!(this.$data.upX || this.$data.upY || this.$data.downX || this.$data.downY);
      this.$data.distX=event.pageX-this.$data.currentComponent.locationX;
      this.$data.distY=event.pageY-this.$data.currentComponent.locationY;
      this.$data.distdX=event.pageX-this.$data.currentComponent.width;
      this.$data.distdY=event.pageY-this.$data.currentComponent.height;
      this.$data.distuX=event.pageX+this.$data.currentComponent.width;
      this.$data.distuY=event.pageY+this.$data.currentComponent.height;

    }
    window.onmouseup=() => {
      this.$data.mousedown = false;
      this.$data.isDrop=false;
      this.$data.upX = false;
      this.$data.upY = false;
      this.$data.downX = false;
      this.$data.downY = false;
    }
    window.onmousemove=(event) => {
      if(this.$data.currentTool && this.$data.currentTool.size){
        this.$refs.range.style.left = event.pageX - this.$data.currentTool.size/2 + 'px';
        this.$refs.range.style.top = event.pageY - this.$data.currentTool.size/2 + 'px';
      }
      if(!this.$data.currentComponent)return;
      var elm = document.elementFromPoint(event.pageX, event.pageY);
      if(this.$data.currentComponent == this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]]){
        if(elm != null && elm != this.$refs.canvasMask && elm != this.$refs.tempCanvas)window.dispatchEvent(new Event('mouseup'));
      }
      else {
        if(elm != null && elm != this.$data.currentComponent.ref  && elm != this.$refs.tempCanvas)window.dispatchEvent(new Event('mouseup'));
      }
      if(this.$data.isDrop){
        this.$data.currentComponent.locationX=(event.pageX-this.$data.distX);
        this.$data.currentComponent.locationY=(event.pageY-this.$data.distY);
        this.updateCurrentComponent();
        return;
      }
      if(this.$data.upX){
        this.$data.currentComponent.locationX=(event.pageX-this.$data.distX);
        this.$data.currentComponent.width=(this.$data.distuX-event.pageX);
      }
      if(this.$data.upY){
        this.$data.currentComponent.locationY=(event.pageY-this.$data.distY);
        this.$data.currentComponent.height=(this.$data.distuY-event.pageY);
      }
      if(this.$data.downX){
        this.$data.currentComponent.width=(event.pageX-this.$data.distdX);
      }
      if(this.$data.downY){
        this.$data.currentComponent.height=(event.pageY-this.$data.distdY);
      }
      this.updateCurrentComponent();
      if(this.$data.mousedown)return;
      var r = 5;
      var minX = this.$data.currentComponent.locationX;
      var maxX = this.$data.currentComponent.locationX + this.$data.currentComponent.width;
      var minY = this.$data.currentComponent.locationY;
      var maxY = this.$data.currentComponent.locationY + this.$data.currentComponent.height;
      var flag = true;
      if(this.$data.currentComponent.ref != this.$refs.canvasBack){
        minX += this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX;
        maxX += this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX;
        minY += this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY;
        maxY += this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY;
      }
      if(event.pageX<minX-r)flag = false;
      if(event.pageY<minY-r)flag = false;
      if(event.pageX>maxX+r)flag = false;
      if(event.pageY>maxY+r)flag = false;
      document.body.style.cursor = "default";
      var cursorStyle = "";
      var downX = (event.pageX>=maxX-r && event.pageX<=maxX+r);
      var downY = (event.pageY>=maxY-r && event.pageY<=maxY+r);
      var upX = (event.pageX>=minX-r && event.pageX<=minX+r && !(this.$data.downX));
      var upY = (event.pageY>=minY-r && event.pageY<=minY+r && !(this.$data.downY));
      if(downY && flag)cursorStyle += "n";
      if(upY && flag)cursorStyle += "s";
      if(downX && flag)cursorStyle += "w";
      if(upX && flag)cursorStyle += "e";
      if(cursorStyle)document.body.style.cursor = cursorStyle + "-resize";
    }
    if(!this.$data.currentComponent)this.$data.currentComponent = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
  },
  methods:{
    updateCurrentComponent() {
      if(!this.$data.currentComponent)return;
      var item = this.$data.currentComponent.ref;
      this.$refs.select.style.width = item.style.width = this.$data.currentComponent.width + 'px';
      this.$refs.select.style.height = item.style.height = this.$data.currentComponent.height + 'px';
      this.$refs.select.style.left = item.style.left = this.$data.currentComponent.locationX + 'px';
      this.$refs.select.style.top = item.style.top = this.$data.currentComponent.locationY + 'px';
      if(item != this.$refs.canvasBack){
        this.$refs.select.style.left = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX + this.$data.currentComponent.locationX + 'px';
        this.$refs.select.style.top = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY + this.$data.currentComponent.locationY + 'px';
      }
      
      if(this.$data.currentComponent.color)item.style.backgroundColor = this.$data.currentComponent.color;
    },
    updateBorderColor() {
      this.$refs.select.style.outlineColor = this.$data.borderColor;
    },
    updateToolSize() {
      this.$refs.range.style.width = this.$data.currentTool.size + 'px';
      this.$refs.range.style.height = this.$data.currentTool.size + 'px';
    },
    selectPage() {
      this.$data.currentTool = null;
      if(this.$data.selected){
        this.$data.currentComponent = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
        this.$nextTick(()=>{this.updateCurrentComponent()});
      }
      else{
        this.$data.selectedIndex = this.$data.currentCanvasIndex;
        this.$data.currentComponent = null;
      }
      this.$data.selected = !this.$data.selected;
    },
    swapPage() {
      if(this.$data.selected == false) {
        this.$message.error("不能进行交换操作");
        return;
      }
      if(this.$data.selectedIndex == this.$data.currentCanvasIndex)return;
      var canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      if(canva){
        canva.mainCanvas.style.display="none";
        for(var i = 0; i < canva.components.length; i++){
          canva.components[i].style.display = "none";
        }
      }
      var temp;
      temp = this.$data.canvasIndexList[this.$data.selectedIndex];
      this.$data.canvasIndexList[this.$data.selectedIndex] = this.$data.canvasIndexList[this.$data.currentCanvasIndex];
      this.$data.canvasIndexList[this.$data.currentCanvasIndex] = temp;
      this.$nextTick(this.switchPage(this.$data.currentCanvasIndex));
      this.$data.selected = false;
    },
    insertPage() {
      if(this.$data.selected == false) {
        this.$message.error("不能进行插入操作");
        return;
      }
      var temp = this.$data.canvasIndexList[this.$data.selectedIndex];
      var canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      if(canva){
        canva.mainCanvas.style.display="none";
        for(var i = 0; i < canva.components.length; i++){
          canva.components[i].style.display = "none";
        }
      }
      if(this.$data.selectedIndex > this.$data.currentCanvasIndex){
        for(var i = this.$data.selectedIndex - 1; i > this.$data.currentCanvasIndex ;i--){
          this.$data.canvasIndexList[i+1] = this.$data.canvasIndexList[i];
        }
        this.$data.canvasIndexList[this.$data.currentCanvasIndex+1] = temp;
      }
      else if(this.$data.selectedIndex < this.$data.currentCanvasIndex){
        for(var i = this.$data.selectedIndex; i < this.$data.currentCanvasIndex ;i--){
          this.$data.canvasIndexList[i] = this.$data.canvasIndexList[i+1];
        }
        this.$data.canvasIndexList[this.$data.currentCanvasIndex] = temp;
      }
      this.$nextTick(this.switchPage(this.$data.currentCanvasIndex));
      this.$data.selected = false;

    },
    switchPage(index) {
      if(index >= this.$data.canvasIndexList.length)return;
      if(index < -1)return;
      this.$data.currentTool = null;
      if(index == -1){
        if(this.$data.canvasIndexList.length > 0)return;
        this.$refs.canvasBack.style.backgroundColor = "rgba(255,255,255,0)";
        this.$data.currentComponent = null;
        this.$data.currentCanvasIndex = -1;
        return;
      }
      var canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      if(canva){
        canva.mainCanvas.style.display="none";
        for(var i = 0; i < canva.components.length; i++){
          canva.components[i].style.display = "none";
        }
      }
      this.$data.currentCanvasIndex = index;
      canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      canva.mainCanvas.style.display="block";
      for(var i = 0; i < canva.components.length; i++){
        canva.components[i].style.display = "block";
      }
      this.$data.currentComponent = (this.$data.currentTool?null:canva);
      this.$nextTick(()=>{this.updateCurrentComponent()});
    },
    newPage(){
      //从后端申请一个新画布
      //------------------
      var length = this.$data.canvasIndexList.length;
      for(var i = length - 1; i > this.$data.currentCanvasIndex ;i--){
        this.$data.canvasIndexList[i+1] = this.$data.canvasIndexList[i]
      }
      if(this.$data.canvasIndexList.length==0){
        var newCanva = JSON.parse(JSON.stringify(this.$data.defaultCanvas));
        newCanva.locationX = window.outerWidth/2 - newCanva.width/2;
        newCanva.locationY = window.outerHeight/2 - newCanva.height/2;
        this.$data.canvasList.push(newCanva);

      }else {
        this.$data.canvasList.push(JSON.parse(JSON.stringify(this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]])));
      }
      this.$data.canvasIndexList[this.$data.currentCanvasIndex+1]=this.$data.canvasList.length - 1;
      if(this.$data.currentCanvasIndex>=0){
        var canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
        if(canva){
          canva.mainCanvas.style.display="none";
          for(var i = 0; i < canva.components.length; i++){
            canva.components[i].style.display = "none";
          }
        }
      }
      this.$data.currentCanvasIndex=this.$data.currentCanvasIndex+1;
      var canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      canva.ref = this.$refs.canvasBack;
      canva.id = this.$data.canvasList.length;
      canva.components = [];
      this.$data.currentComponent = (this.$data.currentTool?null:canva);
      this.$nextTick(()=>{
        canva.mainCanvas = (this.$refs['canvas'+canva.id])[0];
        canva.mainCanvas.width = window.outerWidth;
        canva.mainCanvas.height = window.outerHeight;
        this.updateCurrentComponent();
      })
    },
    removeAllComponents(){
      var comps = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].components;
      for(var i = 0; i < comps.length; i++){
        comps[i].remove();
      }
    },
    deletePage(){
      if(this.$data.canvasIndexList.length <= 0){
        this.$message.error("没有页面");
        return;
      }
      this.$nextTick(this.removeAllComponents());
      this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].mainCanvas.style.display="none";
      this.$data.canvasIndexList.splice(this.$data.currentCanvasIndex,1);
      if(this.currentCanvasIndex >= this.$data.canvasIndexList.length)this.currentCanvasIndex = this.$data.canvasIndexList.length - 1;
      this.$nextTick(this.switchPage(this.$data.currentCanvasIndex));
    },
    changeCurrentTool(item) {
      if(this.$data.canvasIndexList <= 0){
        this.$message.error("请先创建画布");
        return;
      }
      if(this.$data.selected){
        this.$message.error("请先退出选择");
        return;
      }
      if(this.$data.currentTool == item || item == null)
      {
        this.$data.currentTool = null;
        this.$data.currentComponent = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
        this.$nextTick(()=>{this.updateCurrentComponent()});
        return;
      }
      this.$data.currentTool = item;
      if(this.$data.currentTool.size != undefined) this.$nextTick(this.updateToolSize);
      this.$data.currentComponent = null;
    },
    startDrag(item){
      if(this.$data.canvasIndexList <= 0){
        this.$message.error("请先创建画布");
        return;
      }
      if(this.$data.selected){
        this.$message.error("请先退出选择");
        return;
      }
      this.$data.currentTool = null;
      var parDiv = this.$refs.canvasBack;
      var newDiv = document.createElement('div')
      parDiv.appendChild(newDiv);
      this.$data.currentComponent = {
        name:'属性',
        locationX:0,
        locationY:0,
        height:item.height,
        width:item.width,
        ref:newDiv,
      };
        newDiv.style.display="block";
        newDiv.style.zIndex=5;
        newDiv.style.position = "absolute";
        this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].components.push(newDiv);
        newDiv.addEventListener('click',(event)=>{
          if(this.$data.selected)return;
          this.$data.currentComponent = {
            name:'属性',
            locationX:parseInt(event.target.style.left),
            locationY:parseInt(event.target.style.top),
            height:parseInt(event.target.style.height),
            width:parseInt(event.target.style.width),
            ref:event.target,
          }
        });
      if(item.tag){
        var com = document.createElement(item.tag);
        newDiv.appendChild(com);
        com.style.height="200px";
        com.style.width="200px";
        com.style.display="block";
      }
      if(item.url){
        var img = document.createElement('img');
        newDiv.appendChild(img);
        img.src=item.url;
        img.style.objectFit = "contain";
        img.style.width="100%";
        img.style.height="100%";
        img.style.pointerEvents="none";
      }
    },
    getTitle(data){
      this.$data.title = data;
    },
    reset(){
        const ctx = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].mainCanvas.getContext('2d');
        const tctx = this.$refs.tempCanvas.getContext('2d');
        ctx.clearRect(0,0,10000,10000)
        tctx.clearRect(0,0,10000,10000)
    },
    remove(){
        if(!this.$data.currentComponent)return;
        if(!this.$data.currentComponent.ref)return;
        var comps = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].components;
        comps.splice(comps.indexOf(this.$data.currentComponent.ref),1);
        this.$data.currentComponent.ref.remove();
        this.$data.currentComponent = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
    },
    download(){
      var canvasList = document.getElementsByClassName('canvas');
      html2Canvas(canvasList[0]).then((canvas) => {
        const link = canvas.toDataURL("image/jpg");
        const file = document.createElement("a");
        file.style.display = "none";
        file.href = link;
        this.$data.downloadIndex = this.$data.downloadIndex + 1;
        file.download = decodeURI(this.$data.title + "_" + (this.$data.downloadIndex));
        document.body.appendChild(file);
        file.click();
        document.body.removeChild(file);
      });
    },
    downloadOne() {
      this.$data.downloadIndex = this.$data.currentCanvasIndex;
        this.download();
    },
    downloadAll() {
      this.$data.downloadIndex = 0;
      for(var i = 0;i < this.$data.canvasIndexList.length;i++) {
        this.switchPage(i);
        this.download();
      }
    },
    getToken() {
      var form = {username:"charlie",password:"1111"};
      axios.post('http://127.0.0.1:8000/api/login/', form).then((response)=>{
          this.$data.config.headers.Authorization = 'Token ' + response.data.token;  
        }).catch((error) => {
          this.error('1');
          console.log(error);
        });
    },
    getCanvas(){
      console.log(this.$data.config);
        // headers:{
        //   'Content-Type': 'application/json',
        //   'Authorization' : 'Token 752b7d9c1c60c9d528644928e3d428ec1040d749',
        // }
      axios.get('http://127.0.0.1:8000/api/teams/1/tasks/3/pages/',this.$data.config).then((response)=>{
          console.log(response.data)
          for(var i = 0; i < response.data.length;i++){
            var newCanva = {
              id:response.data[i].id,
              name:'画布',
              locationX:0,
              locationY:0,
              height:response.data[i].height,
              width:response.data[i].width,
              color:response.data[i].background_color,
              ref:this.$refs.canvasBack,
              mainCanvas:'',
              components:[],
            }
            newCanva.locationX = window.outerWidth/2 - newCanva.width/2;
            newCanva.locationY = window.outerHeight/2 - newCanva.height/2;
            this.$data.canvasIndexList[i] = this.$data.canvasList.length;
            this.$data.canvasList.push(newCanva);
          }
          this.$nextTick(()=>{
            for(var i = 0; i < this.$data.canvasIndexList.length;i++){
              console.log(
                'canvas'+this.$data.canvasList[this.$data.canvasIndexList[i]].id);
              this.$data.canvasList[this.$data.canvasIndexList[i]].mainCanvas 
              = (this.$refs['canvas'+this.$data.canvasList[this.$data.canvasIndexList[i]].id])[0];
            }
            if(this.$data.canvasIndexList.length > 0)this.$data.currentCanvasIndex = 0;
            this.switchPage(this.$data.currentCanvasIndex);
          });
        }).catch((error) => {
          this.error('1');
          console.log(error);
        });

    },
  },
}
</script>

<style src='../assets/css/itemDesign.css' scoped>
</style>