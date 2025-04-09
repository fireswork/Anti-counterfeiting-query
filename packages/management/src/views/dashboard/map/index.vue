<template>
  <div class="map-wrapper">
    <div class="background-effects">
      <div class="network-lines"></div>
      <div class="animated-dots">
        <span v-for="i in 20" :key="i" class="dot animate__animated animate__pulse animate__infinite"></span>
      </div>
    </div>
    <div ref="chartRef" class="china-map"></div>
    <div class="map-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { loadChineseMap } from './fetchChineseMap'
import 'animate.css'

const chartRef = ref(null)
let chartInstance = null

// Mock数据 - 模拟各省份查询数量
const mapData = [
  { name: '北京市', value: 199 },
  { name: '天津市', value: 42 },
  { name: '河北省', value: 102 },
  { name: '山西省', value: 81 },
  { name: '内蒙古自治区', value: 47 },
  { name: '辽宁省', value: 67 },
  { name: '吉林省', value: 82 },
  { name: '黑龙江省', value: 123 },
  { name: '上海市', value: 178 },
  { name: '江苏省', value: 142 },
  { name: '浙江省', value: 156 },
  { name: '安徽省', value: 85 },
  { name: '福建省', value: 92 },
  { name: '江西省', value: 51 },
  { name: '山东省', value: 112 },
  { name: '河南省', value: 94 },
  { name: '湖北省', value: 106 },
  { name: '湖南省', value: 81 },
  { name: '广东省', value: 187 },
  { name: '广西壮族自治区', value: 59 },
  { name: '海南省', value: 29 },
  { name: '重庆市', value: 91 },
  { name: '四川省', value: 114 },
  { name: '贵州省', value: 62 },
  { name: '云南省', value: 83 },
  { name: '西藏自治区', value: 22 },
  { name: '陕西省', value: 89 },
  { name: '甘肃省', value: 57 },
  { name: '青海省', value: 34 },
  { name: '宁夏回族自治区', value: 28 },
  { name: '新疆维吾尔自治区', value: 71 },
  { name: '台湾省', value: 47 },
  { name: '香港特别行政区', value: 67 },
  { name: '澳门特别行政区', value: 15 }
]

// 连接线数据
const createLinesData = () => {
  // 新疆连接到多个省份
  const xinjiang = [87.68, 43.77]; // 新疆中心点坐标
  return [
    {
      coords: [xinjiang, [116.4, 39.9]], // 新疆到北京
      lineStyle: { color: 'rgba(147, 235, 248, 0.6)' }
    },
    {
      coords: [xinjiang, [121.4, 31.2]], // 新疆到上海
      lineStyle: { color: 'rgba(147, 235, 248, 0.5)' }
    },
    {
      coords: [xinjiang, [104.06, 30.67]], // 新疆到成都
      lineStyle: { color: 'rgba(147, 235, 248, 0.4)' }
    },
    {
      coords: [xinjiang, [113.3, 23.1]], // 新疆到广州
      lineStyle: { color: 'rgba(147, 235, 248, 0.7)' }
    }
  ];
};

const getOption = () => {
  return {
    backgroundColor: '#061d33',
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: params => {
        return `<div style="text-align:center;font-weight:bold;margin-bottom:5px;">${params.name}</div>` +
               `<div style="text-align:center;">查询数量: ${params.value || 0} 件</div>`;
      },
      backgroundColor: 'rgba(0,21,41,0.85)',
      borderColor: '#0096bc',
      textStyle: {
        color: '#fff'
      },
      padding: [10, 15]
    },
    visualMap: {
      min: 0,
      max: 200,
      left: 'left',
      bottom: 20,
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#0c6a9c', '#10a7bb', '#1ee3e9', '#52f5f5']
      },
      textStyle: {
        color: '#fff'
      },
      show: true
    },
    series: [
      {
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [104, 36],
        label: {
          show: true,
          color: '#fff',
          fontSize: 10,
          position: 'center'
        },
        itemStyle: {
          areaColor: '#0c2139',
          borderColor: '#0daeef',
          borderWidth: 1
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            areaColor: '#00c1de'
          }
        },
        data: mapData,
        nameMap: {
          '新疆维吾尔自治区': '新疆',
          '内蒙古自治区': '内蒙古',
          '广西壮族自治区': '广西',
          '宁夏回族自治区': '宁夏',
          '西藏自治区': '西藏',
          '香港特别行政区': '香港',
          '澳门特别行政区': '澳门'
        }
      },
      {
        name: '连接线',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        effect: {
          show: true,
          period: 6,
          trailLength: 0.5,
          color: '#16f3ff',
          symbolSize: 4
        },
        lineStyle: {
          width: 1,
          color: 'rgba(0, 255, 255, 0.3)',
          curveness: 0.35
        },
        data: createLinesData()
      },
      {
        name: '点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        rippleEffect: {
          brushType: 'stroke',
          scale: 5
        },
        label: {
          show: false
        },
        symbolSize: 6,
        itemStyle: {
          color: '#16f3ff'
        },
        data: [
          {
            name: '新疆维吾尔自治区',
            value: [87.68, 43.77, 71]
          }
        ]
      }
    ]
  }
}

const initChart = async () => {
  const isMapLoaded = await loadChineseMap()
  if (!isMapLoaded || !chartRef.value) {
    console.error('地图加载失败或图表容器未找到')
    return
  }
  
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getOption())

  // 添加点击事件
  chartInstance.on('click', params => {
    if (params.name) {
      const data = mapData.find(item => item.name === params.name)
      if (data) {
        // 弹出提示框显示详细信息
        chartInstance.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          name: params.name
        })

        // 添加点击动画效果
        const provinceElement = document.querySelector(`.china-map path[data-name="${params.name}"]`)
        if (provinceElement) {
          provinceElement.classList.add('animate__animated', 'animate__pulse')
          setTimeout(() => {
            provinceElement.classList.remove('animate__animated', 'animate__pulse')
          }, 1000)
        }
      }
    }
  })

  // 在特定区域上添加弹出提示框
  setTimeout(() => {
    chartInstance.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      name: '新疆'
    })
  }, 1000)
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(async () => {
  await initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  min-height: 600px;
  padding: 0;
  box-sizing: border-box;
  background-color: #061d33;
  position: relative;
  overflow: hidden;
}

.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.network-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(13, 174, 239, 0.2) 0%, transparent 45%),
    radial-gradient(circle at 85% 25%, rgba(0, 217, 223, 0.1) 0%, transparent 35%);
  opacity: 0.7;
}

.animated-dots .dot {
  position: absolute;
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: rgba(20, 203, 216, 0.8);
  box-shadow: 0 0 8px rgba(20, 203, 216, 0.8);
}

.animated-dots .dot:nth-child(1) { top: 10%; left: 15%; animation-delay: 0.2s; }
.animated-dots .dot:nth-child(2) { top: 30%; left: 25%; animation-delay: 1.5s; }
.animated-dots .dot:nth-child(3) { top: 50%; left: 10%; animation-delay: 1s; }
.animated-dots .dot:nth-child(4) { top: 70%; left: 20%; animation-delay: 0.5s; }
.animated-dots .dot:nth-child(5) { top: 20%; left: 40%; animation-delay: 2s; }
.animated-dots .dot:nth-child(6) { top: 40%; left: 50%; animation-delay: 3s; }
.animated-dots .dot:nth-child(7) { top: 60%; left: 45%; animation-delay: 0.7s; }
.animated-dots .dot:nth-child(8) { top: 80%; left: 55%; animation-delay: 1.8s; }
.animated-dots .dot:nth-child(9) { top: 25%; left: 65%; animation-delay: 1.3s; }
.animated-dots .dot:nth-child(10) { top: 45%; left: 75%; animation-delay: 2.6s; }
.animated-dots .dot:nth-child(11) { top: 65%; left: 70%; animation-delay: 0.9s; }
.animated-dots .dot:nth-child(12) { top: 85%; left: 80%; animation-delay: 2.2s; }
.animated-dots .dot:nth-child(13) { top: 15%; left: 85%; animation-delay: 1.7s; }
.animated-dots .dot:nth-child(14) { top: 35%; left: 90%; animation-delay: 0.3s; }
.animated-dots .dot:nth-child(15) { top: 55%; left: 88%; animation-delay: 2.8s; }
.animated-dots .dot:nth-child(16) { top: 75%; left: 92%; animation-delay: 1.1s; }
.animated-dots .dot:nth-child(17) { top: 7%; left: 55%; animation-delay: 2.4s; }
.animated-dots .dot:nth-child(18) { top: 93%; left: 40%; animation-delay: 0.6s; }
.animated-dots .dot:nth-child(19) { top: 28%; left: 12%; animation-delay: 1.9s; }
.animated-dots .dot:nth-child(20) { top: 82%; left: 7%; animation-delay: 1.4s; }

.china-map {
  width: 100%;
  height: 100%;
  min-height: 600px;
  position: relative;
  z-index: 2;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, transparent 50%, rgba(6, 29, 51, 0.5) 100%);
  pointer-events: none;
  z-index: 3;
}

/* 添加连线动画 */
@keyframes flowingLine {
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.china-map path {
  transition: all 0.3s;
}
</style> 