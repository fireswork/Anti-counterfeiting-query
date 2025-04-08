<template>
  <div class="dashboard">
    <a-row :gutter="[16, 16]">
      <!-- 统计卡片 -->
      <a-col :span="6">
        <a-card>
          <statistic
            title="商品种类"
            :value="1234"
            :precision="0"
            style="margin-right: 50px"
          >
            <template #prefix>
              <shopping-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <statistic
            title="客户总数"
            :value="4567"
            :precision="0"
          >
            <template #prefix>
              <user-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <statistic
            title="出货量总额"
            :value="89012"
            :precision="0"
          >
            <template #prefix>
              <rise-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <statistic
            title="标签总数"
            :value="345"
            :precision="0"
          >
            <template #prefix>
              <tags-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>

      <!-- 图表区域 -->
      <a-col :span="16">
        <a-card title="销售趋势">
          <v-chart class="chart" :option="salesOption" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="商品分类占比">
          <v-chart class="chart" :option="categoryOption" />
        </a-card>
      </a-col>

      <!-- 地图 -->
      <a-col :span="24">
        <a-card title="地区分布">
          <div id="map-container" class="map-container"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import AMapLoader from '@amap/amap-jsapi-loader'
import { ShoppingOutlined, UserOutlined, RiseOutlined, TagsOutlined } from '@ant-design/icons-vue'

// 注册必须的组件
use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 销售趋势图表配置
const salesOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }
  ]
})

// 商品分类占比图表配置
const categoryOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '服装' },
        { value: 735, name: '电子' },
        { value: 580, name: '食品' },
        { value: 484, name: '家具' },
        { value: 300, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

// 初始化地图
onMounted(() => {
  AMapLoader.load({
    key: '19c0d5e83d9fc1bc507a99459051467a',
    version: '2.0',
    plugins: ['AMap.Scale', 'AMap.ToolBar']
  }).then((AMap) => {
    const map = new AMap.Map('map-container', {
      zoom: 4,
      center: [116.397428, 39.90923]
    })
    map.addControl(new AMap.Scale())
    map.addControl(new AMap.ToolBar())
  })
})
</script>

<style scoped lang="less">
.dashboard {
  .chart {
    height: 300px;
  }

  .map-container {
    height: 500px;
    width: 100%;
  }

  :deep(.ant-card) {
    height: 100%;
  }
}
</style> 