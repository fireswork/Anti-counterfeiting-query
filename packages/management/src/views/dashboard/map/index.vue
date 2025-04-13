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
import 'animate.css'
import request from '@/api/request'
import { message } from 'ant-design-vue'
import chinaMap from '/public/map/china.json'

const chartRef = ref(null)
let chartInstance = null

// 数据存储
const mapData = ref([])

// 加载省份数据
const loadProvinceData = async () => {
  try {
    const res = await request.get('/system/report/provinceStatistics')
    if (res.code === 200) {
      mapData.value = res.data || []
    } else {
      message.error('获取省份数据失败')
    }
  } catch (error) {
    console.error('获取省份数据失败:', error)
    message.error('获取省份数据失败')
  }
}

const getOption = () => {
  // 计算最大值，如果没有数据则默认为100
  const maxValue = mapData.value.length > 0 
    ? Math.max(...mapData.value.map(item => item.value)) 
    : 100;
    
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
      max: maxValue,
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
        data: mapData.value,
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
  if (!echarts.getMap('china')) {
      echarts.registerMap('china', chinaMap)
    }
  
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(getOption())

  // 添加点击事件
  chartInstance.on('click', params => {
    if (params.name) {
      // 从真实数据中查找对应省份数据
      const data = mapData.value.find(item => {
        // 处理名称差异，如"新疆维吾尔自治区"和"新疆"
        const paramName = params.name.replace(/维吾尔自治区|壮族自治区|回族自治区|自治区|特别行政区/, '')
        const itemName = item.name.replace(/维吾尔自治区|壮族自治区|回族自治区|自治区|特别行政区/, '')
        return itemName.includes(paramName) || paramName.includes(itemName)
      })
      
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
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 更新图表
const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption(getOption())
    
    // 如果有数据，自动显示第一个省份的提示
    if (mapData.value.length > 0) {
      setTimeout(() => {
        chartInstance.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          name: mapData.value[0].name
        })
      }, 1000)
    }
  }
}

onMounted(async () => {
  // 先加载省份数据
  await loadProvinceData()
  
  // 初始化地图
  await initChart()
  
  // 设置定时刷新数据
  const refreshTimer = setInterval(async () => {
    await loadProvinceData()
    updateChart()
  }, 60000) // 每分钟刷新一次
  
  window.addEventListener('resize', handleResize)
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(refreshTimer)
  })
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