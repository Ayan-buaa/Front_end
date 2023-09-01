<template>
  <div id="item-design">
    <div class="canvas-mark" ref="canvasMask">
      <div ref="select" class="select-border" v-if="this.$data.currentComponent && (!this.$data.nonname)">
        <el-button type="danger" ref="delete" icon="el-icon-close" class="delete-button" circle 
        v-if="this.$data.currentComponent!=this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]]" @click="remove()"></el-button>
      </div>
      <div ref="range" class="circle" v-if="this.$data.currentTool && this.$data.currentTool.size!=undefined && (!this.$data.nonname)"></div>
      <div ref="canvasBack" class="canvas">
        <canvas ref="tempCanvas" :class="$data.currentTool && $data.currentTool.id != 'act'?'temp-canvas1':'temp-canvas2'" fillStyle="rgba(255,255,255,0)">
        </canvas>
        <canvas v-for="canva in canvasList" class="main-canvas" :ref="'canvas' + canva.id">
        </canvas>
      </div>
    </div>
    <el-row class="title">
      <el-col :span="3" class="gap1" v-if="!this.$data.nonname" >
        <el-button type="primary" :disabled="this.$data.selected" @click="save()" class="save-button"><i class="el-icon-s-fold"></i>保存并返回</el-button>
      </el-col>
      <el-col :span="7" class="gap1">
        <el-popconfirm
        v-if="!this.$data.nonname"
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
        v-if="!this.$data.nonname"
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
        v-if="!this.$data.nonname"
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
      <el-col :span="4" v-if="!this.$data.nonname">
      <DoubleClick :title="this.$data.title" class="title-content" @getMsg="getTitle"/>
      </el-col>
      <el-col :span="4" v-else class="gap1" :offset="4"> 
        <span style="font-size:30px;">{{this.$data.title}}</span>
      </el-col>
      <el-col :span="6" class="gap1">
        <el-button type="primary" icon="el-icon-plus" :disabled="this.$data.selected" @click="newPage()" v-if="!this.$data.nonname"></el-button>
        <el-button type="primary" icon="el-icon-back" @click="switchPage($data.currentCanvasIndex-1)" :disabled="$data.currentCanvasIndex<=0"></el-button>
        <el-popover
        v-if="!this.$data.nonname"
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
        <el-popover
        v-if="!this.$data.nonname"
        class="gap3"
        placement="bottom"
        width="50"
        height="100"
        trigger="manual"
        v-model="canvasInterface"
      >
        <el-row class="gap2"><el-button type="primary" @click="changeSize(0)">居中画布</el-button></el-row>
        <el-row class="gap2"><el-button type="primary" @click="changeSize(1)">PC端大小</el-button></el-row>
        <el-row class="gap2"><el-button type="primary" @click="changeSize(2)">移动端大小</el-button></el-row>
        <el-button slot="reference" type="primary"  icon="el-icon-full-screen" @click="canvasInterface=!canvasInterface" :disabled="this.$data.selected || this.$data.canvasIndexList.length <= 0"></el-button>
      </el-popover>
      </el-col>
    <el-col :span="3" class="gap1">
      <span class="page-num">第{{currentCanvasIndex + 1}}页 , 共{{canvasIndexList.length}}页</span>
    </el-col>
    <el-col :span="1" class="gap1" v-if="!this.$data.nonname">
      <el-color-picker @change="updateBorderColor()" v-model="borderColor"></el-color-picker>
    </el-col>
    </el-row>
    <el-container class="workplace">
    <el-aside width="280px" class="tools" v-if="!this.$data.nonname"> 
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
        <button class="toolkit drag-tool" v-for="tool in dragtool.tools" @dblclick="startDrag(currentCanvasIndex,componentProps[tool.id])">
        <div>
        <img class="tool-icon" :src="tool.url">
        <p class="tool-name">{{componentProps[tool.id].name}}</p></div>
        </button>
    </div>
    </el-aside>
    <div class="editor" v-if="this.$data.currentTool && (!this.$data.nonname)"> 
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
      <el-row class="props-row" v-if="currentTool.id == 'act'">
        <el-col :span="4">
        <span class="props-label">分享</span>
        </el-col>
        <el-col :span="4">
          <el-switch
          v-model="shared"
          active-color="#13ce66"
          inactive-color="#ff4949" @change="setSharedStatus(shared)">
        </el-switch>
      </el-col>
      </el-row>
      <el-row class="props-row"></el-row>
      <el-row v-if="currentTool.id == 'act' && shared">
        <el-col :span="22" :offset="1">
          <el-input v-model="sharedURL" :readonly="true"></el-input>
        </el-col>
      </el-row>
    </div>
    <div class="editor" v-else-if="this.$data.currentComponent && (!this.$data.nonname)"> 
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
      <el-row class="props-row" v-if="currentComponent.color != undefined">
        <el-col :span="4">
        <span class="props-label">颜色</span>
        </el-col>
        <el-col :span="4">
        <el-color-picker @change="updateCurrentComponent()" size="mini" v-model="currentComponent.color"></el-color-picker>
      </el-col>
      </el-row>
      <!-- <el-row class="props-row" v-if="currentComponent.size != undefined">
        <el-col class="props-label" :span="4">
          <span>大小</span>
        </el-col>
        <el-col :span="8">
          <el-input-number @change="currentComponent.ref.style.fontSize = currentComponent.ref.childNodes[0].__vue__.$root.$data.size+'px'" class="props-num"  v-model="currentComponent.ref.childNodes[0].__vue__.$root.$data.size" controls-position="right" :min="12" :max="48"></el-input-number>
        </el-col>
      </el-row> -->
      <el-row class="props-row"></el-row>
      <el-row class="props-row" v-if="currentComponent.text != undefined">
        <el-col :span="6">
        <span class="props-label">文字</span>
        </el-col>
      </el-row>
      <el-row class="props-row" v-if="currentComponent.text != undefined">
        <el-col :span="22" :offset="1">
          <el-input v-model="currentComponent.ref.childNodes[0].__vue__.$root.$data.ctext" placeholder="" class="input-text" @change="updataeCurrentComponentBack()"></el-input>
        </el-col>
      </el-row>
    </div>
    </el-container>
  </div>
</template>

<script setup>
import DoubleClick from '../components/DoubleClick.vue'
import html2Canvas from 'html2canvas';
import Vue from 'vue'
</script>

<script>
export default {
  data() {
    return {
      teamId : this.$route.params.teamid == undefined ? 1 : this.$route.params.teamid,
      taskId : this.$route.params.taskid == undefined ? 3 : this.$route.params.taskid,
      nonname : this.$route.params.taskid != undefined || this.$route.params.teamid != undefined,
      shared : false,
      sharedURL :'',
      canvasInterface:false,
      config:{
        headers:{
          'Content-Type': 'application/json',
          'Authorization' : this.$route.params.taskid != undefined || this.$route.params.teamid != undefined?'':'Token 752b7d9c1c60c9d528644928e3d428ec1040d749',
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
        default:{
          id:'',
          name:'画布',
          locationX:0,
          locationY:0,
          height:480,
          width:720,
          color:'#FFFFFF',
          ref:'',
          mainCanvas:'',
          components:[],
        },
        appStore:{
          id:'',
          name:'画布',
          locationX:0,
          locationY:0,
          height:480,
          width:720,
          color:'#FFFFFF',
          ref:'',
          mainCanvas:'',
          components:[],
        }
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
            {
              url:require('../assets/img/act.png'),
              props:{
                id:'act',
                name:'预览',
              }
            }
        ]},
      ],
      dragTools:[
      //   {
      //   label:'图标',
      //   tools:[{
      //       ref:'drag1',
      //       url:require('../assets/img/pencil.png'),
      //       props:{
      //         url:require('../assets/img/pencil.png'),
      //         id:'pencil',
      //         name:'铅笔',
      //         width:200,
      //         height:200,
      //       }
      //     }]
      // },
      {
        label:'组件',
        tools:[{
            id:'tool1',
            url:require('../assets/img/button1.png'),
        },{
            id:'tool2',
            url:require('../assets/img/select.png'),
        },{
            id:'tool3',
            url:require('../assets/img/switch.png'),
        },{
            id:'tool4',
            url:require('../assets/img/text.png'),
        },{
            id:'tool5',
            url:require('../assets/img/text.png'),
        },{
            id:'tool6',
            url:require('../assets/img/text.png'),
        },{
            id:'tool7',
            url:require('../assets/img/text.png'),
        },{
            id:'tool8',
            url:require('../assets/img/text.png'),
        },{
            id:'tool9',
            url:require('../assets/img/text.png'),
        },{
            id:'tool10',
            url:require('../assets/img/text.png'),
        },
        ]
      }],
      componentProps:{
        "tool1":{
              ikey:"tool1",
              tag:'el-button',
              name:'按钮1',
              text:'按钮',
              width:80,
              height:30,
        },
        "tool2":{
              ikey:"tool2",
              tag:'el-select',
              name:'选择器',
              props:" v-model=value",
              options: [{
                  value: '选项1',
                  label: '选项1'
                }, {
                  value: '选项2',
                  label: '选项2'
                }, {
                  value: '选项3',
                  label: '选项3'
                }],
              inner:"<el-option v-for='op in options' :key='op.value' :label='op.label' :value='op.value' :disabled='op.disabled'> </el-option>",
              width:150,
              height:30,
            },
        "tool3":{
          ikey:"tool3",
            tag:'el-switch',
            name:'开关',
            props:" active-color='#13ce66' inactive-color='#ff4949' v-model=value",
            width:80,
            height:30,
          },
        "tool4":{
          ikey:"tool4",
              tag:'el-row',
              name:'文本',
              text:'文字',
              width:120,
              height:60,
              size:12,
            },
        "tool5":{
          ikey:"tool5",
          tag:'el-avatar',
          name:'头像',
          width:100,
          height:100,
          props:" src='https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'"
        },
        "tool6":{
          ikey:"tool6",
          tag:'el-image',
          name:'图片',
          width:100,
          height:100,
          inner:'<div slot="error" class="image-slot" style="backgroundColor:rgb(200,200,200);height:inherit;width:inherit;"><i class="el-icon-picture-outline"></i></div>',
        },
        "tool7":{
          ikey:"tool7",
          tag:'el-rate',
          name:'评分',
          width:100,
          height:100,
          props:' v-model="value"',
        },
        "tool8":{
          ikey:"tool8",
          tag:"el-date-picker",
          name:'日期选择器',
          width:100,
          height:100,
          props:' v-model="value" type="date" placeholder="选择日期" style="::v-deep vertical-align: top;"',
        },
        "tool9":{
          ikey:"tool9",
          tag:'el-pagination',
          name:'分页器',
          width:300,
          height:40,
          props:' layout="prev, pager, next" :total="50"'
        },
        "tool10":{
          ikey:"tool10",
          tag:'el-slider',
          name:'滑块',
          width:100,
          height:30,
          props:' v-model="value"',
        }
      }
    }
  },
  mounted() {
    this.$data.sharedURL = window.location.href + '/' + this.$data.teamId + '/' + this.$data.taskId;
     this.getToken();
    if(!this.$data.nonname)this.getSharedStatus();
    this.getCanvas();
    const canvas = this.$refs.tempCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if(this.$data.currentCanvasIndex>=0){
      const mCanvas = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      mCanvas.ref=this.$refs.canvasBack;     //-----
      mCanvas.mainCanvas = this.$refs["canvas" + mCanvas.id][0];//-----
      mCanvas.mainCanvas.width = window.innerWidth;
      mCanvas.mainCanvas.height = window.innerHeight;
    }
    canvas.addEventListener('mousemove', (event) => {
      if(this.$data.nonname)return;
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
        if(this.$data.nonname)return;
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
        if(this.$data.nonname)return;
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
      if(this.$data.nonname)return;
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
      if(this.$data.nonname)return;
      this.resetMouseStatu();
      if(this.$data.currentCanvasIndex < 0 || this.$data.currentComponent == null)return;
      if(this.$data.currentComponent == this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]]){
        this.updateCurrentCanvasBack();
        return;
      }
      this.updataeCurrentComponentBack();
    }
    window.onmousemove=(event) => {
      if(this.$data.nonname)return;
      if(this.$data.currentTool && this.$data.currentTool.size){
        this.$refs.range.style.left = event.pageX - this.$data.currentTool.size/2 + 'px';
        this.$refs.range.style.top = event.pageY - this.$data.currentTool.size/2 + 'px';
      }
      if(!this.$data.currentComponent)return;
      // var elm = document.elementFromPoint(event.pageX, event.pageY);
      // if(this.$data.currentComponent == this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]]){
      //   if(elm != null && elm != this.$refs.canvasMask && elm != this.$refs.tempCanvas)this.resetMouseStatu();
      // }
      // else {
      //   if(elm != null && elm != this.$data.currentComponent.ref  && elm != this.$refs.tempCanvas)this.resetMouseStatu();
      // }
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
    resetMouseStatu() {
      this.$data.mousedown = false;
      this.$data.isDrop=false;
      this.$data.upX = false;
      this.$data.upY = false;
      this.$data.downX = false;
      this.$data.downY = false;
    },
    updateCurrentComponent() {
      if(!this.$data.currentComponent)return;
      var item = this.$data.currentComponent.ref;
      if(item == undefined)return;
      item.style.width = this.$data.currentComponent.width + 'px';
      item.style.height = this.$data.currentComponent.height + 'px';
      item.style.left = this.$data.currentComponent.locationX + 'px';
      item.style.top = this.$data.currentComponent.locationY + 'px';
      if(this.$data.currentComponent.text != undefined)item.style.fontSize = this.$data.currentComponent.height/3 + 'px';
      if(this.$data.currentComponent.color)item.style.backgroundColor = this.$data.currentComponent.color;
      if(this.$refs.select == undefined)return;
      this.$refs.select.style.width = item.style.width;
      this.$refs.select.style.height = item.style.height;
      this.$refs.select.style.left = item.style.left;
      this.$refs.select.style.top = item.style.top;
      if(item != this.$refs.canvasBack){
        this.$refs.select.style.left = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationX + this.$data.currentComponent.locationX + 'px';
        this.$refs.select.style.top = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].locationY + this.$data.currentComponent.locationY + 'px';
      }
      
    },
    updateCurrentCanvasBack() {
          var form = {
          name: this.$data.title + (1000 + this.$data.currentCanvasIndex),
          background_color : this.$data.currentComponent.color,
          width : this.$data.currentComponent.width,
          height : this.$data.currentComponent.height,
        }
        //teams/<int:team_id>/tasks/<int:task_id>/pages/<int:page_id>/
        var url = '/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/'+ this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].id+'/';
        this.$http.put(url, form,this.$data.config).then((response)=>{
          console.log('更新成功');
        }).catch((error) => {
          this.error('更新失败');
          console.log(error);
        });},
    updataeCurrentComponentBack() {
      if(!this.$data.currentComponent)return;
      var form = {
        component_type: this.$data.currentComponent.ref.childNodes[0].__vue__.$root.$data.tag,
        name: this.$data.currentComponent.ref.childNodes[0].__vue__.$root.$data.ctext,
        x_position :this.$data.currentComponent.locationX,
        y_position :this.$data.currentComponent.locationY,
        width : this.$data.currentComponent.width,
        height : this.$data.currentComponent.height,
      }
      var url = '/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/'+ this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].id +'/components/' + this.$data.currentComponent.ref.childNodes[0].__vue__.$root.$data.id + '/';
      this.$http.put(url, form,this.$data.config).then((response)=>{
        console.log('更新成功');
      }).catch((error) => {
        this.error('更新失败');
        console.log(error);
      });
    },
    updateBorderColor() {
      this.$refs.select.style.outlineColor = this.$data.borderColor;
    },
    updateToolSize() {
      this.$refs.range.style.width = this.$data.currentTool.size + 'px';
      this.$refs.range.style.height = this.$data.currentTool.size + 'px';
    },
    setCanvasStatus(canvas, status){
      if(canvas.mainCanvas)canvas.mainCanvas.style.display=status;
      for(var i = 0; i < canvas.components.length; i++){
        canvas.components[i].style.display = status;
      }
    },
    save() {
      for(var i = 0; i < this.$data.canvasIndexList.length;i++){
        var canvas = this.$data.canvasList[this.$data.canvasIndexList[i]];
        var form = {
            name: this.$data.title + (1000 + i),
            background_color : canvas.color,
            width : canvas.width,
            height : canvas.height,
          }
          //teams/<int:team_id>/tasks/<int:task_id>/pages/<int:page_id>/
          var url = '/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/'+ canvas.id+'/';
          this.$http.put(url, form,this.$data.config).then((response)=>{
            console.log('更新成功');
          }).catch((error) => {
            this.error('更新失败');
            console.log(error);
          });
        }
    },
    changeSize(opt) {
      this.$data.currentComponent = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      switch(opt) {
        case 1:
          this.$data.currentComponent.width = 1080;
          this.$data.currentComponent.height = 720;
          break;
        case 2:
          this.$data.currentComponent.width = 480;
          this.$data.currentComponent.height = 720;
          break;
        default:
          break;
      }
      this.$data.currentComponent.locationX = window.innerWidth/2 - this.$data.currentComponent.width/2;
      this.$data.currentComponent.locationY = window.innerHeight/2 - this.$data.currentComponent.height/2;
      this.$nextTick(()=>{this.updateCurrentComponent();this.updateCurrentCanvasBack()});
      this.$data.canvasInterface = false;
    },
    selectPage() {
      this.$data.canvasInterface = false;
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
        this.setCanvasStatus(canva,"none")
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
        this.setCanvasStatus(canva,"none")
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
        this.setCanvasStatus(canva,"none")
      }
      this.$data.currentCanvasIndex = index;
      canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      this.setCanvasStatus(canva,"block")
      this.$data.currentComponent = (this.$data.currentTool?null:canva);
      this.$nextTick(()=>{this.updateCurrentComponent()});
    },
    newPage(page){
      //从后端申请一个新画布
      //------------------
      var length = this.$data.canvasIndexList.length;
      for(var i = length - 1; i > this.$data.currentCanvasIndex ;i--){
        this.$data.canvasIndexList[i+1] = this.$data.canvasIndexList[i]
      }
      var newCanva;
      if(this.$data.defaultCanvas[page]==undefined)
      {
        if(this.$data.canvasIndexList.length>0){
          newCanva = JSON.parse(JSON.stringify(this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]]));
        }
        else{
          newCanva = JSON.parse(JSON.stringify(this.$data.defaultCanvas['default']));
          newCanva.locationX = window.innerWidth/2 - newCanva.width/2;
          newCanva.locationY = window.innerHeight/2 - newCanva.height/2;
        }
      } else {
        newCanva = JSON.parse(JSON.stringify(this.$data.defaultCanvas[page]));
          newCanva.locationX = window.innerWidth/2 - newCanva.width/2;
          newCanva.locationY = window.innerHeight/2 - newCanva.height/2;
      }
      this.$data.canvasList.push(newCanva);
      this.$data.canvasIndexList[this.$data.currentCanvasIndex+1]=this.$data.canvasList.length - 1;
      if(this.$data.currentCanvasIndex>=0){
        var canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
        if(canva){
          this.setCanvasStatus(canva,"none")
        }
      }
      this.$data.currentCanvasIndex=this.$data.currentCanvasIndex+1;
      var canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
      canva.ref = this.$refs.canvasBack;
      canva.components = [];
      this.$data.currentComponent = (this.$data.currentTool?null:canva);
      this.$nextTick(()=>{
        canva.mainCanvas = (this.$refs['canvas'+canva.id])[0];
        canva.mainCanvas.width = window.innerWidth;
        canva.mainCanvas.height = window.innerHeight;
        this.updateCurrentComponent();
      })
      var form = {
        "name": this.$data.title,
        "background_color": canva.color,
        "width":canva.width,
        "height":canva.height,
      }
      this.$http.post('/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/', form,this.$data.config).then((response)=>{
        this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].id = response.data.id;
        console.log("成功创建页面");
        }).catch((error) => {
          this.error('创建页面失败');
          console.log(error);
        });
    },
    removeAllComponents(){
      var comps = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].components;
      var pageId = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].id;
      for(var i = 0; i < comps.length; i++){
        this.$nextTick(this.removeById(pageId,comps[i].childNodes[0].__vue__.$root.$data.id));
        comps[i].remove();
      }
    },
    deletePage(){
      if(this.$data.canvasIndexList.length <= 0){
        this.$message.error("没有页面");
        return;
      }
      this.$nextTick(this.removeAllComponents());
      var url = '/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/'+ this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].id+'/';
        this.$http.delete(url,this.$data.config).then((response)=>{
            console.log('删除成功');
          }).catch((error) => {
            this.error('删除失败');
            console.log(error);
          });
      this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].mainCanvas.style.display="none";
      this.$data.canvasIndexList.splice(this.$data.currentCanvasIndex,1);
      if(this.currentCanvasIndex >= this.$data.canvasIndexList.length)this.currentCanvasIndex = this.$data.canvasIndexList.length - 1;
      this.$nextTick(this.switchPage(this.$data.currentCanvasIndex));
    },
    changeCurrentTool(item) {
      if(this.$data.canvasIndexList.length <= 0){
        this.$message.error("请先创建画布");
        return;
      }
      if(this.$data.selected){
        this.$message.error("请先退出选择");
        return;
      }
      if(this.$data.currentTool == item || item == null)
      {
        var comps = document.getElementsByClassName('comps');
        for(var i = 0; i < comps.length;i++){
          comps[i].style.pointerEvents = "none";
        }
        this.$data.currentTool = null;
        this.$data.currentComponent = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
        this.$nextTick(()=>{this.updateCurrentComponent()});
        return;
      }
      this.$data.currentTool = item;
      if(this.$data.currentTool.id == 'act'){
        var comps = document.getElementsByClassName('comps');
        for(var i = 0; i < comps.length;i++){
          comps[i].style.pointerEvents = "all";
        }
      }
      if(this.$data.currentTool.size != undefined) this.$nextTick(this.updateToolSize);
      this.$data.currentComponent = null;
    },
    startDrag(canvasIndex,item){
      if(this.$data.canvasIndexList.length <= 0 || canvasIndex < 0){
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
        id:'',
        name:'属性',
        locationX:item.locationX==undefined?0:item.locationX,
        locationY:item.locationY==undefined?0:item.locationY,
        height:item.height,
        width:item.width,
        text:item.text,
        // size:item.size,
        ref:newDiv,
      };
        newDiv.style.display="block";
        newDiv.style.zIndex=5;
        newDiv.style.position = "absolute";
        newDiv.style.width = this.$data.currentComponent.width + 'px';
        newDiv.style.height = this.$data.currentComponent.height + 'px';
        newDiv.style.left = this.$data.currentComponent.locationX + 'px';
        newDiv.style.top = this.$data.currentComponent.locationY + 'px';
        if(item.text!=undefined)newDiv.style.fontSize = this.$data.currentComponent.height/3 + 'px';
        // if(item.size != undefined)newDiv.style.fontSize = item.size + 'px';
        this.$data.canvasList[this.$data.canvasIndexList[canvasIndex]].components.push(newDiv);
        newDiv.addEventListener('click',(event)=>{
          if(this.$data.nonname)return;
          if(this.$data.selected)return;
          if(this.$data.currentTool)return;
          this.$data.currentComponent = {
            id:event.target.childNodes[0].__vue__.$root.$data.id,
            name:'属性',
            locationX:parseInt(event.target.style.left),
            locationY:parseInt(event.target.style.top),
            height:parseInt(event.target.style.height),
            width:parseInt(event.target.style.width),
            // size:event.target.childNodes[0].__vue__.$root.$data.size,
            text:event.target.childNodes[0].__vue__.$root.$data.ctext,
            ref:event.target,
          }
        });
      var p;
      if(item.tag){
        var temp = '<' + item.tag + (item.props!=undefined?item.props:'') + ' class="comps">'
        + (item.text!=undefined?'{{ctext}}':'') + (item.inner!=undefined?item.inner:'') + '</' + item.tag + '>';
        var Profile = Vue.extend({
          template: temp,
          data: function () {
            return {
              id:item.id,
              tag:item.ikey,
              // size:item.size,
              ctext:item.text,
              value:'',
              options:item.options,
            }
          },
        })
        var tempDiv = document.createElement('div')
        newDiv.appendChild(tempDiv);
        p = new Profile();
        p.$mount(tempDiv);
        p.$el.style.pointerEvents = "none";
        p.$el.style.width = "inherit";
        p.$el.style.height = "inherit";
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
      if(item.id == undefined) {
        var form = {
          component_type: item.ikey,
          name: this.$data.currentComponent.text==undefined?item.tag:this.$data.currentComponent.text,
          x_position :this.$data.currentComponent.locationX,
          y_position :this.$data.currentComponent.locationY,
          width : this.$data.currentComponent.width,
          height : this.$data.currentComponent.height,
        }
        var url = '/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/'+ this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].id +'/components/';
        this.$http.post(url, form,this.$data.config).then((response)=>{
          console.log('创建组件成功');
          this.$data.currentComponent.ref.childNodes[0].__vue__.$root.$data.id = response.data.id; 
        }).catch((error) => {
          this.error('创建组件失败');
          console.log(error);
        });
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
    removeById(pageId,componentId){
      this.$http.delete('/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/'+ pageId + '/components/' + componentId + '/', this.$data.config).then((response)=>{ 
          console.log('成功删除组件')
        }).catch((error) => {
          this.error('删除失败');
          console.log(error);
        });
    },
    remove(){
        if(!this.$data.currentComponent)return;
        if(!this.$data.currentComponent.ref)return;
        var comps = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]].components;
        comps.splice(comps.indexOf(this.$data.currentComponent.ref),1);
        this.$data.currentComponent.ref.remove();
        var canva = this.$data.canvasList[this.$data.canvasIndexList[this.$data.currentCanvasIndex]];
        this.$nextTick(this.removeById(canva.id,this.$data.currentComponent.id));
        this.$data.currentComponent = canva;
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
      this.$http.post('/api/login/', form).then((response)=>{
        console.log("登录 "+ this.$data.config.headers.Authorization)
          this.$data.config.headers.Authorization = 'Token ' + response.data.token;  
        }).catch((error) => {
          this.error('1');
          console.log(error);
        });
    },
    getComponents(canvasIndex){
      this.$http.get('/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/' + this.$data.canvasList[this.$data.canvasIndexList[canvasIndex]].id + '/components/',this.$data.config).then((response)=>{
        for(var j = 0; j < response.data.length; j++) {
          var pr = this.$data.componentProps[response.data[j].component_type];
          console.log(response.data[j].component_type);
          var item = {
            id:response.data[j].id,
            tag:pr.tag,
            name:'属性',
            width:response.data[j].width,
            height:response.data[j].height,
            locationX:response.data[j].x_position,
            locationY:response.data[j].y_position,
            text:pr.text,
            options : pr.options,
            props :pr.props,
            inner:pr.inner,
          }
          this.$nextTick(this.startDrag(canvasIndex,item));
        }
      }).catch((error) => {
        this.error('读取组件失败');
        console.log(error);
      });
    },
    setSharedStatus(status) {
      var url = '/api/task/'+ this.$data.taskId + '/set_' + (status?'shared':'private') + '/';
      console.log(this.$data.config);
      this.$http.post(url,{},this.$data.config).then((response)=>{
          console.log('修改分享权限成功' + status);
        }).catch((error) => {
          this.error('修改分享权限失败');
          this.$data.shared = !this.$data.shared
          console.log(error);
        });

    },
    getSharedStatus() {
      this.$http.get('/api/task/' + this.$data.taskId +'/is_shared/',this.$data.config).then((response)=>{
          console.log(response.data)
          this.$data.shared = response.data.is_shared;
        }).catch((error) => {
          this.error('获取分享权限失败');
          console.log(error);
        });
    },
    getCanvas(){
        // headers:{
        //   'Content-Type': 'application/json',
        //   'Authorization' : 'Token 752b7d9c1c60c9d528644928e3d428ec1040d749',
        // }
        this.$http.get('/api/teams/'+ this.$data.teamId + '/tasks/' + this.$data.taskId +'/pages/',this.$data.config).then((response)=>{
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
            newCanva.locationX = window.innerWidth/2 - newCanva.width/2;
            newCanva.locationY = window.innerHeight/2 - newCanva.height/2;
            this.$data.canvasIndexList[i] = this.$data.canvasList.length;
            this.$data.canvasList.push(newCanva);
            this.$data.currentCanvasIndex = i;
            this.$nextTick(this.getComponents(i))
          }
          this.$nextTick(()=>{for(var i = 0; i < this.$data.canvasIndexList.length;i++){
            this.$data.canvasList[this.$data.canvasIndexList[i]].mainCanvas 
            = (this.$refs['canvas'+this.$data.canvasList[this.$data.canvasIndexList[i]].id])[0];
            this.$data.canvasList[this.$data.canvasIndexList[i]].mainCanvas.width = window.innerWidth;
            this.$data.canvasList[this.$data.canvasIndexList[i]].mainCanvas.height = window.innerHeight;
          }});
          setTimeout(()=>{
            for(var i = 0; i < this.$data.canvasIndexList.length;i++){
              this.setCanvasStatus(this.$data.canvasList[this.$data.canvasIndexList[i]],"none");
            }
            this.switchPage(0);
          },400);
        }).catch((error) => {
          this.error('没有权限访问');
          console.log(error);
        });

    },
  },
}
</script>

<style src='../assets/css/itemDesign.css' scoped>
</style>